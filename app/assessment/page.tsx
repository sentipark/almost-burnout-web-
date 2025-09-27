'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { questions } from '@/lib/questions';
import { saveAnswers, getAnswers, clearAnswers, saveDemographics } from '@/lib/storage';
import { saveUserResult, getCurrentUser } from '@/lib/storage-migration';
import { calculateScores, calculateABOIndex, getBurnoutLevel } from '@/lib/scoring';
import Footer from '@/components/Footer';

export default function AssessmentPage() {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showDemographics, setShowDemographics] = useState(false);
  const [demographics, setDemographics] = useState({ gender: '', ageGroup: '' });
  const [isClient, setIsClient] = useState(false);

  // 페이지당 문항 수
  const questionsPerPage = 10;
  const totalPages = Math.ceil(questions.length / questionsPerPage);
  
  // 현재 페이지의 문항들
  const currentQuestions = questions.slice(
    currentPage * questionsPerPage,
    Math.min((currentPage + 1) * questionsPerPage, questions.length)
  );

  // 진행률 계산
  const progress = (Object.keys(answers).length / questions.length) * 100;

  // 클라이언트 사이드 마운트 감지
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return; // 클라이언트에서만 실행
    
    // 기존 답변 불러오기
    const savedAnswers = getAnswers();
    if (savedAnswers) {
      setAnswers(savedAnswers);
      console.log('Loaded saved answers:', savedAnswers);
      
      // 저장된 답변에 따라 현재 페이지 계산
      const answeredCount = Object.keys(savedAnswers).length;
      const calculatedPage = Math.floor(answeredCount / questionsPerPage);
      if (calculatedPage !== currentPage && answeredCount > 0) {
        setCurrentPage(Math.min(calculatedPage, totalPages - 1));
      }
    }
  }, [isClient, questionsPerPage, totalPages]);

  useEffect(() => {
    if (!isClient) return; // 클라이언트에서만 실행
    
    // 페이지 새로고침/이탈 시에도 답변 저장
    const handleBeforeUnload = () => {
      if (Object.keys(answers).length > 0) {
        saveAnswers(answers);
      }
    };
    
    // popstate 이벤트 처리 (뒤로가기)
    const handlePopState = (e: PopStateEvent) => {
      // 뒤로가기 시 답변 저장
      if (Object.keys(answers).length > 0) {
        saveAnswers(answers);
      }
      // 페이지 상태 복원
      if (e.state && e.state.assessmentPage !== undefined) {
        setCurrentPage(e.state.assessmentPage);
      }
    };
    
    // 현재 페이지를 history state에 저장
    const currentState = { assessmentPage: currentPage };
    window.history.replaceState(currentState, '');
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handlePopState);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isClient, answers, currentPage]);

  const handleAnswer = (questionId: number, score: number) => {
    const newAnswers = { ...answers, [questionId]: score };
    setAnswers(newAnswers);
    saveAnswers(newAnswers);
  };

  const handleNext = () => {
    // 현재 페이지의 모든 문항에 답했는지 확인
    const allAnswered = currentQuestions.every(q => answers[q.id] !== undefined);
    
    if (!allAnswered) {
      alert('모든 문항에 답해주세요.');
      return;
    }

    // 페이지 변경 전 답변 저장
    saveAnswers(answers);
    console.log('Saved answers before page change:', answers);

    if (currentPage < totalPages - 1) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      // history state 업데이트
      window.history.pushState({ assessmentPage: nextPage }, '');
      window.scrollTo(0, 0);
    } else {
      // 마지막 페이지인 경우 인구통계 모달 표시
      setShowDemographics(true);
    }
  };

  const handlePrevious = () => {
    // 페이지 변경 전 답변 저장
    saveAnswers(answers);
    console.log('Saved answers before going back:', answers);
    
    if (currentPage > 0) {
      const prevPage = currentPage - 1;
      setCurrentPage(prevPage);
      // history state 업데이트
      window.history.pushState({ assessmentPage: prevPage }, '');
      window.scrollTo(0, 0);
    }
  };

  const handleComplete = async () => {
    if (!demographics.gender || !demographics.ageGroup) {
      alert('성별과 연령대를 선택해주세요.');
      return;
    }

    saveDemographics(demographics);
    
    // 결과 계산 및 저장
    const scores = calculateScores(answers);
    const aboIndex = calculateABOIndex(scores);
    const level = getBurnoutLevel(aboIndex);
    
    const result = {
      categoryScores: scores,
      aboIndex,
      level,
      timestamp: new Date().toISOString(),
      demographics
    };

    // 사용자별 결과 저장 (로그인 여부에 따라)
    const currentUser = await getCurrentUser();
    console.log('Assessment completed by user:', currentUser?.id || 'anonymous');
    console.log('Saving result:', result);
    
    // 결과 저장 (Supabase 또는 localStorage)
    await saveUserResult(result, currentUser?.id);
    
    // 결과 페이지로 전달하기 위해 localStorage에 임시 저장
    localStorage.setItem('abo_latest_result', JSON.stringify(result));
    
    // 저장 확인
    console.log('Result saved successfully');
    
    // 결과 페이지로 이동 (window.location 사용으로 확실한 이동)
    setTimeout(() => {
      window.location.href = '/result';
    }, 100);
  };

  const handleRestart = () => {
    if (confirm('진단을 다시 시작하시겠습니까? 현재까지의 답변이 모두 삭제됩니다.')) {
      clearAnswers();
      setAnswers({});
      setCurrentPage(0);
    }
  };

  // 테스트 모드: 랜덤 답변 자동 입력
  const handleTestMode = async () => {
    const testAnswers: Record<number, number> = {};
    
    // 모든 문항에 랜덤 답변 (1-5)
    questions.forEach(q => {
      testAnswers[q.id] = Math.floor(Math.random() * 5) + 1;
    });
    
    setAnswers(testAnswers);
    saveAnswers(testAnswers);
    
    // 랜덤 인구통계 설정
    const genders = ['남성', '여성'];
    const ageGroups = ['20-24', '25-29', '30-34', '35-39'];
    
    const randomDemographics = {
      gender: genders[Math.floor(Math.random() * genders.length)],
      ageGroup: ageGroups[Math.floor(Math.random() * ageGroups.length)]
    };
    
    setDemographics(randomDemographics);
    saveDemographics(randomDemographics);
    
    // 결과 계산 및 저장
    const scores = calculateScores(testAnswers);
    const aboIndex = calculateABOIndex(scores);
    const level = getBurnoutLevel(aboIndex);
    
    const result = {
      categoryScores: scores,
      aboIndex,
      level,
      timestamp: new Date().toISOString(),
      demographics: randomDemographics
    };
    
    // 결과 저장 (Supabase 또는 localStorage)
    const currentUser = await getCurrentUser();
    await saveUserResult(result, currentUser?.id);
    
    console.log('Test mode result:', result);
    
    // 바로 결과 페이지로 이동 (window.location 사용)
    setTimeout(() => {
      window.location.href = '/result';
    }, 100);
  };

  // SSR 시 스켈레톤 표시
  if (!isClient) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
        <div className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-40 border-b border-gray-100">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <div className="h-12 w-40 bg-gray-200 animate-pulse rounded"></div>
            <div className="flex gap-4">
              <div className="h-8 w-20 bg-gray-200 animate-pulse rounded"></div>
              <div className="h-8 w-24 bg-gray-200 animate-pulse rounded"></div>
            </div>
          </div>
        </div>
        <div className="pt-36 pb-20 px-4">
          <div className="container mx-auto max-w-3xl">
            <div className="text-center mb-8">
              <div className="h-8 w-48 bg-gray-200 animate-pulse rounded mx-auto mb-2"></div>
              <div className="h-4 w-24 bg-gray-200 animate-pulse rounded mx-auto"></div>
            </div>
            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <div className="h-4 w-8 bg-gray-200 animate-pulse rounded mb-4"></div>
                  <div className="h-6 w-full bg-gray-200 animate-pulse rounded mb-4"></div>
                  <div className="flex justify-between items-center">
                    <div className="h-3 w-16 bg-gray-200 animate-pulse rounded"></div>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((j) => (
                        <div key={j} className="w-12 h-12 bg-gray-200 animate-pulse rounded-full"></div>
                      ))}
                    </div>
                    <div className="h-3 w-16 bg-gray-200 animate-pulse rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Header */}
      <header className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-40 border-b border-gray-100">
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
          <div className="flex gap-4">
            <button
              onClick={handleTestMode}
              className="text-sm px-4 py-2 bg-origin-purple text-white rounded-lg hover:bg-origin-purple-dark transition"
            >
              🚀 테스트 모드
            </button>
            <button
              onClick={handleRestart}
              className="text-sm text-gray-600 hover:text-origin-purple transition"
            >
              처음부터 다시
            </button>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="fixed top-[73px] w-full bg-white z-30 shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">진행률</span>
            <span className="text-sm font-semibold text-origin-purple">
              {Math.round(progress)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-origin-purple to-origin-purple-dark h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="pt-36 pb-20 px-4">
        <div className="container mx-auto max-w-3xl">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              번아웃 진단 설문
            </h1>
            <p className="text-gray-600">
              페이지 {currentPage + 1} / {totalPages}
            </p>
          </div>

          {/* Questions */}
          <div className="space-y-6">
            {currentQuestions.map((question) => (
              <div
                key={question.id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
              >
                <div className="mb-4">
                  <span className="text-sm font-semibold text-origin-purple">
                    Q{question.id}
                  </span>
                  <p className="text-lg text-gray-900 mt-2">{question.text}</p>
                </div>

                <div className="flex justify-between items-center gap-2">
                  <span className="text-xs text-gray-500">전혀 그렇지 않다</span>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((score) => (
                      <button
                        key={score}
                        onClick={() => handleAnswer(question.id, score)}
                        className={`
                          w-12 h-12 rounded-full border-2 transition-all
                          ${answers[question.id] === score
                            ? 'bg-origin-purple border-origin-purple text-white'
                            : 'bg-white border-gray-300 text-gray-600 hover:border-origin-purple/50'
                          }
                        `}
                      >
                        {score}
                      </button>
                    ))}
                  </div>
                  <span className="text-xs text-gray-500">매우 그렇다</span>
                </div>
              </div>
            ))}
          </div>

          {/* Navigation */}
          <div className="flex justify-between mt-8">
            <button
              onClick={handlePrevious}
              disabled={currentPage === 0}
              className={`
                px-6 py-3 rounded-lg font-medium transition
                ${currentPage === 0
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                }
              `}
            >
              이전
            </button>

            <button
              onClick={handleNext}
              className="px-8 py-3 bg-origin-purple hover:bg-origin-purple-dark text-white font-medium rounded-lg transition"
            >
              {currentPage === totalPages - 1 ? '완료' : '다음'}
            </button>
          </div>
        </div>
      </main>

      {/* Demographics Modal */}
      {showDemographics && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              마지막 단계입니다
            </h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  성별
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {['남성', '여성'].map((gender) => (
                    <button
                      key={gender}
                      onClick={() => setDemographics(prev => ({ ...prev, gender }))}
                      className={`
                        py-3 rounded-lg border-2 font-medium transition
                        ${demographics.gender === gender
                          ? 'border-origin-purple bg-origin-purple/10 text-origin-purple'
                          : 'border-gray-200 hover:border-origin-purple/50'
                        }
                      `}
                    >
                      {gender}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  연령대
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {['20-24', '25-29', '30-34', '35-39', '40-44', '45+'].map((age) => (
                    <button
                      key={age}
                      onClick={() => setDemographics(prev => ({ ...prev, ageGroup: age }))}
                      className={`
                        py-3 rounded-lg border-2 font-medium transition
                        ${demographics.ageGroup === age
                          ? 'border-origin-purple bg-origin-purple/10 text-origin-purple'
                          : 'border-gray-200 hover:border-origin-purple/50'
                        }
                      `}
                    >
                      {age}세
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={handleComplete}
              className="w-full mt-8 py-3 bg-origin-purple hover:bg-origin-purple-dark text-white font-medium rounded-lg transition"
            >
              결과 확인하기
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <Footer />
    </div>
  );
}