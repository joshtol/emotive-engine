import EmotiveHeader from '@/components/EmotiveHeader'
import EmotiveFooter from '@/components/EmotiveFooter'

export default function ExamplesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <EmotiveHeader />
      {children}
      <EmotiveFooter />
    </>
  )
}
