"use client"

import { signOut } from "next-auth/react"

export default function LogoutButton() {
  return (
    <button
      onClick={() => signOut()}
      className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg text-xs cursor-pointer"
    >
      Cerrar sesión
    </button>
  )
}