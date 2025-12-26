"use client"

import { useState, useMemo, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { useTripDetails, useLockSeats } from "@/hooks"
import { useUserProfile } from "@/contexts/UserContext"
import { Button } from "@/components/ui/button"
import { getErrorMessage } from "@/lib/utils"
import type { Seat } from "@/types/bus.type"
import {
  Bus,
  Clock,
  MapPin,
  AlertCircle,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  X,
} from "lucide-react"

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
 * Seat component for rendering individual seat buttons
 * Handles available, selected, and unavailable states
 */
const SeatButton: React.FC<{
  seat: Seat
  isSelected: boolean
  onSelect: (seatNumber: string) => void
  fare: number
}> = ({ seat, isSelected, onSelect, fare }) => {
  const baseClasses = "w-10 h-10 md:w-12 md:h-12 rounded-lg text-xs font-medium transition-all duration-200 flex items-center justify-center"
  const price =  fare
  const isAvailable = !seat.status || seat.status === 'AVAILABLE'

  // Unavailable seat (BOOKED, LOCKED, or UNAVAILABLE)
  if (!isAvailable) {
    return (
      <button
        disabled
        className={`${baseClasses} bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed`}
        title={`Seat ${seat.seatNumber} - Not Available`}
      >
        {seat.seatNumber}
      </button>
    )
  }

  // Selected seat
  if (isSelected) {
    return (
      <button
        onClick={() => onSelect(seat.seatNumber)}
        className={`${baseClasses} bg-primary text-white shadow-lg scale-105`}
        title={`Seat ${seat.seatNumber} - ₹${price}`}
      >
        {seat.seatNumber}
      </button>
    )
  }

  // Available seat
  return (
    <button
      onClick={() => onSelect(seat.seatNumber)}
      className={`${baseClasses} bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 border-2 border-green-500 hover:bg-green-200 dark:hover:bg-green-800`}
      title={`Seat ${seat.seatNumber} - ₹${price}`}
    >
      {seat.seatNumber}
    </button>
  )
}

/**
 * Row labels for seat matrix (A-L for 12 rows)
 */
const ROW_LABELS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L']

export default function BookingPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const tripId = searchParams.get("tripId")

  // Key for persisting selected seats per trip in sessionStorage
  const storageKey = tripId ? `booking_selectedSeats_${tripId}` : null

  const [selectedSeats, setSelectedSeats] = useState<string[]>(() => {
    // Initialize from URL first (if seats are passed back), then from sessionStorage
    if (typeof window === 'undefined') return []

    const seatsParam = searchParams.get("seats")
    if (seatsParam) {
      return seatsParam.split(',').filter(Boolean)
    }

    if (tripId) {
      try {
        const stored = sessionStorage.getItem(`booking_selectedSeats_${tripId}`)
        if (stored) {
          const parsed = JSON.parse(stored)
          if (Array.isArray(parsed)) {
            return parsed
          }
        }
      } catch {
        // ignore parse errors and fall back to empty selection
      }
    }

    return []
  })
  const [showTripDetails, setShowTripDetails] = useState(true)
  const [lockError, setLockError] = useState<string | null>(null)

  // Persist selected seats in sessionStorage so that going to payment
  // and then coming back (or soft refreshes) retains the previous selection.
  useEffect(() => {
    if (!storageKey) return
    try {
      sessionStorage.setItem(storageKey, JSON.stringify(selectedSeats))
    } catch {
      // Ignore storage errors (e.g., quota exceeded)
    }
  }, [selectedSeats, storageKey])

  // Fetch trip details
  const {
    data: tripDetails,
    isLoading,
    isError,
    error,
    refetch,
  } = useTripDetails(tripId ? parseInt(tripId) : null)

  // Lock seats mutation
  const lockSeatsMutation = useLockSeats()
  const { userProfile } = useUserProfile()

  // Get seat matrix from API response
  const seatMatrix = useMemo(() => {
    return tripDetails?.seatMatrix || []
  }, [tripDetails?.seatMatrix])
  
  // Flatten seat matrix for price calculations
  const allSeats = useMemo(() => {
    return seatMatrix.flat()
  }, [seatMatrix])

  const handleSeatSelect = (seatNumber: string) => {
    setSelectedSeats(prev => {
      if (prev.includes(seatNumber)) {
        return prev.filter(s => s !== seatNumber)
      }
      if (prev.length >= 6) {
        // Maximum 6 seats per booking
        return prev
      }
      return [...prev, seatNumber]
    })
  }

  const totalAmount = useMemo(() => {
    return selectedSeats.reduce((total, seatNumber) => {
      const seat = allSeats.find(s => s.seatNumber === seatNumber)
      return total + ( tripDetails?.fare || 0)
    }, 0)
  }, [selectedSeats, allSeats, tripDetails?.fare])

  const handleProceedToPayment = async () => {
    if (selectedSeats.length === 0 || !tripId) return
    
    // Clear any previous error
    setLockError(null)
    
    try {
      // Lock seats first
      const response = await lockSeatsMutation.mutateAsync({
        tripId: parseInt(tripId),
        seats: selectedSeats,
        lockOwner: userProfile?.id,
      })
      
      // Store lock expiry in sessionStorage for payment page
      sessionStorage.setItem('seatLockExpiresAt', response.lockExpiresAt)
      
      // Navigate to payment page
      router.push(`/payment?tripId=${tripId}&seats=${selectedSeats.join(',')}`)
    } catch (err) {
      // Show error message
      setLockError(getErrorMessage(err, 'Failed to lock seats. Please try again.'))
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground">Loading trip details...</p>
        </div>
      </div>
    )
  }

  if (isError || !tripDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="flex flex-col items-center justify-center text-center max-w-md">
          <AlertCircle className="h-16 w-16 text-destructive mb-4" />
          <h2 className="text-xl font-bold text-foreground mb-2">Failed to Load Trip Details</h2>
          <p className="text-muted-foreground mb-6">
            {getErrorMessage(error, 'An error occurred while loading the trip details.')}
          </p>
          <div className="flex gap-4">
            <Button variant="outline" onClick={() => router.back()}>
              <ArrowLeft size={16} className="mr-2" />
              Go Back
            </Button>
            <Button onClick={() => refetch()}>Try Again</Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-32 md:pb-8">
      {/* Error Toast */}
      {lockError && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 max-w-md w-full mx-4">
          <div className="bg-destructive text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <p className="flex-1 text-sm">{lockError}</p>
            <button
              onClick={() => setLockError(null)}
              className="p-1 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white dark:bg-slate-900 shadow-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-muted rounded-full transition-colors"
            >
              <ArrowLeft size={24} />
            </button>
            <div>
              <h1 className="text-lg md:text-xl font-bold text-foreground">Select Seats</h1>
              <p className="text-sm text-muted-foreground">
                {tripDetails.source} → {tripDetails.destination}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content - Seat Selection */}
          <div className="lg:col-span-2 space-y-6">
            {/* Trip Summary Card - Collapsible on Mobile */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md overflow-hidden">
              <button
                onClick={() => setShowTripDetails(!showTripDetails)}
                className="w-full flex items-center justify-between p-4 md:cursor-default"
              >
                <div className="flex items-center gap-3">
                  <Bus className="h-6 w-6 text-primary" />
                  <div className="text-left">
                    <p className="font-semibold text-foreground">{tripDetails.busNumber}</p>
                    <p className="text-sm text-muted-foreground">{tripDetails.busType}</p>
                  </div>
                </div>
                <div className="md:hidden">
                  {showTripDetails ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>
              </button>

              <div className={`${showTripDetails ? 'block' : 'hidden md:block'} border-t border-border`}>
                <div className="p-4 space-y-4">
                  {/* Route & Time */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="text-xs text-muted-foreground uppercase">From</p>
                        <p className="font-semibold text-foreground">{tripDetails.source}</p>
                        <p className="text-sm text-muted-foreground">{formatTime(tripDetails.departureTime)}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="text-xs text-muted-foreground uppercase">To</p>
                        <p className="font-semibold text-foreground">{tripDetails.destination}</p>
                        <p className="text-sm text-muted-foreground">{formatTime(tripDetails.arrivalTime)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Date & Distance */}
                  <div className="flex items-center justify-between pt-2 border-t border-border">
                    <div className="flex items-center gap-3">
                      <Clock className="h-5 w-5 text-primary" />
                      <p className="text-sm text-foreground">{formatDate(tripDetails.travelDate)}</p>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{tripDetails.distanceInKm} km</span>
                      <span className="text-green-600 dark:text-green-400 font-medium">
                        {tripDetails.availableSeats} seats available
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Seat Legend */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-4">
              <div className="flex flex-wrap gap-4 justify-center">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-green-100 dark:bg-green-900 border-2 border-green-500 rounded" />
                  <span className="text-sm text-muted-foreground">Available</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-primary rounded" />
                  <span className="text-sm text-muted-foreground">Selected</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded" />
                  <span className="text-sm text-muted-foreground">Unavailable</span>
                </div>
              </div>
            </div>

            {/* Seat Layout */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-4 md:p-6">
              <div className="flex flex-col items-center">
                {/* Driver */}
                <div className="w-full flex justify-end mb-6 pr-4" style={{ maxWidth: '280px' }}>
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-muted rounded-lg flex items-center justify-center">
                    <span className="text-xs text-muted-foreground">D</span>
                  </div>
                </div>

                {/* Seat Matrix - 2x2 layout with aisle */}
                <div className="space-y-2">
                  {seatMatrix.map((row, rowIndex) => (
                    <div key={ROW_LABELS[rowIndex] || rowIndex} className="flex items-center gap-1">
                      {/* Row Label */}
                      <span className="w-6 text-xs font-medium text-muted-foreground text-center">
                        {ROW_LABELS[rowIndex]}
                      </span>
                      
                      {/* Left side seats (2 seats) */}
                      <div className="flex gap-1">
                        {row.slice(0, 2).map((seat) => (
                          <SeatButton
                            key={seat.seatNumber}
                            seat={seat}
                            isSelected={selectedSeats.includes(seat.seatNumber)}
                            onSelect={handleSeatSelect}
                            fare={tripDetails.fare}
                          />
                        ))}
                      </div>

                      {/* Aisle */}
                      <div className="w-6 md:w-8" />

                      {/* Right side seats (2 seats) */}
                      <div className="flex gap-1">
                        {row.slice(2, 4).map((seat) => (
                          <SeatButton
                            key={seat.seatNumber}
                            seat={seat}
                            isSelected={selectedSeats.includes(seat.seatNumber)}
                            onSelect={handleSeatSelect}
                            fare={tripDetails.fare}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Row info */}
                <div className="mt-4 text-xs text-muted-foreground text-center">
                  {tripDetails.totalRows} rows × {tripDetails.seatsPerRow} seats per row
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar - Booking Summary (Desktop) */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="sticky top-24">
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Booking Summary</h3>

                {/* Selected Seats */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Selected Seats</span>
                    <span className="font-medium text-foreground">
                      {selectedSeats.length > 0 ? selectedSeats.join(', ') : 'None'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Number of Seats</span>
                    <span className="font-medium text-foreground">{selectedSeats.length}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Price per Seat</span>
                    <span className="font-medium text-foreground">₹{tripDetails.fare}</span>
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t border-border my-4" />

                {/* Total */}
                <div className="flex items-center justify-between mb-6">
                  <span className="text-lg font-semibold text-foreground">Total Amount</span>
                  <span className="text-2xl font-bold text-primary">₹{totalAmount}</span>
                </div>

                {/* Proceed Button */}
                <Button
                  onClick={handleProceedToPayment}
                  disabled={selectedSeats.length === 0 || lockSeatsMutation.isPending}
                  className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3"
                >
                  {lockSeatsMutation.isPending ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Locking Seats...
                    </div>
                  ) : (
                    'Proceed to Payment'
                  )}
                </Button>

                {selectedSeats.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center mt-3">
                    Please select at least one seat to continue
                  </p>
                )}

                {selectedSeats.length >= 6 && (
                  <p className="text-xs text-amber-600 text-center mt-3">
                    Maximum 6 seats can be booked at a time
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-800 border-t border-border shadow-lg lg:hidden z-20">
        <div className="p-4">
          {selectedSeats.length > 0 ? (
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm text-muted-foreground">
                  {selectedSeats.length} seat{selectedSeats.length > 1 ? 's' : ''} selected
                </p>
                <p className="text-xs text-muted-foreground">{selectedSeats.join(', ')}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-primary">₹{totalAmount}</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center mb-3">
              Select seats to continue
            </p>
          )}
          <Button
            onClick={handleProceedToPayment}
            disabled={selectedSeats.length === 0 || lockSeatsMutation.isPending}
            className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3"
          >
            {lockSeatsMutation.isPending ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Locking Seats...
              </div>
            ) : (
              'Proceed to Payment'
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
