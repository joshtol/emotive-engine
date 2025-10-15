import { ReactNode } from 'react'
import { getDocNavigation } from '@/lib/markdown'
import DocsLayoutClient from '@/components/docs/DocsLayoutClient'

export default async function DocsLayout({
  children,
}: {
  children: ReactNode
}) {
  const navigation = await getDocNavigation()

  return <DocsLayoutClient navigation={navigation}>{children}</DocsLayoutClient>
}
