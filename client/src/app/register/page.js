"use client"

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Image from "next/image";


export default function RegisterPage() {
    const { register } = useAuth();
    const router = useRouter();

    const [error, setError] = useState("");

    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            await register(username, email, password);
            router.push('/login');
        } catch (error) {
            setError(error.message || 'Registration failed');
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
                <h1 className="text-4xl font-semibold mb-6 text-left text-black">Créer votre compte</h1>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <input
                            id="username"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            placeholder="Nom d'utilisateur"
                            className="border-indigo-800 text-black w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="Adresse mail"
                            className="border-indigo-800 text-black w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder="Mot de passe"
                            className="border-indigo-800 text-black w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-2 rounded-3xl text-white font-semibold ${loading ? "bg-indigo-800 cursor-not-allowed" : "bg-indigo-800 hover:bg-blue-700"
                            }`}
                    >
                        {loading ? "Création en cours..." : "S'inscrire"}
                    </button>

                </form>

                {error && (
                    <p className="text-black mt-8 text-red-600 text-center font-medium">{error}</p>
                )}

            </div>
        </div>
    );
}