"use client"

import { use } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { useBookingDetail } from "@/hooks/useBooking"
import { Button } from "@/components/ui/button"
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Clock,
  Users,
  IndianRupee,
  Bus,
  Phone,
  User,
  Ticket,
  QrCode,
  Loader2,
  AlertCircle,
  Route,
  Timer,
  CheckCircle2,
  XCircle,
  ClockIcon,
} from "lucide-react"
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
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  } catch {
    return dateStr
  }
}

/**
 * Get booking status details
 */
const getStatusInfo = (status: string) => {
  const statusLower = status.toLowerCase()
  
  switch (statusLower) {
    case 'confirmed':
      return {
        icon: CheckCircle2,
        color: 'text-green-600 dark:text-green-400',
        bgColor: 'bg-green-100 dark:bg-green-900/30',
        label: 'Confirmed',
      }
    case 'pending':
      return {
        icon: ClockIcon,
        color: 'text-yellow-600 dark:text-yellow-400',
        bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
        label: 'Pending',
      }
    case 'cancelled':
      return {
        icon: XCircle,
        color: 'text-red-600 dark:text-red-400',
        bgColor: 'bg-red-100 dark:bg-red-900/30',
        label: 'Cancelled',
      }
    case 'completed':
      return {
        icon: CheckCircle2,
        color: 'text-blue-600 dark:text-blue-400',
        bgColor: 'bg-blue-100 dark:bg-blue-900/30',
        label: 'Completed',
      }
    default:
      return {
        icon: AlertCircle,
        color: 'text-gray-600 dark:text-gray-400',
        bgColor: 'bg-gray-100 dark:bg-gray-900/30',
        label: status,
      }
  }
}

/**
 * Booking detail page
 */
