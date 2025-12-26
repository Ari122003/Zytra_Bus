"use client"

import { useState, useMemo } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { useTripDetails, useLockSeats } from "@/hooks"
import { useUserProfile } from "@/contexts/UserContext"
import { Button } from "@/components/ui/button"
import { getErrorMessage } from "@/lib/utils"
import {
  ArrowLeft,
  Bus,
  MapPin,
  Clock,
  CreditCard,
  Wallet,
  Smartphone,
  Building2,
  AlertCircle,
  Check,
  Shield,
  Lock,
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

type PaymentMethod = 'card' | 'upi' | 'wallet' | 'netbanking'

interface PaymentOption {
  id: PaymentMethod
  name: string
  description: string
  icon: React.ReactNode
}

const paymentOptions: PaymentOption[] = [
  {
    id: 'card',
    name: 'Credit / Debit Card',
    description: 'Visa, Mastercard, RuPay',
    icon: <CreditCard className="h-6 w-6" />,
  },
  {
    id: 'upi',
    name: 'UPI',
    description: 'Google Pay, PhonePe, Paytm',
    icon: <Smartphone className="h-6 w-6" />,
  },
  {
    id: 'wallet',
    name: 'Wallet',
    description: 'Paytm, Amazon Pay, MobiKwik',
    icon: <Wallet className="h-6 w-6" />,
  },
  {
    id: 'netbanking',
    name: 'Net Banking',
    description: 'All major banks supported',
    icon: <Building2 className="h-6 w-6" />,
  },
]

export default function PaymentPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  
  const tripId = searchParams.get("tripId")
  const seatsParam = searchParams.get("seats")
  const selectedSeats = useMemo(() => {
    return seatsParam ? seatsParam.split(',') : []
  }, [seatsParam])

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentError, setPaymentError] = useState<string | null>(null)
  const [lockExpiresAt, setLockExpiresAt] = useState<string | null>(() => {
    // Initialize from sessionStorage (only runs on client)
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('seatLockExpiresAt')
    }
    return null
  })

  // Lock seats mutation for re-locking if expired
  const lockSeatsMutation = useLockSeats()
  const { userProfile } = useUserProfile()

  // Fetch trip details
  const {
    data: tripDetails,
    isLoading,
    isError,
    error,
    refetch,
  } = useTripDetails(tripId ? parseInt(tripId) : null)

  // Calculate total amount based on selected seats
  const totalAmount = useMemo(() => {
    if (!tripDetails) return 0
    
    const seatMatrix = tripDetails.seatMatrix || []
    const allSeats = seatMatrix.flat()
    
    return selectedSeats.reduce((total, seatNumber) => {
      const seat = allSeats.find(s => s.seatNumber === seatNumber)
      return total + (seat?.price || tripDetails.fare || 0)
    }, 0)
  }, [selectedSeats, tripDetails])

  // Convenience fee (2% of total)
  const convenienceFee = useMemo(() => {
    return Math.round(totalAmount * 0.02)
  }, [totalAmount])

  // Grand total
  const grandTotal = totalAmount + convenienceFee

  /**
   * Check if seat lock has expired
   */
  const isLockExpired = (): boolean => {
    if (!lockExpiresAt) return true
    const now = new Date().getTime()
    const expiry = new Date(lockExpiresAt).getTime()
    return now >= expiry
  }

  /**
   * Attempt to re-lock seats
   */
  const relockSeats = async (): Promise<boolean> => {
    if (!tripId) return false
    
    try {
      const response = await lockSeatsMutation.mutateAsync({
        tripId: parseInt(tripId),
        seats: selectedSeats,
        lockOwner: userProfile?.id,
      })
      
      // Update lock expiry
      setLockExpiresAt(response.lockExpiresAt)
      sessionStorage.setItem('seatLockExpiresAt', response.lockExpiresAt)
      return true
    } catch (err) {
      setPaymentError(getErrorMessage(err, 'Seats are no longer available. Redirecting to booking page...'))
      
      // Clear session storage
      sessionStorage.removeItem('seatLockExpiresAt')
      
      // Redirect to booking page after 3 seconds
      setTimeout(() => {
        // Preserve previously selected seats when redirecting back
        router.push(`/booking?tripId=${tripId}&seats=${selectedSeats.join(',')}`)
      }, 3000)
      
      return false
    }
  }

  const handlePayment = async () => {
    if (!selectedPaymentMethod || selectedSeats.length === 0 || !tripId) return

    // Clear any previous error
    setPaymentError(null)
    setIsProcessing(true)
    
    // Check if lock has expired
    if (isLockExpired()) {
      // Try to re-lock seats
      const relockSuccess = await relockSeats()
      if (!relockSuccess) {
        setIsProcessing(false)
        return
      }
    }
    
    // Proceed with payment
    // In real implementation, this would call the payment API
    setTimeout(() => {
      setIsProcessing(false)
      // Clear session storage on success
      sessionStorage.removeItem('seatLockExpiresAt')
      // Navigate to success page
      router.push(`/sucess?tripId=${tripId}&seats=${seatsParam}`)
    }, 2000)
  }

  // Validate URL parameters
  if (!tripId || selectedSeats.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="flex flex-col items-center justify-center text-center max-w-md">
          <AlertCircle className="h-16 w-16 text-destructive mb-4" />
          <h2 className="text-xl font-bold text-foreground mb-2">Invalid Booking</h2>
          <p className="text-muted-foreground mb-6">
            No trip or seats selected. Please go back and select seats to continue.
          </p>
          <Button variant="outline" onClick={() => router.push('/results')}>
            <ArrowLeft size={16} className="mr-2" />
            Back to Search
          </Button>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground">Loading payment details...</p>
        </div>
      </div>
    )
  }

  if (isError || !tripDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="flex flex-col items-center justify-center text-center max-w-md">
          <AlertCircle className="h-16 w-16 text-destructive mb-4" />
          <h2 className="text-xl font-bold text-foreground mb-2">Failed to Load Details</h2>
          <p className="text-muted-foreground mb-6">
            {getErrorMessage(error, 'An error occurred while loading payment details.')}
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
      {paymentError && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 max-w-md w-full mx-4">
          <div className="bg-destructive text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <p className="flex-1 text-sm">{paymentError}</p>
            <button
              onClick={() => setPaymentError(null)}
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
              // Go back explicitly to booking page while preserving selected seats
              onClick={() => router.push(`/booking?tripId=${tripId}&seats=${selectedSeats.join(',')}`)}
              className="p-2 hover:bg-muted rounded-full transition-colors"
            >
              <ArrowLeft size={24} />
            </button>
            <div>
              <h1 className="text-lg md:text-xl font-bold text-foreground">Payment</h1>
              <p className="text-sm text-muted-foreground">
                Complete your booking
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content - Payment Methods */}
          <div className="lg:col-span-2 space-y-6">
            {/* Trip Summary Card */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md overflow-hidden">
              <div className="p-4 border-b border-border">
                <div className="flex items-center gap-3">
                  <Bus className="h-6 w-6 text-primary" />
                  <div>
                    <p className="font-semibold text-foreground">{tripDetails.busNumber}</p>
                    <p className="text-sm text-muted-foreground">{tripDetails.busType}</p>
                  </div>
                </div>
              </div>

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

                {/* Date & Seats */}
                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-primary" />
                    <p className="text-sm text-foreground">{formatDate(tripDetails.travelDate)}</p>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">{selectedSeats.length}</span> seat(s): {selectedSeats.join(', ')}
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Methods */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Select Payment Method</h2>
              
              <div className="space-y-3">
                {paymentOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setSelectedPaymentMethod(option.id)}
                    className={`w-full flex items-center gap-4 p-4 rounded-lg border-2 transition-all ${
                      selectedPaymentMethod === option.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className={`p-3 rounded-lg ${
                      selectedPaymentMethod === option.id
                        ? 'bg-primary text-white'
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      {option.icon}
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-medium text-foreground">{option.name}</p>
                      <p className="text-sm text-muted-foreground">{option.description}</p>
                    </div>
                    {selectedPaymentMethod === option.id && (
                      <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                        <Check className="h-4 w-4 text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>

              {/* Security Note */}
              <div className="mt-6 flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <Shield className="h-5 w-5 text-green-600 dark:text-green-400" />
                <p className="text-sm text-green-700 dark:text-green-300">
                  Your payment is secured with 256-bit SSL encryption
                </p>
              </div>
            </div>
          </div>

          {/* Sidebar - Fare Summary (Desktop) */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="sticky top-24">
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Fare Summary</h3>

                {/* Fare Breakdown */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Base Fare ({selectedSeats.length} seat{selectedSeats.length > 1 ? 's' : ''})</span>
                    <span className="font-medium text-foreground">₹{totalAmount}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Convenience Fee</span>
                    <span className="font-medium text-foreground">₹{convenienceFee}</span>
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t border-border my-4" />

                {/* Total */}
                <div className="flex items-center justify-between mb-6">
                  <span className="text-lg font-semibold text-foreground">Total Amount</span>
                  <span className="text-2xl font-bold text-primary">₹{grandTotal}</span>
                </div>

                {/* Pay Button */}
                <Button
                  onClick={handlePayment}
                  disabled={!selectedPaymentMethod || isProcessing}
                  className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3"
                >
                  {isProcessing ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Processing...
                    </div>
                  ) : (
                    <>
                      <Lock size={16} className="mr-2" />
                      Pay ₹{grandTotal}
                    </>
                  )}
                </Button>

                {!selectedPaymentMethod && (
                  <p className="text-xs text-muted-foreground text-center mt-3">
                    Please select a payment method to continue
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
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm text-muted-foreground">Total Amount</p>
              <p className="text-xs text-muted-foreground">
                ₹{totalAmount} + ₹{convenienceFee} fee
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-primary">₹{grandTotal}</p>
            </div>
          </div>
          <Button
            onClick={handlePayment}
            disabled={!selectedPaymentMethod || isProcessing}
            className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3"
          >
            {isProcessing ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Processing...
              </div>
            ) : (
              <>
                <Lock size={16} className="mr-2" />
                Pay ₹{grandTotal}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
