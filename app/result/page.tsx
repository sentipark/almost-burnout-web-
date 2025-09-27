'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { AssessmentResult, getLevelInfo, getQuickWins, QuickWin } from '@/lib/scoring';
import { categoryNames, categoryDescriptions } from '@/lib/questions';
import { saveUserResult, getCurrentUser, getUserResults } from '@/lib/storage-migration';
import { clearAnswers } from '@/lib/storage';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

// 차트 컴포넌트 동적 import (SSR 비활성화)
const GaugeChart = dynamic(
  () => import('@/components/charts/ResultCharts').then(mod => mod.GaugeChart),
  { ssr: false }
);

const RadarChartComponent = dynamic(
  () => import('@/components/charts/ResultCharts').then(mod => mod.RadarChartComponent),
  { ssr: false }
);

const CategoryBars = dynamic(
  () => import('@/components/charts/ResultCharts').then(mod => mod.CategoryBars),
  { ssr: false }
);

// 레벨별 맞춤 메시지
function getPersonalizedMessage(level: string, aboIndex: number) {
  const messages = {
    safe: {
      title: "좋은 상태를 유지하고 계시네요! 👍",
      subtitle: "번아웃과는 거리가 먼 건강한 상태입니다",
      description: "현재의 균형을 잘 유지하고 계십니다. 지금의 페이스를 유지하면서 가끔씩 자신을 돌아보는 시간을 가져보세요."
    },
    caution: {
      title: "조금 지쳐있으신 것 같아요 🤔",
      subtitle: "번아웃 초기 징후가 보이기 시작합니다",
      description: "아직은 괜찮지만, 조금씩 피로가 쌓이고 있어요. 지금이 예방의 골든타임입니다. 작은 변화로 큰 차이를 만들 수 있어요."
    },
    warning: {
      title: "지금이 바로 Almost 단계입니다 ⚠️",
      subtitle: "번아웃 직전, 즉시 개입이 필요합니다",
      description: "번아웃의 경계선에 서 계십니다. 더 늦기 전에 자신을 위한 시간을 만들어야 해요. 우리가 함께 회복의 길을 찾아드릴게요."
    },
    danger: {
      title: "많이 힘드셨겠어요 😔",
      subtitle: "심각한 번아웃 상태입니다",
      description: "지금까지 정말 고생 많으셨어요. 혼자 견디기 힘든 상황입니다. 전문가의 도움과 함께 천천히, 하지만 확실하게 회복해나가요."
    }
  };
  
  return messages[level as keyof typeof messages] || messages.warning;
}

// ABO Index 설명
function getABOExplanation(aboIndex: number) {
  let range = "";
  let comparison = "";
  
  if (aboIndex < 30) {
    range = "0-29점";
    comparison = "상위 20%의 건강한 상태";
  } else if (aboIndex < 50) {
    range = "30-49점";
    comparison = "평균적인 직장인 수준";
  } else if (aboIndex < 70) {
    range = "50-69점";
    comparison = "상위 30%의 위험군";
  } else {
    range = "70-100점";
    comparison = "상위 10%의 고위험군";
  }
  
  return { range, comparison };
}

function ResultContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [quickWins, setQuickWins] = useState<QuickWin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [completedWins, setCompletedWins] = useState<Set<number>>(new Set());
  // 이메일 발송 기능 제거됨

  useEffect(() => {
    // 클라이언트 사이드에서만 실행
    if (typeof window === 'undefined') {
      return;
    }
    
    // 이미 로드했으면 재실행 방지
    if (hasLoaded) {
      return;
    }
    
    let isMounted = true; // 컴포넌트 언마운트 감지
    
    // 데이터 로드 함수
    const loadResult = async () => {
      if (!isMounted) return;
      
      try {
        const currentUser = await getCurrentUser();
        const resultId = searchParams.get('id');
        
        // 1. URL 파라미터가 있고 로그인된 사용자인 경우, 히스토리에서 불러오기
        if (resultId && currentUser) {
          const userResults = await getUserResults(currentUser.id);
          const targetResult = userResults[parseInt(resultId)];
          
          if (targetResult && isMounted) {
            console.log('Loading result from history:', targetResult);
            setResult(targetResult);
            setQuickWins(getQuickWins(targetResult.categoryScores));
            setHasLoaded(true);
            setIsLoading(false);
            return;
          }
        }
        
        // 2. 최신 결과를 로컬스토리지에서 불러오기 (새로 완료한 진단)
        const savedResult = localStorage.getItem('abo_latest_result');
        
        if (savedResult && isMounted) {
          try {
            const parsedResult = JSON.parse(savedResult);
            setResult(parsedResult);
            setQuickWins(getQuickWins(parsedResult.categoryScores));
            setHasLoaded(true);
            setIsLoading(false);
            
            // 데이터 로드 완료 후 3초 뒤에 삭제 (충분한 시간 확보)
            setTimeout(() => {
              if (isMounted) {
                localStorage.removeItem('abo_latest_result');
                clearAnswers();
              }
            }, 3000);
          } catch (error) {
            console.error('Error parsing result:', error);
            if (isMounted) {
              setIsLoading(false);
              alert('진단 결과 데이터에 문제가 있습니다.\n\n문제가 지속되면 고객센터(help@beorigin.com)로 문의해주세요.\n\n새로운 진단을 시작하겠습니다.');
              window.location.href = '/assessment';
            }
          }
        } else if (isMounted) {
          // 결과가 없으면 적절한 안내와 함께 진단 페이지로 리다이렉트
          console.log('No result found, redirecting to assessment');
          setIsLoading(false);
          alert('진단 결과를 찾을 수 없습니다.\n\n• 진단을 완료하지 않았거나\n• 브라우저 데이터가 삭제되었을 수 있습니다.\n\n새로운 진단을 시작하겠습니다.');
          window.location.href = '/assessment';
        }
      } catch (error) {
        console.error('Error loading result:', error);
        if (isMounted) {
          setIsLoading(false);
          alert('데이터를 불러오는 중 오류가 발생했습니다.');
          window.location.href = '/assessment';
        }
      }
    };
    
    // 약간의 딜레이 후 로드 (localStorage 동기화 보장)
    const timeoutId = setTimeout(loadResult, 50);
    
    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [hasLoaded, searchParams]);

  const handleWinToggle = (index: number) => {
    setCompletedWins(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  // 이메일 발송 기능 제거됨

  const handlePDFDownload = async () => {
    if (!result) return;
    
    try {
      // 동적 import를 사용하여 클라이언트에서만 로드
      const html2canvas = (await import('html2canvas')).default;
      const { jsPDF } = await import('jspdf');
      
      // PDF로 캡처할 요소 찾기
      const element = document.getElementById('result-content');
      if (!element) {
        alert('결과 페이지를 찾을 수 없습니다.');
        return;
      }
      
      // HTML 요소를 Canvas로 변환
      const canvas = await html2canvas(element, {
        scale: 2, // 고화질을 위한 스케일링
        useCORS: true,
        backgroundColor: '#ffffff',
        width: element.scrollWidth,
        height: element.scrollHeight
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      // A4 사이즈에 맞게 이미지 크기 조정
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      
      let position = 0;
      
      // 첫 번째 페이지
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      
      // 여러 페이지가 필요한 경우
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      // PDF 파일 이름 생성
      const fileName = `번아웃진단결과_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
      
    } catch (error) {
      console.error('PDF 생성 오류:', error);
      alert('PDF 생성 중 오류가 발생했습니다. 다시 시도해주세요.');
    }
  };

  const handleShareLink = async () => {
    if (!result) return;

    try {
      // 공유 링크 생성 API 호출
      const response = await fetch('/api/share', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          result: {
            categoryScores: result.categoryScores,
            aboIndex: result.aboIndex,
            level: result.level,
            timestamp: result.timestamp
          },
          demographics: result.demographics
        })
      });

      if (!response.ok) {
        throw new Error('공유 링크 생성 실패');
      }

      const data = await response.json();
      
      if (data.success && data.shareUrl) {
        // 클립보드에 복사
        await navigator.clipboard.writeText(data.shareUrl);
        alert('공유 링크가 클립보드에 복사되었습니다!\n\n다른 사람들이 개인정보 없이 결과를 볼 수 있습니다.');
      } else {
        throw new Error('공유 URL 생성 실패');
      }

    } catch (error) {
      console.error('Share link error:', error);
      // 실패 시 기존 방식으로 폴백
      navigator.clipboard.writeText(window.location.href);
      alert('공유 링크가 클립보드에 복사되었습니다!');
    }
  };

  if (isLoading || !result) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-origin-purple mx-auto"></div>
          <p className="mt-4 text-gray-600">당신의 번아웃 스토리를 분석하는 중...</p>
        </div>
      </div>
    );
  }

  const levelInfo = getLevelInfo(result.level);
  const personalizedMessage = getPersonalizedMessage(result.level, result.aboIndex);
  const aboExplanation = getABOExplanation(result.aboIndex);

  // 레이더 차트 데이터
  const radarData = Object.entries(result.categoryScores).map(([key, value]) => ({
    category: categoryNames[key as keyof typeof categoryNames],
    score: value,
    fullMark: 100,
  }));

  // 가장 높은 점수 카테고리 찾기
  const topCategory = Object.entries(result.categoryScores)
    .sort(([, a], [, b]) => b - a)[0];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-white">
      {/* Header */}
      <Navigation />

      {/* Main Content */}
      <main className="pt-24 pb-20 px-4">
        <div id="result-content" className="container mx-auto max-w-6xl">
          
          {/* 개인화된 인사말 섹션 */}
          <div className="text-center mb-12 animate-fade-in">
            <div className={`inline-flex items-center gap-2 px-6 py-3 rounded-full mb-6 ${levelInfo.bgColor} ${levelInfo.borderColor} border-2`}>
              <span className={`text-lg font-bold ${levelInfo.color}`}>
                {levelInfo.label}
              </span>
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {personalizedMessage.title}
            </h1>
            <p className="text-xl text-gray-700 mb-3">
              {personalizedMessage.subtitle}
            </p>
            <p className="text-gray-600 max-w-2xl mx-auto">
              {personalizedMessage.description}
            </p>
          </div>

          {/* ABO Index 설명 카드 */}
          <div className="bg-gradient-to-r from-origin-purple/5 to-origin-purple/10 rounded-2xl p-8 mb-8">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                당신의 번아웃 스토리
              </h2>
              
              {/* ABO Index 게이지와 설명 */}
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div className="bg-white rounded-xl p-6 shadow-lg">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    ABO Index란?
                  </h3>
                  <p className="text-gray-600 mb-4">
                    <span className="font-semibold text-origin-purple">Almost Burnout Index</span>는 
                    번아웃 임박 정도를 측정하는 종합 지표입니다.
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl font-bold text-origin-purple">
                        {result.aboIndex}점
                      </span>
                      <span className="text-gray-500">
                        ({aboExplanation.range})
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      당신은 <span className="font-semibold">{aboExplanation.comparison}</span>에 속합니다
                    </p>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl p-6 shadow-lg">
                  <GaugeChart aboIndex={result.aboIndex} />
                </div>
              </div>

              {/* 주요 원인 분석 */}
              <div className="mt-8 bg-white rounded-xl p-6 shadow-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  주요 원인 분석
                </h3>
                <p className="text-gray-600">
                  당신의 번아웃 주요 원인은 <span className="font-semibold text-origin-purple">
                  {categoryNames[topCategory[0] as keyof typeof categoryNames]}</span> ({Math.round(topCategory[1])}점)입니다.
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  {categoryDescriptions[topCategory[0] as keyof typeof categoryDescriptions]}
                </p>
              </div>
            </div>
          </div>

          {/* 상세 분석 섹션 */}
          <div className="mb-12">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="flex items-center gap-2 mx-auto mb-6 px-6 py-3 bg-white border border-gray-200 rounded-full hover:bg-gray-50 transition"
            >
              <span className="font-medium">상세 분석 보기</span>
              <svg 
                className={`w-5 h-5 transition-transform ${showDetails ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {showDetails && (
              <div className="grid md:grid-cols-2 gap-8 animate-fade-in">
                {/* Radar Chart */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">
                    5개 요인 분석
                  </h3>
                  <RadarChartComponent radarData={radarData} />
                </div>

                {/* Category Scores */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">
                    요인별 점수
                  </h3>
                  <CategoryBars 
                    categoryScores={result.categoryScores} 
                    categoryNames={categoryNames}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Quick Wins - 재미있게 개선 */}
          <div className="mb-12">
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                지금 바로 시작하는 회복 미션 🎯
              </h2>
              <p className="text-gray-600">
                작은 실천이 큰 변화를 만듭니다. 오늘 하나만 해보세요!
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {quickWins.map((win, index) => (
                <div
                  key={index}
                  className={`relative bg-white rounded-2xl shadow-lg p-6 transition-all hover:shadow-xl ${
                    completedWins.has(index) ? 'ring-2 ring-green-500 bg-green-50' : ''
                  }`}
                >
                  {/* 완료 체크 */}
                  <button
                    onClick={() => handleWinToggle(index)}
                    className={`absolute top-4 right-4 w-8 h-8 rounded-full border-2 flex items-center justify-center transition ${
                      completedWins.has(index) 
                        ? 'bg-green-500 border-green-500' 
                        : 'border-gray-300 hover:border-origin-purple'
                    }`}
                  >
                    {completedWins.has(index) && (
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>

                  {/* 이모지와 카테고리 */}
                  <div className="mb-4">
                    <span className="text-4xl mb-2 block">{win.emoji}</span>
                    <span className="text-xs font-medium text-origin-purple bg-origin-purple/10 px-2 py-1 rounded-full">
                      {win.category}
                    </span>
                  </div>

                  {/* 제목과 설명 */}
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    {win.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    {win.description}
                  </p>

                  {/* 소요 시간 */}
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{win.duration}</span>
                  </div>
                </div>
              ))}
            </div>

            {completedWins.size > 0 && (
              <div className="mt-6 text-center">
                <p className="text-green-600 font-medium">
                  🎉 {completedWins.size}개의 미션을 완료했어요! 대단해요!
                </p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="mb-12">
            {/* 공유 옵션 버튼들 */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
              <button
                onClick={handlePDFDownload}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition flex items-center justify-center gap-2"
              >
                📄 PDF 다운로드
              </button>
              <button
                onClick={handleShareLink}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition flex items-center justify-center gap-2"
              >
                🔗 공유 링크 복사
              </button>
            </div>
            
            {/* 메인 CTA */}
            <div className="flex justify-center">
              <Link
                href="/programs"
                className="px-8 py-4 bg-origin-purple hover:bg-origin-purple-dark text-white rounded-xl font-semibold text-lg text-center transition transform hover:scale-105 shadow-lg"
              >
                맞춤 프로그램 보기
              </Link>
            </div>
          </div>

          {/* CTA Section - 희망적 메시지 */}
          <div className="bg-gradient-to-r from-origin-purple to-origin-purple-dark rounded-3xl p-12 text-center text-white">
            <h3 className="text-2xl md:text-3xl font-bold mb-4">
              회복은 가능합니다 ✨
            </h3>
            <p className="text-lg mb-8 max-w-2xl mx-auto opacity-90">
              번아웃은 끝이 아니라 새로운 시작의 신호입니다.<br />
              당신만의 속도로, 당신만의 방법으로 회복해나가세요.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/programs"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-origin-purple hover:bg-gray-100 font-semibold rounded-full transition transform hover:scale-105"
              >
                <span>나만의 회복 프로그램 시작하기</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
            
            <div className="mt-8 pt-8 border-t border-white/20">
              <p className="text-sm opacity-75">
                지금까지 <span className="font-semibold">3,847명</span>이 회복의 여정을 시작했습니다
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* 이메일 공유 모달 제거됨 */}

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default function ResultPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-origin-purple mx-auto"></div>
          <p className="mt-4 text-gray-600">결과 페이지를 불러오는 중...</p>
        </div>
      </div>
    }>
      <ResultContent />
    </Suspense>
  );
}