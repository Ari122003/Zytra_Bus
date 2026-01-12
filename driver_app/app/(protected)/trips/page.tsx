"use client";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { LogOut, Bus, Clock, MapPin, Calendar } from "lucide-react";

export default function TripsPage() {
  const { driver, logout } = useAuth();

  // Mock data for trips - replace with actual API call
  const upcomingTrips = [
    {
      id: 1,
      route: "New York → Boston",
      departureTime: "2026-01-15 08:00 AM",
      status: "upcoming",
      busNumber: "BUS-101",
      passengers: 28,
    },
    {
      id: 2,
      route: "Boston → New York",
      departureTime: "2026-01-15 02:00 PM",
      status: "upcoming",
      busNumber: "BUS-101",
      passengers: 32,
    },
  ];

  const ongoingTrips = [
    {
      id: 3,
      route: "Philadelphia → Washington DC",
      departureTime: "2026-01-12 10:30 AM",
      status: "ongoing",
      busNumber: "BUS-101",
      currentLocation: "Baltimore, MD",
      passengers: 24,
    },
  ];

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
          {/* Ongoing Trips Section */}
          <section className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Bus className="text-primary" size={24} />
              <h2 className="text-2xl font-bold text-foreground">Ongoing Trips</h2>
            </div>

            {ongoingTrips.length === 0 ? (
              <div className="bg-card rounded-lg shadow-md border border-border p-8 text-center">
                <Bus className="mx-auto text-muted-foreground mb-3" size={48} />
                <p className="text-muted-foreground">No ongoing trips at the moment</p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {ongoingTrips.map((trip) => (
                  <div
                    key={trip.id}
                    className="bg-card rounded-lg shadow-lg border border-border p-6 border-l-4 border-l-secondary hover:shadow-xl transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-bold text-lg text-foreground mb-1">
                          {trip.route}
                        </h3>
                        <span className="inline-block px-2 py-1 bg-secondary/20 text-secondary-foreground text-xs font-semibold rounded">
                          ONGOING
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Bus size={16} />
                        <span>{trip.busNumber}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock size={16} />
                        <span>{trip.departureTime}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin size={16} />
                        <span>{trip.currentLocation}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <span className="font-semibold">Passengers:</span>
                        <span>{trip.passengers}</span>
                      </div>
                    </div>

                    <Button className="w-full mt-4" variant="outline">
                      View Details
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Upcoming Trips Section */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="text-primary" size={24} />
              <h2 className="text-2xl font-bold text-foreground">Upcoming Trips</h2>
            </div>

            {upcomingTrips.length === 0 ? (
              <div className="bg-card rounded-lg shadow-md border border-border p-8 text-center">
                <Calendar className="mx-auto text-muted-foreground mb-3" size={48} />
                <p className="text-muted-foreground">No upcoming trips scheduled</p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {upcomingTrips.map((trip) => (
                  <div
                    key={trip.id}
                    className="bg-card rounded-lg shadow-lg border border-border p-6 border-l-4 border-l-accent hover:shadow-xl transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-bold text-lg text-foreground mb-1">
                          {trip.route}
                        </h3>
                        <span className="inline-block px-2 py-1 bg-accent/20 text-accent-foreground text-xs font-semibold rounded">
                          UPCOMING
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Bus size={16} />
                        <span>{trip.busNumber}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock size={16} />
                        <span>{trip.departureTime}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <span className="font-semibold">Passengers:</span>
                        <span>{trip.passengers}</span>
                      </div>
                    </div>

                    <Button className="w-full mt-4" variant="outline">
                      View Details
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </section>
        </main>
      </div>
    </ProtectedRoute>
  );
}
