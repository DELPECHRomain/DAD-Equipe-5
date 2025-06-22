"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { fetchUserProfile } from "@/utils/api";
import { AiOutlineEnvironment, AiOutlineLink } from "react-icons/ai";

export default function Profile() {
  const { accessToken, username, userId } = useAuth();
  const router = useRouter();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    displayName: "",
    bio: "",
    location: "",
    website: "",
  });

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

    fetchUserProfile(accessToken, userId)
      .then(data => {
        setProfile(data);
        setFormData({
          displayName: data.displayName || "",
          bio: data.bio || "",
          location: data.location || "",
          website: data.website || "",
        });
        setLoading(false);
      })
      .catch(() => {
        setError("Erreur lors de la récupération du profil.");
        setLoading(false);
      });
  }, [accessToken, router]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Chargement...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;
  if (!profile) return <div className="min-h-screen flex items-center justify-center">Profil introuvable.</div>;

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002"}/profile-service/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error("Erreur mise à jour");
      const updatedProfile = await res.json();
      setProfile(updatedProfile);
      setEditMode(false);
    } catch {
      alert("Erreur lors de la mise à jour du profil");
    }
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
        {!editMode && (
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
            <h1 className="text-2xl text-black font-bold">{profile.displayName || profile.username}</h1>
            <p className="text-black">@{username}</p>

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
                  href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 hover:underline"
                >
                  <AiOutlineLink className="w-4 h-4" />
                  {profile.website.replace(/^https?:\/\//, '')}
                </a>
              )}
            </div>

            <div className="flex gap-8 mt-6 text-black font-semibold text-sm border-t border-gray-200 pt-4">
              <div>
                <span className="text-black">{profile.followers?.length || 0}</span> abonnés
              </div>
              <div>
                <span className="text-black">{profile.following?.length || 0}</span> abonnements
              </div>
            </div>
          </>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block font-semibold mb-1 text-black" htmlFor="displayName">Nom affiché</label>
              <input
                id="displayName"
                name="displayName"
                value={formData.displayName}
                onChange={handleChange}
                className="text-black w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1 text-black" htmlFor="bio">Bio</label>
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
              <label className="block font-semibold mb-1 text-black" htmlFor="location">Lieu</label>
              <input
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="text-black w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1 text-black" htmlFor="website">Site web</label>
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
