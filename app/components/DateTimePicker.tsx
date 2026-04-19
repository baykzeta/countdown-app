"use client"

import { useRef, memo } from "react"
import DatePicker, { CalendarContainer } from "react-datepicker"
import { es } from "date-fns/locale"

interface Props {
  value: string
  onChange: (value: string) => void
  required?: boolean
  ringColor?: string
}

const DateTimePicker = memo(function DateTimePicker({ value, onChange, required, ringColor = "green" }: Props) {
  const ref = useRef<DatePicker>(null)

  const selected = value ? new Date(value) : null

  function handleChange(date: Date | null) {
    if (!date) {
      onChange("")
      return
    }
    const pad = (n: number) => String(n).padStart(2, "0")
    const formatted = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
    onChange(formatted)
  }

  const CustomContainer = ({ className, children }: { className: string; children: React.ReactNode }) => (
    <div className="rounded-lg overflow-hidden shadow-xl">
      <CalendarContainer className={className}>{children}</CalendarContainer>
      <div className="bg-gray-900 flex justify-end px-3 py-2 border-t border-gray-700">
        <button
          type="button"
          onClick={() => ref.current?.setOpen(false)}
          className="bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-4 py-1.5 rounded-lg transition"
        >
          Aceptar
        </button>
      </div>
    </div>
  )

  return (
    <DatePicker
      ref={ref}
      selected={selected}
      onChange={handleChange}
      showTimeSelect
      timeFormat="HH:mm"
      timeIntervals={15}
      dateFormat="dd/MM/yyyy HH:mm"
      locale={es}
      placeholderText="Selecciona fecha y hora"
      timeCaption="Hora"
      shouldCloseOnSelect={false}
      calendarContainer={CustomContainer}
      required={required}
      className={`w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-${ringColor}-500`}
      wrapperClassName="w-full"
    />
  )
})

export default DateTimePicker
