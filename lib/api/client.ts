import { auth } from '@/lib/firebase/clientConfig';

export async function apiCall(url: string, options: RequestInit = {}) {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('not authenticated');
  }

  const token = await user.getIdToken();

  const headers = {
    ...options.headers,
    Authorization: `Bearer ${token}`,
  };

  return fetch(url, { ...options, headers });
}
