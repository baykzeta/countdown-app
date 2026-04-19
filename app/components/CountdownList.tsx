"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { signOut } from "next-auth/react"
import CrearEvento from "./CrearEvento"

interface Evento {
  id: string
  summary: string
  start: { dateTime?: string; date?: string }
}

interface CountdownProps {
  accessToken: string
}

function calcularTiempo(fecha: string) {
  const ahora = new Date().getTime()
  const evento = new Date(fecha).getTime()
  const diff = evento - ahora

  if (diff <= 0) return "¡Ya pasó!"

  const dias = Math.floor(diff / (1000 * 60 * 60 * 24))
  const horas = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutos = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  const segundos = Math.floor((diff % (1000 * 60)) / 1000)

  return `${dias}d ${horas}h ${minutos}m ${segundos}s`
}

function toDatetimeLocal(isoString: string) {
  const d = new Date(isoString)
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export default function CountdownList({ accessToken }: CountdownProps) {
  const [eventos, setEventos] = useState<Evento[]>([])
  const [tiempos, setTiempos] = useState<Record<string, string>>({})
  const [cargando, setCargando] = useState(true)
  const [editandoId, setEditandoId] = useState<string | null>(null)
  const [editSummary, setEditSummary] = useState("")
  const [editStart, setEditStart] = useState("")
  const [guardando, setGuardando] = useState(false)
  const [eliminandoId, setEliminandoId] = useState<string | null>(null)
  const editDateInputRef = useRef<HTMLInputElement>(null)

  const fetchEventos = useCallback(async () => {
    setCargando(true)
    let res: Response
    try {
      res = await fetch(`/api/eventos?accessToken=${accessToken}`)
    } catch {
      setCargando(false)
      return
    }
    if (res.status === 401) {
      signOut({ callbackUrl: "/login" })
      return
    }
    if (!res.ok) {
      setCargando(false)
      return
    }
    const data = await res.json()
    setEventos(data.eventos || [])
    setCargando(false)
  }, [accessToken])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchEventos()
  }, [fetchEventos])

  useEffect(() => {
    const interval = setInterval(() => {
      const nuevos: Record<string, string> = {}
      eventos.forEach((e) => {
        const fecha = e.start.dateTime || (e.start.date ? e.start.date + "T00:00" : "")
        nuevos[e.id] = calcularTiempo(fecha)
      })
      setTiempos(nuevos)
    }, 1000)
    return () => clearInterval(interval)
  }, [eventos])

  function abrirEditar(evento: Evento) {
    const fecha = evento.start.dateTime
      ? toDatetimeLocal(evento.start.dateTime)
      : evento.start.date
      ? evento.start.date + "T00:00"
      : ""
    setEditandoId(evento.id)
    setEditSummary(evento.summary)
    setEditStart(fecha)
  }

  async function handleEditar(e: React.SyntheticEvent) {
    e.preventDefault()
    if (!editandoId) return
    setGuardando(true)

    const res = await fetch("/api/eventos", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        accessToken,
        eventId: editandoId,
        summary: editSummary,
        start: editStart,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      }),
    })

    setGuardando(false)
    if (res.ok) {
      setEditandoId(null)
      fetchEventos()
    }
  }

  async function handleEliminar(eventId: string) {
    setEliminandoId(eventId)

    await fetch("/api/eventos", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accessToken, eventId }),
    })

    setEliminandoId(null)
    fetchEventos()
  }

  return (
    <div>
      <CrearEvento accessToken={accessToken} onCreado={fetchEventos} />
      {cargando ? (
        <p className="text-gray-400">Cargando eventos...</p>
      ) : eventos.length === 0 ? (
        <p className="text-gray-400">No hay eventos próximos.</p>
      ) : (
        <div className="space-y-4">
          {eventos.map((evento) =>
            editandoId === evento.id ? (
              <form
                key={evento.id}
                onSubmit={handleEditar}
                className="bg-gray-800 rounded-xl p-5 space-y-4"
              >
                <h2 className="text-lg font-semibold">Editar evento</h2>

                <div>
                  <label className="block text-sm text-gray-400 mb-1">Nombre</label>
                  <input
                    type="text"
                    value={editSummary}
                    onChange={(e) => setEditSummary(e.target.value)}
                    required
                    className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1">Fecha y hora</label>
                  <div className="flex gap-2">
                    <input
                      ref={editDateInputRef}
                      type="datetime-local"
                      value={editStart}
                      onChange={(e) => setEditStart(e.target.value)}
                      required
                      className="flex-1 bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => editDateInputRef.current?.blur()}
                      className="bg-gray-600 hover:bg-gray-500 text-white px-3 py-2 rounded-lg text-sm transition"
                    >
                      OK
                    </button>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={guardando}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-2 rounded-lg transition"
                  >
                    {guardando ? "Guardando..." : "Guardar cambios"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditandoId(null)}
                    className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 rounded-lg transition"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            ) : (
              <div key={evento.id} className="bg-gray-800 rounded-xl p-5">
                <div className="flex justify-between items-start mb-1">
                  <h2 className="text-lg font-semibold">{evento.summary}</h2>
                  <div className="flex gap-2 ml-4 shrink-0">
                    <button
                      onClick={() => abrirEditar(evento)}
                      className="text-sm text-blue-400 hover:text-blue-300 transition"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleEliminar(evento.id)}
                      disabled={eliminandoId === evento.id}
                      className="text-sm text-red-400 hover:text-red-300 disabled:opacity-50 transition"
                    >
                      {eliminandoId === evento.id ? "..." : "Eliminar"}
                    </button>
                  </div>
                </div>
                <p className="text-3xl font-mono text-green-400">{tiempos[evento.id] || "..."}</p>
                <p className="text-sm text-gray-400 mt-1">
                  {new Date(
                    evento.start.dateTime || (evento.start.date ? evento.start.date + "T00:00" : "")
                  ).toLocaleDateString("es-CL", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            )
          )}
        </div>
      )}
    </div>
  )
}
