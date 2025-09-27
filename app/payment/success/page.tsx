'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

interface PaymentInfo {
  orderId: string;
  paymentKey: string;
  amount: number;
}

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo | null>(null);
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const confirmPayment = async () => {
      const paymentKey = searchParams.get('paymentKey');
      const orderId = searchParams.get('orderId');
      const amount = searchParams.get('amount');

      if (!paymentKey || !orderId || !amount) {
        setError('결제 정보가 올바르지 않습니다.');
        setIsProcessing(false);
        return;
      }

      try {
        const response = await fetch('/api/payment/confirm', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            paymentKey,
            orderId,
            amount: parseInt(amount)
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || '결제 승인에 실패했습니다.');
        }

        const result = await response.json();
        setPaymentInfo({
          orderId: result.payment.orderId,
          paymentKey: result.payment.paymentKey,
          amount: result.payment.totalAmount
        });

      } catch (error) {
        console.error('Payment confirmation error:', error);
        setError(error instanceof Error ? error.message : '결제 처리 중 오류가 발생했습니다.');
      } finally {
        setIsProcessing(false);
      }
    };

    confirmPayment();
  }, [searchParams]);

  if (isProcessing) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
        <Navigation />
        <div className="pt-32 pb-20 px-4">
          <div className="container mx-auto max-w-2xl text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-origin-purple mx-auto mb-6"></div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              결제를 처리하고 있습니다
            </h1>
            <p className="text-gray-600">
              잠시만 기다려주세요...
            </p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
        <Navigation />
        <div className="pt-32 pb-20 px-4">
          <div className="container mx-auto max-w-2xl text-center">
            <div className="text-6xl mb-6">😔</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              결제 처리 실패
            </h1>
            <p className="text-gray-600 mb-8">
              {error}
            </p>
            <div className="flex gap-4 justify-center">
              <Link
                href="/programs"
                className="px-6 py-3 bg-origin-purple text-white rounded-lg hover:bg-origin-purple-dark transition"
              >
                프로그램으로 돌아가기
              </Link>
              <Link
                href="/contact"
                className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                고객센터 문의
              </Link>
            </div>
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
        <div className="container mx-auto max-w-2xl text-center">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="text-6xl mb-6">🎉</div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              결제가 완료되었습니다!
            </h1>
            
            <p className="text-lg text-gray-600 mb-8">
              알모스트번아웃 프로그램을 구매해주셔서 감사합니다.<br />
              곧 회복의 여정이 시작됩니다.
            </p>

            {paymentInfo && (
              <div className="bg-gray-50 rounded-lg p-6 mb-8 text-left">
                <h3 className="font-semibold text-gray-900 mb-4">결제 정보</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">주문번호:</span>
                    <span className="font-medium">{paymentInfo.orderId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">결제금액:</span>
                    <span className="font-medium">{paymentInfo.amount.toLocaleString()}원</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">결제일시:</span>
                    <span className="font-medium">{new Date().toLocaleDateString('ko-KR')}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-origin-purple/10 border border-origin-purple/20 rounded-lg p-6 mb-8">
              <h3 className="font-semibold text-origin-purple mb-2">다음 단계</h3>
              <ul className="text-sm text-origin-purple/80 text-left space-y-1">
                <li>• 결제 확인 이메일이 발송됩니다</li>
                <li>• 프로그램 시작 가이드를 받아보세요</li>
                <li>• 마이페이지에서 진행상황을 확인하세요</li>
                <li>• 궁금한 점이 있으면 언제든 문의해주세요</li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/dashboard"
                className="px-8 py-3 bg-origin-purple text-white rounded-lg hover:bg-origin-purple-dark transition font-medium"
              >
                프로그램 시작하기
              </Link>
              <Link
                href="/"
                className="px-8 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
              >
                홈으로 돌아가기
              </Link>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200 text-xs text-gray-500">
              문의사항이 있으시면 help@beorigin.com으로 연락주세요.
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
        <Navigation />
        <div className="pt-32 pb-20 px-4">
          <div className="container mx-auto max-w-2xl text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-origin-purple mx-auto"></div>
            <p className="mt-4 text-gray-600">로딩 중...</p>
          </div>
        </div>
        <Footer />
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  );
}