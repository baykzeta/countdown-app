"use client"

import { useEffect, useState, useCallback } from "react"
import { signOut } from "next-auth/react"
import {
  Calendar, Clock, LayoutDashboard, Plus, Bell,
  ChevronLeft, ChevronRight, Activity, CheckCircle2, X,
  Trash2, Zap, Sun, Moon, Pencil, LogOut, Menu,
} from "lucide-react"
import DateTimePicker from "./DateTimePicker"

interface Evento {
  id: string
  summary: string
  start: { dateTime?: string; date?: string }
}

interface Props {
  accessToken: string
  userName?: string | null
}

const COLORS = [
  "bg-blue-500", "bg-purple-500", "bg-rose-500",
  "bg-amber-500", "bg-emerald-500", "bg-cyan-500", "bg-orange-500",
]

const MONTH_NAMES = [
  "Enero","Febrero","Marzo","Abril","Mayo","Junio",
  "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre",
]

function getEventDate(evento: Evento): Date {
  return new Date(evento.start.dateTime || (evento.start.date ? evento.start.date + "T00:00" : ""))
}

function toDatetimeLocal(iso: string): string {
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function calendarDaysUntil(target: Date, now: Date): number {
  const t = new Date(target.getFullYear(), target.getMonth(), target.getDate()).getTime()
  const n = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  return Math.max(0, Math.round((t - n) / 86400000))
}

function calcParts(target: Date, now: Date) {
  const diff = target.getTime() - now.getTime()
  if (diff <= 0) return null
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff / 3600000) % 24),
    minutes: Math.floor((diff / 60000) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  }
}

