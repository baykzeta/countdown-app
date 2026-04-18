"use client"

import { signIn } from "next-auth/react"

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="bg-gray-800 rounded-2xl p-10 text-center space-y-6">
        <h1 className="text-3xl font-bold text-white">🗓 Countdown App</h1>
        <p className="text-gray-400">Inicia sesión para ver tus eventos</p>
        <button
          onClick={() => signIn("google", { callbackUrl: "/" })}
          className="bg-white text-gray-900 font-semibold px-6 py-3 rounded-lg hover:bg-gray-100 transition"
        >
          Iniciar sesión con Google
        </button>
      </div>
    </main>
  )
}