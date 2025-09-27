'use client';

import Image from 'next/image';
import Link from 'next/link';

export default function PrivacyPage() {
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">개인정보처리방침</h1>
            <p className="text-gray-600 mb-8">시행일: 2024년 1월 1일</p>

            <div className="space-y-8">
              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">제1조 (개인정보의 처리목적)</h2>
                <p className="text-gray-700 leading-relaxed mb-3">
                  주식회사 비오리진(이하 '회사')은 다음의 목적을 위하여 개인정보를 처리합니다. 
                  처리하고 있는 개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며, 
                  이용 목적이 변경되는 경우에는 개인정보보호법 제18조에 따라 별도의 동의를 받는 등 필요한 조치를 이행할 예정입니다.
                </p>
                <ul className="ml-6 space-y-2 text-gray-700">
                  <li>• 회원 가입의사 확인, 회원제 서비스 제공에 따른 본인 식별·인증</li>
                  <li>• 번아웃 진단 서비스 제공 및 결과 분석</li>
                  <li>• 개인 맞춤형 코칭 프로그램 제공</li>
                  <li>• 서비스 개선 및 신규 서비스 개발</li>
                  <li>• 고객 상담 및 불만처리</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">제2조 (처리하는 개인정보 항목)</h2>
                <div className="space-y-4">
                  <div>
                    <p className="text-gray-700 font-medium mb-2">1. 필수항목</p>
                    <ul className="ml-6 space-y-1 text-gray-700">
                      <li>• 이름, 이메일 주소, 생년월일, 성별</li>
                      <li>• 진단 설문 응답 내용</li>
                      <li>• 서비스 이용 기록, 접속 로그, 쿠키, 접속 IP 정보</li>
                    </ul>
                  </div>
                  <div>
                    <p className="text-gray-700 font-medium mb-2">2. 선택항목</p>
                    <ul className="ml-6 space-y-1 text-gray-700">
                      <li>• 연락처 (코칭 프로그램 신청 시)</li>
                      <li>• 추가 상담 요청 내용</li>
                    </ul>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">제3조 (개인정보의 처리 및 보유기간)</h2>
                <div className="space-y-3">
                  <p className="text-gray-700">
                    1. 회사는 법령에 따른 개인정보 보유·이용기간 또는 정보주체로부터 개인정보를 수집 시에 
                    동의받은 개인정보 보유·이용기간 내에서 개인정보를 처리·보유합니다.
                  </p>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-700 font-medium mb-2">구체적인 개인정보 처리 및 보유 기간:</p>
                    <ul className="space-y-1 text-gray-700">
                      <li>• 회원정보: 회원 탈퇴 시까지</li>
                      <li>• 진단 결과: 5년 (의료법에 준하여)</li>
                      <li>• 서비스 이용 기록: 3년 (통신비밀보호법)</li>
                      <li>• 결제 기록: 5년 (전자상거래등에서의소비자보호에관한법률)</li>
                    </ul>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">제4조 (개인정보의 제3자 제공)</h2>
                <p className="text-gray-700 leading-relaxed">
                  회사는 정보주체의 개인정보를 제1조(개인정보의 처리목적)에서 명시한 범위 내에서만 처리하며, 
                  정보주체의 동의, 법률의 특별한 규정 등 개인정보보호법 제17조에 해당하는 경우에만 개인정보를 제3자에게 제공합니다.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">제5조 (개인정보 처리의 위탁)</h2>
                <p className="text-gray-700 leading-relaxed mb-3">
                  회사는 원활한 개인정보 업무처리를 위하여 다음과 같이 개인정보 처리업무를 위탁하고 있습니다:
                </p>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="space-y-2 text-gray-700">
                    <p><span className="font-medium">위탁받는 자:</span> Amazon Web Services (AWS)</p>
                    <p><span className="font-medium">위탁하는 업무:</span> 클라우드 서비스 제공</p>
                    <p><span className="font-medium">위탁기간:</span> 서비스 제공 기간</p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">제6조 (정보주체의 권리·의무 및 행사방법)</h2>
                <div className="space-y-3">
                  <p className="text-gray-700">
                    정보주체는 회사에 대해 언제든지 다음 각 호의 개인정보 보호 관련 권리를 행사할 수 있습니다:
                  </p>
                  <ul className="ml-6 space-y-2 text-gray-700">
                    <li>• 개인정보 처리현황 통지 요구</li>
                    <li>• 개인정보 처리정지 요구</li>
                    <li>• 개인정보의 정정·삭제 요구</li>
                    <li>• 손해배상 청구</li>
                  </ul>
                  <p className="text-gray-700 mt-3">
                    위의 권리 행사는 개인정보보호법 시행규칙 별지 제8호 서식에 따라 작성하여 
                    서면, 전자우편, 모사전송(FAX) 등을 통하여 하실 수 있으며 회사는 이에 대해 지체없이 조치하겠습니다.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">제7조 (개인정보의 안전성 확보조치)</h2>
                <div className="space-y-3">
                  <p className="text-gray-700">
                    회사는 개인정보의 안전성 확보를 위해 다음과 같은 조치를 취하고 있습니다:
                  </p>
                  <ul className="ml-6 space-y-2 text-gray-700">
                    <li>• 관리적 조치: 내부관리계획 수립·시행, 정기적 직원 교육</li>
                    <li>• 기술적 조치: 개인정보처리시스템 등의 접근권한 관리, 접근통제시스템 설치, 고유식별정보 등의 암호화, 보안프로그램 설치</li>
                    <li>• 물리적 조치: 전산실, 자료보관실 등의 접근통제</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">제8조 (개인정보보호책임자)</h2>
                <div className="space-y-3">
                  <p className="text-gray-700 mb-3">
                    회사는 개인정보 처리에 관한 업무를 총괄해서 책임지고, 개인정보 처리와 관련한 정보주체의 
                    불만처리 및 피해구제 등을 위하여 아래와 같이 개인정보보호책임자를 지정하고 있습니다:
                  </p>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="space-y-2 text-gray-700">
                      <p><span className="font-medium">개인정보보호책임자</span></p>
                      <p>성명: 김개인</p>
                      <p>직책: 개인정보보호팀장</p>
                      <p>연락처: privacy@beorigin.co.kr</p>
                      <p>전화: 02-1234-5679</p>
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">제9조 (개인정보처리방침 변경)</h2>
                <p className="text-gray-700 leading-relaxed">
                  이 개인정보처리방침은 시행일로부터 적용되며, 법령 및 방침에 따른 변경내용의 추가, 삭제 및 정정이 있는 경우에는 
                  변경사항의 시행 7일 전부터 공지사항을 통하여 고지할 것입니다.
                </p>
              </section>
            </div>

            <div className="mt-12 pt-8 border-t border-gray-200">
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  개인정보 처리와 관련한 문의사항이 있으시면 언제든지 연락주세요
                </p>
                <p className="text-sm text-origin-purple font-medium mt-2">
                  개인정보보호 담당자: privacy@beorigin.co.kr | 전화: 02-1234-5679
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}