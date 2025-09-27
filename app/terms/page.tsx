'use client';

import Image from 'next/image';
import Link from 'next/link';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center">
            <Image
              src="/logo-A.png"
              alt="BeOrigin Logo"
              width={180}
              height={60}
              className="h-12 w-auto"
              priority
            />
          </Link>
          <button
            onClick={() => window.close()}
            className="text-gray-600 hover:text-gray-900 transition"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="py-12 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="bg-white rounded-2xl shadow-sm p-8 md:p-12">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">이용약관</h1>
            <p className="text-gray-600 mb-8">시행일: 2024년 1월 1일</p>

            <div className="space-y-8">
              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">제1조 (목적)</h2>
                <p className="text-gray-700 leading-relaxed">
                  이 약관은 주식회사 비오리진(이하 "회사")이 제공하는 AlmostBurnOut 서비스(이하 "서비스")의 이용과 관련하여 
                  회사와 이용자 간의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">제2조 (정의)</h2>
                <div className="space-y-3">
                  <p className="text-gray-700">
                    <span className="font-medium">1. "서비스"</span>란 회사가 제공하는 번아웃 진단 및 코칭 서비스를 의미합니다.
                  </p>
                  <p className="text-gray-700">
                    <span className="font-medium">2. "이용자"</span>란 이 약관에 따라 회사가 제공하는 서비스를 받는 개인을 의미합니다.
                  </p>
                  <p className="text-gray-700">
                    <span className="font-medium">3. "회원"</span>이란 회사에 개인정보를 제공하여 회원등록을 한 자로서, 
                    계속적으로 회사가 제공하는 서비스를 이용할 수 있는 자를 의미합니다.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">제3조 (약관의 효력 및 변경)</h2>
                <div className="space-y-3">
                  <p className="text-gray-700">
                    1. 이 약관은 서비스 화면에 게시하거나 기타의 방법으로 공지함으로써 효력을 발생합니다.
                  </p>
                  <p className="text-gray-700">
                    2. 회사는 필요하다고 인정되는 경우 이 약관을 변경할 수 있으며, 
                    변경된 약관은 제1항과 같은 방법으로 공지 또는 통지함으로써 효력을 발생합니다.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">제4조 (서비스의 제공 및 변경)</h2>
                <div className="space-y-3">
                  <p className="text-gray-700">
                    1. 회사는 다음과 같은 업무를 수행합니다:
                  </p>
                  <ul className="ml-6 space-y-2 text-gray-700">
                    <li>• 번아웃 진단 설문 및 결과 제공</li>
                    <li>• 개인 맞춤형 회복 프로그램 제공</li>
                    <li>• 1:1 코칭 서비스</li>
                    <li>• 번아웃 예방 및 회복 관련 콘텐츠 제공</li>
                  </ul>
                  <p className="text-gray-700">
                    2. 회사는 서비스의 내용을 변경할 수 있으며, 변경된 서비스 내용은 이용자에게 공지합니다.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">제5조 (서비스 이용 제한)</h2>
                <div className="space-y-3">
                  <p className="text-gray-700">
                    회사는 다음 각 호에 해당하는 경우 서비스 이용을 제한할 수 있습니다:
                  </p>
                  <ul className="ml-6 space-y-2 text-gray-700">
                    <li>• 타인의 개인정보를 도용하거나 허위 정보를 기재한 경우</li>
                    <li>• 서비스의 안정적 운영을 방해하는 행위를 한 경우</li>
                    <li>• 법령 또는 이 약관을 위반한 경우</li>
                    <li>• 기타 회사가 서비스 제공이 부적절하다고 판단한 경우</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">제6조 (개인정보 보호)</h2>
                <p className="text-gray-700 leading-relaxed">
                  회사는 관련 법령이 정하는 바에 따라 이용자의 개인정보를 보호하기 위해 노력합니다. 
                  개인정보의 보호 및 사용에 대해서는 관련 법령 및 회사의 개인정보처리방침이 적용됩니다.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">제7조 (면책조항)</h2>
                <div className="space-y-3">
                  <p className="text-gray-700">
                    1. 회사는 천재지변 또는 이에 준하는 불가항력으로 인하여 서비스를 제공할 수 없는 경우에는 
                    서비스 제공에 관한 책임이 면제됩니다.
                  </p>
                  <p className="text-gray-700">
                    2. 본 서비스는 의료 행위가 아니며, 제공되는 진단 결과 및 조언은 전문의료진의 진단을 대체할 수 없습니다.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">제8조 (분쟁해결)</h2>
                <p className="text-gray-700 leading-relaxed">
                  이 약관에 명시되지 않은 사항은 전기통신사업법, 정보통신망이용촉진 및 정보보호 등에 관한 법률, 
                  개인정보보호법 등 관련 법령의 규정에 따릅니다.
                </p>
              </section>
            </div>

            <div className="mt-12 pt-8 border-t border-gray-200">
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  문의사항이 있으시면 언제든지 연락주세요
                </p>
                <p className="text-sm text-origin-purple font-medium mt-2">
                  이메일: hello@beorigin.co.kr | 전화: 02-1234-5678
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}