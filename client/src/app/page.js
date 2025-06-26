"use client";

import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from 'next/image';
import { useLang } from "@/context/LangContext";
import { dictionaries } from "@/utils/dictionaries";


export default function Home() {
    const { accessToken, isLoading } = useAuth();
    const router = useRouter();
    const { lang } = useLang();
    const dict = dictionaries[lang];

    useEffect(() => {
        if (accessToken) {
            router.push(`/home`);
        }
    }, [accessToken, router]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-gray-600">{dict.loading}</p>
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
                <h1 className="text-5xl font-bold mb-6 text-black">{dict.homeTilte}</h1>
                <p className="text-gray-400 text-lg mb-8 text-center">{dict.homeSubtitle}</p>

                <div className="flex flex-col gap-4 w-full max-w-sm">
                    <Link href="/register">
                        <button className="w-full py-3 px-4 rounded-full bg-white border text-indigo-800 border-indigo-800 font-semibold hover:bg-indigo-50 transition cursor-pointer">
                            {dict.signUpWithGoogle}
                        </button>
                    </Link>

                    <Link href="/register">
                        <button className="w-full py-3 px-4 rounded-full bg-indigo-800 text-gray-200 font-semibold hover:bg-indigo-700 transition cursor-pointer">
                            {dict.createAccountBtn}
                        </button>
                    </Link>


                    <div className="flex items-center">
                        <div className="flex-grow border-t border-gray-300"></div>
                        <div className="mx-3 text-center text-gray-600 font-semibold my-2">{dict.orDivider}</div>
                        <div className="flex-grow border-t border-gray-300"></div>
                    </div>

                    <Link href="/login">
                        <button className="w-full py-3 px-4 rounded-full bg-white border text-indigo-800 border-indigo-800 font-semibold hover:bg-indigo-50 transition cursor-pointer">
                            {dict.connectBtn}
                        </button>
                    </Link>

                </div>
            </div>
        </div>
    );
}
