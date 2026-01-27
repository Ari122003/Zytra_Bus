"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { QrCode, X, CheckCircle, AlertCircle, Loader2, Users } from "lucide-react";
import { Html5Qrcode } from "html5-qrcode";
import { verifyTicket } from "@/lib/api/trip.api";
import type { Passenger } from "@/types/trip.type";

interface PassengerListProps {
  passengers: Passenger[];
}

export function PassengerList({ passengers }: PassengerListProps) {
  const [scannerOpen, setScannerOpen] = useState(false);
  const [selectedPassenger, setSelectedPassenger] = useState<{
    id: number;
    name: string;
    ticketNumber: string;
  } | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [toast, setToast] = useState<{
    show: boolean;
    type: 'success' | 'error';
    title: string;
    message: string;
  }>({ show: false, type: 'success', title: '', message: '' });
  const [verifiedPassengers, setVerifiedPassengers] = useState<Set<number>>(new Set());
  const scannerRef = useRef<Html5Qrcode | null>(null);

  // Show toast notification
  const showToast = (type: 'success' | 'error', title: string, message: string) => {
    setToast({ show: true, type, title, message });
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 4000);
  };

  // Start QR scanner
  const startScanner = async (passenger: { bookingId: number; name: string; ticketNumber: string }) => {
    setSelectedPassenger({
      id: passenger.bookingId,
      name: passenger.name,
      ticketNumber: passenger.ticketNumber,
    });
    setScannerOpen(true);
  };

  // Stop QR scanner
  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
        scannerRef.current = null;
      } catch (err) {
        console.error("Failed to stop scanner:", err);
      }
    }
    setScannerOpen(false);
    setSelectedPassenger(null);
  };

  // Handle successful QR scan
  const onScanSuccess = useCallback(async (decodedText: string) => {
    if (!selectedPassenger) return;

    // Stop scanner immediately
    await stopScanner();

    // Check if scanned ticket matches
    if (decodedText.trim() === selectedPassenger.ticketNumber.trim()) {
      // Immediately mark as verified in UI
      setVerifiedPassengers(prev => new Set(prev).add(selectedPassenger.id));
      
      // Call API to verify ticket
      setIsVerifying(true);
      try {
        const result = await verifyTicket(selectedPassenger.id);
        
        showToast('success', 'Ticket Verified!', result.message || `Ticket verified successfully for ${selectedPassenger.name}`);
      } catch (err: unknown) {
        // If API fails, remove from verified set
        setVerifiedPassengers(prev => {
          const newSet = new Set(prev);
          newSet.delete(selectedPassenger.id);
          return newSet;
        });
        
        const errorMessage = err && typeof err === 'object' && 'response' in err 
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message || 'Failed to verify ticket. Please try again.'
          : 'Failed to verify ticket. Please try again.';
        showToast('error', 'Verification Failed', errorMessage);
      } finally {
        setIsVerifying(false);
      }
    } else {
      showToast('error', 'Ticket Mismatch', `Scanned: ${decodedText || 'No data'}\nExpected: ${selectedPassenger.ticketNumber}`);
    }
  }, [selectedPassenger]);

  // Handle scan errors (ignore continuous scanning errors)
  const onScanError = useCallback((errorMessage: string) => {
    // Ignore continuous scanning errors, only log critical ones
    if (!errorMessage.includes("NotFoundException")) {
      console.error("QR Scan Error:", errorMessage);
    }
  }, []);

  // Initialize scanner after modal is rendered
  useEffect(() => {
    if (!scannerOpen || !selectedPassenger) return;

    const initScanner = async () => {
      // Wait for DOM to render
      await new Promise(resolve => setTimeout(resolve, 100));

      try {
        const html5QrCode = new Html5Qrcode("qr-reader");
        scannerRef.current = html5QrCode;

        // Try to start with environment camera (back camera on phones)
        try {
          await html5QrCode.start(
            { facingMode: "environment" },
            {
              fps: 10,
              qrbox: { width: 250, height: 250 },
            },
            onScanSuccess,
            onScanError
          );
        } catch {
          // If environment camera fails, try user camera (front camera/webcam)
          try {
            await html5QrCode.start(
              { facingMode: "user" },
              {
                fps: 10,
                qrbox: { width: 250, height: 250 },
              },
              onScanSuccess,
              onScanError
            );
          } catch {
            // If both fail, try without facingMode constraint (any available camera)
            const devices = await Html5Qrcode.getCameras();
            if (devices && devices.length > 0) {
              const cameraId = devices[0].id;
              await html5QrCode.start(
                cameraId,
                {
                  fps: 10,
                  qrbox: { width: 250, height: 250 },
                },
                onScanSuccess,
                onScanError
              );
            } else {
              throw new Error("No cameras found on this device");
            }
          }
        }
      } catch (err: unknown) {
        console.error("Failed to start scanner:", err);
        showToast(
          'error',
          'Camera Error',
          err instanceof Error ? err.message : 'Failed to access camera. Please check permissions and ensure camera is not in use.'
        );
        setScannerOpen(false);
      }
    };

    initScanner();
  }, [scannerOpen, selectedPassenger, onScanSuccess, onScanError]);

  // Cleanup scanner on unmount
  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(console.error);
      }
    };
  }, []);

  return (
    <>
      {/* Passengers List */}
      <div className="px-6 pb-6">
        <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <Users size={18} />
          Passengers ({passengers.length})
        </h4>
        <div className="space-y-2">
          {passengers.map((passenger) => (
            <div
              key={passenger.bookingId}
              className="flex items-center justify-between bg-muted/50 rounded-lg p-3 hover:bg-muted/70 transition-colors"
            >
              <div className="flex items-center gap-3 flex-1">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <Users size={20} className="text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-foreground">{passenger.name}</p>
                  <p className="text-xs text-muted-foreground">Booking ID: {passenger.bookingId}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-foreground">
                    {passenger.seatCount} {passenger.seatCount === 1 ? 'seat' : 'seats'}
                  </p>
                </div>
                {passenger.bookingStatus === "VERIFIED" || verifiedPassengers.has(passenger.bookingId) ? (
                  <div className="flex items-center gap-1 px-3 py-1.5 bg-green-100 border border-green-500 rounded-lg">
                    <CheckCircle size={16} className="text-green-600" />
                    <span className="text-xs font-semibold text-green-700">Verified</span>
                  </div>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                    onClick={() => startScanner(passenger)}
                  >
                    <QrCode size={16} className="mr-1" />
                    Scan
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* QR Scanner Modal */}
      {scannerOpen && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-xl shadow-2xl max-w-md w-full overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-primary to-secondary p-4 text-primary-foreground flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg">Scan QR Code</h3>
                <p className="text-xs opacity-90">{selectedPassenger?.name}</p>
              </div>
              <button
                onClick={stopScanner}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Scanner Area */}
            <div className="p-6">
              <div className="mb-4">
                <div
                  id="qr-reader"
                  className="rounded-lg overflow-hidden border-4 border-primary"
                ></div>
              </div>

              <p className="text-sm text-muted-foreground text-center mb-4">
                Position the QR code within the frame to scan
              </p>

              <Button
                onClick={stopScanner}
                variant="outline"
                className="w-full"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Toast Notification */}
      {toast.show && (
        <div className="fixed top-4 right-4 z-[60] animate-in slide-in-from-top-5 duration-300">
          <div className={`rounded-lg shadow-2xl border-2 p-4 min-w-[320px] max-w-md ${
            toast.type === 'success'
              ? 'bg-green-50 border-green-500'
              : 'bg-red-50 border-red-500'
          }`}>
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-full ${
                toast.type === 'success'
                  ? 'bg-green-500'
                  : 'bg-red-500'
              }`}>
                {toast.type === 'success' ? (
                  <CheckCircle className="text-white" size={24} />
                ) : (
                  <AlertCircle className="text-white" size={24} />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className={`font-bold text-lg mb-1 ${
                  toast.type === 'success' ? 'text-green-900' : 'text-red-900'
                }`}>
                  {toast.title}
                </h4>
                <p className={`text-sm whitespace-pre-line ${
                  toast.type === 'success' ? 'text-green-800' : 'text-red-800'
                }`}>
                  {toast.message}
                </p>
              </div>
              <button
                onClick={() => setToast(prev => ({ ...prev, show: false }))}
                className={`p-1 rounded-full hover:bg-black/10 transition-colors ${
                  toast.type === 'success' ? 'text-green-900' : 'text-red-900'
                }`}
              >
                <X size={20} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Verifying Overlay */}
      {isVerifying && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-card rounded-lg p-8 shadow-xl text-center">
            <Loader2 className="mx-auto text-primary mb-3 animate-spin" size={48} />
            <p className="text-foreground font-semibold">Verifying Ticket...</p>
          </div>
        </div>
      )}
    </>
  );
}
