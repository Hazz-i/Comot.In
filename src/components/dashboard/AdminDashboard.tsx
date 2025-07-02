import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { API_BASE_URL } from '@/constant';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

interface AdminDashboardProps {
	token: string;
}

interface AdminUserData {
	username: string;
	email: string;
	role: string;
}

interface RecentUser {
	id: number;
	username: string;
	email: string;
	created_at: string;
	total_downloads: number;
	role?: string;
	sub?: string;
	stats?: {
		download_count: number;
	};
}

// Function to decode JWT token
const parseJwt = (token: string) => {
	try {
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

export function AdminDashboard({ token }: AdminDashboardProps) {
	const navigate = useNavigate();
	const [adminData, setAdminData] = useState<AdminUserData | null>(null);
	const [userStats, setUserStats] = useState<any | null>(null);
	const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		// Check if user has valid token
		if (!token) {
			navigate('/');
			return;
		}

		// Get user data from token
		const tokenData = parseJwt(token);

		// Check if user is admin
		if (!tokenData || (tokenData.sub !== 'admin' && tokenData.role !== 'admin')) {
			toast.error('Access denied. Admin privileges required.');
			navigate('/dashboard');
			return;
		}

		const fetchAdminData = async () => {
			setIsLoading(true);
			try {
				// Set admin data from token
				if (tokenData && tokenData.username && tokenData.email) {
					setAdminData({
						username: tokenData.username,
						email: tokenData.email,
						role: tokenData.role,
					});
				}

				// Fetch user statistics
				try {
					const statsResponse = await fetch(`${API_BASE_URL}/admin/stats`, {
						method: 'GET',
						headers: {
							Authorization: `Bearer ${token}`,
							'Content-Type': 'application/json',
						},
					});

					if (statsResponse.ok) {
						const statsData = await statsResponse.json();
						setUserStats(statsData);
					} else {
						// Fallback data if API fails
						setUserStats({
							totalUsers: 0,
							totalDownloads: 0,
							activeUsers: 0,
							newUsersToday: 0,
						});
					}
				} catch (error) {
					console.error('Error fetching stats:', error);
					setUserStats({
						totalUsers: 0,
						totalDownloads: 0,
						activeUsers: 0,
						newUsersToday: 0,
					});
				}

				setIsLoading(false);
			} catch (error) {
				console.error('Error processing admin data:', error);
				toast.error('Could not load admin dashboard');
				setIsLoading(false);
			}
		};

		const fetchUsers = async () => {
			try {
				const usersResponse = await fetch(`${API_BASE_URL}/admin/users`, {
					method: 'GET',
					headers: {
						Authorization: `Bearer ${token}`,
						'Content-Type': 'application/json',
					},
				});
				if (usersResponse.ok) {
					const usersData = await usersResponse.json();
					// Filter out admin users from the list
					const filteredUsers = usersData.filter(
						(user: any) =>
							user.role !== 'admin' &&
							user.sub !== 'admin' &&
							!user.username.toLowerCase().includes('admin')
					);
					setRecentUsers(filteredUsers);
				} else {
					console.error('Failed to fetch recent users:', usersResponse.statusText);
					setRecentUsers([]);
				}
			} catch (error) {
				console.error('Error fetching recent users:', error);
				setRecentUsers([]);
			}
		};

		// Fetch recent users
		fetchUsers();

		fetchAdminData();
	}, [token, navigate]);

	if (isLoading) {
		return (
			<div className='flex items-center justify-center min-h-screen'>
				<div className='text-center'>
					<div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#99BC85] mx-auto'></div>
					<p className='mt-4 text-[#99BC85]'>Loading admin dashboard...</p>
				</div>
			</div>
		);
	}

	return (
		<div className='min-h-screen bg-gray-50'>
			<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6'>
				{/* Admin Header */}
				<div className='bg-white shadow rounded-lg p-6 mb-6'>
					<div className='flex items-center justify-between'>
						<div className='flex items-center'>
							<Avatar className='h-14 w-14'>
								<AvatarImage src='https://github.com/admin.png' alt='@admin' />
								<AvatarFallback className='bg-red-100 text-red-600'>AD</AvatarFallback>
							</Avatar>
							<div className='ml-4'>
								<h2 className='text-lg font-semibold'>Admin Dashboard</h2>
								<p className='text-gray-600 text-sm'>Welcome, {adminData?.username}</p>
								<p className='text-gray-500 text-xs'>{adminData?.email}</p>
							</div>
						</div>
						<div className='bg-red-100 px-3 py-1.5 rounded-full'>
							<span className='text-sm font-medium text-red-700'>ADMIN</span>
						</div>
					</div>
				</div>

				{/* Stats Cards */}
				<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6'>
					<div className='bg-white p-6 rounded-lg shadow'>
						<div className='flex items-center'>
							<div className='p-2 bg-blue-100 rounded-lg'>
								<svg
									className='w-6 h-6 text-blue-600'
									fill='none'
									stroke='currentColor'
									viewBox='0 0 24 24'
								>
									<path
										strokeLinecap='round'
										strokeLinejoin='round'
										strokeWidth={2}
										d='M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z'
									/>
								</svg>
							</div>
							<div className='ml-4'>
								<h3 className='text-sm font-medium text-gray-500'>Total Regular Users</h3>
								<p className='text-2xl font-bold text-gray-900'>
									{userStats?.system.total_users
										? Math.max(0, userStats.system.total_users - 1)
										: 0}
								</p>
							</div>
						</div>
					</div>

					<div className='bg-white p-6 rounded-lg shadow'>
						<div className='flex items-center'>
							<div className='p-2 bg-green-100 rounded-lg'>
								<svg
									className='w-6 h-6 text-green-600'
									fill='none'
									stroke='currentColor'
									viewBox='0 0 24 24'
								>
									<path
										strokeLinecap='round'
										strokeLinejoin='round'
										strokeWidth={2}
										d='M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10'
									/>
								</svg>
							</div>
							<div className='ml-4'>
								<h3 className='text-sm font-medium text-gray-500'>Total Downloads</h3>
								<p className='text-2xl font-bold text-gray-900'>
									{userStats?.system.total_downloads || 0}
								</p>
							</div>
						</div>
					</div>

					<div className='bg-white p-6 rounded-lg shadow'>
						<div className='flex items-center'>
							<div className='p-2 bg-purple-100 rounded-lg'>
								<svg
									className='w-6 h-6 text-purple-600'
									fill='none'
									stroke='currentColor'
									viewBox='0 0 24 24'
								>
									<path
										strokeLinecap='round'
										strokeLinejoin='round'
										strokeWidth={2}
										d='M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z'
									/>
								</svg>
							</div>
							<div className='ml-4'>
								<h3 className='text-sm font-medium text-gray-500'>New Users Last 7 Days</h3>
								<p className='text-2xl font-bold text-gray-900'>
									{userStats?.recent_activity.downloads_last_7_days || 0}
								</p>
							</div>
						</div>
					</div>
				</div>

				{/* Recent Users */}
				<div className='bg-white shadow rounded-lg overflow-hidden'>
					<div className='p-4 border-b border-gray-200'>
						<h2 className='font-semibold text-gray-900'>Recent Regular Users</h2>
						<p className='text-xs text-gray-500 mt-1'>Admin users are hidden from this list</p>
					</div>

					{recentUsers.length > 0 ? (
						<div className='divide-y divide-gray-200'>
							{recentUsers.map((user: any) => (
								<div key={user.id} className='p-4 hover:bg-gray-50'>
									<div className='flex items-center justify-between'>
										<div className='flex items-center'>
											<Avatar className='h-10 w-10'>
												<AvatarFallback className='bg-gray-100'>
													{user.username.charAt(0).toUpperCase()}
												</AvatarFallback>
											</Avatar>
											<div className='ml-3'>
												<p className='text-sm font-medium text-gray-900'>{user.username}</p>
												<p className='text-sm text-gray-500'>{user.email}</p>
											</div>
										</div>
										<div className='text-right'>
											<p className='text-sm text-gray-900'>{user.stats.download_count} downloads</p>
											<p className='text-xs text-gray-500'>
												Joined {new Date(user.created_at).toLocaleDateString()}
											</p>
										</div>
									</div>
								</div>
							))}
						</div>
					) : (
						<div className='p-8 text-center text-gray-500'>
							<p>No users found.</p>
							<p className='text-sm mt-1'>User data will appear here when available.</p>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}

export default AdminDashboard;
