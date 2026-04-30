"use client"

import { signIn } from "next-auth/react"
import { Clock } from "lucide-react"

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-10 text-center space-y-6 shadow-xl border border-slate-200 w-full max-w-sm">
        <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-indigo-200">
          <Clock size={32} className="text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">TokiToki</h1>
          <p className="text-slate-400 text-sm mt-1">Cuentas regresivas desde Google Calendar</p>
        </div>
        <button
          onClick={() => signIn("google", { callbackUrl: "/" })}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-xl transition active:scale-95 shadow-lg shadow-indigo-100"
        >
          Iniciar sesión con Google
        </button>
      </div>
    </main>
  )
}