export default function BookingDetailPage({
  params,
}: {
  params: Promise<{ bookingId: string }>
}) {
  const resolvedParams = use(params)
  const router = useRouter()
  const bookingId = parseInt(resolvedParams.bookingId, 10)
  
  const { data: booking, isLoading, isError, error, refetch } = useBookingDetail(bookingId)

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
          <p className="text-muted-foreground">Loading booking details...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (isError || !booking) {
    const axiosError = error as AxiosError
    const statusCode = axiosError?.response?.status
    const is404 = statusCode === 404
    const is500 = statusCode === 500

    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="flex flex-col items-center justify-center text-center max-w-md">
          <div className="p-4 bg-red-100 dark:bg-red-900/30 rounded-full mb-4">
            <AlertCircle className="h-16 w-16 text-red-600 dark:text-red-400" />
          </div>
          
          <h2 className="text-2xl font-bold text-foreground mb-2">
            {is404 ? 'Booking Not Found' : 'Failed to Load Booking'}
          </h2>
          
          <p className="text-muted-foreground mb-6">
            {is404 
              ? "The booking you're looking for doesn't exist or has been removed."
              : is500
              ? "We're experiencing technical difficulties. Please try again later."
              : "Unable to retrieve booking details. Please check your connection and try again."}
          </p>
          
          <div className="flex gap-4">
            <Button variant="outline" onClick={() => router.push('/bookings')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Bookings
            </Button>
            {!is404 && (
              <Button onClick={() => refetch()}>
                Try Again
              </Button>
            )}
          </div>
        </div>
      </div>
    )
  }

  const statusInfo = getStatusInfo(booking.bookingStatus)
  const StatusIcon = statusInfo.icon

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 shadow-md sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <Button
            variant="ghost"
            onClick={() => router.push('/bookings')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Bookings
          </Button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                Booking Details
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Booking ID: #{booking.bookingId}
              </p>
            </div>
            
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${statusInfo.bgColor}`}>
              <StatusIcon className={`h-5 w-5 ${statusInfo.color}`} />
              <span className={`font-semibold ${statusInfo.color}`}>
                {statusInfo.label}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* QR Code Card */}
        {booking.ticketQr && (
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6">
            <div className="flex flex-col items-center gap-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <QrCode className="h-6 w-6 text-primary" />
              </div>
              <div className="text-center">
                <h3 className="font-semibold text-foreground text-lg mb-1">Your Ticket QR</h3>
                <p className="text-sm text-muted-foreground">Show this at the boarding point</p>
              </div>
              <div className="bg-white dark:bg-slate-900 p-4 rounded-lg border-2 border-dashed border-border">
                <Image 
                  src={`data:image/png;base64,${booking.ticketQr}`}
                  alt="Ticket QR Code" 
                  width={192}
                  height={192}
                  className="object-contain"
                  unoptimized
                />
              </div>
            </div>
          </div>
        )}

        {/* Route Information */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6">
          <h3 className="font-semibold text-foreground text-lg mb-4 flex items-center gap-2">
            <Route className="h-5 w-5 text-primary" />
            Journey Details
          </h3>
          
          <div className="space-y-6">
            {/* Route */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg h-fit">
                  <MapPin className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase mb-1">From</p>
                  <p className="font-semibold text-foreground text-lg">{booking.source}</p>
                  <p className="text-sm text-muted-foreground mt-1">{formatTime(booking.departureTime)}</p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg h-fit">
                  <MapPin className="h-5 w-5 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase mb-1">To</p>
                  <p className="font-semibold text-foreground text-lg">{booking.destination}</p>
                  <p className="text-sm text-muted-foreground mt-1">{formatTime(booking.arrivalTime)}</p>
                </div>
              </div>
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-border">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground uppercase">Travel Date</p>
                  <p className="text-sm font-medium text-foreground">{formatDate(booking.travelDate)}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Timer className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground uppercase">Duration</p>
                  <p className="text-sm font-medium text-foreground">{booking.travelTime}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Route className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground uppercase">Distance</p>
                  <p className="text-sm font-medium text-foreground">{booking.distance} km</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bus Information */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6">
          <h3 className="font-semibold text-foreground text-lg mb-4 flex items-center gap-2">
            <Bus className="h-5 w-5 text-primary" />
            Bus Information
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <Bus className="h-5 w-5 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground uppercase">Bus Number</p>
                <p className="text-sm font-medium text-foreground">{booking.busNumber}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Bus className="h-5 w-5 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground uppercase">Bus Type</p>
                <p className="text-sm font-medium text-foreground">{booking.busType}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Seats and Payment */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6">
          <h3 className="font-semibold text-foreground text-lg mb-4 flex items-center gap-2">
            <Ticket className="h-5 w-5 text-primary" />
            Booking Information
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground uppercase">Total Seats</p>
                <p className="text-sm font-medium text-foreground">{booking.totalSeats} seat(s)</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Ticket className="h-5 w-5 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground uppercase">Seat Numbers</p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {booking.seatNumbers.map((seat) => (
                    <span 
                      key={seat}
                      className="px-3 py-1 bg-primary/10 text-primary rounded-md text-sm font-medium"
                    >
                      {seat}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 pt-4 border-t border-border">
              <IndianRupee className="h-5 w-5 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground uppercase">Total Amount</p>
                <p className="text-2xl font-bold text-foreground">₹{booking.amount.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Driver Information */}
        {(booking.driverName || booking.driverContact) && (
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6">
            <h3 className="font-semibold text-foreground text-lg mb-4 flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Driver Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {booking.driverName && (
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground uppercase">Driver Name</p>
                    <p className="text-sm font-medium text-foreground">{booking.driverName}</p>
                  </div>
                </div>
              )}
              
              {booking.driverContact && (
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground uppercase">Contact Number</p>
                    <a 
                      href={`tel:${booking.driverContact}`}
                      className="text-sm font-medium text-primary hover:underline"
                    >
                      {booking.driverContact}
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Button
            variant="outline"
            onClick={() => router.push('/bookings')}
            className="flex-1"
          >
            View All Bookings
          </Button>
          <Button
            onClick={() => window.print()}
            className="flex-1"
          >
            Print Ticket
          </Button>
        </div>
      </div>
    </div>
  )
}
