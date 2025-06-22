"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { searchProfiles, fetchUserProfile, toggleLike, addReply, fetchFollowingPosts } from "@/utils/api";
import { AiOutlineHeart, AiFillHeart } from "react-icons/ai";
import { FaRegCommentDots } from "react-icons/fa";


export default function HomeConnected() {
  const { accessToken, isLoading, userId } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);

  const router = useRouter();
  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);



  // États pour la gestion des commentaires et des inputs
  const [commentInputs, setCommentInputs] = useState({});
  const [openComments, setOpenComments] = useState({});

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

  // Gestion du like
  const handleLike = async (postId) => {
    try {
      const updatedPost = await toggleLike(accessToken, postId, userId);
      setPosts((prev) => prev.map((p) => (p._id === postId ? updatedPost : p)));
    } catch {
      alert("Erreur lors du like");
    }
  };

  // Gestion de l'ouverture du formulaire de commentaire
  const toggleCommentInput = (postId) => {
    setOpenComments((prev) => ({ ...prev, [postId]: !prev[postId] }));
  };

  // Mise à jour du champ commentaire
  const handleCommentChange = (postId, text) => {
    setCommentInputs((prev) => ({ ...prev, [postId]: text }));
  };

  // Soumission d'un commentaire
  const handleCommentSubmit = async (postId, e) => {
    e.preventDefault();
    const text = commentInputs[postId];
    if (!text || text.trim() === "") return;

    try {
      const updatedPost = await addReply(accessToken, postId, userId, text.trim());
      setPosts((prev) => prev.map((p) => (p._id === postId ? updatedPost : p)));
      setCommentInputs((prev) => ({ ...prev, [postId]: "" }));
    } catch {
      alert("Erreur lors de l'ajout du commentaire");
    }
  };

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
    <div className="flex bg-white min-h-screen text-black">
      <main className="flex-1 md:ml-64 max-w-2xl border-x border-gray-200 min-h-screen">
        <header className="p-4 border-b border-gray-200 sticky top-0 bg-white z-10">
          <h1 className="text-2xl font-bold">Accueil</h1>
        </header>

        {posts.length === 0 ? (
          <div className="p-4 text-gray-600">Aucun posts pour le moment.</div>
        ) : (
          posts.map((post) => {
            const likedByUser = post.likes?.includes(userId);
            return (
              <div key={post._id} className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="font-semibold">{post.userId?.username}</span>
                  <span className="text-gray-500 text-sm">
                    {new Date(post.createdAt).toLocaleString()}
                  </span>
                </div>
                <p className="mt-2 text-gray-800">{post.content}</p>

                <div className="flex items-center justify-between mt-3 text-gray-500 text-sm">
                  <button
                    onClick={() => toggleCommentInput(post._id)}
                    className="flex items-center gap-1 hover:text-blue-500 transition"
                  >
                    <FaRegCommentDots className="w-5 h-5" />
                    <span>{post.replies?.length || 0}</span>
                  </button>

                  <button
                    onClick={() => handleLike(post._id)}
                    className={`flex items-center gap-1 ${likedByUser ? "text-red-500" : "hover:text-red-500"
                      } transition`}
                  >
                    {likedByUser ? (
                      <AiFillHeart className="w-5 h-5" />
                    ) : (
                      <AiOutlineHeart className="w-5 h-5" />
                    )}
                    <span>{post.likes?.length || 0}</span>
                  </button>
                </div>

                {openComments[post._id] && (
                  <>
                    <div className="mt-3 max-h-40 overflow-y-auto border-t border-gray-100 pt-2">
                      {post.replies && post.replies.length > 0 ? (
                        post.replies.map((comment) => (
                          <div key={comment._id || comment.createdAt} className="mb-2">
                            <span className="font-semibold text-black">
                              {comment.userId?.displayName || comment.userId?.username || "Anonyme"}
                            </span>{" "}
                            <span className="text-gray-700">{comment.content}</span>
                            <div className="text-gray-400 text-xs">
                              {new Date(comment.createdAt).toLocaleString()}
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-400 text-sm">Pas encore de commentaires</p>
                      )}
                    </div>

                    <form
                      onSubmit={(e) => handleCommentSubmit(post._id, e)}
                      className="mt-2 flex gap-2"
                    >
                      <input
                        type="text"
                        placeholder="Répondre…"
                        value={commentInputs[post._id] || ""}
                        onChange={(e) => handleCommentChange(post._id, e.target.value)}
                        className="flex-1 border border-gray-300 rounded-full px-4 py-1 text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        type="submit"
                        className="bg-blue-600 text-white px-3 py-1 rounded-full hover:bg-blue-700 transition"
                      >
                        Envoyer
                      </button>
                    </form>
                  </>
                )}
              </div>
            );
          })
        )}
      </main>

      <aside className="hidden lg:block w-80 p-4">
        <div className="bg-gray-100 rounded-xl p-4">
          <h2 className="font-bold text-lg mb-3">Recherche de comptes</h2>

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
      </aside>
    </div>
  );
}
