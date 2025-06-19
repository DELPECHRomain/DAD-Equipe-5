import { useEffect, useState } from 'react';
import axios from 'axios';
import { deletePost, updatePost } from '../utils/api';

export default function PostList() {
  const [posts, setPosts] = useState([]);

  const fetchPosts = async () => {
    const res = await axios.get('http://localhost:5000/api/posts');
    setPosts(res.data);
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  return (
    <div className="space-y-4 p-4">
      {posts.map(post => (
        <div key={post._id} className="border p-4 rounded shadow">
          <p className="text-sm text-gray-500">{post.author?.username} - {new Date(post.createdAt).toLocaleString()}</p>
          <p>{post.content}</p>
        </div>
      ))}
    </div>
  );
}

{user?.id === post.author?._id && (
  <div className="flex space-x-2 mt-2">
    <button
      onClick={() => handleEdit(post)}
      className="text-blue-500 hover:underline text-sm"
    >
      Modifier
    </button>
    <button
      onClick={() => handleDelete(post._id)}
      className="text-red-500 hover:underline text-sm"
    >
      Supprimer
    </button>
  </div>
)}


const handleDelete = async (id) => {
  try {
    await deletePost(id, token);
    fetchPosts(); // rafraîchit la liste
  } catch (err) {
    alert('Erreur lors de la suppression');
  }
};

const handleEdit = async (post) => {
  const newContent = prompt('Modifier le contenu :', post.content);
  if (!newContent || newContent === post.content) return;

  try {
    await updatePost(post._id, newContent, token);
    fetchPosts();
  } catch (err) {
    alert('Erreur lors de la modification');
  }
};
