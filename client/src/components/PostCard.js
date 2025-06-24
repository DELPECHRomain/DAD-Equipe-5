"use client";

import { useState } from "react";
import { toggleLike, addReply } from "@/utils/api";
import { useAuth } from "@/context/AuthContext";
import { AiOutlineHeart, AiFillHeart } from "react-icons/ai";
import { useRouter } from "next/navigation";

export default function PostCard({ post, onUpdatePost }) {
  const { accessToken, userId } = useAuth();
  const [commentContent, setCommentContent] = useState("");
  const router = useRouter();

  const handleLike = async () => {
    try {
      const updatedPost = await toggleLike(accessToken, post._id, userId);
      onUpdatePost(updatedPost);
    } catch (err) {
      console.error("Erreur like :", err);
    }
  };

  const handleAddReply = async (e) => {
    e.preventDefault();
    if (!commentContent.trim()) return;
    try {
      const updatedPost = await addReply(accessToken, post._id, userId, commentContent);
      onUpdatePost(updatedPost);
      setCommentContent("");
    } catch (err) {
      console.error("Erreur ajout commentaire :", err);
    }
  };
  const formatHashtags = (content) => {
  return content.split(" ").map((word, i) => {
    if (word.startsWith("#")) {
      const tag = word.slice(1);
      return (
        <a
          key={i}
          href={`/hashtag/${tag}`}
          className="hashtag-link text-blue-600 underline cursor-pointer"
        >
          {word}
        </a>
      );
    }
    return word + " ";
  });
};

  return (
    <div className="border-b border-gray-200 py-4">
      <div>{formatHashtags(post.content)}</div>  

      {post.media?.length > 0 && (
        <div className="mt-2 flex gap-2 flex-wrap">
          {post.media.map((m, i) => (
            <img key={i} src={m.url} alt={m.type} className="w-32 h-32 object-cover rounded" />
          ))}
        </div>
      )}

      <p className="text-gray-500 text-xs mt-1">{new Date(post.createdAt).toLocaleString()}</p>

      {/* Likes */}
      <div className="flex items-center gap-2 mt-2">
        <button onClick={handleLike} className="flex items-center gap-1 text-red-600">
          {post.likes.includes(userId) ? <AiFillHeart /> : <AiOutlineHeart />}
          <span>{post.likes.length}</span>
        </button>
      </div>

      {/* Commentaires */}
      <div className="mt-2">
        <p className="text-sm font-semibold text-black">{post.replies.length} commentaires</p>
        {post.replies.map((r) => (
          <div key={r.replyId} className="text-gray-700 text-sm mt-1">
            ➝ {r.content}
          </div>
        ))}
      </div>

      {/* Ajouter un commentaire */}
      <form onSubmit={handleAddReply} className="mt-2 flex gap-2">
        <input
          value={commentContent}
          onChange={(e) => setCommentContent(e.target.value)}
          placeholder="Ajouter un commentaire..."
          className="flex-1 border border-gray-300 rounded px-2 py-1 text-black"
        />
        <button type="submit" className="text-blue-600 font-semibold">Envoyer</button>
      </form>
    </div>
  );
}
