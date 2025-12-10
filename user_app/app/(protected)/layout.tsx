import Navbar from "@/components/landing/navbar"
import MobileNavFooter from "@/components/landing/mobile-nav-footer"

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
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
  )
}
