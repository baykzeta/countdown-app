"use client"

import { useState } from "react"

interface Props {
  accessToken: string
  onCreado: () => void
}

export default function CrearEvento({ accessToken, onCreado }: Props) {
  const [abierto, setAbierto] = useState(false)
  const [summary, setSummary] = useState("")
  const [start, setStart] = useState("")
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setCargando(true)
    setError("")

    const res = await fetch("/api/eventos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accessToken, summary, start, timezone: Intl.DateTimeFormat().resolvedOptions().timeZone }),
    })

    setCargando(false)

    if (!res.ok) {
      setError("Error al crear el evento. Intenta de nuevo.")
      return
    }

    setSummary("")
    setStart("")
    setAbierto(false)
    onCreado()
  }

  if (!abierto) {
    return (
      <button
        onClick={() => setAbierto(true)}
        className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl transition mb-6"
      >
        + Nuevo evento
      </button>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="bg-gray-800 rounded-xl p-5 mb-6 space-y-4">
      <h2 className="text-lg font-semibold">Nuevo evento</h2>

      <div>
        <label className="block text-sm text-gray-400 mb-1">Nombre</label>
        <input
          type="text"
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          required
          placeholder="Ej: Cumpleaños de Juan"
          className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-1">Fecha y hora</label>
        <input
          type="datetime-local"
          value={start}
          onChange={(e) => setStart(e.target.value)}
          required
          className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>

      {error && <p className="text-red-400 text-sm">{error}</p>}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={cargando}
          className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-semibold py-2 rounded-lg transition"
        >
          {cargando ? "Creando..." : "Crear evento"}
        </button>
        <button
          type="button"
          onClick={() => setAbierto(false)}
          className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 rounded-lg transition"
        >
          Cancelar
        </button>
      </div>
    </form>
  )
}
