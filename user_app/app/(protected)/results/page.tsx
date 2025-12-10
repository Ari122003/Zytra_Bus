"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import SearchSection from "@/components/landing/search-section"
import { Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Bus } from "@/types/bus.type"


export default function Results() {
  const searchParams = useSearchParams()
  const [buses, setBuses] = useState<Bus[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const from = searchParams.get("from") || ""
  const to = searchParams.get("to") || ""
  const date = searchParams.get("date") || ""

  // Mock data generator
  const generateMockBuses = (): Bus[] => {
    return [
      {
        id: "1",
        from,
        to,
        departureTime: "08:00 AM",
        arrivalTime: "02:30 PM",
        price: 1500,
        seatsAvailable: 8,
        busType: "Sleeper",
      },
      {
        id: "2",
        from,
        to,
        departureTime: "11:00 AM",
        arrivalTime: "05:00 PM",
        price: 1200,
        seatsAvailable: 12,
        busType: "AC Seater",
      },
      {
        id: "3",
        from,
        to,
        departureTime: "02:00 PM",
        arrivalTime: "08:30 PM",
        price: 800,
        seatsAvailable: 15,
        busType: "Non-AC",
      },
      {
        id: "4",
        from,
        to,
        departureTime: "09:30 AM",
        arrivalTime: "04:00 PM",
        price: 2500,
        seatsAvailable: 5,
        busType: "Luxury Sleeper",
      },
      {
        id: "5",
        from,
        to,
        departureTime: "05:00 PM",
        arrivalTime: "11:15 PM",
        price: 1300,
        seatsAvailable: 9,
        busType: "AC Seater",
      },
    ]
  }

  useEffect(() => {
    // Simulate API call
    const timer = setTimeout(() => {
      setBuses(generateMockBuses())
      setIsLoading(false)
    }, 500)

    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [from, to, date])

  const handleSearch = () => {
    // Update results based on new search
    setIsLoading(true)
    const timer = setTimeout(() => {
      setBuses(generateMockBuses())
      setIsLoading(false)
    }, 500)

    return () => clearTimeout(timer)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Search Section */}
      <div className="bg-white dark:bg-slate-900 py-8 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SearchSection
            initialFrom={from}
            initialTo={to}
            initialDate={date}
            onSearch={handleSearch}
          />
        </div>
      </div>

      {/* Results Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Summary */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            Buses from <span className="text-primary">{from}</span> to <span className="text-primary">{to}</span>
          </h1>
          <p className="text-muted-foreground">
            Traveling on {date} • {buses.length} buses found
          </p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        )}

        {/* Results Grid */}
        {!isLoading && buses.length > 0 && (
          <div className="space-y-6">
            {/* Results List */}
            <div className="space-y-6">
              {buses.map((bus) => (
                <div
                  key={bus.id}
                  className="bg-white dark:bg-slate-800 rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden"
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6">
                    {/* Bus Details */}
                    <div className="md:col-span-2 flex flex-col justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">{bus.busType}</p>

                        {/* Journey Info */}
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <p className="text-xs text-muted-foreground uppercase">From</p>
                            <p className="text-lg font-semibold text-foreground">{bus.from}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground uppercase">To</p>
                            <p className="text-lg font-semibold text-foreground">{bus.to}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs text-muted-foreground uppercase">Departure</p>
                            <p className="text-lg font-semibold text-foreground">{bus.departureTime}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground uppercase">Arrival</p>
                            <p className="text-lg font-semibold text-foreground">{bus.arrivalTime}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Pricing and Booking */}
                    <div className="md:col-span-1 flex flex-col justify-between">
                      {/* Seats and Price */}
                      <div className="mb-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                          <Users size={16} />
                          <span>{bus.seatsAvailable} seats left</span>
                        </div>
                        <p className="text-3xl font-bold text-primary mb-2">₹{bus.price}</p>
                        <p className="text-xs text-muted-foreground">per person</p>
                      </div>

                      {/* Book Button */}
                      <Button className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-2">
                        Select
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No Results */}
        {!isLoading && buses.length === 0 && (
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground">No buses found for your search.</p>
            <p className="text-sm text-muted-foreground mt-2">Try changing your search criteria.</p>
          </div>
        )}
      </div>
    </div>
  )
}
