"use client"

import { useSearchParams, useRouter } from "next/navigation"
import SearchSection from "@/components/landing/search-section"
import { Users, Clock, Bus as BusIcon, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useSearchBuses } from "@/hooks"
import type { BusResult } from "@/types/bus.type"

/**
 * Format time string from HH:mm:ss to 12-hour format
 */
const formatTime = (time: string): string => {
  try {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minutes} ${ampm}`;
  } catch {
    return time;
  }
};

/**
 * Format date string to readable format
 */
const formatDate = (dateStr: string): string => {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
};

export default function Results() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const source = searchParams.get("from") || ""
  const destination = searchParams.get("to") || ""
  const travelDate = searchParams.get("date") || ""

  // Use TanStack Query to fetch buses
  const { 
    data, 
    isLoading, 
    isError, 
    error,
    refetch 
  } = useSearchBuses({
    source,
    destination,
    travelDate,
  });

  const buses = data?.results || [];

  const handleSearch = (from: string, to: string, date: string) => {
    // Update URL params to trigger new search
    router.push(`/results?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&date=${encodeURIComponent(date)}`);
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Search Section */}
      <div className="bg-white dark:bg-slate-900 py-8 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SearchSection
            initialFrom={source}
            initialTo={destination}
            initialDate={travelDate}
            onSearch={handleSearch}
          />
        </div>
      </div>

      {/* Results Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Summary */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            Buses from <span className="text-primary">{source}</span> to <span className="text-primary">{destination}</span>
          </h1>
          <p className="text-muted-foreground">
            Traveling on {formatDate(travelDate)} • {buses.length} buses found
          </p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        )}

        {/* Error State */}
        {isError && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <AlertCircle className="h-12 w-12 text-destructive mb-4" />
            <p className="text-lg text-foreground font-medium mb-2">Failed to load buses</p>
            <p className="text-sm text-muted-foreground mb-4">
              {error?.message || 'An error occurred while searching for buses.'}
            </p>
            <Button onClick={() => refetch()} variant="outline">
              Try Again
            </Button>
          </div>
        )}

        {/* Results Grid */}
        {!isLoading && !isError && buses.length > 0 && (
          <div className="space-y-6">
            {/* Results List */}
            <div className="space-y-6">
              {buses.map((bus: BusResult) => (
                <div
                  key={bus.tripId}
                  className="bg-white dark:bg-slate-800 rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden"
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6">
                    {/* Bus Details */}
                    <div className="md:col-span-2 flex flex-col justify-between">
                      <div>
                        {/* Bus Info */}
                        <div className="flex items-center gap-2 mb-3">
                          <BusIcon className="h-5 w-5 text-primary" />
                          <span className="font-semibold text-foreground">{bus.busNumber}</span>
                          <span className="text-sm text-muted-foreground">• {bus.busDescription}</span>
                        </div>

                        {/* Journey Info */}
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <p className="text-xs text-muted-foreground uppercase">From</p>
                            <p className="text-lg font-semibold text-foreground">{bus.source}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground uppercase">To</p>
                            <p className="text-lg font-semibold text-foreground">{bus.destination}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="text-xs text-muted-foreground uppercase">Departure</p>
                              <p className="text-lg font-semibold text-foreground">{formatTime(bus.departureTime)}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="text-xs text-muted-foreground uppercase">Arrival</p>
                              <p className="text-lg font-semibold text-foreground">{formatTime(bus.arrivalTime)}</p>
                            </div>
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
                          <span>{bus.availableSeats} seats left</span>
                        </div>
                        <p className="text-3xl font-bold text-primary mb-2">₹{bus.fare}</p>
                        <p className="text-xs text-muted-foreground">per person</p>
                      </div>

                      {/* Book Button */}
                      <Button 
                        className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-2"
                        disabled={bus.availableSeats === 0}
                      >
                        {bus.availableSeats > 0 ? 'Select' : 'Sold Out'}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No Results */}
        {!isLoading && !isError && buses.length === 0 && (
          <div className="text-center py-12">
            <BusIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg text-muted-foreground">No buses found for your search.</p>
            <p className="text-sm text-muted-foreground mt-2">Try changing your search criteria.</p>
          </div>
        )}
      </div>
    </div>
  )
}
