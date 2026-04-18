import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "../lib/authOptions"
import LogoutButton from "./components/LogoutButton"
import CountdownList from "./components/CountdownList"

export default async function Home() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">🗓 Mis Cuentas Regresivas</h1>
          <LogoutButton />
        </div>
        <CountdownList accessToken={session.accessToken!} />
      </div>
    </main>
  )
}