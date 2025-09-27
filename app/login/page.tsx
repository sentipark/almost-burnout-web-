'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signUp, signIn, migrateTemporaryResult } from '@/lib/storage-migration';
import Footer from '@/components/Footer';

export default function LoginPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    birthDate: '',
    gender: '',
    confirmPassword: '',
    agreeTerms: false
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = '이메일을 입력해주세요';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = '유효한 이메일 주소를 입력해주세요';
    }

    if (!formData.password) {
      newErrors.password = '비밀번호를 입력해주세요';
    } else if (formData.password.length < 8) {
      newErrors.password = '비밀번호는 최소 8자 이상이어야 합니다';
    }

    if (!isLogin) {
      if (!formData.name) {
        newErrors.name = '이름을 입력해주세요';
      }
      
      if (!formData.birthDate) {
        newErrors.birthDate = '생년월일을 입력해주세요';
      }
      
      if (!formData.gender) {
        newErrors.gender = '성별을 선택해주세요';
      }
      
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = '비밀번호가 일치하지 않습니다';
      }

      if (!formData.agreeTerms) {
        newErrors.agreeTerms = '이용약관에 동의해주세요';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    if (isLogin) {
      // 로그인 로직 - Supabase 사용
      const result = await signIn({
        email: formData.email,
        password: formData.password
      });
      
      if (result.success && result.user) {
        // 로그인 전 진단 결과가 있으면 사용자 히스토리로 이동
        await migrateTemporaryResult(result.user.id);
        
        alert('로그인 성공!');
        router.push('/mypage');
      } else {
        setErrors({ email: result.error || '이메일 또는 비밀번호가 올바르지 않습니다' });
      }
    } else {
      // 회원가입 로직 - 이메일 인증 없이 바로 진행
      // Supabase로 회원가입
      const result = await signUp({
        email: formData.email,
        password: formData.password,
        name: formData.name,
        birthDate: formData.birthDate,
        gender: formData.gender
      });
      
      if (result.success && result.user) {
        // 회원가입 후에도 임시 결과가 있으면 이동
        await migrateTemporaryResult(result.user.id);
        
        alert('회원가입이 완료되었습니다!');
        router.push('/mypage');
      } else {
        setErrors({ email: result.error || '회원가입에 실패했습니다' });
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 flex flex-col">
      {/* Header */}
      <header className="w-full bg-white/90 backdrop-blur-md z-40 border-b border-gray-100">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center">
            <Image
              src="/logo-A.png"
              alt="Origin Logo"
              width={180}
              height={60}
              className="h-12 w-auto"
              priority
            />
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            {/* Tab Switcher */}
            <div className="flex mb-8 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setIsLogin(true)}
                className={`flex-1 py-2 rounded-md font-medium transition ${
                  isLogin 
                    ? 'bg-white text-origin-purple shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                로그인
              </button>
              <button
                onClick={() => setIsLogin(false)}
                className={`flex-1 py-2 rounded-md font-medium transition ${
                  !isLogin 
                    ? 'bg-white text-origin-purple shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                회원가입
              </button>
            </div>

            {/* Form Title */}
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {isLogin ? '다시 만나서 반가워요!' : '함께 시작해요!'}
              </h2>
              <p className="text-gray-600">
                {isLogin 
                  ? '번아웃 회복 여정을 계속해요' 
                  : '회원가입하고 맞춤형 케어를 받아보세요'}
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    이름
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-origin-purple focus:border-origin-purple ${
                      errors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="홍길동"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-500">{errors.name}</p>
                  )}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  이메일
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-origin-purple focus:border-origin-purple ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="your@email.com"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-500">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  비밀번호
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-origin-purple focus:border-origin-purple ${
                    errors.password ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="••••••••"
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-500">{errors.password}</p>
                )}
              </div>

              {!isLogin && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      비밀번호 확인
                    </label>
                    <input
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-origin-purple focus:border-origin-purple ${
                        errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="••••••••"
                    />
                    {errors.confirmPassword && (
                      <p className="mt-1 text-sm text-red-500">{errors.confirmPassword}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      생년월일
                    </label>
                    <input
                      type="date"
                      value={formData.birthDate}
                      onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-origin-purple focus:border-origin-purple ${
                        errors.birthDate ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.birthDate && (
                      <p className="mt-1 text-sm text-red-500">{errors.birthDate}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      성별
                    </label>
                    <div className="flex gap-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="gender"
                          value="male"
                          checked={formData.gender === 'male'}
                          onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                          className="mr-2"
                        />
                        <span className="text-sm text-gray-700">남성</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="gender"
                          value="female"
                          checked={formData.gender === 'female'}
                          onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                          className="mr-2"
                        />
                        <span className="text-sm text-gray-700">여성</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="gender"
                          value="other"
                          checked={formData.gender === 'other'}
                          onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                          className="mr-2"
                        />
                        <span className="text-sm text-gray-700">기타</span>
                      </label>
                    </div>
                    {errors.gender && (
                      <p className="mt-1 text-sm text-red-500">{errors.gender}</p>
                    )}
                  </div>

                  <div className="flex items-start">
                    <input
                      type="checkbox"
                      id="terms"
                      checked={formData.agreeTerms}
                      onChange={(e) => setFormData({ ...formData, agreeTerms: e.target.checked })}
                      className="mt-1 mr-2"
                    />
                    <label htmlFor="terms" className="text-sm text-gray-600">
                      <Link href="/terms" target="_blank" className="text-origin-purple hover:underline">이용약관</Link> 및{' '}
                      <Link href="/privacy" target="_blank" className="text-origin-purple hover:underline">개인정보처리방침</Link>에 동의합니다
                    </label>
                  </div>
                  {errors.agreeTerms && (
                    <p className="text-sm text-red-500">{errors.agreeTerms}</p>
                  )}
                </>
              )}

              {isLogin && (
                <div className="flex items-center justify-between">
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    <span className="text-sm text-gray-600">로그인 유지</span>
                  </label>
                  <Link href="#" className="text-sm text-origin-purple hover:underline">
                    비밀번호 찾기
                  </Link>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-origin-purple hover:bg-origin-purple-dark text-white font-semibold rounded-lg transition"
              >
                {isLogin ? '로그인' : '회원가입'}
              </button>
            </form>

            {/* Bottom Link */}
            <p className="text-center mt-8 text-sm text-gray-600">
              {isLogin ? (
                <>
                  아직 회원이 아니신가요?{' '}
                  <button
                    onClick={() => setIsLogin(false)}
                    className="text-origin-purple hover:underline font-medium"
                  >
                    회원가입
                  </button>
                </>
              ) : (
                <>
                  이미 계정이 있으신가요?{' '}
                  <button
                    onClick={() => setIsLogin(true)}
                    className="text-origin-purple hover:underline font-medium"
                  >
                    로그인
                  </button>
                </>
              )}
            </p>
          </div>

          {/* Additional Info */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              로그인하면 나의 진단 기록과 프로그램 진행상황을<br />
              언제든지 확인할 수 있어요
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}