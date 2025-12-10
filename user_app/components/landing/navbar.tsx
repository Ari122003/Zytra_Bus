"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Menu, X, User, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"


export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userName] = useState("John Doe")
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

          {/* Desktop auth button showing single option based on state */}
          <div className="hidden md:block">
            {isAuthenticated ? (
              <Button
                onClick={() => setIsAuthenticated(false)}
                className="bg-primary hover:bg-primary/90 text-white gap-2"
              >
                <User size={16} />
                {userName}
              </Button>
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
              <Button
                onClick={() => setIsAuthenticated(false)}
                className="w-full bg-primary hover:bg-primary/90 text-white gap-2"
              >
                <LogOut size={16} />
                Logout ({userName})
              </Button>
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
