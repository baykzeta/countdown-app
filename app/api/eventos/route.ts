import { NextRequest, NextResponse } from "next/server"
import { google } from "googleapis"

function getAuth(accessToken: string) {
  const auth = new google.auth.OAuth2()
  auth.setCredentials({ access_token: accessToken })
  return auth
}

export async function POST(req: NextRequest) {
  const { accessToken, summary, start, timezone } = await req.json()

  if (!accessToken || !summary || !start) {
    return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 })
  }

  const tz = timezone ?? "America/Santiago"
  const startDate = new Date(start)
  const endDate = new Date(startDate.getTime() + 60 * 60 * 1000)

  const calendar = google.calendar({ version: "v3", auth: getAuth(accessToken) })

  const evento = await calendar.events.insert({
    calendarId: "primary",
    requestBody: {
      summary,
      start: { dateTime: startDate.toISOString(), timeZone: tz },
      end: { dateTime: endDate.toISOString(), timeZone: tz },
    },
  })

  return NextResponse.json({ evento: evento.data })
}

export async function GET(req: NextRequest) {
  const accessToken = req.nextUrl.searchParams.get("accessToken")

  if (!accessToken) {
    return NextResponse.json({ error: "Missing accessToken" }, { status: 401 })
  }

  const calendar = google.calendar({ version: "v3", auth: getAuth(accessToken) })

  const now = new Date()
  const oneYearFromNow = new Date(now)
  oneYearFromNow.setFullYear(now.getFullYear() + 1)

  const res = await calendar.events.list({
    calendarId: "primary",
    timeMin: now.toISOString(),
    timeMax: oneYearFromNow.toISOString(),
    maxResults: 250,
    singleEvents: true,
    orderBy: "startTime",
  })

  const eventos = res.data.items ?? []

  return NextResponse.json({ eventos })
}

export async function PATCH(req: NextRequest) {
  const { accessToken, eventId, summary, start, timezone } = await req.json()

  if (!accessToken || !eventId || !summary || !start) {
    return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 })
  }

  const tz = timezone ?? "America/Santiago"
  const startDate = new Date(start)
  const endDate = new Date(startDate.getTime() + 60 * 60 * 1000)

  const calendar = google.calendar({ version: "v3", auth: getAuth(accessToken) })

  const evento = await calendar.events.patch({
    calendarId: "primary",
    eventId,
    requestBody: {
      summary,
      start: { dateTime: startDate.toISOString(), timeZone: tz },
      end: { dateTime: endDate.toISOString(), timeZone: tz },
    },
  })

  return NextResponse.json({ evento: evento.data })
}

export async function DELETE(req: NextRequest) {
  const { accessToken, eventId } = await req.json()

  if (!accessToken || !eventId) {
    return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 })
  }

  const calendar = google.calendar({ version: "v3", auth: getAuth(accessToken) })
  await calendar.events.delete({ calendarId: "primary", eventId })

  return NextResponse.json({ ok: true })
}
