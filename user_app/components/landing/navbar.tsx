"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { Menu, X, User, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/useAuth"
import { useUserProfile } from "@/contexts/UserContext"
import Image from "next/image"

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const { isAuthenticated } = useAuth()
  const { userProfile } = useUserProfile()
  const router = useRouter()
  const pathname = usePathname()

  // Avatar reads from UserContext; AuthContext hydrates after login

  const navLinks = [
    { label: "Book Buses", href: "/" },
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
            {pathname !== "/" && (
              <Link
                href="/"
                className="text-foreground hover:text-primary transition-colors font-medium flex items-center gap-2"
              >
                <Home size={18} />
                Home
              </Link>
            )}
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
               <Image
                        src={userProfile?.imageUrl || '/dummy.png'}
                        alt="User avatar"
                        width={36}
                        height={24}
                        className="rounded-full border border-muted-foreground/20 shadow-sm"
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
            {pathname !== "/" && (
              <Link
                href="/"
                className="flex items-center gap-2 px-4 py-2 text-foreground hover:bg-muted rounded-lg transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <Home size={18} />
                Home
              </Link>
            )}
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
                  <Image
                    src={userProfile?.imageUrl || '/dummy.png'}
                    alt="User avatar"
                    width={40}
                    height={40}
                    className="rounded-full border border-muted-foreground/20"
                  />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{userProfile?.name || 'Account'}</span>
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
