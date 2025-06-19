'use client';

import PostForm from '../../components/PostForm';
import PostList from '../../components/PostList';
import { useState } from 'react';

export default function PostsPage() {
  const [refresh, setRefresh] = useState(false);

  return (
    <div>
      <PostForm onPostCreated={() => setRefresh(!refresh)} />
      <PostList key={refresh} />
    </div>
  );
}
