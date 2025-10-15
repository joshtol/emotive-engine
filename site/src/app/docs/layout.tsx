import { ReactNode } from 'react'
import EmotiveHeader from '@/components/EmotiveHeader'
import EmotiveFooter from '@/components/EmotiveFooter'
import DocsSidebar from '@/components/docs/DocsSidebar'
import { getDocNavigation } from '@/lib/markdown'

export default async function DocsLayout({
  children,
}: {
  children: ReactNode
}) {
  const navigation = await getDocNavigation()

  return (
    <>
      <EmotiveHeader />

      <div style={{
        display: 'flex',
        minHeight: '100vh',
        background: 'linear-gradient(180deg, rgba(10,10,10,0.98) 0%, rgba(5,5,5,0.95) 100%)',
        color: 'white',
      }}>
        <DocsSidebar navigation={navigation} />

        <main style={{
          flex: 1,
          overflowY: 'auto',
        }}>
          {children}
        </main>
      </div>

      <EmotiveFooter />
    </>
  )
}
