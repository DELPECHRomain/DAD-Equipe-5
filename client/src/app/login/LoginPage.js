'use client';

import { useState, useEffect, Suspense } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export default function LoginClient() {
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [error, setError] = useState('');
  const [from, setFrom] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setFrom(searchParams.get('from') || '');
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      router.push(from || '/');
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
        <div className="max-w-md w-full bg-gray-50 p-8 rounded-lg shadow-md">
          <Image
            src="/breezy-logo.png"
            alt="Logo"
            width={80}
            height={80}
            className="mx-auto mb-6"
          />
          <h1 className="text-4xl font-semibold mb-6 text-left text-black">
            Connectez-vous
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Adresse mail"
              className="border-indigo-800 text-black w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Mot de passe"
              className="border-indigo-800 text-black w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={loading}
              className={`text-white w-full py-2 rounded-3xl font-semibold ${loading
                  ? 'bg-indigo-800 cursor-not-allowed'
                  : 'bg-indigo-800 hover:bg-blue-700'
                }`}
            >
              {loading ? 'Connexion en cours...' : 'Connexion'}
            </button>
          </form>

          {error && (
            <p className="text-red-600 mt-8 text-center font-medium">{error}</p>
          )}

          <p className="text-black mt-2">
            Vous n'avez pas de compte ?{' '}
            <Link
              href={`/register${from ? `?from=${encodeURIComponent(from)}` : '/'}`}
              className="text-indigo-800 hover:underline"
            >
              Inscrivez-vous
            </Link>
          </p>
        </div>
      </div>
  );
}
