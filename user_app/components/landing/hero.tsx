"use client"

import Image from "next/image"
import SearchSection from "@/components/landing/search-section"

export default function Hero() {

  return (
    <section className="relative bg-linear-to-b from-muted to-background py-12 md:py-20">
      {/* Background Bus Image */}
      <div className="absolute inset-0 opacity-5 md:opacity-10">
        <Image src="/modern-bus-transportation-highway.jpg" alt="Bus background" fill className="object-cover" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* App Name for Mobile */}
        <div className="md:hidden text-center mb-4">
          <h2 className="text-2xl font-bold text-primary">Zytra Bus</h2>
        </div>
        {/* Hero Title */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
            Your Journey, Our <span className="text-primary">Priority</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Book comfortable bus tickets for your next adventure. Fast, reliable, and affordable travel.
          </p>
        </div>

        {/* Search Card */}
        <SearchSection />

        {/* Bus Images Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
          <div className="rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
            <div className="relative w-full h-64">
              <Image src="/bus1.jpg" alt="Luxury buses" fill className="object-cover" />
            </div>
            <div className="bg-white dark:bg-slate-800 p-4">
              <h3 className="font-bold text-foreground">Comfort Travel</h3>
              <p className="text-sm text-muted-foreground">Spacious seats & premium service</p>
            </div>
          </div>

          <div className="rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
            <div className="relative w-full h-64">
              <Image src="/bus2.jpg" alt="Express buses" fill className="object-cover" />
            </div>
            <div className="bg-white dark:bg-slate-800 p-4">
              <h3 className="font-bold text-foreground">Express Routes</h3>
              <p className="text-sm text-muted-foreground">Quick & efficient travel</p>
            </div>
          </div>

          <div className="rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
            <div className="relative w-full h-64">
              <Image src="/bus3.jpg" alt="Budget buses" fill className="object-cover" />
            </div>
            <div className="bg-white dark:bg-slate-800 p-4">
              <h3 className="font-bold text-foreground">Budget Friendly</h3>
              <p className="text-sm text-muted-foreground">Great prices, great service</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
