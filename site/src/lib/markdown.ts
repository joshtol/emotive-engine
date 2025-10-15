/**
 * Markdown processing utilities for documentation
 */

import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { remark } from 'remark'
import remarkGfm from 'remark-gfm'
import html from 'remark-html'

// Path to docs directory (one level up from site folder)
const docsDirectory = path.join(process.cwd(), '..', 'docs')

export interface DocFrontmatter {
  title: string
  category: string
  order?: number
  description?: string
}

export interface DocContent {
  slug: string[]
  frontmatter: DocFrontmatter
  content: string
}

/**
 * Get a single documentation page by slug
 */
export async function getDocBySlug(slug: string[]): Promise<DocContent | null> {
  try {
    const fullPath = path.join(docsDirectory, ...slug) + '.md'

    if (!fs.existsSync(fullPath)) {
      return null
    }

    const fileContents = fs.readFileSync(fullPath, 'utf8')
    const { data, content} = matter(fileContents)

    // Process markdown to HTML with GFM (GitHub Flavored Markdown) support
    const processedContent = await remark()
      .use(remarkGfm)
      .use(html, { sanitize: false })
      .process(content)

    return {
      slug,
      frontmatter: data as DocFrontmatter,
      content: processedContent.toString()
    }
  } catch (error) {
    return null
  }
}

/**
 * Get all documentation slugs for static generation
 */
export function getAllDocSlugs(): string[][] {
  const slugs: string[][] = []

  function scanDirectory(dir: string, prefix: string[] = []) {
    if (!fs.existsSync(dir)) return

    const entries = fs.readdirSync(dir, { withFileTypes: true })

    for (const entry of entries) {
      if (entry.isDirectory()) {
        scanDirectory(path.join(dir, entry.name), [...prefix, entry.name])
      } else if (entry.name.endsWith('.md')) {
        const slug = [...prefix, entry.name.replace(/\.md$/, '')]
        slugs.push(slug)
      }
    }
  }

  scanDirectory(docsDirectory)
  return slugs
}

/**
 * Get navigation structure for sidebar
 */
export interface NavItem {
  title: string
  slug: string[]
  order: number
  category: string
}

export interface NavSection {
  category: string
  items: NavItem[]
}

export async function getDocNavigation(): Promise<NavSection[]> {
  const allSlugs = getAllDocSlugs()
  const navItems: NavItem[] = []

  for (const slug of allSlugs) {
    const doc = await getDocBySlug(slug)
    if (doc) {
      navItems.push({
        title: doc.frontmatter.title,
        slug: doc.slug,
        order: doc.frontmatter.order || 999,
        category: doc.frontmatter.category
      })
    }
  }

  // Group by category and sort
  const sections: { [key: string]: NavItem[] } = {}

  for (const item of navItems) {
    if (!sections[item.category]) {
      sections[item.category] = []
    }
    sections[item.category].push(item)
  }

  // Sort items within each category by order
  const result: NavSection[] = []
  for (const [category, items] of Object.entries(sections)) {
    result.push({
      category,
      items: items.sort((a, b) => a.order - b.order)
    })
  }

  // Sort sections by a predefined order
  const categoryOrder = ['Getting Started', 'API Reference', 'Guides', 'Examples', 'Changelog']
  result.sort((a, b) => {
    const aIndex = categoryOrder.indexOf(a.category)
    const bIndex = categoryOrder.indexOf(b.category)
    if (aIndex === -1 && bIndex === -1) return 0
    if (aIndex === -1) return 1
    if (bIndex === -1) return -1
    return aIndex - bIndex
  })

  return result
}
