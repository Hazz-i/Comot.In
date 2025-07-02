import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { API_BASE_URL } from '@/constant';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

interface DashboardProps {
	token: string;
}

interface UserData {
	username: string;
	email: string;
	downloads: number;
	role?: string;
}

interface DownloadItem {
	id: number;
	platform: string;
	original_url: string;
	downloaded_at: string;
}

// Function to decode JWT token
const parseJwt = (token: string) => {
	try {
		// Get the payload part of the JWT (second part)
		const base64Url = token.split('.')[1];
		const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
		const jsonPayload = decodeURIComponent(
			atob(base64)
				.split('')
				.map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
				.join('')
		);
		return JSON.parse(jsonPayload);
	} catch (e) {
		console.error('Error parsing JWT:', e);
		return null;
	}
};

export function Dashboard({ token }: DashboardProps) {
	const navigate = useNavigate();
	const [userData, setUserData] = useState<UserData | null>(null);
	const [downloadHistory, setDownloadHistory] = useState<DownloadItem[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		// Check if user has valid token
		if (!token) {
			navigate('/');
			return;
		}

		// Get user data from token if possible
		const tokenData = parseJwt(token);

		// Check if user is admin and redirect to admin dashboard
		if (tokenData && tokenData.sub === 'admin') {
			navigate('/admin-dashboard');
			return;
		}

		const fetchUserData = async () => {
			setIsLoading(true);
			try {
				// Extract user info from token or fetch from API
				if (tokenData && tokenData.username && tokenData.email) {
					// User info is in the token
					setUserData({
						username: tokenData.username,
						email: tokenData.email,
						downloads: parseInt(localStorage.getItem('downloadCount') || '0'),
						role: tokenData.role || 'user',
					});
				} else {
					// Fallback to API call if token doesn't contain user info
					try {
						const response = await fetch(`${API_BASE_URL}/user/me`, {
							method: 'GET',
							headers: { Authorization: `Bearer ${token}` },
						});

						if (response.ok) {
							const data = await response.json();
							setUserData({
								username: data.username || 'User',
								email: data.email || 'user@example.com',
								downloads:
									data.total_downloads || parseInt(localStorage.getItem('downloadCount') || '0'),
								role: data.role || 'user',
							});
						} else {
							throw new Error('Failed to fetch user data');
						}
					} catch (error) {
						console.error('API error:', error);
						// Set fallback user data if API fails
						setUserData({
							username: 'User',
							email: 'user@example.com',
							downloads: parseInt(localStorage.getItem('downloadCount') || '0'),
							role: 'user',
						});
					}
				}

				// Fetch download history from API
				try {
					const historyResponse = await fetch(`${API_BASE_URL}/download-history`, {
						method: 'GET',
						headers: {
							Authorization: `Bearer ${token}`,
							'Content-Type': 'application/json',
						},
					});

					if (historyResponse.ok) {
						const historyData = await historyResponse.json();
						// Take only the last 10 downloads and sort by most recent
						const sortedHistory = historyData
							.sort(
								(a: DownloadItem, b: DownloadItem) =>
									new Date(b.downloaded_at).getTime() - new Date(a.downloaded_at).getTime()
							)
							.slice(0, 10);
						setDownloadHistory(sortedHistory);
					} else {
						console.error('Failed to fetch download history:', historyResponse.statusText);
						// Fallback to localStorage if API fails
						const recentDownloads = JSON.parse(localStorage.getItem('recentDownloads') || '[]');
						setDownloadHistory(recentDownloads.slice(0, 5));
					}
				} catch (error) {
					console.error('Error fetching download history:', error);
					// Fallback to localStorage if API fails
					const recentDownloads = JSON.parse(localStorage.getItem('recentDownloads') || '[]');
					setDownloadHistory(recentDownloads.slice(0, 5));
				}

				setIsLoading(false);
			} catch (error) {
				console.error('Error processing user data:', error);
				toast.error('Could not load user data');
				setIsLoading(false);
			}
		};

		fetchUserData();
	}, [token, navigate]);

	if (isLoading) {
		return (
			<div className='flex items-center justify-center min-h-screen'>
				<div className='text-center'>
					<div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#99BC85] mx-auto'></div>
					<p className='mt-4 text-[#99BC85]'>Loading your dashboard...</p>
				</div>
			</div>
		);
	}

	return (
		<>
			<div className='min-h-screen'>
				<div className='max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6'>
					{/* Welcome Card */}
					<div className='bg-white shadow rounded-lg p-6 mb-6'>
						<div className='flex items-center'>
							<Avatar className='h-14 w-14'>
								<AvatarImage src='https://github.com/evilrabbit.png' alt='@evilrabbit' />
								<AvatarFallback>ER</AvatarFallback>
							</Avatar>
							<div className='ml-4'>
								<h2 className='text-lg font-semibold'>Welcome, {userData?.username}</h2>
								<p className='text-gray-600 text-sm'>{userData?.email}</p>
							</div>
							<div className='ml-auto bg-gray-100 px-3 py-1.5 rounded-full'>
								<span className='text-sm font-medium text-gray-700'>
									{downloadHistory.length} downloads
								</span>
							</div>
						</div>
					</div>

					{/* Recent Downloads - Simplified */}
					<div className='bg-white shadow rounded-lg overflow-hidden'>
						<div className='p-4 border-b border-gray-200'>
							<h2 className='font-semibold text-gray-900'>Recent Downloads</h2>
						</div>

						{downloadHistory.length > 0 ? (
							<div className='divide-y divide-gray-200'>
								{downloadHistory.map((item) => (
									<div key={item.id} className='p-4 hover:bg-gray-50'>
										<div className='flex items-center'>
											<div
												className={`w-2 h-2 rounded-full mr-3 ${
													item.platform === 'youtube'
														? 'bg-red-500'
														: item.platform === 'facebook'
														? 'bg-blue-500'
														: item.platform === 'instagram'
														? 'bg-pink-500'
														: 'bg-gray-500'
												}`}
											></div>
											<div className='flex-1 min-w-0'>
												<div className='flex items-center gap-2'>
													<a
														href={item.original_url}
														target='_blank'
														rel='noopener noreferrer'
														className='text-sm text-blue-600 hover:underline truncate'
													>
														{item.original_url}
													</a>
												</div>
												<p className='text-xs text-gray-500 mt-1'>
													{new Date(item.downloaded_at).toLocaleDateString()} at{' '}
													{new Date(item.downloaded_at).toLocaleTimeString()}
												</p>
											</div>
											<div className='flex items-center gap-2 ml-2'>
												<span
													className={`text-xs px-2 py-1 rounded-full ${
														item.platform === 'youtube'
															? 'bg-red-100 text-red-700'
															: item.platform === 'facebook'
															? 'bg-blue-100 text-blue-700'
															: item.platform === 'instagram'
															? 'bg-pink-100 text-pink-700'
															: 'bg-gray-100 text-gray-700'
													}`}
												>
													{item.platform}
												</span>
											</div>
										</div>
									</div>
								))}
							</div>
						) : (
							<div className='p-8 text-center text-gray-500'>
								<p>No download history yet.</p>
								<p className='text-sm mt-1'>
									Your recent downloads will appear here after you download videos.
								</p>
							</div>
						)}
					</div>
				</div>
			</div>
		</>
	);
}

export default Dashboard;
