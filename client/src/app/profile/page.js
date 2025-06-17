"use client";

import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";


export default function Profile() {
    const { accessToken } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!accessToken) {
            router.push(`/login?from=${encodeURIComponent("/profile")}`);
        }
    }, [accessToken, router]);

    if (!accessToken) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-gray-600">Redirecting to login...</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Voici votre profil !</h1>
            <h2 className="text-ml font-bold text-gray-800 mb-4">Vous êtes connecté !</h2>
        </div>
    );
}
