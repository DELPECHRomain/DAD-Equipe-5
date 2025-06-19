import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';

export default function PostForm({ onPostCreated }) {
  const [content, setContent] = useState('');
  const { token } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/posts', { content }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setContent('');
      onPostCreated(); // pour rafraîchir les posts
    } catch (err) {
      alert('Erreur lors de la création du post');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="w-full border p-2 rounded"
        placeholder="Quoi de neuf ?"
        maxLength={280}
      />
      <button type="submit" className="bg-blue-500 text-white px-4 py-2 mt-2 rounded">Poster</button>
    </form>
  );
}
