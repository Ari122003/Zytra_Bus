"use client"

import { useUserBookings } from "@/hooks/useBooking"
import { useUserProfile } from "@/contexts/UserContext"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import {
  Ticket,
  MapPin,
  Calendar,
  Clock,
  AlertCircle,
  Bus,
  IndianRupee,
  ChevronRight,
  Loader2,
} from "lucide-react"
import type { UserBooking } from "@/types/booking.type"
import { AxiosError } from "axios"

/**
 * Format time string from HH:mm:ss to 12-hour format
 */
const formatTime = (time: string): string => {
  try {
    const [hours, minutes] = time.split(':')
    const hour = parseInt(hours, 10)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const formattedHour = hour % 12 || 12
    return `${formattedHour}:${minutes} ${ampm}`
  } catch {
    return time
  }
}

/**
 * Format date string to readable format
 */
const formatDate = (dateStr: string): string => {
  try {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  } catch {
    return dateStr
  }
}

/**
 * Booking card component
 */
function BookingCard({ booking }: { booking: UserBooking }) {
  const router = useRouter()

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Bus className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="font-semibold text-foreground">Booking #{booking.bookingId}</p>
            <p className="text-sm text-muted-foreground">{booking.totalSeats} seat(s)</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Route */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-start gap-2">
            <MapPin className="h-5 w-5 text-primary mt-0.5 shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground uppercase">From</p>
              <p className="font-semibold text-foreground">{booking.source}</p>
              <p className="text-sm text-muted-foreground">{formatTime(booking.departureTime)}</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <MapPin className="h-5 w-5 text-primary mt-0.5 shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground uppercase">To</p>
              <p className="font-semibold text-foreground">{booking.destination}</p>
              <p className="text-sm text-muted-foreground">{formatTime(booking.arrivalTime)}</p>
            </div>
          </div>
        </div>

        {/* Date and Seats */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground uppercase">Travel Date</p>
              <p className="text-sm font-medium text-foreground">{formatDate(booking.travelDate)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Ticket className="h-5 w-5 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground uppercase">Total Seats</p>
              <p className="text-sm font-medium text-foreground">{booking.totalSeats} seat(s)</p>
            </div>
          </div>
        </div>

        {/* View Details Button */}
        <Button 
          variant="outline" 
          className="w-full mt-4"
          onClick={() => router.push(`/bookings/${booking.bookingId}`)}
        >
          View Details
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  )
}

/**
 * Bookings page component
 */
export default function BookingsPage() {
  const router = useRouter()
  const { userProfile } = useUserProfile()
  const { data: bookings, isLoading, isError, error, refetch } = useUserBookings(userProfile?.id)

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
          <p className="text-muted-foreground">Loading your bookings...</p>
        </div>
      </div>
    )
  }

  // Error state - check for 404 (no bookings) vs 500 (server error)
  if (isError) {
    const axiosError = error as AxiosError
    const is404 = axiosError.response?.status === 404
    const is500 = axiosError.response?.status === 500

    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="flex flex-col items-center justify-center text-center max-w-md">
          <div className={`p-4 rounded-full mb-4 ${is404 ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
            <AlertCircle className={`h-16 w-16 ${is404 ? 'text-blue-600 dark:text-blue-400' : 'text-red-600 dark:text-red-400'}`} />
          </div>
          
          <h2 className="text-2xl font-bold text-foreground mb-2">
            {is404 ? 'No Bookings Found' : 'Something Went Wrong'}
          </h2>
          
          <p className="text-muted-foreground mb-6">
            {is404 
              ? "You haven't made any bookings yet. Start exploring and book your first trip!"
              : is500
              ? "We're experiencing technical difficulties. Please try again later."
              : "Failed to load your bookings. Please try again."}
          </p>
          
          <div className="flex gap-4">
            {is404 ? (
              <Button onClick={() => router.push('/')} className="bg-primary hover:bg-primary/90">
                Find Buses
              </Button>
            ) : (
              <>
                <Button variant="outline" onClick={() => router.push('/')}>
                  Go Home
                </Button>
                <Button onClick={() => refetch()}>
                  Try Again
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Empty state (should be covered by 404, but just in case)
  if (!bookings || bookings.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="flex flex-col items-center justify-center text-center max-w-md">
          <div className="p-4 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-4">
            <Ticket className="h-16 w-16 text-blue-600 dark:text-blue-400" />
          </div>
          
          <h2 className="text-2xl font-bold text-foreground mb-2">No Bookings Yet</h2>
          
          <p className="text-muted-foreground mb-6">
            You have not made any bookings yet. Start your journey by booking your first trip!
          </p>
          
          <Button onClick={() => router.push('/')} className="bg-primary hover:bg-primary/90">
            Find Buses
          </Button>
        </div>
      </div>
    )
  }

  // Success state - display bookings
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 shadow-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">My Bookings</h1>
              <p className="text-sm text-muted-foreground mt-1">
                {bookings.length} {bookings.length === 1 ? 'booking' : 'bookings'} found
              </p>
            </div>
            <Button 
              variant="outline"
              onClick={() => router.push('/')}
            >
              Book New Trip
            </Button>
          </div>
        </div>
      </div>

      {/* Bookings Grid */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bookings.map((booking) => (
            <BookingCard key={booking.bookingId} booking={booking} />
          ))}
        </div>
      </div>
    </div>
  )
}
