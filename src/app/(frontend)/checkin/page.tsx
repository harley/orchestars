'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation'; 
import Head from 'next/head';
import { useAuth } from '@/providers/CheckIn/useAuth';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { setToken } = useAuth();
  
  const handleLogin = async () => {
    if (!email || !password) {
      alert('Please enter both email and password');
      return;
    }

    try {
      setIsLoading(true);

      const res = await fetch('/api/checkin-app/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
            email,
            password,
         }),
      });

      if (res?.ok) {
        const token = await res.json(); // or decode from cookie if SSR-only
        setToken(token.token); // optional since cookie already stores it
        router.replace('/checkin/events');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Login</title>
      </Head>
      <div className="min-h-screen flex items-center justify-center bg-orange-400 px-4">
        <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center">Welcome Back</h1>
          <p className="text-sm text-gray-600 mb-6 text-center">Sign in to continue</p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                disabled={isLoading}
              />
            </div>

            <button
              onClick={handleLogin}
              disabled={isLoading}
              className={`w-full py-3 text-white rounded-lg font-semibold transition ${
                isLoading ? 'bg-orange-300 cursor-not-allowed' : 'bg-orange-500 hover:bg-orange-600'
              }`}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
