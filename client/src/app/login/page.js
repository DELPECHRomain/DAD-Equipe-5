import { Suspense } from 'react';
import LoginClient from './LoginPage';

export default function Page() {
  return (
    <Suspense fallback={null}>
      <LoginClient />
    </Suspense>
  );
}
