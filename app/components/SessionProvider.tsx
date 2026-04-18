"use client"

import { SessionProvider as NextSessionProvider } from "next-auth/react"

export default function SessionProvider({
  children,
  session,
}: {
  children: React.ReactNode
  session: Parameters<typeof NextSessionProvider>[0]["session"]
}) {
  return (
    <NextSessionProvider session={session}>
      {children}
    </NextSessionProvider>
  )
}