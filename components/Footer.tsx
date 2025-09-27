import Image from 'next/image';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Company Info */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center mb-4">
              <Image
                src="/logo-A.png"
                alt="BeOrigin Logo"
                width={180}
                height={60}
                className="h-10 w-auto brightness-0 invert"
              />
            </Link>
            <p className="text-gray-300 mb-4">
              번아웃 직전, Almost 단계에서 자기다움을 회복하는 여정을 함께합니다.
            </p>
            <div className="space-y-1 text-sm text-gray-400">
              <p>주식회사 비오리진 (BeOrigin Co., Ltd.)</p>
              <p>대표이사: 박현진 | 사업자등록번호: 123-45-67890</p>
              <p>주소: 서울특별시 강남구 테헤란로 123, 456호</p>
              <p>통신판매업신고번호: 2024-서울강남-0123</p>
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-semibold text-lg mb-4">서비스</h3>
            <ul className="space-y-2 text-gray-300">
              <li>
                <Link href="/assessment" className="hover:text-white transition">
                  번아웃 진단
                </Link>
              </li>
              <li>
                <Link href="/programs" className="hover:text-white transition">
                  회복 프로그램
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-white transition">
                  회복 가이드
                </Link>
              </li>
              <li>
                <Link href="/mypage" className="hover:text-white transition">
                  마이페이지
                </Link>
              </li>
            </ul>
          </div>

          {/* Support & Legal */}
          <div>
            <h3 className="font-semibold text-lg mb-4">고객지원</h3>
            <ul className="space-y-2 text-gray-300">
              <li>
                <a href="mailto:hello@beorigin.co.kr" className="hover:text-white transition">
                  이메일 문의
                </a>
              </li>
              <li>
                <a href="tel:02-1234-5678" className="hover:text-white transition">
                  전화: 02-1234-5678
                </a>
              </li>
              <li className="pt-2 border-t border-gray-700">
                <Link href="/terms" target="_blank" className="hover:text-white transition text-sm">
                  이용약관
                </Link>
              </li>
              <li>
                <Link href="/privacy" target="_blank" className="hover:text-white transition text-sm">
                  개인정보처리방침
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-sm text-gray-400">
              © 2024 BeOrigin Co., Ltd. All rights reserved.
            </div>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-white transition">
                <span className="sr-only">Facebook</span>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M20 10C20 4.477 15.523 0 10 0S0 4.477 0 10c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V10h2.54V7.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V10h2.773l-.443 2.89h-2.33v6.988C16.343 19.128 20 14.991 20 10z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition">
                <span className="sr-only">Instagram</span>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 2c2.667 0 2.987.01 4.04.058 2.185.099 3.398 1.325 3.497 3.497.048 1.053.058 1.373.058 4.04s-.01 2.987-.058 4.04c-.099 2.172-1.312 3.398-3.497 3.497-1.053.048-1.373.058-4.04.058s-2.987-.01-4.04-.058c-2.185-.099-3.398-1.325-3.497-3.497C2.01 12.987 2 12.667 2 10s.01-2.987.058-4.04C2.157 3.775 3.383 2.549 5.568 2.45 6.62 2.402 6.94 2.392 10 2.392 10 2.392 10 2 10 2zm0 1.622c-2.62 0-2.925.01-3.954.056-1.817.082-2.84 1.104-2.922 2.922C3.078 7.625 3.068 7.93 3.068 10.5s.01 2.875.056 3.904c.082 1.818 1.104 2.84 2.922 2.922 1.029.046 1.334.056 3.954.056s2.925-.01 3.954-.056c1.817-.082 2.84-1.104 2.922-2.922.046-1.029.056-1.334.056-3.954s-.01-2.925-.056-3.954c-.082-1.818-1.104-2.84-2.922-2.922C12.925 3.632 12.62 3.622 10 3.622zM10 13.5a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7zm0-5.622a2.122 2.122 0 1 0 0 4.244 2.122 2.122 0 0 0 0-4.244zM15.846 7.5a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition">
                <span className="sr-only">YouTube</span>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M19.615 6.287c.23.86.23 2.654.23 2.654s0 1.793-.23 2.653a2.89 2.89 0 01-2.032 2.033c-1.793.23-8.968.23-8.968.23s-7.175 0-8.968-.23a2.89 2.89 0 01-2.032-2.033c-.23-.86-.23-2.653-.23-2.653s0-1.794.23-2.654A2.89 2.89 0 01-.615 4.255c1.793-.23 8.968-.23 8.968-.23s7.175 0 8.968.23a2.89 2.89 0 012.032 2.032z" />
                  <path d="M8.077 11.846l5.846-3.385-5.846-3.385v6.77z" fill="#fff" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}