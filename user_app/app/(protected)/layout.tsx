import Navbar from "@/components/landing/navbar"
import MobileNavFooter from "@/components/landing/mobile-nav-footer"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute>
      <div className="flex flex-col min-h-screen">
        {/* Desktop navbar */}
        <div className="hidden md:block">
          <Navbar />
        </div>
        <main className="grow pb-20 md:pb-0">
          {children}
        </main>
        {/* Mobile nav footer */}
        <div className="md:hidden">
          <MobileNavFooter />
        </div>
      </div>
    </ProtectedRoute>
  )
}
