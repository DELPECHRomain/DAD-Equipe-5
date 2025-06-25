"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { createPost } from "@/utils/api";
import { useLang } from "@/context/LangContext";
import { dictionaries } from "@/utils/dictionaries";

export default function CreatePost() {
  const { accessToken, userId, isLoading } = useAuth();
  const router = useRouter();

  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { lang } = useLang();
  const dict = dictionaries[lang];

  useEffect(() => {
    if (!isLoading && !accessToken) {
      router.push("/login");
    }
  }, [accessToken, isLoading, router]);

  const handleSubmit = async (e) => {

    e.preventDefault();

    if (!content.trim()) {
      setError("{dict.emptyPost}");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await createPost(accessToken, userId, content);
      setLoading(false);
      router.push("/home");
    } catch (err) {
      setLoading(false);
      setError(
        err.response?.data?.message ||
        dict.postError
      );
    }
  };

  if (isLoading || !accessToken) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">{dict.loading}</p>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-3xl text-black font-bold mb-6">{dict.createPost}</h1>

      <form onSubmit={handleSubmit}>
        <textarea
          className="text-black w-full border border-gray-300 rounded-md p-3 resize-none focus:ring-2 focus:ring-indigo-500"
          rows={5}
          placeholder={dict.whatsUp}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          maxLength={280}
          disabled={loading}
        />

        <div className="text-black flex justify-between items-center mt-2 text-sm">
          <span>{280 - content.length} {dict.charsLeft}</span>
        </div>

        {error && <p className="text-red-500 mt-2">{error}</p>}

        <button
          type="submit"
          disabled={!content.trim()}
          className={`mt-4 w-full ${
            content.trim() ? "bg-indigo-600 hover:bg-indigo-700" : "bg-gray-300"
          } text-white font-semibold py-2 px-6 rounded-full`}
        >
          {loading ? dict.posting : dict.postBtn}
        </button>
      </form>
    </div>
  );
}
