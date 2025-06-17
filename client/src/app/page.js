"use client";

import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function Home() {
    const { accessToken, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && !accessToken) {
            router.push(`/login?from=${encodeURIComponent("/")}`);
        }
    }, [accessToken, isLoading, router]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-gray-600">Loading...</p>
            </div>
        );
    }

    if (!accessToken) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-gray-600">Redirecting to login...</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Bienvenue sur Breezy !</h1>
        </div>
    );
}
