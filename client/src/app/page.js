"use client";

import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from 'next/image';


export default function Home() {
    const { accessToken, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (accessToken) {
            router.push(`/home`);
        }
    }, [accessToken, router]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-gray-600">Loading...</p>
            </div>
        );
    }
    
    return (
        <div className="flex min-h-screen bg-gray-200 text-white">
            <div className="hidden md:flex w-1/2 items-center justify-center bg-gray-200">
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
                <h1 className="text-5xl font-bold mb-6 text-black">La brise du moment</h1>
                <p className="text-gray-400 text-lg mb-8 text-center">Exprimez-vous, suivez ce qui vous passionne et découvrez ce qui se passe dans le monde.</p>

                <div className="flex flex-col gap-4 w-full max-w-sm">
                    <Link href="/register">
                        <button className="w-full py-3 px-4 rounded-full bg-white border text-indigo-800 border-indigo-800 font-semibold hover:bg-indigo-50 transition">
                            S'inscrire avec Google
                        </button>
                    </Link>

                    <Link href="/register">
                        <button className="w-full py-3 px-4 rounded-full bg-indigo-800 text-gray-200 font-semibold hover:bg-indigo-700 transition">
                            Créer un compte
                        </button>
                    </Link>


                    <div className="flex items-center">
                        <div className="flex-grow border-t border-gray-300"></div>
                        <div className="mx-3 text-center text-gray-600 font-semibold my-2">OU</div>
                        <div className="flex-grow border-t border-gray-300"></div>
                    </div>

                    <Link href="/login">
                        <button className="w-full py-3 px-4 rounded-full bg-white border text-indigo-800 border-indigo-800 font-semibold hover:bg-indigo-50 transition">
                            Se connecter
                        </button>
                    </Link>

                </div>
            </div>
        </div>
    );
}
