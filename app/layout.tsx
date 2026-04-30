import { authOptions } from "../lib/authOptions"
import type { Metadata } from "next"
import { Geist } from "next/font/google"
import "./globals.css"
import { getServerSession } from "next-auth"
import SessionProvider from "./components/SessionProvider"

const geist = Geist({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "TokiToki",
  description: "Tu tiempo, tus momentos.",
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  return (
    <html lang="es">
      <body className={geist.className}>
        <SessionProvider session={session}>
          {children}
        </SessionProvider>
      </body>
    </html>
  )
}