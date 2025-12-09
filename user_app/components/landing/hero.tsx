"use client"

import { useState } from "react"
import Image from "next/image"
import { MapPin, Calendar, ArrowLeftRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function Hero() {
  const cities = [
    "New York",
    "Boston",
    "Philadelphia",
    "Washington DC",
    "Los Angeles",
    "San Francisco",
    "Chicago",
    "Miami",
    "Atlanta",
    "Denver",
    "Seattle",
    "Austin",
    "Nashville",
    "Portland",
    "Las Vegas",
  ]

  const [from, setFrom] = useState<string>("")
  const [to, setTo] = useState<string>("")
  const [date, setDate] = useState<string>("2025-12-20")
  const [fromSuggestions, setFromSuggestions] = useState<string[]>([])
  const [toSuggestions, setToSuggestions] = useState<string[]>([])
  const [showFromSuggestions, setShowFromSuggestions] = useState<boolean>(false)
  const [showToSuggestions, setShowToSuggestions] = useState<boolean>(false)

  const handleFromChange = (value: string) => {
    setFrom(value)
    if (value.trim()) {
      const filtered = cities.filter((city) => city.toLowerCase().includes(value.toLowerCase()))
      setFromSuggestions(filtered)
      setShowFromSuggestions(true)
    } else {
      setFromSuggestions([])
      setShowFromSuggestions(false)
    }
  }

  const handleToChange = (value: string) => {
    setTo(value)
    if (value.trim()) {
      const filtered = cities.filter((city) => city.toLowerCase().includes(value.toLowerCase()))
      setToSuggestions(filtered)
      setShowToSuggestions(true)
    } else {
      setToSuggestions([])
      setShowToSuggestions(false)
    }
  }

  const selectFromCity = (city: string) => {
    setFrom(city)
    setShowFromSuggestions(false)
  }

  const selectToCity = (city: string) => {
    setTo(city)
    setShowToSuggestions(false)
  }

  const swapLocations = () => {
    const temp = from
    setFrom(to)
    setTo(temp)
  }

  return (
    <section className="relative bg-linear-to-b from-muted to-background py-12 md:py-20">
      {/* Background Bus Image */}
      <div className="absolute inset-0 opacity-5 md:opacity-10">
        <Image src="/modern-bus-transportation-highway.jpg" alt="Bus background" fill className="object-cover" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
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
        <div className="max-w-4xl mx-auto bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 md:p-8">
          {/* Search Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-6">
            {/* From */}
            <div className="md:col-span-5 relative">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">From</label>
              <div className="flex items-center gap-2 mt-2">
                <MapPin size={18} className="text-primary" />
                <input
                  type="text"
                  value={from}
                  onChange={(e) => handleFromChange(e.target.value)}
                  onFocus={() => from.trim() && setShowFromSuggestions(true)}
                  className="w-full bg-input border border-border rounded-lg px-3 py-2 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Departure city"
                />
              </div>
              {showFromSuggestions && fromSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-700 border border-border rounded-lg shadow-lg z-10">
                  {fromSuggestions.map((city) => (
                    <button
                      key={city}
                      onClick={() => selectFromCity(city)}
                      className="w-full text-left px-4 py-2 hover:bg-muted transition-colors text-foreground text-sm"
                    >
                      {city}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="md:col-span-2 flex items-end justify-center">
              <button
                onClick={swapLocations}
                className="flex items-center gap-2 px-4 py-2 text-primary hover:bg-muted rounded-lg transition-colors mb-1"
              >
                <ArrowLeftRight size={20} />
              </button>
            </div>

            {/* To */}
            <div className="md:col-span-5 relative">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">To</label>
              <div className="flex items-center gap-2 mt-2">
                <MapPin size={18} className="text-primary" />
                <input
                  type="text"
                  value={to}
                  onChange={(e) => handleToChange(e.target.value)}
                  onFocus={() => to.trim() && setShowToSuggestions(true)}
                  className="w-full bg-input border border-border rounded-lg px-3 py-2 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Destination city"
                />
              </div>
              {showToSuggestions && toSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-700 border border-border rounded-lg shadow-lg z-10">
                  {toSuggestions.map((city) => (
                    <button
                      key={city}
                      onClick={() => selectToCity(city)}
                      className="w-full text-left px-4 py-2 hover:bg-muted transition-colors text-foreground text-sm"
                    >
                      {city}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Date and Search */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-0 md:items-end">
            {/* Date */}
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Date</label>
              <div className="flex items-center gap-2 mt-2">
                <Calendar size={18} className="text-primary" />
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-input border border-border rounded-lg px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            {/* Search Button */}
            <Button className="bg-primary hover:bg-primary/90 text-white px-8 py-2 text-lg font-semibold md:col-span-2 md:ml-4">
              Search Buses
            </Button>
          </div>
        </div>

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
