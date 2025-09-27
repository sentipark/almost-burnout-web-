'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { AssessmentResult, getLevelInfo, getQuickWins, QuickWin } from '@/lib/scoring';
import { categoryNames, categoryDescriptions } from '@/lib/questions';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { createClient } from '@supabase/supabase-js';

// 차트 컴포넌트 동적 import
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

interface SharedResult {
  id: string;
  result_data: {
    categoryScores: Record<string, number>;
    aboIndex: number;
    level: 'safe' | 'caution' | 'warning' | 'danger';
    timestamp: string;
  };
  demographics?: {
    gender?: string;
    ageGroup?: string;
  };
}

// 레벨별 맞춤 메시지 (개인정보 제외)
function getAnonymousMessage(level: string, aboIndex: number) {
  const messages = {
    safe: {
      title: "건강한 상태입니다 👍",
      subtitle: "번아웃과는 거리가 먼 균형 잡힌 상태",
      description: "현재의 균형을 잘 유지하고 계시는군요. 지금의 페이스를 유지하면서 가끔씩 자신을 돌아보는 시간을 가져보세요."
    },
    caution: {
      title: "조금 지친 상태입니다 🤔",
      subtitle: "번아웃 초기 징후가 보이기 시작합니다",
      description: "아직은 괜찮지만, 조금씩 피로가 쌓이고 있어요. 지금이 예방의 골든타임입니다. 작은 변화로 큰 차이를 만들 수 있어요."
    },
    warning: {
      title: "Almost 단계입니다 ⚠️",
      subtitle: "번아웃 직전, 즉시 개입이 필요합니다",
      description: "번아웃의 경계선에 서 있습니다. 더 늦기 전에 자신을 위한 시간을 만들어야 해요. 전문적인 도움을 받는 것을 고려해보세요."
    },
    danger: {
      title: "위험한 상태입니다 😔",
      subtitle: "심각한 번아웃 상태입니다",
      description: "심각한 번아웃 상태입니다. 혼자 견디기 힘든 상황일 수 있어요. 전문가의 도움과 함께 천천히, 하지만 확실하게 회복해나가는 것이 중요합니다."
    }
  };
  
  return messages[level as keyof typeof messages] || messages.warning;
}

export default function SharePage() {
  const params = useParams();
  const shareId = params.shareId as string;
  const [sharedResult, setSharedResult] = useState<SharedResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!shareId) return;

    const fetchSharedResult = async () => {
      try {
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        const { data, error } = await supabase
          .from('result_shares')
          .select('*')
          .eq('id', shareId)
          .gt('expires_at', new Date().toISOString())
          .single();

        if (error || !data) {
          setError('공유 링크를 찾을 수 없거나 만료되었습니다.');
          setIsLoading(false);
          return;
        }

        // 조회수 증가
        await supabase
          .from('result_shares')
          .update({ view_count: (data.view_count || 0) + 1 })
          .eq('id', shareId);

        setSharedResult(data);
        setIsLoading(false);

      } catch (err) {
        console.error('Fetch shared result error:', err);
        setError('공유된 결과를 불러오는 중 오류가 발생했습니다.');
        setIsLoading(false);
      }
    };

    fetchSharedResult();
  }, [shareId]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-origin-purple mx-auto"></div>
          <p className="mt-4 text-gray-600">공유된 결과를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error || !sharedResult) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
        <Navigation />
        <div className="pt-32 pb-20 px-4">
          <div className="container mx-auto max-w-2xl text-center">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="text-6xl mb-6">😕</div>
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                {error || '결과를 찾을 수 없습니다'}
              </h1>
              <p className="text-gray-600 mb-8">
                공유 링크가 만료되었거나 올바르지 않을 수 있습니다.
              </p>
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-6 py-3 bg-origin-purple text-white rounded-lg hover:bg-origin-purple-dark transition"
              >
                홈으로 돌아가기
              </Link>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const result = sharedResult.result_data;
  const levelInfo = getLevelInfo(result.level);
  const anonymousMessage = getAnonymousMessage(result.level, result.aboIndex);
  const quickWins = getQuickWins(result.categoryScores as any);

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

      {/* Shared Badge */}
      <div className="pt-24 pb-4 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="bg-origin-purple/10 border border-origin-purple/20 rounded-lg p-4 text-center">
            <p className="text-sm text-origin-purple">
              🔗 <strong>공유된 번아웃 진단 결과</strong> - 개인정보는 포함되지 않습니다
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="pb-20 px-4">
        <div className="container mx-auto max-w-6xl">
          
          {/* 결과 요약 섹션 */}
          <div className="text-center mb-12">
            <div className={`inline-flex items-center gap-2 px-6 py-3 rounded-full mb-6 ${levelInfo.bgColor} ${levelInfo.borderColor} border-2`}>
              <span className={`text-lg font-bold ${levelInfo.color}`}>
                {levelInfo.label}
              </span>
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {anonymousMessage.title}
            </h1>
            <p className="text-xl text-gray-700 mb-3">
              {anonymousMessage.subtitle}
            </p>
            <p className="text-gray-600 max-w-2xl mx-auto">
              {anonymousMessage.description}
            </p>
          </div>

          {/* ABO Index 표시 */}
          <div className="bg-gradient-to-r from-origin-purple/5 to-origin-purple/10 rounded-2xl p-8 mb-8">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                번아웃 진단 결과
              </h2>
              
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div className="bg-white rounded-xl p-6 shadow-lg">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    ABO Index
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl font-bold text-origin-purple">
                        {result.aboIndex}점
                      </span>
                      <span className="text-gray-500">
                        / 100점
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Almost Burnout Index - 번아웃 임박 정도를 나타내는 종합 지표
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
                  주요 요인
                </h3>
                <p className="text-gray-600">
                  가장 높은 점수를 보인 요인은 <span className="font-semibold text-origin-purple">
                  {categoryNames[topCategory[0] as keyof typeof categoryNames]}</span> ({Math.round(topCategory[1])}점)입니다.
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  {categoryDescriptions[topCategory[0] as keyof typeof categoryDescriptions]}
                </p>
              </div>
            </div>
          </div>

          {/* 상세 분석 */}
          <div className="mb-12">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-6">
                  5개 요인 분석
                </h3>
                <RadarChartComponent radarData={radarData} />
              </div>

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
          </div>

          {/* CTA Section */}
          <div className="bg-gradient-to-r from-origin-purple to-origin-purple-dark rounded-3xl p-12 text-center text-white">
            <h3 className="text-2xl md:text-3xl font-bold mb-4">
              나도 진단해보기 ✨
            </h3>
            <p className="text-lg mb-8 max-w-2xl mx-auto opacity-90">
              2분 만에 내 번아웃 상태를 확인하고<br />
              맞춤형 솔루션을 받아보세요
            </p>
            <Link
              href="/assessment"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-origin-purple hover:bg-gray-100 font-semibold rounded-full transition transform hover:scale-105"
            >
              <span>무료 진단 시작하기</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}