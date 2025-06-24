"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter, useParams } from "next/navigation";  // Import useParams ici
import {
  fetchUserProfile,
  fetchUserPosts,
  updateUserProfile,
  toggleLike,
  addReply,
  toggleFollow,
} from "@/utils/api";
import { AiOutlineEnvironment, AiOutlineLink, AiOutlineHeart, AiFillHeart } from "react-icons/ai";
import { FaRegCommentDots } from "react-icons/fa";

export default function Profile() {
  const { accessToken, username, userId } = useAuth();
  const router = useRouter();
  const params = useParams();
  const profileId = params?.id || userId;

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [posts, setPosts] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    displayName: "",
    bio: "",
    location: "",
    website: "",
  });

  const [commentInputs, setCommentInputs] = useState({});
  const [openComments, setOpenComments] = useState({});

  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    if (profile && profile.followers) {
      setIsFollowing(profile.followers.includes(userId));
    }
  }, [profile, userId]);

  const handleToggleFollow = async () => {
    try {
      const result = await toggleFollow(accessToken, userId, profile.userId._id);
      setIsFollowing(result.following);

      const updatedProfile = await fetchUserProfile(accessToken, profileId);
      setProfile(updatedProfile);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    if (!accessToken) {
      router.push(`/login?from=${encodeURIComponent("/profile")}`);
      return;
    }

    if (!userId) {
      setError("Utilisateur non valide");
      setLoading(false);
      return;
    }

    fetchUserProfile(accessToken, profileId)
      .then((data) => {
        setProfile(data);
        setFormData({
          displayName: data.displayName || "",
          bio: data.bio || "",
          location: data.location || "",
          website: data.website || "",
        });
        setLoading(false);
        return fetchUserPosts(accessToken, profileId);
      })
      .then((userPosts) => {
        setPosts(userPosts);
        setLoading(false);
      })
      .catch(() => {
        setError("Erreur lors de la récupération du profil ou des posts.");
        setLoading(false);
      });
  }, [accessToken, router, profileId]);

  if (loading)
    return <div className="min-h-screen flex items-center justify-center">Chargement...</div>;
  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>
    );
  if (!profile)
    return (
      <div className="min-h-screen flex items-center justify-center">Profil introuvable.</div>
    );

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const updatedProfile = await updateUserProfile(accessToken, userId, formData);
      setProfile(updatedProfile);
      setEditMode(false);
    } catch {
      alert("Erreur lors de la mise à jour du profil");
    }
  };

  const handleLike = async (postId) => {
    try {
      const updatedLike = await toggleLike(accessToken, postId, userId);
      setPosts((prev) => prev.map((p) => (p._id === postId ? updatedLike : p)));
    } catch {
      alert("Erreur lors du like");
    }
  };

  const handleCommentChange = (postId, text) => {
    setCommentInputs((prev) => ({ ...prev, [postId]: text }));
  };

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

  const toggleCommentInput = (postId) => {
    setOpenComments((prev) => ({ ...prev, [postId]: !prev[postId] }));
  };

  const formatHashtags = (content) => {
  return content.split(/(\s+)/).map((part, i) => {
    if (part.match(/^#\w+/)) {
      return (
        <a
          key={i}
          href={`/hashtag/${part.substring(1)}`}
          className="hashtag-link text-blue-600 underline cursor-pointer"
        >
          {part}
        </a>
      );
    }
    return part;
  });
};

  return (
    <div className="max-w-2xl mx-auto bg-white border border-gray-200 rounded-lg shadow-md overflow-hidden">
      <div className="relative h-36 bg-gray-100">
        {profile.bannerImage ? (
          <img src={profile.bannerImage} alt="Bannière" className="w-full h-full object-cover" />
        ) : (
          <div className="flex items-center justify-center h-full text-black">Pas de bannière</div>
        )}
        <div className="absolute -bottom-12 left-6 w-24 h-24 rounded-full border-4 border-white overflow-hidden bg-gray-200 shadow-lg">
          {profile.profileImage ? (
            <img src={profile.profileImage} alt="Photo profil" className="w-full h-full object-cover" />
          ) : (
            <div className="flex items-center justify-center h-full text-black">No Img</div>
          )}
        </div>
        {!editMode && userId === profileId && (
          <button
            onClick={() => setEditMode(true)}
            className="absolute top-4 right-4 bg-blue-600 text-white text-sm font-semibold py-1.5 px-4 rounded-full hover:bg-blue-700 transition"
          >
            Modifier le profil
          </button>
        )}
      </div>

      <div className="pt-16 px-6 pb-6">
        {!editMode ? (
          <>
            <h1 className="text-2xl text-black font-bold">{profile.displayName}</h1>
            <p className="text-black">@{profile.userId.username}</p>


            {profile.bio && <p className="mt-3 text-black">{profile.bio}</p>}

            <div className="flex flex-wrap gap-4 mt-3 text-black text-sm">
              {profile.location && (
                <div className="flex items-center gap-1">
                  <AiOutlineEnvironment className="w-4 h-4" />
                  <span>{profile.location}</span>
                </div>
              )}
              {profile.website && (
                <a
                  href={profile.website.startsWith("http") ? profile.website : `https://${profile.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 hover:underline"
                >
                  <AiOutlineLink className="w-4 h-4" />
                  {profile.website.replace(/^https?:\/\//, "")}
                </a>
              )}
            </div>

            <div className="flex gap-8 mt-6 text-black font-semibold text-sm border-t border-gray-200 pt-4">
              <div><span>{profile.followers?.length || 0}</span> abonnés</div>
              <div><span>{profile.following?.length || 0}</span> abonnements</div>
            </div>

            {userId !== profileId && (
              <button
                onClick={handleToggleFollow}
                className={`mt-4 px-4 py-2 rounded-full font-semibold ${isFollowing ? "bg-gray-300 text-black" : "bg-blue-600 text-white"
                  }`}
              >
                {isFollowing ? "Se désabonner" : "S'abonner"}
              </button>
            )}


            <div className="mt-8">
              <h2 className="text-xl font-bold text-black mb-4">Mes posts</h2>
              {posts.length === 0 ? (
                <p className="text-gray-600">Aucun posts pour le moment.</p>
              ) : (
                posts.map((post) => {
                  const likedByUser = post.likes?.includes(userId);
                  return (
                    <div key={post._id} className="border-b border-gray-200 py-4">
                      <p className="text-black font-semibold">
                        {post.userId.displayName || post.userId.username}
                      </p>
                      <div>{formatHashtags(post.content)}</div>
                      {post.media && post.media.length > 0 && (
                        <div className="mt-2 flex gap-2 flex-wrap">
                          {post.media.map((mediaItem, index) => (
                            <img key={index} src={mediaItem.url} alt={mediaItem.type} className="w-32 h-32 object-cover rounded" />
                          ))}
                        </div>
                      )}

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
                          className={`flex items-center gap-1 ${likedByUser ? "text-red-500" : "hover:text-red-500"} transition`}
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
                                    {comment.userId.displayName || comment.userId.username}
                                  </span>
                                  {" "}
                                  <span className="text-gray-700">{comment.content}</span>
                                  <div className="text-gray-400 text-xs">{new Date(comment.createdAt).toLocaleString()}</div>
                                </div>
                              ))
                            ) : (
                              <p className="text-gray-400 text-sm">Pas encore de commentaires</p>
                            )}
                          </div>

                          <form onSubmit={(e) => handleCommentSubmit(post._id, e)} className="mt-2 flex gap-2">
                            <input
                              type="text"
                              placeholder="Répondre…"
                              value={commentInputs[post._id] || ""}
                              onChange={(e) => handleCommentChange(post._id, e.target.value)}
                              className="flex-1 border border-gray-300 rounded-full px-4 py-1 text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <button type="submit" className="bg-blue-600 text-white px-3 py-1 rounded-full hover:bg-blue-700 transition">Envoyer</button>
                          </form>
                        </>
                      )}

                      <p className="text-gray-500 text-xs mt-1">{new Date(post.createdAt).toLocaleString()}</p>
                    </div>
                  );
                })
              )}
            </div>
          </>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                className="block font-semibold mb-1 text-black"
                htmlFor="displayName"
              >
                Nom affiché
              </label>
              <input
                id="displayName"
                name="displayName"
                value={formData.displayName}
                onChange={handleChange}
                className="text-black w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label
                className="block font-semibold mb-1 text-black"
                htmlFor="bio"
              >
                Bio
              </label>
              <textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows={3}
                className="text-black w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label
                className="block font-semibold mb-1 text-black"
                htmlFor="location"
              >
                Lieu
              </label>
              <input
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="text-black w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label
                className="block font-semibold mb-1 text-black"
                htmlFor="website"
              >
                Site web
              </label>
              <input
                id="website"
                name="website"
                value={formData.website}
                onChange={handleChange}
                className="text-black w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center gap-4">
              <button
                type="submit"
                className="bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700 transition"
              >
                Sauvegarder
              </button>
              <button
                type="button"
                onClick={() => setEditMode(false)}
                className="text-black hover:underline"
              >
                Annuler
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
