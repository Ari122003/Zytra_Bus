"use client"

import { useState } from "react"
import { MapPin, Calendar, ArrowLeftRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

interface SearchSectionProps {
  initialFrom?: string
  initialTo?: string
  initialDate?: string
  onSearch?: (from: string, to: string, date: string) => void
}

export default function SearchSection({ 
  initialFrom = "", 
  initialTo = "", 
  initialDate = "2025-12-20",
  onSearch 
}: SearchSectionProps) {
  const cities = [
    "Kolkata",
    "Digha",
    "New Jalpaiguri",
    "Mayapur",
    "Shantiniketan",
  ]

  const [from, setFrom] = useState<string>(initialFrom)
  const [to, setTo] = useState<string>(initialTo)
  const [date, setDate] = useState<string>(initialDate)
  const [fromSuggestions, setFromSuggestions] = useState<string[]>([])
  const [toSuggestions, setToSuggestions] = useState<string[]>([])
  const [isSearching, setIsSearching] = useState<boolean>(false)
  const [dateError, setDateError] = useState<string>('')
  const [showFromSuggestions, setShowFromSuggestions] = useState<boolean>(false)
  const [showToSuggestions, setShowToSuggestions] = useState<boolean>(false)

  const router = useRouter()

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

  /**
   * Check if the selected date is before today
   */
  const isDateBeforeToday = (selectedDate: string): boolean => {
    const today = new Date()
    today.setHours(0, 0, 0, 0) // Reset time to start of day
    const selected = new Date(selectedDate)
    return selected < today
  }

  /**
   * Handle date change with validation
   */
  const handleDateChange = (value: string) => {
    setDate(value)
    if (value && isDateBeforeToday(value)) {
      setDateError('Travel date cannot be in the past')
    } else {
      setDateError('')
    }
  }

  const handleSearch = () => {
    if (isSearching) return; // Prevent multiple clicks
    
    // Validate date before searching
    if (isDateBeforeToday(date)) {
      setDateError('Travel date cannot be in the past')
      return
    }
    
    setIsSearching(true)
    
    if (onSearch) {
      onSearch(from, to, date)
    } else {
      router.push(`/results?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&date=${encodeURIComponent(date)}`)
    }
    
    // Reset after a short delay to allow navigation
    setTimeout(() => setIsSearching(false), 1000)
  }

  return (
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
          <div className="flex items-center gap-2 md:mt-2">
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
      <div className="space-y-4">
        {/* Date */}
        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Date</label>
          <div className="flex items-center gap-2 mt-2">
            <Calendar size={18} className={dateError ? "text-destructive" : "text-primary"} />
            <input
              type="date"
              value={date}
              onChange={(e) => handleDateChange(e.target.value)}
              min={new Date().toISOString().split('T')[0]} // Prevent selecting past dates
              className={`w-full bg-input border rounded-lg px-3 py-2 text-foreground focus:outline-none focus:ring-2 ${
                dateError 
                  ? 'border-destructive focus:ring-destructive' 
                  : 'border-border focus:ring-primary'
              }`}
            />
          </div>
          {dateError && (
            <p className="text-destructive text-sm mt-1">{dateError}</p>
          )}
        </div>

        {/* Search Button - Below Date */}
        <div className="flex justify-center">
          <Button 
            onClick={handleSearch} 
            disabled={isSearching || !from.trim() || !to.trim() || !date || !!dateError}
            className="w-full md:w-auto bg-primary hover:bg-primary/90 text-white px-8 py-2 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSearching ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Searching...
              </span>
            ) : (
              'Search Buses'
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
