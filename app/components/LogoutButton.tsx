"use client"

import { signOut } from "next-auth/react"

export default function LogoutButton() {
  return (
    <button
      onClick={() => signOut()}
      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm"
    >
      Cerrar sesión
    </button>
  )
}