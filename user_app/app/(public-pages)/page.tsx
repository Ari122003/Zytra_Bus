import Features from "@/components/landing/feature";
import Footer from "@/components/landing/footer";
import Hero from "@/components/landing/hero";
import MobileNavFooter from "@/components/landing/mobile-nav-footer";
import Navbar from "@/components/landing/navbar";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Desktop navbar */}
      <div className="hidden md:block">
        <Navbar/>
      </div>
      <main className="grow pb-20 md:pb-0">
        <Hero/>
        <Features/>
      </main>
      {/* Desktop footer */}
      <div className="hidden md:block">
        <Footer/>
      </div>
      {/* Mobile nav footer */}
      <div className="md:hidden">
        <MobileNavFooter/>
      </div>
    </div>
  )
}
