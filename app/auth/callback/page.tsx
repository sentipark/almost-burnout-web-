'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    // Supabase Auth 콜백 처리 (소셜 로그인 등을 위한 예비)
    const handleCallback = async () => {
      // URL에서 토큰 확인
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get('access_token');
      
      if (accessToken) {
        // 인증 성공
        router.push('/mypage');
      } else {
        // 인증 실패 또는 에러
        const error = hashParams.get('error_description') || '로그인에 실패했습니다.';
        alert(error);
        router.push('/login');
      }
    };

    handleCallback();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-origin-purple mx-auto"></div>
        <p className="mt-4 text-gray-600">로그인 처리 중...</p>
      </div>
    </div>
  );
}