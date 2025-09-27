'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { loadTossPayments } from '@tosspayments/payment-sdk';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { getCurrentUser } from '@/lib/storage-migration';

interface ProgramInfo {
  type: 'basic' | 'premium' | 'enterprise';
  name: string;
  price: number;
  description: string;
  features: string[];
}

const PROGRAMS: Record<string, ProgramInfo> = {
  basic: {
    type: 'basic',
    name: '기본 프로그램',
    price: 29000,
    description: '번아웃 회복의 첫 단계',
    features: [
      '개인 맞춤 진단 리포트',
      '7일 회복 가이드',
      '기본 명상 콘텐츠',
      '이메일 지원'
    ]
  },
  premium: {
    type: 'premium', 
    name: '프리미엄 프로그램',
    price: 49000,
    description: '체계적인 번아웃 회복 프로그램',
    features: [
      '상세 진단 리포트',
      '21일 단계별 회복 프로그램',
      '프리미엄 명상 & 운동 콘텐츠',
      '주간 진행 체크',
      '전문가 1:1 상담 (1회)'
    ]
  },
  enterprise: {
    type: 'enterprise',
    name: '기업 프로그램',
    price: 99000,
    description: '조직 차원의 번아웃 예방 솔루션',
    features: [
      '팀/조직 진단 분석',
      '관리자용 대시보드',
      '맞춤형 교육 자료',
      '분기별 조직 건강도 체크',
      '전문 컨설턴트 지원',
      '무제한 상담 지원'
    ]
  }
};

export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const programType = searchParams.get('program') as keyof typeof PROGRAMS;
  
  const [program, setProgram] = useState<ProgramInfo | null>(null);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [tossPayments, setTossPayments] = useState<any>(null);

  useEffect(() => {
    // 프로그램 정보 설정
    if (programType && PROGRAMS[programType]) {
      setProgram(PROGRAMS[programType]);
    }

    // 사용자 정보 로드
    const loadUser = async () => {
      const currentUser = await getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
        setCustomerInfo(prev => ({
          ...prev,
          email: currentUser.email || ''
        }));
      }
    };

    loadUser();

    // 토스페이먼츠 SDK 로드
    const initTossPayments = async () => {
      try {
        const toss = await loadTossPayments(process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY!);
        setTossPayments(toss);
      } catch (error) {
        console.error('TossPayments 로드 실패:', error);
      }
    };

    initTossPayments();
  }, [programType]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCustomerInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePayment = async () => {
    if (!program || !tossPayments) {
      alert('결제 준비가 완료되지 않았습니다.');
      return;
    }

    if (!customerInfo.name || !customerInfo.email) {
      alert('이름과 이메일을 입력해주세요.');
      return;
    }

    setIsLoading(true);

    try {
      // 주문 생성
      const checkoutResponse = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          programType: program.type,
          customerName: customerInfo.name,
          customerEmail: customerInfo.email,
          customerPhone: customerInfo.phone,
          userId: user?.id || null
        })
      });

      if (!checkoutResponse.ok) {
        throw new Error('주문 생성 실패');
      }

      const { paymentData } = await checkoutResponse.json();

      // 토스페이먼츠 결제창 호출
      await tossPayments.requestPayment('카드', {
        amount: paymentData.amount,
        orderId: paymentData.orderId,
        orderName: paymentData.orderName,
        customerName: paymentData.customerName,
        customerEmail: paymentData.customerEmail,
        successUrl: paymentData.successUrl,
        failUrl: paymentData.failUrl,
      });

    } catch (error) {
      console.error('결제 오류:', error);
      alert('결제 처리 중 오류가 발생했습니다.');
      setIsLoading(false);
    }
  };

  if (!program) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
        <Navigation />
        <div className="pt-32 pb-20 px-4">
          <div className="container mx-auto max-w-2xl text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              프로그램을 찾을 수 없습니다
            </h1>
            <p className="text-gray-600">
              올바른 프로그램을 선택해주세요.
            </p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <Navigation />
      
      <main className="pt-24 pb-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              결제하기
            </h1>
            <p className="text-gray-600">
              회복의 여정을 시작할 준비가 되셨나요?
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* 프로그램 정보 */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {program.name}
              </h2>
              <p className="text-gray-600 mb-4">
                {program.description}
              </p>
              
              <div className="mb-6">
                <div className="text-3xl font-bold text-origin-purple mb-2">
                  {program.price.toLocaleString()}원
                </div>
                <p className="text-sm text-gray-500">부가세 포함</p>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900">포함 내용</h3>
                {program.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 결제 정보 입력 */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6">
                주문자 정보
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    이름 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={customerInfo.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-origin-purple focus:border-transparent"
                    placeholder="실명을 입력해주세요"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    이메일 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={customerInfo.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-origin-purple focus:border-transparent"
                    placeholder="example@email.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    연락처 (선택)
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={customerInfo.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-origin-purple focus:border-transparent"
                    placeholder="010-1234-5678"
                  />
                </div>
              </div>

              {/* 결제 금액 요약 */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-gray-700">프로그램 가격</span>
                  <span className="text-gray-900">{program.price.toLocaleString()}원</span>
                </div>
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>총 결제금액</span>
                  <span className="text-origin-purple">{program.price.toLocaleString()}원</span>
                </div>
              </div>

              {/* 결제 버튼 */}
              <button
                onClick={handlePayment}
                disabled={isLoading || !customerInfo.name || !customerInfo.email}
                className="w-full mt-6 px-6 py-4 bg-origin-purple hover:bg-origin-purple-dark text-white font-semibold rounded-lg transition disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {isLoading ? '결제 준비 중...' : '결제하기'}
              </button>

              <div className="mt-4 text-xs text-gray-500 text-center">
                결제 후 즉시 프로그램을 이용하실 수 있습니다.<br />
                결제 문의: help@beorigin.com
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}