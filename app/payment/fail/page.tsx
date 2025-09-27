'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

export default function PaymentFailPage() {
  const searchParams = useSearchParams();
  const errorCode = searchParams.get('code');
  const errorMessage = searchParams.get('message');

  const getErrorMessage = (code: string | null) => {
    switch (code) {
      case 'PAY_PROCESS_CANCELED':
        return '사용자가 결제를 취소했습니다.';
      case 'PAY_PROCESS_ABORTED':
        return '결제 승인에 실패했습니다.';
      case 'EXCEED_MAX_CARD_INSTALLMENT_PLAN':
        return '설정 가능한 최대 할부 개월 수를 초과했습니다.';
      case 'INVALID_CARD_EXPIRATION':
        return '카드 유효기간을 다시 확인해주세요.';
      case 'INVALID_STOPPED_CARD':
        return '정지된 카드입니다.';
      case 'EXCEED_MAX_DAILY_PAYMENT_COUNT':
        return '하루 결제 가능 횟수를 초과했습니다.';
      case 'NOT_SUPPORTED_INSTALLMENT_PLAN_CARD_OR_MERCHANT':
        return '할부가 지원되지 않는 카드이거나 가맹점입니다.';
      case 'INVALID_CARD_INSTALLMENT_PLAN':
        return '할부 개월 정보가 잘못되었습니다.';
      case 'NOT_SUPPORTED_MONTHLY_INSTALLMENT_PLAN':
        return '할부가 지원되지 않는 카드입니다.';
      case 'EXCEED_MAX_PAYMENT_AMOUNT':
        return '거래금액 한도를 초과했습니다.';
      case 'CARD_PROCESSING_ERROR':
        return '카드사에서 오류가 발생했습니다.';
      default:
        return errorMessage || '결제 처리 중 오류가 발생했습니다.';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <Navigation />
      
      <main className="pt-24 pb-20 px-4">
        <div className="container mx-auto max-w-2xl text-center">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="text-6xl mb-6">😔</div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              결제에 실패했습니다
            </h1>
            
            <p className="text-lg text-gray-600 mb-8">
              {getErrorMessage(errorCode)}
            </p>

            {errorCode && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
                <p className="text-sm text-red-600">
                  <span className="font-medium">오류 코드:</span> {errorCode}
                </p>
                {errorMessage && (
                  <p className="text-sm text-red-600 mt-1">
                    <span className="font-medium">상세 메시지:</span> {errorMessage}
                  </p>
                )}
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8 text-left">
              <h3 className="font-semibold text-blue-900 mb-3">결제 실패 시 확인사항</h3>
              <ul className="text-sm text-blue-800 space-y-2">
                <li>• 카드 정보가 정확한지 확인해주세요</li>
                <li>• 카드 한도가 충분한지 확인해주세요</li>
                <li>• 해외 결제가 차단되어 있지 않은지 확인해주세요</li>
                <li>• 인터넷 브라우저의 팝업 차단이 해제되어 있는지 확인해주세요</li>
                <li>• 다른 결제 수단을 시도해보세요</li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/programs"
                className="px-8 py-3 bg-origin-purple text-white rounded-lg hover:bg-origin-purple-dark transition font-medium"
              >
                다시 시도하기
              </Link>
              <Link
                href="/contact"
                className="px-8 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
              >
                고객센터 문의
              </Link>
              <Link
                href="/"
                className="px-8 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
              >
                홈으로 돌아가기
              </Link>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200 text-xs text-gray-500">
              결제 관련 문의: help@beorigin.com | 전화: 02-1234-5678<br />
              평일 09:00-18:00 (점심시간 12:00-13:00 제외)
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}