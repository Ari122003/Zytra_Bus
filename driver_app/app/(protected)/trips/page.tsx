"use client";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { LogOut, Bus, Clock, MapPin, Calendar, Navigation, AlertCircle, Loader2, Users } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getCurrentTrip, getUpcomingTrips } from "@/lib/api/trip.api";
import { PassengerList } from "./PassengerList";

export default function TripsPage() {
  const { driver, logout } = useAuth();

  const { data: currentTrip, isLoading, isError, error } = useQuery({
    queryKey: ['currentTrip', driver?.id],
    queryFn: () => getCurrentTrip(driver!.id!),
    enabled: !!driver?.id,
    refetchInterval: 30000,
  });

  const { 
    data: upcomingTripsData, 
    isLoading: isLoadingUpcoming, 
    isError: isErrorUpcoming 
  } = useQuery({
    queryKey: ['upcomingTrips', driver?.id],
    queryFn: () => getUpcomingTrips(driver!.id!),
    enabled: !!driver?.id,
    refetchInterval: 60000,
  });

  /**
   * Formats date/time strings from the API to human-readable format.
   * Handles Java LocalTime (HH:MM:SS) and LocalDateTime (ISO format) from backend.
   * Converts to 12-hour format with AM/PM for display.
   */
  const formatDateTime = (dateString: string) => {
    if (!dateString) return 'N/A';
    
    const timeOnlyPattern = /^\d{2}:\d{2}(:\d{2})?$/;
    if (timeOnlyPattern.test(dateString)) {
      const [hours, minutes] = dateString.split(':');
      const hour = parseInt(hours, 10);
      
      const period = hour >= 12 ? 'PM' : 'AM';
      const hour12 = hour % 12 || 12;
      
      return `${hour12}:${minutes} ${period}`;
    }
    
    const normalizedDate = dateString.replace(' ', 'T');
    
    const date = new Date(normalizedDate);
    
    if (isNaN(date.getTime())) {
      console.error('Invalid date string:', dateString);
      return 'Invalid Date';
    }
    
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-background via-muted to-accent/5">
        {/* Header */}
        <header className="bg-card/95 backdrop-blur-sm shadow-md border-b border-border sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-primary-foreground font-bold text-xl">Z</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-foreground">Zytra Bus Driver</h1>
                  <p className="text-sm text-muted-foreground">
                    Welcome, {driver?.name || driver?.email}
                  </p>
                </div>
              </div>
              <Button
                onClick={logout}
                variant="outline"
                className="flex items-center gap-2 border-border hover:bg-accent hover:text-accent-foreground">
                <LogOut size={18} />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Current Trip Details - Main Section */}
            <section className="flex-1">
              <div className="flex items-center gap-2 mb-4">
                <Bus className="text-primary" size={24} />
                <h2 className="text-2xl font-bold text-foreground">Current Trip</h2>
              </div>

              {isLoading ? (
                <div className="bg-card rounded-lg shadow-md border border-border p-8 text-center">
                  <Loader2 className="mx-auto text-primary mb-3 animate-spin" size={48} />
                  <p className="text-muted-foreground">Loading current trip...</p>
                </div>
              ) : isError ? (
                <div className="bg-card rounded-lg shadow-md border border-red-200 p-8 text-center">
                  <AlertCircle className="mx-auto text-red-500 mb-3" size={48} />
                  <p className="text-red-600 font-semibold">Failed to load current trip</p>
                  <p className="text-sm text-muted-foreground mt-2">{error?.message || 'Please try again later'}</p>
                </div>
              ) : !currentTrip ? (
                <div className="bg-card rounded-lg shadow-md border border-border p-8 text-center">
                  <Bus className="mx-auto text-muted-foreground mb-3" size={48} />
                  <p className="text-lg font-semibold text-foreground">No Current Trip</p>
                  <p className="text-sm text-muted-foreground mt-2">You do not have an active trip at the moment</p>
                  <p className="text-sm text-muted-foreground">Check your upcoming trips to start a new journey</p>
                </div>
              ) : (
                <div className="bg-card rounded-lg shadow-lg border border-border overflow-hidden">
                  {/* Trip Header */}
                  <div className="bg-gradient-to-r from-primary to-secondary p-6 text-primary-foreground">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-bold text-2xl mb-2">
                          {currentTrip.startLocation} → {currentTrip.endLocation}
                        </h3>
                        <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm text-xs font-semibold rounded-full">
                          IN PROGRESS
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm opacity-90">Trip ID</div>
                        <div className="text-xl font-bold">#{currentTrip.tripId}</div>
                      </div>
                    </div>
                  </div>

                  {/* Trip Info Grid */}
                  <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-muted/50 rounded-lg p-4">
                      <div className="flex items-center gap-2 text-muted-foreground mb-2">
                        <Clock size={16} />
                        <span className="text-xs font-medium">Departure Time</span>
                      </div>
                      <div className="text-lg font-bold text-foreground">
                        {formatDateTime(currentTrip.startTime)}
                      </div>
                    </div>

                    <div className="bg-muted/50 rounded-lg p-4">
                      <div className="flex items-center gap-2 text-muted-foreground mb-2">
                        <Clock size={16} />
                        <span className="text-xs font-medium">Arrival Time (Est.)</span>
                      </div>
                      <div className="text-lg font-bold text-foreground">
                        {formatDateTime(currentTrip.estimatedEndTime)}
                      </div>
                    </div>

                    <div className="bg-muted/50 rounded-lg p-4">
                      <div className="flex items-center gap-2 text-muted-foreground mb-2">
                        <Users size={16} />
                        <span className="text-xs font-medium">Total Passengers</span>
                      </div>
                      <div className="text-2xl font-bold text-foreground">
                        {currentTrip.passengerCount}
                      </div>
                    </div>

                    <div className="bg-muted/50 rounded-lg p-4">
                      <div className="flex items-center gap-2 text-muted-foreground mb-2">
                        <Bus size={16} />
                        <span className="text-xs font-medium">Bus Number</span>
                      </div>
                      <div className="text-2xl font-bold text-foreground">
                        {currentTrip.busNumber}
                      </div>
                    </div>
                  </div>

                  {/* Route */}
                  <div className="px-6 pb-4">
                    <div className="bg-gradient-to-r from-secondary/20 to-accent/20 rounded-lg p-4 border-l-4 border-secondary">
                      <div className="flex items-center gap-2 mb-3">
                        <Navigation className="text-secondary" size={20} />
                        <span className="font-semibold text-foreground">Route</span>
                      </div>
                      <div className="ml-7 space-y-2">
                        <div>
                          <p className="text-xs text-muted-foreground">From</p>
                          <p className="text-lg font-bold text-foreground">{currentTrip.startLocation}</p>
                        </div>
                        <div className="h-8 w-0.5 bg-secondary ml-2"></div>
                        <div>
                          <p className="text-xs text-muted-foreground">To</p>
                          <p className="text-lg font-bold text-foreground">{currentTrip.endLocation}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Passengers List */}
                  <PassengerList passengers={currentTrip.bookings} />

                  {/* Action Buttons */}
                  <div className="p-6 bg-muted/50 flex gap-3">
                    <Button className="flex-1">
                      <MapPin size={18} className="mr-2" />
                      Update Location
                    </Button>
                    <Button variant="outline" className="flex-1">
                      <AlertCircle size={18} className="mr-2" />
                      Report Issue
                    </Button>
                  </div>
                </div>
              )}
            </section>

            {/* Upcoming Trips - Right Sidebar */}
            <aside className="lg:w-80 xl:w-96">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="text-primary" size={20} />
                <h3 className="text-xl font-bold text-foreground">Upcoming Trips</h3>
              </div>

              {isLoadingUpcoming ? (
                <div className="bg-card rounded-lg shadow-md border border-border p-6 text-center">
                  <Loader2 className="mx-auto animate-spin text-primary mb-3" size={40} />
                  <p className="text-sm text-muted-foreground">Loading upcoming trips...</p>
                </div>
              ) : isErrorUpcoming ? (
                <div className="bg-card rounded-lg shadow-md border border-border p-6 text-center">
                  <AlertCircle className="mx-auto text-destructive mb-3" size={40} />
                  <p className="text-sm text-destructive">Failed to load upcoming trips</p>
                </div>
              ) : !upcomingTripsData?.upcomingTrips || upcomingTripsData.upcomingTrips.length === 0 ? (
                <div className="bg-card rounded-lg shadow-md border border-border p-6 text-center">
                  <Calendar className="mx-auto text-muted-foreground mb-3" size={40} />
                  <p className="text-sm text-muted-foreground">No upcoming trips scheduled</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {upcomingTripsData.upcomingTrips.map((trip) => (
                    <div
                      key={trip.tripId}
                      className="bg-card rounded-lg shadow-md border border-border p-4 border-l-4 border-l-accent hover:shadow-lg transition-shadow">
                      <div className="mb-3">
                        <h4 className="font-bold text-foreground mb-1">
                          {trip.startLocation} → {trip.endLocation}
                        </h4>
                        <span className="inline-block px-2 py-0.5 bg-accent/20 text-accent-foreground text-xs font-semibold rounded">
                          UPCOMING
                        </span>
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar size={14} />
                          <span>{new Date(trip.travelDate).toLocaleDateString('en-US', { 
                            weekday: 'short', 
                            month: 'short', 
                            day: 'numeric',
                            year: 'numeric'
                          })}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock size={14} />
                          <div className="flex flex-col">
                            <span className="font-medium text-foreground">Depart: {formatDateTime(trip.departureTime)}</span>
                            <span className="font-medium text-foreground">Arrive: {formatDateTime(trip.arrivalTime)}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Users size={14} />
                          <span>{trip.availableSeats} seats available</span>
                        </div>
                      </div>

                      <Button className="w-full mt-3" size="sm" variant="outline">
                        View Details
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </aside>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
