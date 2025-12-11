/* eslint-disable @next/next/no-img-element */
"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  User,
  Settings,
  CreditCard,
  LogOut,
  Camera,
  ChevronRight,
  Bell,
  Lock,
  HelpCircle,
  Trash2,
} from "lucide-react"

export default function AccountPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [profileImage, setProfileImage] = useState<string>("/avatar-placeholder.png")
  const [firstName, setFirstName] = useState("John")
  const [lastName, setLastName] = useState("Doe")
  const [dob, setDob] = useState("1990-01-01")
  const [email, setEmail] = useState("john.doe@example.com")
  const [phone, setPhone] = useState("+1 (555) 123-4567")
  const [isEditingNameDob, setIsEditingNameDob] = useState(false)
  const [isEditingEmail, setIsEditingEmail] = useState(false)
  const [isEditingPhone, setIsEditingPhone] = useState(false)
  const [activeTab, setActiveTab] = useState<"profile" | "settings" | "payment">("profile")

  const handleProfileImageClick = () => {
    fileInputRef.current?.click()
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setProfileImage(reader.result as string)
        handleUpdateProfilePicture(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleUpdateProfilePicture = async (imageData: string) => {
    try {
      console.log("Uploading profile picture", { bytes: imageData.length })
      // API call to update profile picture
      // const response = await fetch('/api/profile/update-picture', {
      //   method: 'PATCH',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ profileImage: imageData })
      // })
      // const data = await response.json()
      // if (data.success) {
      //   console.log("Profile picture updated successfully")
      // }
    } catch (error) {
      console.error("Error updating profile picture:", error)
    }
  }

  const handleUpdateNameAndDob = async () => {
    try {
      console.log("Updating name & DOB:", { firstName, lastName, dob })
      // API call to update name and date of birth
      // const response = await fetch('/api/profile/update-name-dob', {
      //   method: 'PATCH',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ firstName, lastName, dob })
      // })
      // const data = await response.json()
      // if (data.success) setIsEditingNameDob(false)
      setIsEditingNameDob(false)
    } catch (error) {
      console.error("Error updating name & DOB:", error)
    }
  }

  const handleUpdateEmail = async () => {
    try {
      console.log("Updating email:", { email })
      // API call to update email
      // const response = await fetch('/api/profile/update-email', {
      //   method: 'PATCH',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email })
      // })
      // const data = await response.json()
      // if (data.success) setIsEditingEmail(false)
      setIsEditingEmail(false)
    } catch (error) {
      console.error("Error updating email:", error)
    }
  }

  const handleUpdatePhone = async () => {
    try {
      console.log("Updating phone:", { phone })
      // API call to update phone
      // const response = await fetch('/api/profile/update-phone', {
      //   method: 'PATCH',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ phone })
      // })
      // const data = await response.json()
      // if (data.success) setIsEditingPhone(false)
      setIsEditingPhone(false)
    } catch (error) {
      console.error("Error updating phone:", error)
    }
  }

  const handleLogout = () => {
    // Clear any user data
    localStorage.removeItem("userToken")
    router.push("/login")
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-muted to-background">
      {/* Desktop Layout */}
      <div className="hidden md:block">
        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">My Account</h1>
            <p className="text-muted-foreground mt-2">Manage your profile and preferences</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar Navigation */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 sticky top-20">
                <nav className="space-y-2">
                  <button
                    onClick={() => setActiveTab("profile")}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      activeTab === "profile"
                        ? "bg-primary text-white"
                        : "text-foreground hover:bg-muted"
                    }`}
                  >
                    <User size={20} />
                    <span className="font-medium">Profile</span>
                  </button>
                  <button
                    onClick={() => setActiveTab("payment")}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      activeTab === "payment"
                        ? "bg-primary text-white"
                        : "text-foreground hover:bg-muted"
                    }`}
                  >
                    <CreditCard size={20} />
                    <span className="font-medium">Payment Methods</span>
                  </button>
                  <button
                    onClick={() => setActiveTab("settings")}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      activeTab === "settings"
                        ? "bg-primary text-white"
                        : "text-foreground hover:bg-muted"
                    }`}
                  >
                    <Settings size={20} />
                    <span className="font-medium">Settings</span>
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
                  >
                    <LogOut size={20} />
                    <span className="font-medium">Logout</span>
                  </button>
                </nav>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              {/* Profile Tab */}
              {activeTab === "profile" && (
                <div className="space-y-6">
                  {/* Profile Picture Section */}
                  <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-8">
                    <h2 className="text-2xl font-bold text-foreground mb-6">Profile Picture</h2>
                    <div className="flex items-center gap-8">
                      <div className="relative">
                        <div className="w-32 h-32 rounded-full bg-linear-to-br from-primary to-primary/50 flex items-center justify-center overflow-hidden border-4 border-primary/20">
                          <img
                            src={profileImage}
                            alt="Profile"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <button
                          onClick={handleProfileImageClick}
                          className="absolute bottom-0 right-0 bg-primary text-white p-3 rounded-full hover:bg-primary/90 transition-colors shadow-lg"
                        >
                          <Camera size={20} />
                        </button>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                        />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-foreground mb-2">Update Photo</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          Click the camera icon to upload a new profile picture. Supported formats:
                          JPG, PNG (Max 5MB)
                        </p>
                        <button
                          onClick={handleProfileImageClick}
                          className="px-4 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors text-sm font-medium"
                        >
                          Choose Photo
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Profile Information */}
                  <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-8 space-y-6">
                    <h2 className="text-2xl font-bold text-foreground">Personal Information</h2>

                    {/* Name & DOB */}
                    <div className="border border-border rounded-lg p-5">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <p className="text-lg font-semibold text-foreground">Name & Date of Birth</p>
                          <p className="text-sm text-muted-foreground">Keep your basic details up to date</p>
                        </div>
                        <button
                          onClick={() => setIsEditingNameDob(!isEditingNameDob)}
                          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
                        >
                          {isEditingNameDob ? "Cancel" : "Edit"}
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">First Name</label>
                          <input
                            type="text"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            disabled={!isEditingNameDob}
                            className="w-full mt-2 px-4 py-2 bg-input border border-border rounded-lg text-foreground disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Last Name</label>
                          <input
                            type="text"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            disabled={!isEditingNameDob}
                            className="w-full mt-2 px-4 py-2 bg-input border border-border rounded-lg text-foreground disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Date of Birth</label>
                          <input
                            type="date"
                            value={dob}
                            onChange={(e) => setDob(e.target.value)}
                            disabled={!isEditingNameDob}
                            className="w-full mt-2 px-4 py-2 bg-input border border-border rounded-lg text-foreground disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                        </div>
                      </div>

                      {isEditingNameDob && (
                        <div className="mt-4 flex justify-end">
                          <Button onClick={handleUpdateNameAndDob} className="px-5 py-2">Save</Button>
                        </div>
                      )}
                    </div>

                    {/* Email */}
                    <div className="border border-border rounded-lg p-5">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <p className="text-lg font-semibold text-foreground">Email</p>
                          <p className="text-sm text-muted-foreground">Used for booking receipts and alerts</p>
                        </div>
                        <button
                          onClick={() => setIsEditingEmail(!isEditingEmail)}
                          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
                        >
                          {isEditingEmail ? "Cancel" : "Edit"}
                        </button>
                      </div>
                      <div className="grid grid-cols-1 gap-4">
                        <div>
                          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Email</label>
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={!isEditingEmail}
                            className="w-full mt-2 px-4 py-2 bg-input border border-border rounded-lg text-foreground disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                        </div>
                      </div>
                      {isEditingEmail && (
                        <div className="mt-4 flex justify-end">
                          <Button onClick={handleUpdateEmail} className="px-5 py-2">Save Email</Button>
                        </div>
                      )}
                    </div>

                    {/* Phone */}
                    <div className="border border-border rounded-lg p-5">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <p className="text-lg font-semibold text-foreground">Phone Number</p>
                          <p className="text-sm text-muted-foreground">Used for OTP and trip updates</p>
                        </div>
                        <button
                          onClick={() => setIsEditingPhone(!isEditingPhone)}
                          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
                        >
                          {isEditingPhone ? "Cancel" : "Edit"}
                        </button>
                      </div>
                      <div className="grid grid-cols-1 gap-4">
                        <div>
                          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Phone Number</label>
                          <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            disabled={!isEditingPhone}
                            className="w-full mt-2 px-4 py-2 bg-input border border-border rounded-lg text-foreground disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                        </div>
                      </div>
                      {isEditingPhone && (
                        <div className="mt-4 flex justify-end">
                          <Button onClick={handleUpdatePhone} className="px-5 py-2">Save Phone</Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Payment Methods Tab */}
              {activeTab === "payment" && (
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-foreground">Payment Methods</h2>
                    <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium">
                      Add Payment Method
                    </button>
                  </div>

                  <div className="space-y-4">
                    {/* Credit Card 1 */}
                    <div className="p-6 border border-border rounded-lg hover:border-primary/50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-linear-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center">
                            <CreditCard className="text-white" size={24} />
                          </div>
                          <div>
                            <h3 className="font-semibold text-foreground">Visa Ending in 4242</h3>
                            <p className="text-sm text-muted-foreground">Expires 12/26</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button className="px-3 py-1 text-sm bg-primary/10 text-primary rounded hover:bg-primary/20 transition-colors">
                            Edit
                          </button>
                          <button className="px-3 py-1 text-sm bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors">
                            Remove
                          </button>
                        </div>
                      </div>
                      <label className="flex items-center gap-2 mt-4 cursor-pointer">
                        <input type="radio" name="default-card" defaultChecked className="rounded" />
                        <span className="text-sm text-muted-foreground">Set as default payment method</span>
                      </label>
                    </div>

                    {/* Credit Card 2 */}
                    <div className="p-6 border border-border rounded-lg hover:border-primary/50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-linear-to-br from-amber-400 to-amber-600 rounded-lg flex items-center justify-center">
                            <CreditCard className="text-white" size={24} />
                          </div>
                          <div>
                            <h3 className="font-semibold text-foreground">Mastercard Ending in 5555</h3>
                            <p className="text-sm text-muted-foreground">Expires 08/25</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button className="px-3 py-1 text-sm bg-primary/10 text-primary rounded hover:bg-primary/20 transition-colors">
                            Edit
                          </button>
                          <button className="px-3 py-1 text-sm bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors">
                            Remove
                          </button>
                        </div>
                      </div>
                      <label className="flex items-center gap-2 mt-4 cursor-pointer">
                        <input type="radio" name="default-card" className="rounded" />
                        <span className="text-sm text-muted-foreground">Set as default payment method</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Settings Tab */}
              {activeTab === "settings" && (
                <div className="space-y-6">
                  {/* Notifications */}
                  <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-8">
                    <h2 className="text-2xl font-bold text-foreground mb-6">Notification Preferences</h2>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                        <div className="flex items-center gap-3">
                          <Bell size={20} className="text-primary" />
                          <div>
                            <p className="font-semibold text-foreground">Booking Confirmations</p>
                            <p className="text-sm text-muted-foreground">Get notified when your booking is confirmed</p>
                          </div>
                        </div>
                        <input type="checkbox" defaultChecked className="w-5 h-5 rounded" />
                      </div>
                      <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                        <div className="flex items-center gap-3">
                          <Bell size={20} className="text-primary" />
                          <div>
                            <p className="font-semibold text-foreground">Trip Reminders</p>
                            <p className="text-sm text-muted-foreground">Reminders before your trip departure</p>
                          </div>
                        </div>
                        <input type="checkbox" defaultChecked className="w-5 h-5 rounded" />
                      </div>
                      <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                        <div className="flex items-center gap-3">
                          <Bell size={20} className="text-primary" />
                          <div>
                            <p className="font-semibold text-foreground">Promotional Offers</p>
                            <p className="text-sm text-muted-foreground">Exclusive discounts and special offers</p>
                          </div>
                        </div>
                        <input type="checkbox" className="w-5 h-5 rounded" />
                      </div>
                    </div>
                  </div>

                  {/* Security */}
                  <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-8">
                    <h2 className="text-2xl font-bold text-foreground mb-6">Security</h2>
                    <div className="space-y-4">
                      <button className="w-full flex items-center justify-between p-4 border border-border rounded-lg hover:border-primary/50 transition-colors group">
                        <div className="flex items-center gap-3">
                          <Lock size={20} className="text-primary" />
                          <div className="text-left">
                            <p className="font-semibold text-foreground">Change Password</p>
                            <p className="text-sm text-muted-foreground">Update your password regularly</p>
                          </div>
                        </div>
                        <ChevronRight size={20} className="text-muted-foreground group-hover:text-primary transition-colors" />
                      </button>
                      <button className="w-full flex items-center justify-between p-4 border border-border rounded-lg hover:border-primary/50 transition-colors group">
                        <div className="flex items-center gap-3">
                          <Lock size={20} className="text-primary" />
                          <div className="text-left">
                            <p className="font-semibold text-foreground">Two-Factor Authentication</p>
                            <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                          </div>
                        </div>
                        <ChevronRight size={20} className="text-muted-foreground group-hover:text-primary transition-colors" />
                      </button>
                    </div>
                  </div>

                  {/* Help & Support */}
                  <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-8">
                    <h2 className="text-2xl font-bold text-foreground mb-6">Help & Support</h2>
                    <div className="space-y-4">
                      <button className="w-full flex items-center justify-between p-4 border border-border rounded-lg hover:border-primary/50 transition-colors group">
                        <div className="flex items-center gap-3">
                          <HelpCircle size={20} className="text-primary" />
                          <div className="text-left">
                            <p className="font-semibold text-foreground">Help Center</p>
                            <p className="text-sm text-muted-foreground">Browse FAQs and guides</p>
                          </div>
                        </div>
                        <ChevronRight size={20} className="text-muted-foreground group-hover:text-primary transition-colors" />
                      </button>
                      <button className="w-full flex items-center justify-between p-4 border border-border rounded-lg hover:border-primary/50 transition-colors group">
                        <div className="flex items-center gap-3">
                          <HelpCircle size={20} className="text-primary" />
                          <div className="text-left">
                            <p className="font-semibold text-foreground">Contact Support</p>
                            <p className="text-sm text-muted-foreground">Get in touch with our team</p>
                          </div>
                        </div>
                        <ChevronRight size={20} className="text-muted-foreground group-hover:text-primary transition-colors" />
                      </button>
                    </div>
                  </div>

                  {/* Danger Zone */}
                  <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-xl p-8">
                    <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-6">Danger Zone</h2>
                    <button className="w-full flex items-center justify-between p-4 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-900 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors group">
                      <div className="flex items-center gap-3">
                        <Trash2 size={20} className="text-red-600 dark:text-red-400" />
                        <div className="text-left">
                          <p className="font-semibold text-red-600 dark:text-red-400">Delete Account</p>
                          <p className="text-sm text-red-600/80 dark:text-red-400/80">Permanently delete your account and data</p>
                        </div>
                      </div>
                      <ChevronRight size={20} className="text-red-600 dark:text-red-400 group-hover:text-red-700 dark:group-hover:text-red-300 transition-colors" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden pb-24">
        {/* Mobile Header with Tabs */}
        <div className="sticky top-0 bg-white dark:bg-slate-800 border-b border-border z-10">
          <div className="px-4 py-4">
            <h1 className="text-2xl font-bold text-foreground">My Account</h1>
          </div>
          <div className="flex border-t border-border">
            <button
              onClick={() => setActiveTab("profile")}
              className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${
                activeTab === "profile"
                  ? "border-b-2 border-primary text-primary"
                  : "text-muted-foreground"
              }`}
            >
              <User size={18} className="mx-auto mb-1" />
              <span className="text-xs">Profile</span>
            </button>
            <button
              onClick={() => setActiveTab("payment")}
              className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${
                activeTab === "payment"
                  ? "border-b-2 border-primary text-primary"
                  : "text-muted-foreground"
              }`}
            >
              <CreditCard size={18} className="mx-auto mb-1" />
              <span className="text-xs">Payment</span>
            </button>
            <button
              onClick={() => setActiveTab("settings")}
              className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${
                activeTab === "settings"
                  ? "border-b-2 border-primary text-primary"
                  : "text-muted-foreground"
              }`}
            >
              <Settings size={18} className="mx-auto mb-1" />
              <span className="text-xs">Settings</span>
            </button>
          </div>
        </div>

        <div className="px-4 py-6">
          {/* Profile Tab - Mobile */}
          {activeTab === "profile" && (
            <div className="space-y-6">
              {/* Profile Picture Section */}
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
                <h2 className="text-lg font-bold text-foreground mb-4">Profile Picture</h2>
                <div className="flex flex-col items-center gap-4">
                  <div className="relative">
                    <div className="w-28 h-28 rounded-full bg-linear-to-br from-primary to-primary/50 flex items-center justify-center overflow-hidden border-4 border-primary/20">
                      <img
                        src={profileImage}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <button
                      onClick={handleProfileImageClick}
                      className="absolute bottom-0 right-0 bg-primary text-white p-2 rounded-full hover:bg-primary/90 transition-colors shadow-lg"
                    >
                      <Camera size={16} />
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-3">
                      Click the camera icon to update your photo
                    </p>
                    <button
                      onClick={handleProfileImageClick}
                      className="px-4 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors text-sm font-medium"
                    >
                      Choose Photo
                    </button>
                  </div>
                </div>
              </div>

              {/* Personal Information - Mobile */}
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 space-y-5">
                {/* Name & DOB */}
                <div className="border border-border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-lg font-bold text-foreground">Name & DOB</h2>
                    <button
                      onClick={() => setIsEditingNameDob(!isEditingNameDob)}
                      className="px-3 py-1 bg-primary text-white rounded text-xs font-medium hover:bg-primary/90 transition-colors"
                    >
                      {isEditingNameDob ? "Cancel" : "Edit"}
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground uppercase">First Name</label>
                      <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        disabled={!isEditingNameDob}
                        className="w-full mt-1 px-3 py-2 bg-input border border-border rounded-lg text-sm text-foreground disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground uppercase">Last Name</label>
                      <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        disabled={!isEditingNameDob}
                        className="w-full mt-1 px-3 py-2 bg-input border border-border rounded-lg text-sm text-foreground disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground uppercase">Date of Birth</label>
                      <input
                        type="date"
                        value={dob}
                        onChange={(e) => setDob(e.target.value)}
                        disabled={!isEditingNameDob}
                        className="w-full mt-1 px-3 py-2 bg-input border border-border rounded-lg text-sm text-foreground disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>

                  {isEditingNameDob && (
                    <button
                      onClick={handleUpdateNameAndDob}
                      className="w-full mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-semibold text-sm"
                    >
                      Save
                    </button>
                  )}
                </div>

                {/* Email */}
                <div className="border border-border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-bold text-foreground">Email</h3>
                    <button
                      onClick={() => setIsEditingEmail(!isEditingEmail)}
                      className="px-3 py-1 bg-primary text-white rounded text-xs font-medium hover:bg-primary/90 transition-colors"
                    >
                      {isEditingEmail ? "Cancel" : "Edit"}
                    </button>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase">Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={!isEditingEmail}
                      className="w-full mt-1 px-3 py-2 bg-input border border-border rounded-lg text-sm text-foreground disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  {isEditingEmail && (
                    <button
                      onClick={handleUpdateEmail}
                      className="w-full mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-semibold text-sm"
                    >
                      Save Email
                    </button>
                  )}
                </div>

                {/* Phone */}
                <div className="border border-border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-bold text-foreground">Phone</h3>
                    <button
                      onClick={() => setIsEditingPhone(!isEditingPhone)}
                      className="px-3 py-1 bg-primary text-white rounded text-xs font-medium hover:bg-primary/90 transition-colors"
                    >
                      {isEditingPhone ? "Cancel" : "Edit"}
                    </button>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase">Phone</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      disabled={!isEditingPhone}
                      className="w-full mt-1 px-3 py-2 bg-input border border-border rounded-lg text-sm text-foreground disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  {isEditingPhone && (
                    <button
                      onClick={handleUpdatePhone}
                      className="w-full mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-semibold text-sm"
                    >
                      Save Phone
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Payment Methods Tab - Mobile */}
          {activeTab === "payment" && (
            <div className="space-y-4">
              <button className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium">
                Add Payment Method
              </button>

              {/* Card 1 */}
              <div className="p-4 border border-border rounded-lg bg-white dark:bg-slate-800">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-linear-to-br from-blue-400 to-blue-600 rounded flex items-center justify-center">
                    <CreditCard className="text-white" size={16} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-foreground">Visa •••• 4242</h3>
                    <p className="text-xs text-muted-foreground">Expires 12/26</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="flex-1 px-3 py-1 text-xs bg-primary/10 text-primary rounded hover:bg-primary/20 transition-colors">
                    Edit
                  </button>
                  <button className="flex-1 px-3 py-1 text-xs bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors">
                    Remove
                  </button>
                </div>
                <label className="flex items-center gap-2 mt-3 cursor-pointer">
                  <input type="radio" name="default-card-mobile" defaultChecked className="w-4 h-4 rounded" />
                  <span className="text-xs text-muted-foreground">Default</span>
                </label>
              </div>

              {/* Card 2 */}
              <div className="p-4 border border-border rounded-lg bg-white dark:bg-slate-800">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-linear-to-br from-amber-400 to-amber-600 rounded flex items-center justify-center">
                    <CreditCard className="text-white" size={16} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-foreground">Mastercard •••• 5555</h3>
                    <p className="text-xs text-muted-foreground">Expires 08/25</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="flex-1 px-3 py-1 text-xs bg-primary/10 text-primary rounded hover:bg-primary/20 transition-colors">
                    Edit
                  </button>
                  <button className="flex-1 px-3 py-1 text-xs bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors">
                    Remove
                  </button>
                </div>
                <label className="flex items-center gap-2 mt-3 cursor-pointer">
                  <input type="radio" name="default-card-mobile" className="w-4 h-4 rounded" />
                  <span className="text-xs text-muted-foreground">Default</span>
                </label>
              </div>
            </div>
          )}

          {/* Settings Tab - Mobile */}
          {activeTab === "settings" && (
            <div className="space-y-4">
              {/* Notifications */}
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-4">
                <h3 className="font-bold text-foreground mb-3">Notifications</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bell size={16} className="text-primary" />
                      <span className="text-sm text-foreground">Booking Confirmations</span>
                    </div>
                    <input type="checkbox" defaultChecked className="w-4 h-4" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bell size={16} className="text-primary" />
                      <span className="text-sm text-foreground">Trip Reminders</span>
                    </div>
                    <input type="checkbox" defaultChecked className="w-4 h-4" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bell size={16} className="text-primary" />
                      <span className="text-sm text-foreground">Promotional Offers</span>
                    </div>
                    <input type="checkbox" className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {/* Security */}
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-4">
                <h3 className="font-bold text-foreground mb-3">Security</h3>
                <button className="w-full flex items-center justify-between p-2 hover:bg-muted rounded transition-colors">
                  <div className="flex items-center gap-2">
                    <Lock size={16} className="text-primary" />
                    <span className="text-sm text-foreground">Change Password</span>
                  </div>
                  <ChevronRight size={16} className="text-muted-foreground" />
                </button>
                <button className="w-full flex items-center justify-between p-2 hover:bg-muted rounded transition-colors">
                  <div className="flex items-center gap-2">
                    <Lock size={16} className="text-primary" />
                    <span className="text-sm text-foreground">2-Factor Auth</span>
                  </div>
                  <ChevronRight size={16} className="text-muted-foreground" />
                </button>
              </div>

              {/* Help */}
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-4">
                <h3 className="font-bold text-foreground mb-3">Help & Support</h3>
                <button className="w-full flex items-center justify-between p-2 hover:bg-muted rounded transition-colors">
                  <div className="flex items-center gap-2">
                    <HelpCircle size={16} className="text-primary" />
                    <span className="text-sm text-foreground">Help Center</span>
                  </div>
                  <ChevronRight size={16} className="text-muted-foreground" />
                </button>
                <button className="w-full flex items-center justify-between p-2 hover:bg-muted rounded transition-colors">
                  <div className="flex items-center gap-2">
                    <HelpCircle size={16} className="text-primary" />
                    <span className="text-sm text-foreground">Contact Support</span>
                  </div>
                  <ChevronRight size={16} className="text-muted-foreground" />
                </button>
              </div>

              {/* Logout & Delete */}
              <div className="space-y-2">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 p-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
                >
                  <LogOut size={18} />
                  Logout
                </button>
                <button className="w-full flex items-center justify-center gap-2 p-3 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors font-medium">
                  <Trash2 size={18} />
                  Delete Account
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
