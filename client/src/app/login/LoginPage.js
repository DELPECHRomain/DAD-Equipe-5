'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Loader from '@/components/Loader';
import { useLang } from "@/context/LangContext";
import { dictionaries } from "@/utils/dictionaries";

export default function LoginClient() {
  const { accessToken, login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [error, setError] = useState('');
  const [from, setFrom] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(true);

  const { lang } = useLang();
  const dict = dictionaries[lang];

  useEffect(() => {
    setLoading(true);
    if (accessToken) {
      router.push(`/`);
    }
    setLoading(false);
  }, [accessToken, router]);

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

  if (loading) {
    return (
      <div>
        <Loader></Loader>
      </div>
    );
  }

  return (

    <div className="flex min-h-screen bg-gray-200 text-white">
      <div className="hidden md:flex w-1/2 items-center justify-center bg-gray-200 ml-64">
        <Image
          src="/breezy-logo.svg"
          alt="Logo"
          width={400}
          height={400}
          className="w-[45%] h-[45%] text-white fill-current"
          priority
        />
      </div>

      <div className="flex flex-col items-center justify-center w-full md:w-1/2 p-8">
        <h1 className="text-5xl font-bold mb-6 text-black">{dict.loginTitle}</h1>
        <p className="text-gray-400 text-lg mb-8 text-center">
          {dict.loginSubtitle}
        </p>

        <form onSubmit={handleSubmit} className="space-y-5 w-full max-w-sm">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="{dict.email}"
            className="bg-white border-indigo-800 text-black w-full px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="{dict.password}"
            className="bg-white border-indigo-800 text-black w-full px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <button
            type="submit"
            className="w-full py-3 rounded-full text-white font-semibold 
                 bg-indigo-800 cursor-pointer hover:bg-indigo-700">
            {dict.loginBtn}
          </button>

          {error && (
            <p className="text-black mt-4 text-red-600 text-center font-medium">
              {error}
            </p>
          )}
        </form>

        <div className="flex items-center my-6 w-full max-w-sm">
          <div className="flex-grow border-t border-gray-300"></div>
          <span className="mx-4 text-gray-600 font-semibold">ou</span>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>

        <Link
          href={`/register${from ? `?from=${encodeURIComponent(from)}` : "/"}`}
          className="w-full max-w-sm"
        >
          <button className="w-full py-3 px-4 rounded-full bg-white border text-indigo-800 border-indigo-800 font-semibold hover:bg-indigo-50 transition cursor-pointer">
            {dict.registerBtn}
          </button>
        </Link>
      </div>
    </div>
  );
}
