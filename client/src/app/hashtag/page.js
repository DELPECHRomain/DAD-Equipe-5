"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import PostCard from "@/components/PostCard";

export default function HashtagPage() {
  const { tag } = useParams();
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    fetch(`http://localhost:5000/posts/hashtag/${tag}`)
      .then(res => res.json())
      .then(setPosts);
  }, [tag]);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">#{tag}</h2>
      {posts.map(post => (
        <PostCard key={post._id} post={post} onUpdatePost={() => {}} />
      ))}
    </div>
  );
}