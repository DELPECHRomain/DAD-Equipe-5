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
} from "@/utils/api";
import {
  AiOutlineEnvironment,
  AiOutlineLink,
  AiOutlineHeart,
  AiFillHeart,
} from "react-icons/ai";
import { FaRegCommentDots } from "react-icons/fa";
import ThemeSwitch from "@/components/ThemeSwitch";


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
    profileImage: "",
    bannerImage: "",
  });
  const avatarInputRef  = useRef(null);
  const bannerInputRef  = useRef(null);

  // Gestion commentaires imbriqués
  const [commentInputs, setCommentInputs] = useState({});
  const [openComments, setOpenComments] = useState({}); // toggle formulaire commentaire principal par postId
  const [openReplies, setOpenReplies] = useState({}); // toggle formulaire réponse imbriquée par clé composite

  const [isFollowing, setIsFollowing] = useState(false);

  const fileToBase64 = (file) =>
  new Promise((res, rej) => {
    const reader = new FileReader();
    reader.onload = () => res(reader.result);
    reader.onerror = rej;
    reader.readAsDataURL(file);        // Data-URI complète : “data:image/png;base64,…”
  });

  useEffect(() => {
    if (profile && profile.followers) {
      setIsFollowing(profile.followers.includes(userId));
    }
  }, [profile, userId]);

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

    setLoading(true);
    fetchUserProfile(accessToken, profileId)
      .then((data) => {
        setProfile(data);
        setFormData({
          displayName: data.displayName || "",
          bio: data.bio || "",
          location: data.location || "",
          website: data.website || "",
          profileImage: data.profileImage || "",   
          bannerImage:  data.bannerImage  || "",
        });
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
  }, [accessToken, router, profileId, userId]);

  const handleToggleFollow = async () => {
    try {
      const result = await toggleFollow(accessToken, userId, profileId);
      setIsFollowing(result.following);

      const updatedProfile = await fetchUserProfile(accessToken, profileId);
      setProfile(updatedProfile);
    } catch (err) {
      console.log(err);
    }
  };
  const handleAvatarChange = async (e) => {
  const file = e.target.files?.[0];
  if (!file) return;
  const dataUri = await fileToBase64(file);
  setFormData((p) => ({ ...p, profileImage: dataUri }));
  setProfile((p) => ({ ...p, profileImage: dataUri }));
};

const handleBannerChange = async (e) => {
  const file = e.target.files?.[0];
  if (!file) return;
  const dataUri = await fileToBase64(file);
  setFormData((p) => ({ ...p, bannerImage: dataUri }));
  setProfile((p) => ({ ...p, bannerImage: dataUri }));
};

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

  // Toggle input commentaire principal
  const toggleCommentInput = (postId) => {
    setOpenComments((prev) => ({ ...prev, [postId]: !prev[postId] }));
  };

  // Toggle input réponse imbriquée
  const toggleReplyInput = (key) => {
    setOpenReplies((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Gérer le contenu des inputs (commentaires et réponses)
  const handleCommentChange = (key, text) => {
    setCommentInputs((prev) => ({ ...prev, [key]: text }));
  };

  // Soumission commentaire ou réponse (parentReplyId facultatif)
  const handleCommentSubmit = async (postId, parentReplyId, e) => {
    e.preventDefault();
    const key = parentReplyId ? `${postId}-${parentReplyId}` : postId;
    const text = commentInputs[key];
    if (!text || text.trim() === "") return;

    try {
      const updatedPost = await addReply(accessToken, postId, userId, text.trim(), parentReplyId);
      setPosts((prev) => prev.map((p) => (p._id === postId ? updatedPost : p)));
      setCommentInputs((prev) => ({ ...prev, [key]: "" }));

      if (parentReplyId) {
        setOpenReplies((prev) => ({ ...prev, [key]: false }));
      } else {
        setOpenComments((prev) => ({ ...prev, [postId]: false }));
      }
    } catch {
      alert("Erreur lors de l'ajout du commentaire");
    }
  };

  // Fonction récursive pour afficher les réponses imbriquées
  const renderReplies = (postId, replies) => {
    if (!replies || replies.length === 0) return null;

    return replies.map((reply) => {
      const key = `${postId}-${reply._id}`;
      return (
        <div key={reply._id} className="ml-6 mb-3 border-l border-gray-300 pl-3">
          <div>
            <span
              className="font-semibold text-black cursor-pointer"
              onClick={() => router.push(`/profile/${reply.userId}`)}
            >
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
                Envoyer
              </button>
            </form>
          )}

          {reply.replies && reply.replies.length > 0 && renderReplies(postId, reply.replies)}
        </div>
      );
    });
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">Chargement...</div>
    );
  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>
    );
  if (!profile)
    return (
      <div className="min-h-screen flex items-center justify-center">Profil introuvable.</div>
    );

