"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import {
	ChevronLeft,
	ChevronRight,
	Bell,
	Lock,
	HelpCircle,
	Trash2,
} from "lucide-react";

export default function SettingsPage() {
	const router = useRouter();
	const { logout } = useAuth();

	const handleLogout = async () => {
		try {
			await logout();
		} catch (error) {
			console.error("Logout error:", error);
		}
	};

	return (
		<div className="min-h-screen bg-linear-to-b from-muted to-background">
			<div className="max-w-4xl mx-auto px-4 py-8">
				{/* Header */}
				<div className="mb-8 flex items-center gap-4">
					<button
						onClick={() => router.back()}
						className="p-2 hover:bg-muted rounded-lg transition-colors"
						aria-label="Go back">
						<ChevronLeft size={24} />
					</button>
					<div>
						<h1 className="text-3xl font-bold text-foreground">Settings</h1>
						<p className="text-muted-foreground mt-2">
							Manage your preferences and account security
						</p>
					</div>
				</div>

				<div className="space-y-6">
					{/* Notifications */}
					<div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-8">
						<h2 className="text-2xl font-bold text-foreground mb-6">
							Notification Preferences
						</h2>
						<div className="space-y-4">
							<div className="flex items-center justify-between p-4 border border-border rounded-lg">
								<div className="flex items-center gap-3">
									<Bell size={20} className="text-primary" />
									<div>
										<p className="font-semibold text-foreground">
											Booking Confirmations
										</p>
										<p className="text-sm text-muted-foreground">
											Get notified when your booking is confirmed
										</p>
									</div>
								</div>
								<input
									type="checkbox"
									defaultChecked
									className="w-5 h-5 rounded"
								/>
							</div>
							<div className="flex items-center justify-between p-4 border border-border rounded-lg">
								<div className="flex items-center gap-3">
									<Bell size={20} className="text-primary" />
									<div>
										<p className="font-semibold text-foreground">
											Trip Reminders
										</p>
										<p className="text-sm text-muted-foreground">
											Reminders before your trip departure
										</p>
									</div>
								</div>
								<input
									type="checkbox"
									defaultChecked
									className="w-5 h-5 rounded"
								/>
							</div>
							<div className="flex items-center justify-between p-4 border border-border rounded-lg">
								<div className="flex items-center gap-3">
									<Bell size={20} className="text-primary" />
									<div>
										<p className="font-semibold text-foreground">
											Promotional Offers
										</p>
										<p className="text-sm text-muted-foreground">
											Exclusive discounts and special offers
										</p>
									</div>
								</div>
								<input type="checkbox" className="w-5 h-5 rounded" />
							</div>
						</div>
					</div>

					{/* Security */}
					<div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-8">
						<h2 className="text-2xl font-bold text-foreground mb-6">
							Security
						</h2>
						<div className="space-y-4">
							<button className="w-full flex items-center justify-between p-4 border border-border rounded-lg hover:border-primary/50 transition-colors group">
								<div className="flex items-center gap-3">
									<Lock size={20} className="text-primary" />
									<div className="text-left">
										<p className="font-semibold text-foreground">
											Change Password
										</p>
										<p className="text-sm text-muted-foreground">
											Update your password regularly
										</p>
									</div>
								</div>
								<ChevronRight
									size={20}
									className="text-muted-foreground group-hover:text-primary transition-colors"
								/>
							</button>
							<button className="w-full flex items-center justify-between p-4 border border-border rounded-lg hover:border-primary/50 transition-colors group">
								<div className="flex items-center gap-3">
									<Lock size={20} className="text-primary" />
									<div className="text-left">
										<p className="font-semibold text-foreground">
											Two-Factor Authentication
										</p>
										<p className="text-sm text-muted-foreground">
											Add an extra layer of security
										</p>
									</div>
								</div>
								<ChevronRight
									size={20}
									className="text-muted-foreground group-hover:text-primary transition-colors"
								/>
							</button>
						</div>
					</div>

					{/* Help & Support */}
					<div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-8">
						<h2 className="text-2xl font-bold text-foreground mb-6">
							Help & Support
						</h2>
						<div className="space-y-4">
							<button className="w-full flex items-center justify-between p-4 border border-border rounded-lg hover:border-primary/50 transition-colors group">
								<div className="flex items-center gap-3">
									<HelpCircle size={20} className="text-primary" />
									<div className="text-left">
										<p className="font-semibold text-foreground">
											Help Center
										</p>
										<p className="text-sm text-muted-foreground">
											Browse FAQs and guides
										</p>
									</div>
								</div>
								<ChevronRight
									size={20}
									className="text-muted-foreground group-hover:text-primary transition-colors"
								/>
							</button>
							<button className="w-full flex items-center justify-between p-4 border border-border rounded-lg hover:border-primary/50 transition-colors group">
								<div className="flex items-center gap-3">
									<HelpCircle size={20} className="text-primary" />
									<div className="text-left">
										<p className="font-semibold text-foreground">
											Contact Support
										</p>
										<p className="text-sm text-muted-foreground">
											Get in touch with our team
										</p>
									</div>
								</div>
								<ChevronRight
									size={20}
									className="text-muted-foreground group-hover:text-primary transition-colors"
								/>
							</button>
						</div>
					</div>

					{/* Danger Zone */}
					<div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-xl p-8">
						<h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-6">
							Danger Zone
						</h2>
						<button className="w-full flex items-center justify-between p-4 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-900 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors group">
							<div className="flex items-center gap-3">
								<Trash2
									size={20}
									className="text-red-600 dark:text-red-400"
								/>
								<div className="text-left">
									<p className="font-semibold text-red-600 dark:text-red-400">
										Delete Account
									</p>
									<p className="text-sm text-red-600/80 dark:text-red-400/80">
										Permanently delete your account and data
									</p>
								</div>
							</div>
							<ChevronRight
								size={20}
								className="text-red-600 dark:text-red-400 group-hover:text-red-700 dark:group-hover:text-red-300 transition-colors"
							/>
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
