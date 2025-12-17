"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Ticket, Map, Settings, User, LogIn, Home } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"

export default function MobileNavFooter() {
  const { isAuthenticated } = useAuth()
  const pathname = usePathname()

  const navItems = [
    { label: "Bookings", href: "#", icon: Ticket, id: "bookings" },
    { label: "Routes", href: "#", icon: Map, id: "routes" },
    { label: "Services", href: "#", icon: Settings, id: "services" },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-border shadow-lg z-50">
      <div className="flex justify-around items-center h-16">
        {pathname !== "/" && (
          <Link
            href="/"
            className="flex flex-col items-center justify-center w-full h-full gap-1 text-foreground hover:text-primary transition-colors hover:bg-muted"
          >
            <Home size={24} />
            <span className="text-xs font-medium">Home</span>
          </Link>
        )}
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.id}
              href={item.href}
              className="flex flex-col items-center justify-center w-full h-full gap-1 text-foreground hover:text-primary transition-colors hover:bg-muted"
            >
              <Icon size={24} />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          )
        })}
        {/* Auth Button - Account or Login based on state */}
        {isAuthenticated ? (
          <Link
            href="/account"
            className="flex flex-col items-center justify-center w-full h-full gap-1 text-foreground hover:text-primary transition-colors hover:bg-muted"
          >
            <User size={24} />
            <span className="text-xs font-medium">Account</span>
          </Link>
        ) : (
          <Link
            href="/login"
            className="flex flex-col items-center justify-center w-full h-full gap-1 text-foreground hover:text-primary transition-colors hover:bg-muted"
          >
            <LogIn size={24} />
            <span className="text-xs font-medium">Login</span>
          </Link>
        )}
      </div>
    </nav>
  )
}
