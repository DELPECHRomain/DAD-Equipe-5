"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { searchProfiles, fetchUserProfile, fetchFollowingPosts } from "@/utils/api";
import { useLang } from "@/context/LangContext";
import { dictionaries } from "@/utils/dictionaries";


export default function Searchbar() {
  const { accessToken, isLoading, userId } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const { lang } = useLang();
  const dict = dictionaries[lang];

  const router = useRouter();
  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);

  // Recherche automatique à chaque changement de searchQuery (avec debounce)
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setSearchResults([]);
      return;
    }

    const delayDebounceFn = setTimeout(() => {
      handleSearch();
    }, 300); // 300ms debounce

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handleSearch = async () => {
    setSearchLoading(true);
    try {
      const results = await searchProfiles(accessToken, searchQuery.trim());
      setSearchResults(results);
    } catch (error) {
      console.error("Erreur recherche profils :", error);
      setSearchResults([]);
    }
    setSearchLoading(false);
  };

  const goToProfile = (userId) => {
    router.push(`/profile/${userId}`);
  };

  useEffect(() => {
    if (!accessToken && !isLoading) {
      router.push("/login");
      return;
    }

    if (accessToken && userId) {
      fetchUserProfile(accessToken, userId)
        .then((profile) => {
          const followingIds = profile.following || [];

          if (followingIds.length === 0) {
            setPosts([]);
            setLoadingPosts(false);
            return;
          }

          return fetchFollowingPosts(accessToken, followingIds)
            .then((fetchedPosts) => {
              setPosts(fetchedPosts);
              setLoadingPosts(false);
            });
        })
        .catch((error) => {
          console.error("Erreur lors du chargement :", error);
          setLoadingPosts(false);
        });
    }
  }, [accessToken, isLoading, userId, router]);

  useEffect(() => {
    if (!isLoading && !accessToken) {
      router.push(`/login?from=${encodeURIComponent("/home")}`);
    }
  }, [accessToken, isLoading, router]);

  if (isLoading || loadingPosts) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Chargement...</p>
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
    <div className="flex bg-white min-h-screen text-black justify-center">
      <div className=" w-full p-4">
        <div className="bg-gray-100 rounded-xl p-4">
          <h2 className="font-bold text-lg mb-3">{dict.searchTitle}</h2>

          <div className="flex gap-2 mb-3">
            <input
              type="text"
              placeholder="Rechercher un utilisateur..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSearch();
              }}
            />
            {/* <button
              onClick={handleSearch}
              className="bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition"
            >
              Rechercher
            </button> */}
          </div>

          {searchLoading && <p>Recherche en cours...</p>}

          {!searchLoading && searchResults.length === 0 && searchQuery !== "" && (
            <p className="text-gray-600">Aucun utilisateur trouvé.</p>
          )}

          <ul>
            {searchResults.map((profile) => (
              <li
                key={profile.userId}
                className="cursor-pointer p-2 rounded hover:bg-blue-200"
                onClick={() => goToProfile(profile.userId)}
              >
                {profile.displayName || profile.user?.username}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
