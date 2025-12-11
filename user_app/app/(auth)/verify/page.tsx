"use client"

import { useRef, useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"

export default function VerifyPage() {
  const searchParams = useSearchParams()
  const phone = searchParams.get("phone") || ""
  const name = searchParams.get("name") || ""
  
  const [digits, setDigits] = useState<string[]>(Array(6).fill(""))
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle")
  const [timeLeft, setTimeLeft] = useState(60) 
  const [canResend, setCanResend] = useState(false)
  const inputsRef = useRef<Array<HTMLInputElement | null>>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // Start the timer when component mounts
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setCanResend(true)
          if (timerRef.current) clearInterval(timerRef.current)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  const handleResendOtp = () => {
    if (canResend) {
      setTimeLeft(60)
      setCanResend(false)
      setStatus("idle")
      setDigits(Array(6).fill(""))
      // Here you would call your API to resend OTP
      console.log("OTP resent to:", phone)
      
      // Restart the timer
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setCanResend(true)
            if (timerRef.current) clearInterval(timerRef.current)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const focusInput = (index: number) => {
    const node = inputsRef.current[index]
    if (node) node.focus()
  }

  const handleChange = (idx: number, value: string) => {
    const clean = value.replace(/\D/g, "").slice(0, 1)
    const nextDigits = [...digits]
    nextDigits[idx] = clean
    setDigits(nextDigits)
    if (clean && idx < 5) {
      focusInput(idx + 1)
    }
  }

  const handleKeyDown = (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[idx] && idx > 0) {
      focusInput(idx - 1)
    }
  }

  const handleSubmit = () => {
    const otp = digits.join("")
    if (otp.length !== 6) {
      setStatus("error")
      return
    }
    setStatus("success")
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-muted to-background flex items-center justify-center px-4 py-12 md:py-20">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-xl">✓</span>
            </div>
            <span className="font-bold text-2xl text-primary">Zytra Bus</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Verify OTP</h1>
          <p className="text-muted-foreground">Enter the 6-digit code we sent to your phone.</p>
          {name && <p className="text-sm text-muted-foreground mt-1">Hi, <span className="font-semibold">{name}</span></p>}
          {phone && <p className="text-sm text-muted-foreground">Phone: <span className="font-semibold">{phone}</span></p>}
        </div>

        {/* Verify Card */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 md:p-8">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSubmit()
            }}
            className="space-y-6"
          >
            {/* OTP Input - 6 single digits */}
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block text-center">
                OTP Code
              </label>
              <div className="flex items-center justify-center gap-3 mt-3">
                <div className="flex justify-center gap-2">
                  {digits.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => {
                        inputsRef.current[idx] = el
                      }}
                      type="tel"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleChange(idx, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(idx, e)}
                      className="w-10 h-12 text-center text-lg font-semibold bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      aria-label={`OTP digit ${idx + 1}`}
                    />
                  ))}
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2 text-center">We sent the code to your registered number.</p>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-white py-2 text-lg font-semibold rounded-lg"
            >
              Submit
            </Button>
          </form>

          {/* Status Message */}
          {status === "success" && (
            <div className="mt-4 p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
              <p className="text-sm text-green-700 dark:text-green-300">OTP verified successfully!</p>
            </div>
          )}
          {status === "error" && (
            <div className="mt-4 p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-700 dark:text-red-300">Please enter a 6-digit OTP.</p>
            </div>
          )}

          {/* Resend / Back Links */}
          <div className="mt-6 text-center space-y-2">
            <div>
              {canResend ? (
                <button
                  type="button"
                  onClick={handleResendOtp}
                  className="text-sm text-primary font-semibold hover:underline"
                >
                  Resend OTP
                </button>
              ) : (
                <div className="text-sm text-muted-foreground">
                  <p>Resend OTP in <span className="font-semibold text-primary">{formatTime(timeLeft)}</span></p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
