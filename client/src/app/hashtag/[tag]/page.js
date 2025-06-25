"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import PostCard from "@/components/PostCard";
import { useLang } from "@/context/LangContext";
import { dictionaries } from "@/utils/dictionaries";

export default function HashtagPage() {
  const { tag } = useParams();
  const { accessToken } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { lang } = useLang();
  const dict = dictionaries[lang];

  useEffect(() => {
    if (!tag || !accessToken) return;
    setLoading(true);

    fetch(`http://localhost:3003/post-service/posts/hashtag/${tag}`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    })
      .then(res => res.json())
      .then(data => {
        setPosts(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Erreur lors du fetch hashtag :", err);
        setLoading(false);
      });
  }, [tag, accessToken]);

  if (loading) {
    return <div className="p-8 text-center">{dict.loading}</div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6 text-black">
        {dict.resultsFor}<span className="text-blue-600">#{tag}</span>
      </h1>
      {posts.length === 0 ? (
        <p className="text-gray-500">{dict.noPosts}</p>
      ) : (
        posts.map(post => (
          <PostCard key={post._id} post={post} onUpdatePost={() => {}} />
        ))
      )}
    </div>
  );
}