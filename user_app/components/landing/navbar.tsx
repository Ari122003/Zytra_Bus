"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Menu, X, User, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/useAuth"

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const { isAuthenticated, user, logout } = useAuth()
  const router = useRouter()
  

  const navLinks = [
    { label: "Book Buses", href: "#" },
    { label: "Routes", href: "#" },
    { label: "Services", href: "#" },
  ]

  return (
    <nav className="sticky top-0 z-40 bg-white shadow-md dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">✓</span>
            </div>
            <span className="font-bold text-xl text-primary hidden sm:inline">Zytra Bus</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-foreground hover:text-primary transition-colors font-medium"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop auth: avatar when authenticated, login otherwise */}
          <div className="hidden md:block">
            {isAuthenticated ? (
              <button
                aria-label="Account"
                onClick={() => router.push("/account")}
                className="inline-flex items-center focus:outline-none"
              >
                <img
                  src={`https://i.pravatar.cc/48?u=${user?.email || 'zytra-user'}`}
                  alt="User avatar"
                  className="w-9 h-9 rounded-full border border-muted-foreground/20 shadow-sm"
                />
              </button>
            ) : (
              <Button onClick={() => router.push("/login")} className="bg-primary hover:bg-primary/90 text-white gap-2">
                <User size={16} />
                Login
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="text-foreground">
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden pb-4 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="block px-4 py-2 text-foreground hover:bg-muted rounded-lg transition-colors"
              >
                {link.label}
              </Link>
            ))}
            {isAuthenticated ? (
              <div className="space-y-2 px-4">
                <button
                  aria-label="Account"
                  onClick={() => {
                    setIsOpen(false)
                    router.push("/account")
                  }}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted"
                >
                  <img
                    src={`https://i.pravatar.cc/64?u=${user?.email || 'zytra-user'}`}
                    alt="User avatar"
                    className="w-10 h-10 rounded-full border border-muted-foreground/20"
                  />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{user?.name || 'Account'}</span>
                    <span className="text-xs text-muted-foreground">Tap to view account</span>
                  </div>
                </button>
              </div>
            ) : (
              <Button onClick={() => router.push("/login")} className="w-full bg-primary hover:bg-primary/90 text-white gap-2">
                <User size={16} />
                Login
              </Button>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}
