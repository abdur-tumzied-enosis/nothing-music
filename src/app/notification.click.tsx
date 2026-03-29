import { useRouter } from 'expo-router';
import { useEffect } from 'react';

export default function NotificationClickScreen() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the player screen
    router.replace('/player');
  }, [router]);

  return null;
}