export default function Dashboard({ accessToken, userName }: Props) {
  const [now, setNow] = useState(new Date())
  const [activeTab, setActiveTab] = useState<"dashboard" | "timers">("dashboard")
  const [eventos, setEventos] = useState<Evento[]>([])
  const [cargando, setCargando] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<"create" | "edit">("create")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [modalSummary, setModalSummary] = useState("")
  const [modalStart, setModalStart] = useState("")
  const [guardando, setGuardando] = useState(false)
  const [eliminandoId, setEliminandoId] = useState<string | null>(null)
  const [isDark, setIsDark] = useState(false)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const [calDate, setCalDate] = useState({ year: new Date().getFullYear(), month: new Date().getMonth() })

  useEffect(() => {
    const saved = localStorage.getItem("darkMode") === "true"
    setIsDark(saved)
    document.documentElement.classList.toggle("dark", saved)
  }, [])

  function toggleDark() {
    setIsDark(prev => {
      const next = !prev
      localStorage.setItem("darkMode", String(next))
      document.documentElement.classList.toggle("dark", next)
      return next
    })
  }

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  const fetchEventos = useCallback(async () => {
    setCargando(true)
    let res: Response
    try {
      res = await fetch(`/api/eventos?accessToken=${accessToken}`)
    } catch {
      setCargando(false)
      return
    }
    if (res.status === 401) { signOut({ callbackUrl: "/login" }); return }
    if (!res.ok) { setCargando(false); return }
    const data = await res.json()
    setEventos(data.eventos || [])
    setCargando(false)
  }, [accessToken])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchEventos()
  }, [fetchEventos])

  function openCreateModal() {
    setModalMode("create")
    setModalSummary("")
    setModalStart("")
    setEditingId(null)
    setIsModalOpen(true)
  }

  function openEditModal(evento: Evento) {
    setModalMode("edit")
    setEditingId(evento.id)
    setModalSummary(evento.summary)
    setModalStart(evento.start.dateTime ? toDatetimeLocal(evento.start.dateTime) : evento.start.date ? evento.start.date + "T00:00" : "")
    setIsModalOpen(true)
  }

  async function handleModalSubmit(e: React.FormEvent) {
    e.preventDefault()
    setGuardando(true)
    await fetch("/api/eventos", {
      method: modalMode === "create" ? "POST" : "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        accessToken,
        summary: modalSummary,
        start: modalStart,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        ...(modalMode === "edit" ? { eventId: editingId } : {}),
      }),
    })
    setGuardando(false)
    setIsModalOpen(false)
    fetchEventos()
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

  const { year: calYear, month: calMonth } = calDate
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate()
  const firstDayOffset = (new Date(calYear, calMonth, 1).getDay() + 6) % 7

  function dayHasEvent(day: number) {
    return eventos.some(e => {
      const d = getEventDate(e)
      return d.getFullYear() === calYear && d.getMonth() === calMonth && d.getDate() === day
    })
  }

  function isToday(day: number) {
    const t = new Date()
    return calYear === t.getFullYear() && calMonth === t.getMonth() && day === t.getDate()
  }

  const upcoming = eventos.filter(e => getEventDate(e) > now)
  const nextEvent = upcoming[0] ?? null
  const initials = (userName ?? "U").split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()

  const renderDashboard = () => (
    <div className="space-y-8">
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Eventos regresivos"
          value={eventos.length}
          trend="Contadores activos"
        />
        <StatCard
          title="Próximo evento"
          value={nextEvent ? `${calendarDaysUntil(getEventDate(nextEvent), now)} días` : "Sin eventos"}
          trend={nextEvent?.summary ?? "Programar ahora"}
        />
        <div className="bg-indigo-600 rounded-2xl p-6 text-white flex flex-col justify-between shadow-lg shadow-indigo-200 group relative overflow-hidden">
          <div className="absolute -right-4 -top-4 opacity-10 group-hover:scale-110 transition-transform">
            <Zap size={120} />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-1.5 mb-1">
              <Zap size={12} className="text-indigo-200 fill-indigo-200" />
              <p className="text-indigo-200 text-[10px] font-black uppercase tracking-[0.2em]">Acceso rápido</p>
            </div>
            <h3 className="text-xl font-bold mt-1 leading-tight">Nuevo contador regresivo</h3>
          </div>
          <button
            onClick={openCreateModal}
            className="relative z-10 mt-4 bg-white text-indigo-600 font-bold py-3 px-4 rounded-xl text-sm flex items-center justify-center gap-2 hover:bg-indigo-50 transition-all active:scale-95 shadow-md"
          >
            <Plus size={18} /> Agregar cuenta
          </button>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
            <h3 className="font-bold text-slate-800 dark:text-slate-100">Calendario de Eventos</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCalDate(({ year, month }) => month === 0 ? { year: year - 1, month: 11 } : { year, month: month - 1 })}
                className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md transition"
              ><ChevronLeft size={18} /></button>
              <span className="text-sm font-semibold px-2 text-slate-700 dark:text-slate-200">{MONTH_NAMES[calMonth]} {calYear}</span>
              <button
                onClick={() => setCalDate(({ year, month }) => month === 11 ? { year: year + 1, month: 0 } : { year, month: month + 1 })}
                className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md transition"
              ><ChevronRight size={18} /></button>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-7 gap-2 text-center mb-4 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase">
              {["Lun","Mar","Mié","Jue","Vie","Sáb","Dom"].map(d => <div key={d}>{d}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-2">
              {[...Array(firstDayOffset)].map((_, i) => <div key={`e${i}`} />)}
              {[...Array(daysInMonth)].map((_, i) => {
                const day = i + 1
                const hasEvent = dayHasEvent(day)
                const today = isToday(day)
                return (
                  <div
                    key={day}
                    className={`aspect-square border rounded-xl flex flex-col items-center justify-center text-sm transition-all
                      ${today
                        ? "bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 font-bold border-indigo-100 dark:border-indigo-800 ring-2 ring-indigo-100 dark:ring-indigo-800"
                        : "border-slate-50 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                      }
                      ${hasEvent && !today ? "border-indigo-200 dark:border-indigo-700 font-bold" : ""}
                    `}
                  >
                    {day}
                    {hasEvent && <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full mt-0.5" />}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden h-fit">
          <div className="p-6 border-b border-slate-100 dark:border-slate-700">
            <h3 className="font-bold text-slate-800 dark:text-slate-100">Próximos eventos</h3>
          </div>
          <div className="p-4 space-y-4">
            {cargando ? (
              <p className="text-sm text-slate-400">Cargando...</p>
            ) : upcoming.length === 0 ? (
              <p className="text-sm text-slate-400">No hay eventos próximos.</p>
            ) : upcoming.slice(0, 4).map((evento, i) => {
              const date = getEventDate(evento)
              const daysLeft = calendarDaysUntil(date, now)
              return (
                <div key={evento.id} className="flex items-center gap-4 p-2 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl transition-colors cursor-default">
                  <div className={`w-1.5 h-10 rounded-full ${COLORS[i % COLORS.length]}`} />
                  <div>
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-100 leading-tight">{evento.summary}</p>
                    <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                      {date.toLocaleDateString("es-CL", { day: "numeric", month: "short" })} · {daysLeft} días faltantes
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )

  const renderTimers = () => (
    <div className="space-y-6 pb-10">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100">Mis Cuentas Regresivas</h2>
          <p className="text-sm mt-1 text-slate-500 dark:text-slate-400">Gestión individual de cada uno de tus cronómetros activos.</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-indigo-100 active:scale-95"
        >
          <Plus size={18} /> Nueva Cuenta
        </button>
      </div>

      {cargando ? (
        <p className="text-slate-400">Cargando eventos...</p>
      ) : eventos.length === 0 ? (
        <p className="text-slate-400">No hay eventos próximos.</p>
      ) : (
        <div className="space-y-4">
          {eventos.map((evento, i) => {
            const date = getEventDate(evento)
            const parts = calcParts(date, now)
            return (
              <div
                key={evento.id}
                className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-md transition-shadow relative overflow-hidden"
              >
                <div className={`absolute left-0 top-0 bottom-0 w-1 ${COLORS[i % COLORS.length]}`} />

                <div className="flex flex-col md:flex-row md:items-center gap-6 flex-1">
                  <div className="md:w-1/3">
                    <h4 className="text-lg font-bold text-slate-800 dark:text-slate-100 leading-tight">{evento.summary}</h4>
                  </div>

                  <div className="flex-1 bg-slate-50/50 dark:bg-slate-700/50 rounded-2xl p-4 border border-slate-100/50 dark:border-slate-600/50">
                    <div className="flex items-center justify-center md:justify-start gap-4">
                      {parts ? (
                        <>
                          <TimeBox value={parts.days} label="Días" />
                          <TimeBox value={parts.hours} label="Horas" />
                          <TimeBox value={parts.minutes} label="Min" />
                          <TimeBox value={parts.seconds} label="Seg" />
                        </>
                      ) : (
                        <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold">
                          <CheckCircle2 size={20} />
                          <span>¡Evento finalizado!</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 pl-0 md:pl-6 md:border-l border-slate-100 dark:border-slate-700 min-w-[140px]">
                  <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl text-indigo-600 dark:text-indigo-400">
                    <Calendar size={20} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
                      {date.toLocaleDateString("es-CL", { day: "2-digit", month: "short", year: "numeric" })}
                    </p>
                    <p className="text-xs text-slate-400 font-medium">
                      {date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={() => openEditModal(evento)}
                      className="p-1.5 text-slate-400 hover:text-indigo-500 transition-colors"
                      title="Editar"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      onClick={() => handleEliminar(evento.id)}
                      disabled={eliminandoId === evento.id}
                      className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors disabled:opacity-40"
                      title="Eliminar"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex-col hidden md:flex">
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
            <Clock size={24} />
          </div>
          <h1 className="font-bold text-xl tracking-tight text-slate-800 dark:text-slate-100">TokiToki</h1>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          <NavItem icon={<LayoutDashboard size={20} />} label="Dashboard" active={activeTab === "dashboard"} onClick={() => setActiveTab("dashboard")} />
          <NavItem icon={<Clock size={20} />} label="Cuentas Regresivas" active={activeTab === "timers"} onClick={() => setActiveTab("timers")} />
          <div className="pt-6 pb-2 px-3 text-[10px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-widest">
            Próximamente
          </div>
          <NavItem icon={<CheckCircle2 size={20} />} label="Tareas" disabled />
          <NavItem icon={<Activity size={20} />} label="Análisis" disabled />
        </nav>

        <div className="p-4 border-t border-slate-100 dark:border-slate-700">
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex items-center gap-3 w-full p-3 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl transition-colors"
          >
            <LogOut size={20} />
            <span className="font-bold text-sm">Cerrar sesión</span>
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto">
        <header className="h-16 bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between px-6 md:px-8 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="md:hidden p-2 text-slate-400 hover:text-indigo-600 transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              <Menu size={20} />
            </button>
            <h2 className="font-bold text-slate-800 dark:text-slate-100">
              {activeTab === "dashboard" ? "Panel General" : "Cuentas Regresivas"}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={toggleDark}
              className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-yellow-400 transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
              title={isDark ? "Modo claro" : "Modo oscuro"}
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button className="p-2 text-slate-400 hover:text-indigo-600 transition-colors">
              <Bell size={20} />
            </button>
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs border border-indigo-200">
              {initials}
            </div>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto">
          {activeTab === "dashboard" ? renderDashboard() : renderTimers()}
        </div>
      </main>

      {/* Mobile sidebar */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setIsMobileSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col shadow-xl">
            <div className="p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
                  <Clock size={24} />
                </div>
                <h1 className="font-bold text-xl tracking-tight text-slate-800 dark:text-slate-100">TokiToki</h1>
              </div>
              <button onClick={() => setIsMobileSidebarOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                <X size={18} />
              </button>
            </div>

            <nav className="flex-1 px-4 space-y-1">
              <NavItem icon={<LayoutDashboard size={20} />} label="Dashboard" active={activeTab === "dashboard"} onClick={() => { setActiveTab("dashboard"); setIsMobileSidebarOpen(false) }} />
              <NavItem icon={<Clock size={20} />} label="Cuentas Regresivas" active={activeTab === "timers"} onClick={() => { setActiveTab("timers"); setIsMobileSidebarOpen(false) }} />
              <div className="pt-6 pb-2 px-3 text-[10px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-widest">
                Próximamente
              </div>
              <NavItem icon={<CheckCircle2 size={20} />} label="Tareas" disabled />
              <NavItem icon={<Activity size={20} />} label="Análisis" disabled />
            </nav>

            <div className="p-4 border-t border-slate-100 dark:border-slate-700">
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="flex items-center gap-3 w-full p-3 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl transition-colors"
              >
                <LogOut size={20} />
                <span className="font-bold text-sm">Cerrar sesión</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-md p-8 relative shadow-2xl">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-6 right-6 text-slate-300 dark:text-slate-600 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            >
              <X size={20} />
            </button>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-6 tracking-tight">
              {modalMode === "create" ? "Nueva Cuenta" : "Editar Cuenta"}
            </h3>
            <form onSubmit={handleModalSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Título</label>
                <input
                  type="text"
                  value={modalSummary}
                  onChange={e => setModalSummary(e.target.value)}
                  placeholder="Ej: Cumpleaños de Juan"
                  required
                  className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Fecha y hora</label>
                <DateTimePicker value={modalStart} onChange={setModalStart} required ringColor="indigo" />
              </div>
              <button
                type="submit"
                disabled={guardando}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold py-4 rounded-xl mt-2 active:scale-95 transition-all shadow-lg shadow-indigo-100"
              >
                {guardando ? "Guardando..." : modalMode === "create" ? "Crear evento" : "Guardar cambios"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

function TimeBox({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center min-w-[50px]">
      <span className="text-xl font-black text-slate-800 dark:text-slate-100 tabular-nums">
        {String(value).padStart(2, "0")}
      </span>
      <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tighter">{label}</span>
    </div>
  )
}

function NavItem({ icon, label, active = false, disabled = false, onClick }: {
  icon: React.ReactNode
  label: string
  active?: boolean
  disabled?: boolean
  onClick?: () => void
}) {
  return (
    <button
      onClick={!disabled ? onClick : undefined}
      className={`flex items-center gap-3 w-full p-3 rounded-xl transition-all duration-200
        ${active
          ? "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 shadow-sm ring-1 ring-indigo-100 dark:ring-indigo-800"
          : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700"
        }
        ${disabled ? "opacity-30 cursor-not-allowed" : "cursor-pointer font-bold"}`}
    >
      {icon}
      <span className="text-sm">{label}</span>
      {active && <div className="ml-auto w-1.5 h-1.5 bg-indigo-600 dark:bg-indigo-400 rounded-full" />}
    </button>
  )
}

function StatCard({ title, value, trend, icon }: {
  title: string
  value: string | number
  trend: string
  icon?: React.ReactNode
}) {
  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1 rounded-md leading-tight">{trend}</span>
        {icon && <div className="p-2 bg-slate-50 dark:bg-slate-700 rounded-lg shrink-0">{icon}</div>}
      </div>
      <div className="mt-2">
        <h3 className="text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-widest">{title}</h3>
        <p className="text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">{value}</p>
      </div>
    </div>
  )
}
