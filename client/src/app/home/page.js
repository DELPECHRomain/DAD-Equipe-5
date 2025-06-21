"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function HomeConnected() {
    const { accessToken, isLoading } = useAuth();
    const router = useRouter();
    const [posts, setPosts] = useState([]);

    useEffect(() => {
        if (!accessToken && !isLoading) {
          router.push("/login");
        }

        // Simuler des posts récupérés en BDD
        setPosts([
            {
                id: 1,
                username: "john_doe",
                content: "Bienvenue sur Breezy ! 🌬️",
                createdAt: "Il y a 2 min",
            },
            {
                id: 2,
                username: "dev_girl",
                content: "J'adore cette plateforme ! ❤️ #frontend",
                createdAt: "Il y a 10 min",
            },
        ]);
    }, [accessToken, isLoading, router]);

    useEffect(() => {
        if (!isLoading && !accessToken) {
            router.push(`/login?from=${encodeURIComponent("/home")}`);
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
        <div className="flex bg-white min-h-screen text-black">
            
      <main className="flex-1 md:ml-64 max-w-2xl border-x border-gray-200 min-h-screen">
        <header className="p-4 border-b border-gray-200 sticky top-0 bg-white z-10">
          <h1 className="text-2xl font-bold">Accueil</h1>
        </header>

        {posts.map((post) => (
          <div key={post.id} className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <span className="font-semibold">{post.username}</span>
              <span className="text-gray-500 text-sm">{post.createdAt}</span>
            </div>
            <p className="mt-2 text-gray-800">{post.content}</p>
          </div>
        ))}
      </main>

      <aside className="hidden lg:block w-80 p-4">
        <div className="bg-gray-100 rounded-xl p-4">
          <h2 className="font-bold text-lg mb-3">Suggestions</h2>
          <p className="text-sm text-gray-600">Aucun contenu pour le moment.</p>
        </div>
      </aside>
    </div>
    );
}
