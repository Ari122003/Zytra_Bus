"use client";

import { useRouter } from "next/navigation";
import { CreditCard, ChevronLeft } from "lucide-react";

export default function PaymentMethodsPage() {
	const router = useRouter();

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
						<h1 className="text-3xl font-bold text-foreground">Payment Methods</h1>
						<p className="text-muted-foreground mt-2">Manage your saved payment cards</p>
					</div>
				</div>

				<div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-8">
					<div className="flex items-center justify-between mb-6">
						<h2 className="text-2xl font-bold text-foreground">
							Saved Cards
						</h2>
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
										<h3 className="font-semibold text-foreground">
											Visa Ending in 4242
										</h3>
										<p className="text-sm text-muted-foreground">
											Expires 12/26
										</p>
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
								<input
									type="radio"
									name="default-card"
									defaultChecked
									className="rounded"
								/>
								<span className="text-sm text-muted-foreground">
									Set as default payment method
								</span>
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
										<h3 className="font-semibold text-foreground">
											Mastercard Ending in 5555
										</h3>
										<p className="text-sm text-muted-foreground">
											Expires 08/25
										</p>
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
								<input
									type="radio"
									name="default-card"
									className="rounded"
								/>
								<span className="text-sm text-muted-foreground">
									Set as default payment method
								</span>
							</label>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