return (
  <div className="max-w-2xl mx-auto bg-white border border-gray-200 rounded-lg shadow-md overflow-hidden">
   {editMode && (
    <ThemeSwitch className="absolute top-4 right-4" />
   )}
    {/* ─────────── Bannière cliquable ─────────── */}
    <div
      className="relative h-36 bg-gray-100 cursor-pointer"
      onClick={() => userId === profileId && bannerInputRef.current?.click()}
    >
      {profile.bannerImage ? (
        <img
          src={profile.bannerImage}
          alt="Bannière"
          className="w-full h-full object-cover banner-img"
        />
      ) : (
        <div className="flex items-center justify-center h-full text-black">
          Pas de bannière
        </div>
      )}

      {editMode && (
        <span className="absolute bottom-2 right-2 text-xs bg-black/60 text-white px-1.5 py-0.5 rounded">
          Changer la bannière
        </span>
      )}

      <div
        className="absolute -bottom-12 left-6 w-24 h-24 rounded-full border-4 border-white overflow-hidden bg-gray-200 shadow-lg cursor-pointer"
        onClick={() => userId === profileId && avatarInputRef.current?.click()}
      >
        {profile.profileImage ? (
          <img
            src={profile.profileImage}
            alt="Photo profil"
            className="w-full h-full object-cover avatar-img"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-black">
            No Img
          </div>
        )}
      </div>

  
    </div>

      {!editMode && userId === profileId && (
        <div className="mt-4 px-6 flex justify-end">
        <button
          onClick={() => setEditMode(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
        >
          Modifier
        </button>
        </div>
      )}


      <div className="mt-16 px-6 pb-6">
        {!editMode ? (
          <>
            <h1 className="text-2xl font-bold text-black">{profile.displayName}</h1>
            <p className="text-black">@{profile.user?.username}</p>
            <p className="text-gray-700">{profile.bio}</p>
            <div className="flex gap-4 mt-2 text-gray-500 text-sm">
              {profile.location && (
                <span className="flex items-center gap-1">
                  <AiOutlineEnvironment className="w-4 h-4" /> {profile.location}
                </span>
              )}
              {profile.website && (
                <a
                  href={profile.website.startsWith("http") ? profile.website : `https://${profile.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 hover:underline"
                >
                  <AiOutlineLink className="w-4 h-4" /> {profile.website}
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
                className={`mt-4 px-4 py-2 rounded-md text-white ${isFollowing ? "bg-gray-600 hover:bg-gray-700" : "bg-blue-600 hover:bg-blue-700"
                  } transition`}
              >
                {isFollowing ? "Se désabonner" : "S’abonner"}
              </button>
            )}
          </>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-black">
            <div>
              <label htmlFor="displayName" className="block font-semibold mb-1">
                Nom d’affichage
              </label>
              <input
                type="text"
                id="displayName"
                name="displayName"
                value={formData.displayName}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                required
              />
            </div>
            <div>
              <label htmlFor="bio" className="block font-semibold mb-1">
                Bio
              </label>
              <textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows={3}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
            <div>
              <label htmlFor="location" className="block font-semibold mb-1">
                Localisation
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
            <div>
              <label htmlFor="website" className="block font-semibold mb-1">
                Site web
              </label>
              <input
                type="url"
                id="website"
                name="website"
                value={formData.website}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
              >
                Enregistrer
              </button>
              <button
                type="button"
                onClick={() => setEditMode(false)}
                className="bg-gray-400 text-white px-4 py-2 rounded-md hover:bg-gray-500 transition"
              >
                Annuler
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Posts */}
      <div className="border-t border-gray-200 p-6 space-y-8">
        {posts.length === 0 && (
          <p className="text-center text-gray-500">Aucun post à afficher.</p>
        )}

        {posts.map((post) => {
          const likedByUser = post.likes.includes(userId);
          return (
            <div
              key={post._id}
              className="border border-gray-300 rounded-lg p-4 bg-gray-50"
            >
              <div className="flex items-center gap-4 mb-2">
                <div>
                  <p
                    className="font-semibold cursor-pointer text-black"
                    onClick={() => router.push(`/profile/${post.userId}`)}
                  >
                    @{post.user?.username}
                  </p>
                  <p className="text-xs text-gray-400">
                    {new Date(post.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>

              <p className="text-black mb-2">{post.content}</p>

              <div className="flex items-center gap-4 mb-2">
                <button
                  onClick={() => handleLike(post._id)}
                  className="flex items-center gap-1 text-red-600 hover:text-red-800"
                  aria-label={likedByUser ? "Retirer like" : "Ajouter like"}
                >
                  {likedByUser ? (
                    <AiFillHeart size={20} />
                  ) : (
                    <AiOutlineHeart size={20} />
                  )}
                  {post.likes.length}
                </button>

                <button
                  onClick={() => toggleCommentInput(post._id)}
                  className="flex items-center gap-1 text-gray-600 hover:text-gray-800"
                >
                  <FaRegCommentDots size={18} />
                  {post.replies.length}
                </button>
              </div>


              {/* Formulaire commentaire principal */}
              {openComments[post._id] && (
                <form
                  onSubmit={(e) => handleCommentSubmit(post._id, null, e)}
                  className="flex gap-2 mb-3"
                >
                  <input
                    type="text"
                    placeholder="Ajouter un commentaire..."
                    value={commentInputs[post._id] || ""}
                    onChange={(e) => handleCommentChange(post._id, e.target.value)}
                    className="flex-1 border border-gray-300 rounded-full px-3 py-1 text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-3 py-1 rounded-full hover:bg-blue-700 transition"
                  >
                    Envoyer
                  </button>
                </form>
              )}

              {/* Affichage des réponses imbriquées */}
              {renderReplies(post._id, post.replies)}
            </div>
          );
        })}
      </div>
       <input
    type="file"
    accept="image/*"
    ref={avatarInputRef}
    className="hidden"
    onChange={handleAvatarChange}
  />
  <input
    type="file"
    accept="image/*"
    ref={bannerInputRef}
    className="hidden"
    onChange={handleBannerChange}
  />

</div>  
    
  );
}
