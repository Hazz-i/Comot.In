import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { API_BASE_URL, AUTH_TOKEN_KEY } from '@/constant';

export function LoginModal({
	isOpen,
	onClose,
	setToken,
}: {
	isOpen: boolean;
	onClose: () => void;
	setToken: (token: string) => void;
}) {
	const navigate = useNavigate();
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const [isSubmitting, setIsSubmitting] = useState(false);

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

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsSubmitting(true);
		try {
			const res = await fetch(`${API_BASE_URL}/login`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ login: username, password }),
			});

			let errorMessage = 'Login failed';

			// Try to parse the response regardless of status
			const data = await res.json().catch(() => ({}));

			if (!res.ok) {
				// Handle different error response formats
				if (data.detail) {
					// Could be a string or an object with message property
					if (typeof data.detail === 'string') {
						errorMessage = data.detail;
					} else if (Array.isArray(data.detail) && data.detail.length > 0) {
						// FastAPI validation errors format
						if (data.detail[0].msg) {
							errorMessage = data.detail[0].msg;
						} else {
							errorMessage = JSON.stringify(data.detail[0]);
						}
					} else if (data.detail.message) {
						errorMessage = data.detail.message;
					}
				} else if (data.message) {
					// Some APIs use message directly
					errorMessage = data.message;
				} else if (data.error) {
					// Or direct error property
					errorMessage = data.error;
				}

				throw new Error(errorMessage);
			}

			localStorage.setItem(AUTH_TOKEN_KEY, data.access_token);
			// Using setToken will trigger the App component to show Dashboard
			setToken(data.access_token);

			// Check if user is admin and redirect accordingly
			const tokenData = parseJwt(data.access_token);
			if (tokenData && tokenData.sub === 'admin') {
				toast.success('Login successful! Redirecting to admin dashboard...');
				setTimeout(() => {
					navigate('/admin-dashboard');
				}, 1000);
			} else {
				toast.success('Login successful! Redirecting to dashboard...');
				setTimeout(() => {
					navigate('/dashboard');
				}, 1000);
			}

			setUsername('');
			setPassword('');
			onClose();
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Unknown error';

			// Present more user-friendly error messages
			if (errorMessage.includes('credentials')) {
				toast.error('Invalid username or password. Please try again.');
			} else if (errorMessage.includes('not found')) {
				toast.error('Username not found. Please check your username or sign up.');
			} else if (errorMessage.includes('password')) {
				toast.error('Incorrect password. Please try again.');
			} else {
				toast.error(`Login failed: ${errorMessage}`);
			}

			console.error('Login error:', error);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className='sm:max-w-[425px]'>
				<form onSubmit={handleSubmit}>
					<DialogHeader>
						<DialogTitle className='text-2xl font-bold text-center'>Login Now</DialogTitle>
						<DialogDescription className='text-center'>Sign In to your account.</DialogDescription>
					</DialogHeader>
					<div className='grid gap-4 py-4'>
						<div className='grid gap-2'>
							<Input
								id='username'
								type='text'
								placeholder='Username / Email'
								value={username}
								onChange={(e) => setUsername(e.target.value)}
								required
							/>
						</div>
						<div className='grid gap-2'>
							<Input
								id='password'
								type='password'
								placeholder='Password'
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								required
							/>
						</div>
					</div>
					<DialogFooter className='flex'>
						<Button
							type='button'
							variant='outline'
							onClick={onClose}
							className='flex-1 cursor-pointer'
							disabled={isSubmitting}
						>
							Cancel
						</Button>
						<Button
							type='submit'
							className='bg-[#99BC85] hover:bg-[#88ab74] text-white flex-1 cursor-pointer'
							disabled={isSubmitting}
						>
							{isSubmitting ? 'Logging in...' : 'Login'}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
