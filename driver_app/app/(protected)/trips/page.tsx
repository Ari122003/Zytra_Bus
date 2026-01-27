"use client";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { LogOut, Bus, Clock, MapPin, Calendar, Navigation, AlertCircle, Loader2, Users } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getCurrentTrip } from "@/lib/api/trip.api";
import { PassengerList } from "./PassengerList";

export default function TripsPage() {
  const { driver, logout } = useAuth();

  // Fetch current trip using TanStack Query
  const { data: currentTrip, isLoading, isError, error } = useQuery({
    queryKey: ['currentTrip', driver?.id],
    queryFn: () => getCurrentTrip(driver!.id!),
    enabled: !!driver?.id, // Only fetch if driver ID exists
    refetchInterval: 30000, // Refetch every 30 seconds to keep trip data fresh
  });

  // Mock data for upcoming trips - replace with actual API call later
  const upcomingTrips = [
    {
      id: 1,
      route: "New York → Boston",
      departureTime: "2026-01-28T08:00:00",
      arrivalTime: "2026-01-28T12:30:00",
      status: "upcoming",
      busNumber: "BUS-101",
      passengers: 28,
    },
    {
      id: 2,
      route: "Boston → New York",
      departureTime: "2026-01-28T14:00:00",
      arrivalTime: "2026-01-28T18:30:00",
      status: "upcoming",
      busNumber: "BUS-101",
      passengers: 32,
    },
  ];

  // Format date for display (handles Java LocalTime and LocalDateTime formats)
  const formatDateTime = (dateString: string) => {
    if (!dateString) return 'N/A';
    
    // Check if it's a time-only format (HH:MM:SS or HH:MM)
    const timeOnlyPattern = /^\d{2}:\d{2}(:\d{2})?$/;
    if (timeOnlyPattern.test(dateString)) {
      // It's just a time, parse it as time only
      const [hours, minutes] = dateString.split(':');
      const hour = parseInt(hours, 10);
      
      // Format as 12-hour time
      const period = hour >= 12 ? 'PM' : 'AM';
      const hour12 = hour % 12 || 12;
      
      return `${hour12}:${minutes} ${period}`;
    }
    
    // Handle full datetime formats
    // Java LocalDateTime can be in formats like:
    // "2026-01-28T08:00:00" or "2026-01-28 08:00:00"
    const normalizedDate = dateString.replace(' ', 'T');
    
    const date = new Date(normalizedDate);
    
    // Check if date is valid
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

              {upcomingTrips.length === 0 ? (
                <div className="bg-card rounded-lg shadow-md border border-border p-6 text-center">
                  <Calendar className="mx-auto text-muted-foreground mb-3" size={40} />
                  <p className="text-sm text-muted-foreground">No upcoming trips scheduled</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {upcomingTrips.map((trip) => (
                    <div
                      key={trip.id}
                      className="bg-card rounded-lg shadow-md border border-border p-4 border-l-4 border-l-accent hover:shadow-lg transition-shadow">
                      <div className="mb-3">
                        <h4 className="font-bold text-foreground mb-1">
                          {trip.route}
                        </h4>
                        <span className="inline-block px-2 py-0.5 bg-accent/20 text-accent-foreground text-xs font-semibold rounded">
                          UPCOMING
                        </span>
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Bus size={14} />
                          <span>{trip.busNumber}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock size={14} />
                          <div className="flex flex-col">
                            <span className="font-medium text-foreground">Depart: {trip.departureTime}</span>
                            <span className="font-medium text-foreground">Arrive: {trip.arrivalTime}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Users size={14} />
                          <span>{trip.passengers} passengers</span>
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
