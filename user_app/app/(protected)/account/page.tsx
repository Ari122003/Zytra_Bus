"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useUserProfile } from "@/contexts/UserContext";
import { userApi } from "@/lib/api/user.api";
import { ErrorCard } from "@/components/ui/error-card";
import { Button } from "@/components/ui/button";
import {
	User,
	Settings,
	CreditCard,
	LogOut,
	Camera,
	ChevronRight,
	Loader2,
	AlertCircle,
} from "lucide-react";
import Image from "next/image";

export default function AccountPage() {
	const [isMounted] = useState(() => typeof window !== "undefined");
	const router = useRouter();

	const { user, logout: authLogout } = useAuth();
	const { userProfile, setUserProfile, updateUserProfile } = useUserProfile();
	const fileInputRef = useRef<HTMLInputElement>(null);
	const queryClient = useQueryClient();

	const [editName, setEditName] = useState("");
	const [editDob, setEditDob] = useState("");
	const [editPhone, setEditPhone] = useState("");
	const [isEditingNameDob, setIsEditingNameDob] = useState(false);
	const [isEditingPhone, setIsEditingPhone] = useState(false);
	const [imageUpdateError, setImageUpdateError] = useState<string | null>(null);

	// Fetch user details with React Query
	const {
		data: userDetails,
		isLoading,
		isError,
		error,
		refetch,
	} = useQuery({
		queryKey: ["userDetails", user?.id],
		queryFn: () => userApi.getUserDetails(user!.id!),
		enabled: !!user?.id,
		staleTime: 5 * 60 * 1000, // 5 minutes
		refetchOnMount: "always",
		refetchOnReconnect: true,
		refetchOnWindowFocus: true,
	});

	// Mutation for updating profile image
	const { mutate: updateProfileImageMutation, isPending: isUpdatingImage } =
		useMutation({
			mutationFn: (imageUrl: string) =>
				userApi.updateProfileImage(user!.id!, imageUrl),
			onSuccess: (_response, imageData) => {
				// API returns message only; use the uploaded data for local preview/state
				updateUserProfile({ imageUrl: imageData });
				// Update React Query cache and invalidate to keep it fresh across navigation
				if (user?.id) {
					queryClient.setQueryData(["userDetails", user.id], (prev: Record<string, unknown> | undefined) => ({
						...(prev || {}),
						imageUrl: imageData,
					}));
					queryClient.invalidateQueries({ queryKey: ["userDetails", user.id] });
				}
				setImageUpdateError(null);
				// Reset file input so same file can be selected again
				if (fileInputRef.current) {
					fileInputRef.current.value = "";
				}
			},
			onError: (error) => {
				console.error("Failed to update profile image:", error);
				const errorMessage =
					error instanceof Error
						? error.message
						: "Failed to update profile image. Please try again.";
				setImageUpdateError(errorMessage);
				// Reset file input so same file can be selected again after error
				if (fileInputRef.current) {
					fileInputRef.current.value = "";
				}
			},
		});

	// Mutation for updating user info (name and DOB)
	const { mutate: updateUserInfoMutation, isPending: isUpdatingUserInfo } =
		useMutation({
			mutationFn: (data: { name: string; dob: string }) =>
				userApi.updateUserInfo(user!.id!, data),
			onSuccess: (_response, { name, dob }) => {
				// Sync to userProfile on success
				updateUserProfile({ name, dob });
				// Update React Query cache
				if (user?.id) {
					queryClient.setQueryData(["userDetails", user.id], (prev: Record<string, unknown> | undefined) => ({
						...(prev || {}),
						name,
						dob,
					}));
					queryClient.invalidateQueries({ queryKey: ["userDetails", user.id] });
				}
				setIsEditingNameDob(false);
			},
			onError: (error) => {
				console.error("Failed to update user info:", error);
			},
		});

	// Sync fetched user details with UserContext
	useEffect(() => {
		if (userDetails && user?.id) {
			setUserProfile({
				id: user.id,
				...userDetails,
				imageUrl: userDetails.imageUrl || "/dummy.png",
			});
		}
	}, [userDetails, user?.id, setUserProfile]);

	const name = userProfile?.name || "";
	const email = userProfile?.email || "";
	const phone = userProfile?.phone || "";
	const dob = userProfile?.dob || "";
	const profileImage = userProfile?.imageUrl || "/dummy.png";
	const [uploadedImage, setUploadedImage] = useState<string | null>(null);

	const displayImage = useMemo(() => {
		return uploadedImage || profileImage || "/dummy.png";
	}, [uploadedImage, profileImage]);

	if (!isMounted) {
		return null;
	}

	const handleProfileImageClick = () => {
		fileInputRef.current?.click();
	};

	const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			// Convert to base64 for upload
			const reader = new FileReader();
			reader.onloadend = () => {
				const base64data = reader.result as string;
				setUploadedImage(base64data);
				handleUpdateProfilePicture(base64data);
			};
			reader.readAsDataURL(file);
		}
	};

	const handleUpdateProfilePicture = async (imageData: string) => {
		if (!user?.id) {
			console.error("User ID not available");
			return;
		}

		// Call the mutation to update profile image
		updateProfileImageMutation(imageData);
	};

	const handleUpdateNameAndDob = async () => {
		if (!user?.id) {
			console.error("User ID not available");
			return;
		}

		// Call mutation to update name and date of birth
		updateUserInfoMutation({ name: editName, dob: editDob });
	};



	const handleUpdatePhone = async () => {
		try {
			console.log("Updating phone:", { phone: editPhone });
			// TODO: API call to update phone
			// const response = await fetch('/api/profile/update-phone', {
			//   method: 'PATCH',
			//   headers: { 'Content-Type': 'application/json' },
			//   body: JSON.stringify({ phone: editPhone })
			// })
			// const data = await response.json()
			// if (data.success) setIsEditingPhone(false)
			setIsEditingPhone(false);
		} catch (error) {
			console.error("Error updating phone:", error);
		}
	};

	const handleLogout = async () => {
		try {
			await authLogout();
		} catch (error) {
			console.error("Logout error:", error);
		}
	};

	if (isLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<Loader2 className="w-8 h-8 animate-spin text-primary" />
			</div>
		);
	}

	if (isError) {
		const errorMessage =
			error instanceof Error
				? error.message
				: "Failed to load your profile information. Please try again.";

		return (
			<ErrorCard
				title="Failed to Load Profile"
				message={errorMessage}
				onRetry={() => refetch()}
				showRetryButton={true}
			/>
		);
	}

	return (
		<div className="min-h-screen bg-linear-to-b from-muted to-background">
			{/* Desktop Layout */}
			<div className="hidden md:block">
				<div className="max-w-6xl mx-auto px-4 py-8">
					{/* Header */}
					<div className="mb-8">
						<h1 className="text-3xl font-bold text-foreground">My Account</h1>
						<p className="text-muted-foreground mt-2">
							Manage your profile and preferences
						</p>
					</div>

					<div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
						{/* Sidebar Navigation */}
						<div className="lg:col-span-1">
							<div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 sticky top-20">
								<nav className="space-y-2">
									<button
										className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors bg-primary text-white">
										<User size={20} />
										<span className="font-medium">Profile</span>
									</button>
									<button
										onClick={() => router.push("/payment-methods")}
										className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-foreground hover:bg-muted">
										<CreditCard size={20} />
										<span className="font-medium">Payment Methods</span>
									</button>
									<button
										onClick={() => router.push("/settings")}
										className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-foreground hover:bg-muted">
										<Settings size={20} />
										<span className="font-medium">Settings</span>
									</button>
									<button
										onClick={handleLogout}
										className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-950 transition-colors">
										<LogOut size={20} />
										<span className="font-medium">Logout</span>
									</button>
								</nav>
							</div>
						</div>

						{/* Main Content */}
						<div className="lg:col-span-3">
							{/* Profile Information */}
							<div className="space-y-6">
									{/* Profile Picture Section */}
									<div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-8">
										<h2 className="text-2xl font-bold text-foreground mb-6">
											Profile Picture
										</h2>

										{/* Error Alert */}
										{imageUpdateError && (
											<div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
												<AlertCircle
													className="text-red-500 mt-0.5 shrink-0"
													size={18}
												/>
												<div className="flex-1">
													<p className="text-sm font-medium text-red-700 dark:text-red-400">
														Update Failed
													</p>
													<p className="text-sm text-red-600 dark:text-red-300 mt-1">
														{imageUpdateError}
													</p>
												</div>
												<button
													onClick={() => setImageUpdateError(null)}
													className="text-red-500 hover:text-red-600 transition-colors">
													✕
												</button>
											</div>
										)}

										<div className="flex items-center gap-8">
											<div className="relative">
												<div className="w-32 h-32 rounded-full bg-linear-to-br from-primary to-primary/50 flex items-center justify-center overflow-hidden border-4 border-primary/20 relative">
													<Image
														src={displayImage}
														alt="Profile"
														width={128}
														height={128}
														className="w-full h-full object-cover"
													/>
													{/* Loader Overlay */}
													{isUpdatingImage && (
														<div className="absolute inset-0 bg-black/40 flex items-center justify-center">
															<Loader2 className="w-6 h-6 animate-spin text-white" />
														</div>
													)}
												</div>
												<button
													onClick={handleProfileImageClick}
													disabled={isUpdatingImage}
													className="absolute bottom-0 right-0 bg-primary text-white p-3 rounded-full hover:bg-primary/90 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed">
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
												<h3 className="text-lg font-semibold text-foreground mb-2">
													Update Photo
												</h3>
												<p className="text-sm text-muted-foreground mb-4">
													Click the camera icon to upload a new profile picture.
													Supported formats: JPG, PNG (Max 5MB)
												</p>
												<button
													onClick={handleProfileImageClick}
													className="px-4 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors text-sm font-medium">
													Choose Photo
												</button>
											</div>
										</div>
									</div>

									{/* Profile Information */}
									<div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-8 space-y-6">
										<h2 className="text-2xl font-bold text-foreground">
											Personal Information
										</h2>

										{/* Name & DOB */}
										<div className="border border-border rounded-lg p-5">
											<div className="flex items-center justify-between mb-4">
												<div>
													<p className="text-lg font-semibold text-foreground">
														Name & Date of Birth
													</p>
													<p className="text-sm text-muted-foreground">
														Keep your basic details up to date
													</p>
												</div>
												<button
													onClick={() => setIsEditingNameDob(!isEditingNameDob)}
													className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium">
													{isEditingNameDob ? "Cancel" : "Edit"}
												</button>
											</div>

											<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
												<div>
													<label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
														Full Name
													</label>
													<input
														type="text"
														value={isEditingNameDob ? editName : name}
														onChange={(e) => setEditName(e.target.value)}
														disabled={!isEditingNameDob}
														className="w-full mt-2 px-4 py-2 bg-input border border-border rounded-lg text-foreground disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary"
													/>
												</div>
												<div>
													<label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
														Date of Birth
													</label>
													<input
														type="date"
														value={isEditingNameDob ? editDob : dob}
														onChange={(e) => setEditDob(e.target.value)}
														disabled={!isEditingNameDob}
														className="w-full mt-2 px-4 py-2 bg-input border border-border rounded-lg text-foreground disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary"
													/>
												</div>
											</div>

											{isEditingNameDob && (
												<div className="mt-4 flex justify-end">
													<Button
														onClick={handleUpdateNameAndDob}
														disabled={isUpdatingUserInfo}
														className="px-5 py-2">
														{isUpdatingUserInfo ? (
															<span className="flex items-center justify-center gap-2">
																<Loader2 className="w-4 h-4 animate-spin" />
																Saving...
															</span>
														) : (
															"Save"
														)}
													</Button>
												</div>
											)}
										</div>

{/* Email (Read-Only) */}
						<div className="border border-border rounded-lg p-5">
							<div className="mb-4">
								<div>
									<p className="text-lg font-semibold text-foreground">
										Email
									</p>
									<p className="text-sm text-muted-foreground">
										Used for booking receipts and alerts (cannot be changed)
									</p>
								</div>
							</div>
							<div className="grid grid-cols-1 gap-4">
								<div>
									<label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
										Email
									</label>
									<input
										type="email"
										value={email}
										disabled
										className="w-full mt-2 px-4 py-2 bg-input border border-border rounded-lg text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
									/>
								</div>
							</div>
										</div>

										{/* Phone */}
										<div className="border border-border rounded-lg p-5">
											<div className="flex items-center justify-between mb-4">
												<div>
													<p className="text-lg font-semibold text-foreground">
														Phone Number
													</p>
													<p className="text-sm text-muted-foreground">
														Used for OTP and trip updates
													</p>
												</div>
												<button
													onClick={() => setIsEditingPhone(!isEditingPhone)}
													className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium">
													{isEditingPhone ? "Cancel" : "Edit"}
												</button>
											</div>
											<div className="grid grid-cols-1 gap-4">
												<div>
													<label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
														Phone Number
													</label>
													<input
														type="tel"
														value={isEditingPhone ? editPhone : phone}
														onChange={(e) => setEditPhone(e.target.value)}
														disabled={!isEditingPhone}
														className="w-full mt-2 px-4 py-2 bg-input border border-border rounded-lg text-foreground disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary"
													/>
												</div>
											</div>
											{isEditingPhone && (
												<div className="mt-4 flex justify-end">
													<Button
														onClick={handleUpdatePhone}
														className="px-5 py-2">
														Save Phone
													</Button>
												</div>
											)}
										</div>
									</div>
								</div>
						</div>
					</div>
				</div>
			</div>

			{/* Mobile Layout */}
			<div className="md:hidden pb-24">
				{/* Mobile Header */}
				<div className="sticky top-0 bg-white dark:bg-slate-800 border-b border-border z-10">
					<div className="px-4 py-4">
						<h1 className="text-2xl font-bold text-foreground">My Account</h1>
					</div>
				</div>

				<div className="px-4 py-6">
					{/* Profile - Mobile */}
					<div className="space-y-6">
							{/* Profile Picture Section */}
							<div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
								<h2 className="text-lg font-bold text-foreground mb-4">
									Profile Picture
								</h2>

								{/* Error Alert */}
								{imageUpdateError && (
									<div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-2">
										<AlertCircle
											className="text-red-500 mt-0.5 shrink-0"
											size={16}
										/>
										<div className="flex-1 min-w-0">
											<p className="text-xs font-medium text-red-700 dark:text-red-400">
												Update Failed
											</p>
											<p className="text-xs text-red-600 dark:text-red-300 mt-1 overflow-hidden">
												{imageUpdateError}
											</p>
										</div>
										<button
											onClick={() => setImageUpdateError(null)}
											className="text-red-500 hover:text-red-600 transition-colors shrink-0">
											✕
										</button>
									</div>
								)}

								<div className="flex flex-col items-center gap-4">
									<div className="relative">
										<div className="w-28 h-28 rounded-full bg-linear-to-br from-primary to-primary/50 flex items-center justify-center overflow-hidden border-4 border-primary/20 relative">
											<Image
												src={displayImage}
												alt="Profile"
												width={80}
												height={80}
												className="w-full h-full object-cover"
											/>
											{/* Loader Overlay */}
											{isUpdatingImage && (
												<div className="absolute inset-0 bg-black/40 flex items-center justify-center">
													<Loader2 className="w-4 h-4 animate-spin text-white" />
												</div>
											)}
										</div>
										<button
											onClick={handleProfileImageClick}
											disabled={isUpdatingImage}
											className="absolute bottom-0 right-0 bg-primary text-white p-2 rounded-full hover:bg-primary/90 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed">
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
											className="px-4 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors text-sm font-medium">
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
										<h2 className="text-lg font-bold text-foreground">
											Name & DOB
										</h2>
										<button
											onClick={() => setIsEditingNameDob(!isEditingNameDob)}
											className="px-3 py-1 bg-primary text-white rounded text-xs font-medium hover:bg-primary/90 transition-colors">
											{isEditingNameDob ? "Cancel" : "Edit"}
										</button>
									</div>

									<div className="space-y-3">
										<div>
											<label className="text-xs font-semibold text-muted-foreground uppercase">
												Full Name
											</label>
											<input
												type="text"
												value={isEditingNameDob ? editName : name}
												onChange={(e) => setEditName(e.target.value)}
												disabled={!isEditingNameDob}
												className="w-full mt-1 px-3 py-2 bg-input border border-border rounded-lg text-sm text-foreground disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary"
											/>
										</div>
										<div>
											<label className="text-xs font-semibold text-muted-foreground uppercase">
												Date of Birth
											</label>
											<input
												type="date"
												value={isEditingNameDob ? editDob : dob}
												onChange={(e) => setEditDob(e.target.value)}
												disabled={!isEditingNameDob}
												className="w-full mt-1 px-3 py-2 bg-input border border-border rounded-lg text-sm text-foreground disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary"
											/>
										</div>
									</div>

									{isEditingNameDob && (
										<button
											onClick={handleUpdateNameAndDob}
											disabled={isUpdatingUserInfo}
											className="w-full mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed">
											{isUpdatingUserInfo ? (
												<span className="flex items-center justify-center gap-2">
													<Loader2 className="w-4 h-4 animate-spin" />
													Saving...
												</span>
											) : (
												"Save"
											)}
										</button>
									)}
								</div>

				{/* Email (Read-Only) */}
				<div className="border border-border rounded-lg p-4">
					<div className="mb-3">
						<h3 className="text-lg font-bold text-foreground">Email</h3>
						<p className="text-xs text-muted-foreground mt-1">Cannot be changed</p>
					</div>
					<div>
						<label className="text-xs font-semibold text-muted-foreground uppercase">
							Email
						</label>
						<input
							type="email"
							value={email}
							disabled
							className="w-full mt-1 px-3 py-2 bg-input border border-border rounded-lg text-sm text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
						/>
					</div>
				</div>

				{/* Phone */}
								<div className="border border-border rounded-lg p-4">
									<div className="flex items-center justify-between mb-3">
										<h3 className="text-lg font-bold text-foreground">Phone</h3>
										<button
											onClick={() => setIsEditingPhone(!isEditingPhone)}
											className="px-3 py-1 bg-primary text-white rounded text-xs font-medium hover:bg-primary/90 transition-colors">
											{isEditingPhone ? "Cancel" : "Edit"}
										</button>
									</div>
									<div>
										<label className="text-xs font-semibold text-muted-foreground uppercase">
											Phone
										</label>
										<input
											type="tel"
											value={isEditingPhone ? editPhone : phone}
											onChange={(e) => setEditPhone(e.target.value)}
											disabled={!isEditingPhone}
											className="w-full mt-1 px-3 py-2 bg-input border border-border rounded-lg text-sm text-foreground disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary"
										/>
									</div>
									{isEditingPhone && (
										<button
											onClick={handleUpdatePhone}
											className="w-full mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-semibold text-sm">
											Save Phone
										</button>
									)}
								</div>
							</div>
						</div>

					{/* Quick Links */}
					<div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 mt-6">
						<h2 className="text-lg font-bold text-foreground mb-4">Quick Links</h2>
						<div className="space-y-3">
							<button 
								onClick={() => router.push("/payment-methods")}
								className="w-full flex items-center justify-between p-3 border border-border rounded-lg hover:border-primary/50 transition-colors">
								<div className="flex items-center gap-3">
									<CreditCard size={20} className="text-primary" />
									<span className="font-medium text-foreground">Payment Methods</span>
								</div>
								<ChevronRight size={20} className="text-muted-foreground" />
							</button>
							<button 
								onClick={() => router.push("/settings")}
								className="w-full flex items-center justify-between p-3 border border-border rounded-lg hover:border-primary/50 transition-colors">
								<div className="flex items-center gap-3">
									<Settings size={20} className="text-primary" />
									<span className="font-medium text-foreground">Settings</span>
								</div>
								<ChevronRight size={20} className="text-muted-foreground" />
							</button>
							<button 
								onClick={handleLogout}
								className="w-full flex items-center justify-between p-3 border border-red-200 dark:border-red-900 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 transition-colors">
								<div className="flex items-center gap-3">
									<LogOut size={20} />
									<span className="font-medium">Logout</span>
								</div>
								<ChevronRight size={20} />
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
