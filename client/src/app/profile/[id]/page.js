"use client";

import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter, useParams } from "next/navigation";
import {
  fetchUserProfile,
  fetchUserPosts,
  updateUserProfile,
  toggleLike,
  addReply,
  toggleFollow,
  uploadProfileImages,
} from "@/utils/api";
import {
  AiOutlineEnvironment,
  AiOutlineLink,
  AiOutlineHeart,
  AiFillHeart,
} from "react-icons/ai";
import { FaRegCommentDots } from "react-icons/fa";

export default function Profile() {
  const { accessToken, userId } = useAuth();
  const router = useRouter();
  const params = useParams();
  const profileId = params?.id || userId;

  // États principaux
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

  // Preview + cache-busting persistant
  const [bannerPreview, setBannerPreview] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [bannerTimestamp, setBannerTimestamp] = useState(null);
  const [avatarTimestamp, setAvatarTimestamp] = useState(null);

  // Commentaires / follow
  const [commentInputs, setCommentInputs] = useState({});
  const [openComments, setOpenComments] = useState({});
  const [isFollowing, setIsFollowing] = useState(false);

  // Refs pour fichiers
  const bannerRef = useRef(null);
  const avatarRef = useRef(null);

  // Charger les timestamps stockés au premier mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    const bt = localStorage.getItem(`bannerTs_${profileId}`);
    const at = localStorage.getItem(`avatarTs_${profileId}`);
    if (bt) setBannerTimestamp(Number(bt));
    if (at) setAvatarTimestamp(Number(at));
  }, [profileId]);

  // Met à jour isFollowing
  useEffect(() => {
    if (profile?.followers) {
      setIsFollowing(profile.followers.includes(userId));
    }
  }, [profile, userId]);

  // Fetch profil + posts
  useEffect(() => {
    if (!accessToken) {
      router.push(`/login?from=/profile`);
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
        return fetchUserPosts(accessToken, profileId);
      })
      .then((userPosts) => setPosts(userPosts))
      .catch(() => setError("Erreur récupération profil/posts"))
      .finally(() => setLoading(false));
  }, [accessToken, userId, profileId, router]);

  // Handlers
  const onBannerClick = () => bannerRef.current?.click();
  const onAvatarClick = (e) => {
    e.stopPropagation();
    avatarRef.current?.click();
  };

  const handleFiles = async () => {
    const fd = new FormData();
    const bannerFile = bannerRef.current.files[0];
    const avatarFile = avatarRef.current.files[0];

    if (bannerFile) {
      setBannerPreview(URL.createObjectURL(bannerFile));
      fd.append("bannerImage", bannerFile);
    }
    if (avatarFile) {
      setAvatarPreview(URL.createObjectURL(avatarFile));
      fd.append("profileImage", avatarFile);
    }
    if (!fd.has("bannerImage") && !fd.has("profileImage")) return;

    try {
      await uploadProfileImages(accessToken, profileId, fd);

      // refetch
      const fresh = await fetchUserProfile(accessToken, profileId);
      setProfile(fresh);

      // nouveau timestamp persistant
      const now = Date.now();
      setBannerTimestamp(now);
      setAvatarTimestamp(now);
      localStorage.setItem(`bannerTs_${profileId}`, now.toString());
      localStorage.setItem(`avatarTs_${profileId}`, now.toString());
    } catch (err) {
      console.error(err);
      alert("Erreur lors de l’upload : " + (err.message || err));
    }
  };

  const handleChange = (e) =>
    setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const upd = await updateUserProfile(accessToken, userId, formData);
      setProfile(upd);
      setEditMode(false);
    } catch {
      alert("Erreur mise à jour profil");
    }
  };

  const handleLike = async (postId) => {
    try {
      const upd = await toggleLike(accessToken, postId, userId);
      setPosts((p) => p.map((x) => (x._id === postId ? upd : x)));
    } catch {
      alert("Erreur like");
    }
  };

  const toggleCommentInput = (postId) =>
    setOpenComments((p) => ({ ...p, [postId]: !p[postId] }));
  const handleCommentChange = (postId, text) =>
    setCommentInputs((p) => ({ ...p, [postId]: text }));
  const handleCommentSubmit = async (postId, e) => {
    e.preventDefault();
    const txt = commentInputs[postId]?.trim();
    if (!txt) return;
    try {
      const upd = await addReply(accessToken, postId, userId, txt);
      setPosts((p) => p.map((x) => (x._id === postId ? upd : x)));
      setCommentInputs((p) => ({ ...p, [postId]: "" }));
    } catch {
      alert("Erreur commentaire");
    }
  };

  const handleToggleFollow = async () => {
    try {
      const res = await toggleFollow(accessToken, userId, profile.userId._id);
      setIsFollowing(res.following);
      const upd = await fetchUserProfile(accessToken, profileId);
      setProfile(upd);
    } catch {
      console.error("Erreur follow");
    }
  };

  // Render loading / error / not found
  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        Chargement...
      </div>
    );
  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        {error}
      </div>
    );
  if (!profile)
    return (
      <div className="min-h-screen flex items-center justify-center">
        Profil introuvable.
      </div>
    );

  return (
    <div className="max-w-2xl mx-auto bg-white border border-gray-200 rounded-lg shadow-md overflow-hidden">
      {/* Inputs cachés */}
      <input
        type="file"
        accept="image/*"
        ref={bannerRef}
        className="hidden"
        onChange={handleFiles}
      />
      <input
        type="file"
        accept="image/*"
        ref={avatarRef}
        className="hidden"
        onChange={handleFiles}
      />

      {/* Bannière */}
      <div
        className="relative h-36 bg-gray-100 cursor-pointer"
        onClick={onBannerClick}
      >
        {bannerPreview ? (
          <img
            src={bannerPreview}
            alt="Bannière"
            className="w-full h-full object-cover"
          />
        ) : profile.bannerImage ? (
          <img
            src={`${profile.bannerImage}?t=${bannerTimestamp}`}
            alt="Bannière"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-black">
            Pas de bannière
          </div>
        )}

        {/* Avatar */}
        <div
          className="absolute z-10 -bottom-12 left-6 w-24 h-24 rounded-full border-4 border-white overflow-hidden bg-gray-200 shadow-lg cursor-pointer"
          onClick={onAvatarClick}
        >
          {avatarPreview ? (
            <img
              src={avatarPreview}
              alt="Photo profil"
              className="w-full h-full object-cover"
            />
          ) : profile.profileImage ? (
            <img
              src={`${profile.profileImage}?t=${avatarTimestamp}`}
              alt="Photo profil"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-black">
              No Img
            </div>
          )}
        </div>

        {/* Bouton Modifier */}
        {!editMode && userId === profileId && (
          <button
            onClick={() => setEditMode(true)}
            className="absolute top-4 right-4 bg-blue-600 text-white text-sm font-semibold py-1.5 px-4 rounded-full hover:bg-blue-700 transition"
          >
            Modifier le profil
          </button>
        )}
      </div>

      {/* Contenu profil et posts */}
      <div className="pt-16 px-6 pb-6">
        {!editMode ? (
          <>
            {/* Affichage du profil */}
            <h1 className="text-2xl font-bold text-black">
              {profile.displayName}
            </h1>
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
                  href={
                    profile.website.startsWith("http")
                      ? profile.website
                      : `https://${profile.website}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 hover:underline"
                >
                  <AiOutlineLink className="w-4 h-4" />
                  {profile.website.replace(/^https?:\/\//, "")}
                </a>
              )}
            </div>
            <div className="flex gap-8 mt-6 font-semibold text-sm text-black border-t border-gray-200 pt-4">
              <div>
                <span>{profile.followers?.length || 0}</span> abonnés
              </div>
              <div>
                <span>{profile.following?.length || 0}</span> abonnements
              </div>
            </div>
            {userId !== profileId && (
              <button
                onClick={handleToggleFollow}
                className={`mt-4 px-4 py-2 rounded-full font-semibold ${
                  isFollowing ? "bg-gray-300 text-black" : "bg-blue-600 text-white"
                }`}
              >
                {isFollowing ? "Se désabonner" : "S'abonner"}
              </button>
            )}

            {/* Liste des posts */}
            <div className="mt-8">
              <h2 className="text-xl font-bold mb-4 text-black">Mes posts</h2>
              {posts.length === 0 ? (
                <p className="text-gray-600">Aucun posts pour le moment.</p>
              ) : (
                posts.map((post) => {
                  const likedByUser = post.likes?.includes(userId);
                  return (
                    <div key={post._id} className="border-b border-gray-200 py-4">
                      <p className="font-semibold text-black">
                        {post.userId.displayName || post.userId.username}
                      </p>
                      <p className="text-black">{post.content}</p>
                      {post.media?.length > 0 && (
                        <div className="mt-2 flex gap-2 flex-wrap">
                          {post.media.map((m, i) => (
                            <img
                              key={i}
                              src={m.url}
                              alt={m.type}
                              className="w-32 h-32 object-cover rounded"
                            />
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
                          className={`flex items-center gap-1 ${
                            likedByUser ? "text-red-500" : "hover:text-red-500"
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
                            {post.replies?.length > 0 ? (
                              post.replies.map((c) => (
                                <div key={c._id || c.createdAt} className="mb-2">
                                  <span className="font-semibold text-black">
                                    {c.userId.displayName || c.userId.username}
                                  </span>{" "}
                                  <span className="text-gray-700">{c.content}</span>
                                  <div className="text-gray-400 text-xs">
                                    {new Date(c.createdAt).toLocaleString()}
                                  </div>
                                </div>
                              ))
                            ) : (
                              <p className="text-gray-400 text-sm">
                                Pas encore de commentaires
                              </p>
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
                              onChange={(e) =>
                                handleCommentChange(post._id, e.target.value)
                              }
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
                      <p className="text-gray-500 text-xs mt-1">
                        {new Date(post.createdAt).toLocaleString()}
                      </p>
                    </div>
                  );
                })
              )}
            </div>
          </>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Formulaire d’édition */}
            <div>
              <label
                htmlFor="displayName"
                className="block font-semibold mb-1 text-black"
              >
                Nom affiché
              </label>
              <input
                id="displayName"
                name="displayName"
                value={formData.displayName}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
              />
            </div>
            <div>
              <label htmlFor="bio" className="block font-semibold mb-1 text-black">
                Bio
              </label>
              <textarea
                id="bio"
                name="bio"
                rows={3}
                value={formData.bio}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
              />
            </div>
            <div>
              <label htmlFor="location" className="block font-semibold mb-1 text-black">
                Lieu
              </label>
              <input
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
              />
            </div>
            <div>
              <label htmlFor="website" className="block font-semibold mb-1 text-black">
                Site web
              </label>
              <input
                id="website"
                name="website"
                value={formData.website}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
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
