'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AssessmentResult } from '@/lib/scoring';
import { getCurrentUser, getUserResults, getUserProgramApplications } from '@/lib/storage-migration';
import { signOut } from '@/lib/api/auth';
import { updateProgramApplicationStatus, debugStorage, clearAllStorage, ProgramApplication } from '@/lib/storage';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

interface ResultHistory {
  results: AssessmentResult[];
}

export default function MyPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [results, setResults] = useState<AssessmentResult[]>([]);
  const [applications, setApplications] = useState<ProgramApplication[]>([]);
  const [activeTab, setActiveTab] = useState<'results' | 'programs' | 'settings'>('results');

  useEffect(() => {
    // 로그인 체크 - Supabase 사용
    const checkUser = async () => {
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        router.push('/login');
        return;
      }

      setUser(currentUser);

      // 사용자별 데이터 불러오기
      const loadUserData = async () => {
        const userResults = await getUserResults(currentUser.id);
        const userApplications = await getUserProgramApplications(currentUser.id);
        console.log(`Loading results for user ${currentUser.id}:`, userResults);
        console.log(`Loading applications for user ${currentUser.id}:`, userApplications);
        setResults(userResults);
        setApplications(userApplications);
      };
      
      await loadUserData();

      // 주기적으로 데이터 새로고침 (같은 탭에서의 변경 사항 반영)
      const interval = setInterval(loadUserData, 300); // 300ms로 더 빠르게
      
      return () => {
        clearInterval(interval);
      };
    };
    
    checkUser();
  }, [router]);

  // 개발자 도구용 디버깅 함수들 추가
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).debugStorage = debugStorage;
      (window as any).clearAllStorage = clearAllStorage;
    }
  }, []);

  const handleLogout = async () => {
    await signOut();
    router.push('/');
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-origin-purple"></div>
      </div>
    );
  }

  const getLevelColor = (level: string) => {
    const colors = {
      safe: 'text-green-600',
      caution: 'text-yellow-600',
      warning: 'text-orange-600',
      danger: 'text-red-600'
    };
    return colors[level as keyof typeof colors] || 'text-gray-600';
  };

  const getLevelBg = (level: string) => {
    const colors = {
      safe: 'bg-green-50',
      caution: 'bg-yellow-50',
      warning: 'bg-orange-50',
      danger: 'bg-red-50'
    };
    return colors[level as keyof typeof colors] || 'bg-gray-50';
  };

  const getApplicationTypeText = (type: ProgramApplication['applicationType']) => {
    const types = {
      apply: '결제 신청',
      custom: '맞춤 프로그램'
    };
    return types[type] || type;
  };

  const getStatusText = (status: ProgramApplication['status']) => {
    const statuses = {
      pending: '대기중',
      confirmed: '승인됨',
      in_progress: '진행중',
      completed: '완료',
      cancelled: '취소됨'
    };
    return statuses[status] || status;
  };

  const getStatusColor = (status: ProgramApplication['status']) => {
    const colors = {
      pending: 'text-yellow-600 bg-yellow-50',
      confirmed: 'text-blue-600 bg-blue-50',
      in_progress: 'text-green-600 bg-green-50',
      completed: 'text-gray-600 bg-gray-50',
      cancelled: 'text-red-600 bg-red-50'
    };
    return colors[status] || 'text-gray-600 bg-gray-50';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Header */}
      <Navigation />

      {/* Profile Section */}
      <section className="pt-32 pb-8 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="bg-white rounded-2xl shadow-sm p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-1">
                  {user.name}님, 안녕하세요!
                </h1>
                <p className="text-gray-600">{user.email}</p>
                <p className="text-sm text-gray-500 mt-1">
                  가입일: {new Date(user.createdAt).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-gray-600 hover:text-gray-900 transition"
              >
                로그아웃
              </button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-origin-purple">{results.length}</div>
                <div className="text-sm text-gray-600">진단 횟수</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-origin-gold">
                  {results.length > 0 ? results[results.length - 1].aboIndex : '-'}
                </div>
                <div className="text-sm text-gray-600">최근 ABO Index</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-origin-navy">{applications.length}</div>
                <div className="text-sm text-gray-600">프로그램 신청</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tab Navigation */}
      <section className="px-4 mb-8">
        <div className="container mx-auto max-w-6xl">
          <div className="flex gap-4 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('results')}
              className={`pb-4 px-2 font-medium transition ${
                activeTab === 'results'
                  ? 'text-origin-purple border-b-2 border-origin-purple'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              진단 기록
            </button>
            <button
              onClick={() => setActiveTab('programs')}
              className={`pb-4 px-2 font-medium transition ${
                activeTab === 'programs'
                  ? 'text-origin-purple border-b-2 border-origin-purple'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              나의 프로그램
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`pb-4 px-2 font-medium transition ${
                activeTab === 'settings'
                  ? 'text-origin-purple border-b-2 border-origin-purple'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              설정
            </button>
          </div>
        </div>
      </section>

      {/* Tab Content */}
      <section className="px-4 pb-20">
        <div className="container mx-auto max-w-6xl">
          {/* Results Tab */}
          {activeTab === 'results' && (
            <div>
              {results.length > 0 ? (
                <div className="grid gap-4">
                  {results.map((result, index) => (
                    <div key={index} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-4 mb-2">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getLevelBg(result.level)} ${getLevelColor(result.level)}`}>
                              {result.level === 'safe' && '안전'}
                              {result.level === 'caution' && '주의'}
                              {result.level === 'warning' && '경고'}
                              {result.level === 'danger' && '위험'}
                            </span>
                            <span className="text-gray-500 text-sm">
                              {new Date(result.timestamp).toLocaleDateString()} {new Date(result.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                          <div className="flex items-center gap-6">
                            <div>
                              <span className="text-gray-600">ABO Index:</span>
                              <span className="ml-2 text-xl font-bold text-gray-900">{result.aboIndex}점</span>
                            </div>
                            <div className="flex gap-4 text-sm text-gray-600">
                              <span>감정: {Math.round(result.categoryScores.em)}</span>
                              <span>성취: {Math.round(result.categoryScores.pe)}</span>
                              <span>신체: {Math.round(result.categoryScores.ph)}</span>
                              <span>조직: {Math.round(result.categoryScores.or)}</span>
                              <span>관계: {Math.round(result.categoryScores.im)}</span>
                            </div>
                          </div>
                        </div>
                        <Link
                          href={`/result?id=${index}`}
                          className="px-4 py-2 text-origin-purple hover:bg-origin-purple/10 rounded-lg transition"
                        >
                          상세보기
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                  <div className="text-6xl mb-4">📊</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    아직 진단 기록이 없어요
                  </h3>
                  <p className="text-gray-600 mb-6">
                    번아웃 진단을 받고 나의 상태를 확인해보세요
                  </p>
                  <Link
                    href="/assessment"
                    className="inline-block px-6 py-3 bg-origin-purple hover:bg-origin-purple-dark text-white font-medium rounded-lg transition"
                  >
                    진단 시작하기
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Programs Tab */}
          {activeTab === 'programs' && (
            <div>
              {applications.length > 0 ? (
                <div className="grid gap-4">
                  {applications.map((application, index) => (
                    <div key={application.id} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {application.programTitle}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {getApplicationTypeText(application.applicationType)} · {new Date(application.applicationDate).toLocaleDateString()}
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                          {getStatusText(application.status)}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                        {application.price && (
                          <div>
                            <span className="text-gray-500">가격:</span>
                            <span className="ml-2 font-medium">{application.price}</span>
                          </div>
                        )}
                        {application.sessions && (
                          <div>
                            <span className="text-gray-500">세션:</span>
                            <span className="ml-2 font-medium">{application.sessions}</span>
                          </div>
                        )}
                        {application.duration && (
                          <div>
                            <span className="text-gray-500">기간:</span>
                            <span className="ml-2 font-medium">{application.duration}</span>
                          </div>
                        )}
                        <div>
                          <span className="text-gray-500">신청자:</span>
                          <span className="ml-2 font-medium">{application.applicantInfo.name}</span>
                        </div>
                      </div>
                      
                      {application.applicantInfo.message && (
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-sm text-gray-700">
                            <span className="font-medium">메시지:</span> {application.applicantInfo.message}
                          </p>
                        </div>
                      )}
                      
                      <div className="mt-4 flex justify-end">
                        <Link
                          href="/programs"
                          className="text-origin-purple hover:underline text-sm"
                        >
                          프로그램 상세보기
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                  <div className="text-6xl mb-4">🎯</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    아직 신청한 프로그램이 없어요
                  </h3>
                  <p className="text-gray-600 mb-6">
                    당신만의 회복 프로그램을 시작해보세요
                  </p>
                  <Link
                    href="/programs"
                    className="inline-block px-6 py-3 bg-origin-purple hover:bg-origin-purple-dark text-white font-medium rounded-lg transition"
                  >
                    프로그램 둘러보기
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="bg-white rounded-lg shadow-sm p-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">계정 설정</h3>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    이름
                  </label>
                  <input
                    type="text"
                    value={user.name}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-origin-purple focus:border-origin-purple"
                    readOnly
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    이메일
                  </label>
                  <input
                    type="email"
                    value={user.email}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                    readOnly
                  />
                  <p className="mt-1 text-sm text-gray-500">이메일은 변경할 수 없습니다</p>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-3">알림 설정</h4>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-3" defaultChecked />
                      <span className="text-gray-700">주간 번아웃 체크 리마인더</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-3" defaultChecked />
                      <span className="text-gray-700">프로그램 일정 알림</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-3" />
                      <span className="text-gray-700">마케팅 정보 수신</span>
                    </label>
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-200">
                  <button className="px-6 py-2 bg-origin-purple hover:bg-origin-purple-dark text-white font-medium rounded-lg transition">
                    변경사항 저장
                  </button>
                  <button className="ml-4 px-6 py-2 text-red-600 hover:bg-red-50 font-medium rounded-lg transition">
                    계정 삭제
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}