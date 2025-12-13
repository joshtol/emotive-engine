'use client'

import { useState } from 'react'
import Link from 'next/link'
import styles from './examples.module.css'

interface Example {
  id: string
  title: string
  description: string
  category: '2d' | '3d' | 'llm'
  path: string
  complexity: 1 | 2 | 3 | 4 | 5
  tags: string[]
}

const examples: Example[] = [
  // 2D Examples
  {
    id: 'hello-world',
    title: 'Hello World',
    description: 'The simplest Emotive Engine example. Start here!',
    category: '2d',
    path: '/examples/2d/hello-world',
    complexity: 1,
    tags: ['basics', 'beginner']
  },
  {
    id: 'basic-usage',
    title: 'Basic Usage',
    description: 'Emotions, gestures, and shapes with keyboard shortcuts',
    category: '2d',
    path: '/examples/2d/basic-usage',
    complexity: 2,
    tags: ['emotions', 'gestures', 'shapes']
  },
  {
    id: 'event-handling',
    title: 'Event Handling',
    description: 'Monitor mascot events in real-time with filtering',
    category: '2d',
    path: '/examples/2d/event-handling',
    complexity: 3,
    tags: ['events', 'debugging']
  },
  {
    id: 'breathing-app',
    title: 'Breathing App',
    description: 'Guided breathing exercises with visual feedback',
    category: '2d',
    path: '/examples/2d/breathing-app',
    complexity: 3,
    tags: ['app', 'animation', 'wellness']
  },
  {
    id: 'rhythm-sync',
    title: 'Rhythm Sync',
    description: 'Beat-synchronized animations with tap tempo',
    category: '2d',
    path: '/examples/2d/rhythm-sync',
    complexity: 3,
    tags: ['audio', 'rhythm', 'timing']
  },
  // 3D Examples
  {
    id: '3d-showcase',
    title: '3D Showcase',
    description: 'Complete 3D demo with all geometries, emotions, and effects',
    category: '3d',
    path: '/examples/3d/showcase',
    complexity: 3,
    tags: ['crystal', 'moon', 'sun', 'particles', 'emotions']
  },
  {
    id: 'crystal-demo',
    title: 'Crystal Soul',
    description: 'Frosted crystal with inner soul glow and SSS presets',
    category: '3d',
    path: '/examples/3d/crystal',
    complexity: 4,
    tags: ['crystal', 'shaders', 'blend modes', 'SSS']
  },
  {
    id: 'moon-demo',
    title: 'Moon Phases',
    description: 'Realistic moon with 8 phases and tidal lock camera',
    category: '3d',
    path: '/examples/3d/moon',
    complexity: 3,
    tags: ['moon', 'phases', 'camera']
  },
  {
    id: 'blood-moon',
    title: 'Blood Moon Eclipse',
    description: 'Lunar eclipse with shadow sweep and Rayleigh scattering',
    category: '3d',
    path: '/examples/3d/blood-moon',
    complexity: 5,
    tags: ['moon', 'eclipse', 'blend modes', 'physics']
  },
  {
    id: 'sun-demo',
    title: 'Solar Eclipse',
    description: 'Solar eclipse with corona effects and blend layers',
    category: '3d',
    path: '/examples/3d/sun',
    complexity: 4,
    tags: ['sun', 'eclipse', 'corona', 'blend modes']
  },
  // LLM Integration
  {
    id: 'claude-haiku',
    title: 'Claude Chat',
    description: 'Emotional AI assistant with Claude Haiku integration',
    category: 'llm',
    path: '/examples/llm/claude-chat',
    complexity: 3,
    tags: ['LLM', 'Claude', 'chat', 'emotions']
  }
]

const categoryLabels = {
  '2d': '2D Canvas',
  '3d': '3D WebGL',
  'llm': 'LLM Integration'
}

function ComplexityStars({ level }: { level: number }) {
  return (
    <span className={styles.complexityStars}>
      {'★'.repeat(level)}
      {'☆'.repeat(5 - level)}
    </span>
  )
}

export default function ExamplesPage() {
  const [selectedCategory, setSelectedCategory] = useState<'all' | '2d' | '3d' | 'llm'>('all')

  const filteredExamples = selectedCategory === 'all'
    ? examples
    : examples.filter(e => e.category === selectedCategory)

  return (
    <main className={styles.main}>
      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.title}>Examples Gallery</h1>
        <p className={styles.subtitle}>
          Interactive examples demonstrating Emotive Engine capabilities
        </p>

        {/* Category Filter */}
        <div className={styles.filterContainer}>
          {(['all', '2d', '3d', 'llm'] as const).map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`${styles.filterButton} ${selectedCategory === cat ? styles.active : ''}`}
              data-category={cat}
            >
              {cat === 'all' ? 'All Examples' : categoryLabels[cat]}
            </button>
          ))}
        </div>
      </div>

      {/* Example Cards Grid */}
      <div className={styles.grid}>
        {filteredExamples.map(example => (
          <Link
            key={example.id}
            href={example.path}
            className={styles.card}
            data-category={example.category}
          >
            {/* Category badge */}
            <span className={styles.categoryBadge} data-category={example.category}>
              {example.category}
            </span>

            <h3 className={styles.cardTitle}>{example.title}</h3>
            <p className={styles.cardDescription}>{example.description}</p>

            <div className={styles.complexityRow}>
              <span className={styles.complexityLabel}>Complexity:</span>
              <ComplexityStars level={example.complexity} />
            </div>

            <div className={styles.tags}>
              {example.tags.map(tag => (
                <span key={tag} className={styles.tag}>{tag}</span>
              ))}
            </div>
          </Link>
        ))}
      </div>
    </main>
  )
}
