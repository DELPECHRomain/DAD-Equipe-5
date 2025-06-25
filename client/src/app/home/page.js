"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { searchProfiles, fetchUserProfile, toggleLike, addReply, fetchFollowingPosts } from "@/utils/api";
import { AiOutlineHeart, AiFillHeart } from "react-icons/ai";
import { FaRegCommentDots } from "react-icons/fa";
import SearchBar from "@/components/searchbar";
import { useLang } from "@/context/LangContext";
import { dictionaries } from "@/utils/dictionaries";

export default function HomeConnected() {
  const { accessToken, isLoading, userId } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);

  const router = useRouter();
  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);

  // clé : "postId" pour commentaire sur post, "postId-replyId" pour réponses imbriquées
  const [commentInputs, setCommentInputs] = useState({});
  const [openComments, setOpenComments] = useState({});
  const [openReplies, setOpenReplies] = useState({}); // pour ouvrir formulaire de réponse sur un reply

  const { lang } = useLang();
  const dict = dictionaries[lang];

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
  

  // Gestion ouverture du formulaire de commentaire (post ou reply)
  const toggleCommentInput = (key) => {
    setOpenComments((prev) => ({ ...prev, [key]: !prev[key] }));
  };
  const toggleReplyInput = (key) => {
    setOpenReplies((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleCommentChange = (key, text) => {
    setCommentInputs((prev) => ({ ...prev, [key]: text }));
  };

  // Soumission commentaire ou réponse imbriquée
  // Si parentReplyId est null, commentaire sur post ; sinon réponse à reply
  const handleCommentSubmit = async (postId, parentReplyId, e) => {
  e.preventDefault();
  const key = parentReplyId ? `${postId}-${parentReplyId}` : postId;
  const text = commentInputs[key];
  console.log("Soumission commentaire", { postId, parentReplyId, text });
  if (!text || text.trim() === "") return;

  try {
    const updatedPost = await addReply(accessToken, postId, userId, text.trim(), parentReplyId);
    setPosts((prev) => prev.map((p) => (p._id === postId ? updatedPost : p)));
    setCommentInputs((prev) => ({ ...prev, [key]: "" }));

    if (parentReplyId) {
      setOpenReplies((prev) => ({ ...prev, [key]: false }));
    }
  } catch {
    alert("Erreur lors de l'ajout du commentaire");
  }
};


  // Fonction récursive pour afficher les replies imbriqués
  const renderReplies = (postId, replies) => {
    if (!replies || replies.length === 0) return null;

    return replies.map((reply) => {
      const key = `${postId}-${reply._id}`;
      console.log(reply);
      return (
        <div key={reply._id} className="ml-6 mb-3 border-l border-gray-300 pl-3">
          <div>
            <span className="font-semibold text-black cursor-pointer" onClick={() => goToProfile(reply?.userId)}>
              @{reply.user?.username}
            </span>{" "}
            <span className="text-gray-700">{reply.content}</span>
            <div className="text-gray-400 text-xs">
              {new Date(reply.createdAt).toLocaleString()}
            </div>
          </div>

          <button
            onClick={() => toggleReplyInput(key)}
            className="text-sm text-blue-500 hover:underline mt-1"
          >
            {openReplies[key] ? "Annuler" : "Répondre"}
          </button>

          {openReplies[key] && (
            <form
              onSubmit={(e) => handleCommentSubmit(postId, reply._id, e)}
              className="mt-1 flex gap-2"
            >
              <input
                type="text"
                placeholder="Répondre…"
                value={commentInputs[key] || ""}
                onChange={(e) => handleCommentChange(key, e.target.value)}
                className="flex-1 border border-gray-300 rounded-full px-3 py-1 text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="bg-blue-600 text-white px-3 py-1 rounded-full hover:bg-blue-700 transition"
              >
                {dict.sendReply}
              </button>
            </form>
          )}

          {reply.replies && reply.replies.length > 0 && renderReplies(postId, reply.replies)}
        </div>
      );
    });
  };



  if (isLoading || loadingPosts) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">{dict.loading}</p>
      </div>
    );
  }

  if (!accessToken) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">{dict.redirecting}</p>
      </div>
    );
  }

  return (
    <div className="flex bg-white min-h-screen text-black">
      <main className="flex-1 md:ml-64 max-w-2xl border-x border-gray-200 min-h-screen">
        <header className="p-4 border-b border-gray-200 sticky top-0 bg-white z-10">
          <h1 className="text-2xl font-bold">{dict.homeTitle}</h1>
        </header>

        {posts.length === 0 ? (
          <div className="p-4 text-gray-600">{dict.noPostToDisplay}</div>
        ) : (
          posts.map((post) => {
            const likedByUser = post.likes?.includes(userId);
            return (
              <div key={post._id} className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-black cursor-pointer" onClick={() => goToProfile(post.userId)}>
                    @{post.user?.username}
                  </span>
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
                        renderReplies(post._id, post.replies)
                      ) : (
                        <p className="text-gray-400 text-sm">{dict.noCommentsYet}</p>
                      )}
                    </div>

                    <form
                      onSubmit={(e) => handleCommentSubmit(post._id, null, e)}
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
                        {dict.sendReply}
                      </button>
                    </form>
                  </>
                )}
              </div>
            );
          })
        )}
      </main>

      <aside className="hidden lg:block">
        <SearchBar />
      </aside>
    </div>
  );
}
