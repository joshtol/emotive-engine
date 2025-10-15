import { notFound } from 'next/navigation'
import { getDocBySlug, getAllDocSlugs } from '@/lib/markdown'
import DocsContent from '@/components/docs/DocsContent'

interface PageProps {
  params: Promise<{
    slug: string[]
  }>
}

// Generate static params for all docs
export async function generateStaticParams() {
  const slugs = getAllDocSlugs()
  return slugs.map((slug) => ({
    slug,
  }))
}

// Generate metadata for SEO
export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params
  const doc = await getDocBySlug(slug)

  if (!doc) {
    return {
      title: 'Not Found',
    }
  }

  return {
    title: `${doc.frontmatter.title} - Emotive Engine Docs`,
    description: doc.frontmatter.description || `Documentation for ${doc.frontmatter.title}`,
  }
}

export default async function DocPage({ params }: PageProps) {
  const { slug } = await params
  const doc = await getDocBySlug(slug)

  if (!doc) {
    notFound()
  }

  return <DocsContent title={doc.frontmatter.title} content={doc.content} />
}
