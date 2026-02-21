"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

export default function TopNav() {
  const pathname = usePathname()
  const [groupComplete, setGroupComplete] = useState<boolean | null>(null)

  useEffect(() => {
    async function fetchStatus() {
      try {
        const res = await fetch("/api/cup/status")
        const data = await res.json()
        setGroupComplete(data.groupComplete)
      } catch {
        setGroupComplete(false)
      }
    }

    fetchStatus()
  }, [])

  const items = [
    { href: "/", label: "Rules & Info" },
    { href: "/fixtures", label: "Fixtures" },
    ...(groupComplete
      ? [{ href: "/finals", label: "Knockout Round" }]
      : []),
    { href: "/table", label: "League Table" },
  ]

  return (
    <nav className="bg-gray-900 text-white p-4 hidden md:block">
      <div className="max-w-4xl mx-auto flex space-x-6">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "hover:text-green-400 transition-colors",
              pathname === item.href
                ? "text-green-500 font-semibold"
                : "text-gray-300"
            )}
          >
            {item.label}
          </Link>
        ))}
      </div>
    </nav>
  )
}