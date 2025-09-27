import Image from "next/image";
import Link from "next/link";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Header */}
      <Navigation variant="transparent" />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            나는 자주,<br />
            <span className="text-origin-purple">나로 돌아온다</span>
          </h1>
          
          <p className="text-lg md:text-xl lg:text-2xl text-gray-600 mb-4">
            거의 번아웃? 아직 기회예요
          </p>
          
          <p className="text-base md:text-lg text-gray-500 mb-12 max-w-2xl mx-auto leading-relaxed">
            번아웃이 오기 직전의 징후를 빠르게 포착하고,<br className="hidden md:block" />
            당신의 정체성·습관·에너지를 재정렬해<br className="hidden md:block" />
            다시 시작하고 지속하도록 돕는 진단+코칭 서비스
          </p>

          <Link
            href="/assessment"
            className="inline-flex items-center gap-3 bg-origin-purple hover:bg-origin-purple-dark text-white font-semibold py-4 px-8 rounded-full text-lg transition-all transform hover:scale-105 shadow-lg"
          >
            <span>2분 진단으로 시작하기</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>

          <p className="mt-6 text-sm text-gray-500">
            이미 <span className="font-semibold text-origin-purple">3,847명</span>이 진단을 받았어요
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-16">
            이런 분들에게 필요해요
          </h2>
          
          <div className="grid sm:grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            <div className="text-center p-6 md:p-8 rounded-2xl bg-gradient-to-b from-purple-50 to-white border border-purple-100">
              <div className="w-16 h-16 bg-origin-purple/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl">🎯</span>
              </div>
              <h3 className="text-xl font-semibold mb-4 text-gray-900">완벽 수집가</h3>
              <p className="text-gray-600">
                자료와 준비는 최고인데<br />
                시작 버튼이 안 눌려요<br />
                &quot;더 준비해야 해...&quot;
              </p>
            </div>

            <div className="text-center p-6 md:p-8 rounded-2xl bg-gradient-to-b from-yellow-50 to-white border border-yellow-100">
              <div className="w-16 h-16 bg-origin-gold/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl">🔥</span>
              </div>
              <h3 className="text-xl font-semibold mb-4 text-gray-900">과열 추진가</h3>
              <p className="text-gray-600">
                초반 폭발 후 급격한 소진<br />
                계획보다 감정에 따라 일해요<br />
                &quot;번아웃이 자주 와요&quot;
              </p>
            </div>

            <div className="text-center p-6 md:p-8 rounded-2xl bg-gradient-to-b from-blue-50 to-white border border-blue-100">
              <div className="w-16 h-16 bg-origin-navy/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl">💫</span>
              </div>
              <h3 className="text-xl font-semibold mb-4 text-gray-900">흔들리는 오리진</h3>
              <p className="text-gray-600">
                성과는 내지만<br />
                정체성-일치감이 낮아요<br />
                &quot;이게 내 길이 맞나?&quot;
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-16">
            간단한 3단계 프로세스
          </h2>
          
          <div className="grid sm:grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-origin-purple mb-4">01</div>
              <h3 className="text-xl font-semibold mb-3">2분 진단</h3>
              <p className="text-gray-600">
                39개 문항으로<br />
                번아웃 위험도를 측정해요
              </p>
            </div>

            <div className="text-center">
              <div className="text-4xl font-bold text-origin-gold mb-4">02</div>
              <h3 className="text-xl font-semibold mb-3">즉시 분석</h3>
              <p className="text-gray-600">
                5개 요인별 점수와<br />
                ABO Index를 확인해요
              </p>
            </div>

            <div className="text-center">
              <div className="text-4xl font-bold text-origin-navy mb-4">03</div>
              <h3 className="text-xl font-semibold mb-3">맞춤 처방</h3>
              <p className="text-gray-600">
                당신만의 Quick Wins와<br />
                프로그램을 제안해요
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-origin-purple to-origin-purple-dark">
        <div className="container mx-auto text-center max-w-3xl">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            지금이 당신의 타이밍이에요
          </h2>
          <p className="text-xl text-white/90 mb-10">
            번아웃이 오기 전, 지금이 개입할 최적의 시기입니다
          </p>
          <Link
            href="/assessment"
            className="inline-flex items-center gap-3 bg-white text-origin-purple hover:bg-gray-100 font-semibold py-4 px-8 rounded-full text-lg transition-all transform hover:scale-105 shadow-lg"
          >
            <span>무료 진단 시작하기</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}