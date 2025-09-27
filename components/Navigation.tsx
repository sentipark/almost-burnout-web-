'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getCurrentUser } from '@/lib/storage-migration';

interface NavigationProps {
  variant?: 'default' | 'transparent';
}

export default function Navigation({ variant = 'default' }: NavigationProps) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const currentUser = await getCurrentUser();
        setIsLoggedIn(!!currentUser);
      } catch (error) {
        console.error('Error checking login status:', error);
        setIsLoggedIn(false);
      }
    };
    
    // 초기 로딩 시에만 체크
    checkLoginStatus();
    
    // localStorage 변경 감지 (다른 탭에서의 로그인/로그아웃)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'abo_current_user' || e.key === null) {
        checkLoginStatus();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const navItems = [
    { href: '/assessment', label: '진단하기' },
    { href: '/programs', label: '프로그램' },
    { href: '/blog', label: '블로그' }
  ];

  const headerClass = variant === 'transparent' 
    ? 'fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-gray-100'
    : 'fixed top-0 w-full bg-white/90 backdrop-blur-md z-40 border-b border-gray-100';

  return (
    <header className={headerClass}>
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        {/* Logo */}
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

        {/* Desktop Navigation */}
        <nav className="hidden md:flex gap-8 items-center">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`transition ${
                pathname === item.href
                  ? 'text-origin-purple font-medium'
                  : 'text-gray-700 hover:text-origin-purple'
              }`}
            >
              {item.label}
            </Link>
          ))}
          {isLoggedIn ? (
            <Link 
              href="/mypage" 
              className={`transition ${
                pathname === '/mypage'
                  ? 'text-origin-purple font-medium'
                  : 'text-gray-700 hover:text-origin-purple'
              }`}
            >
              마이페이지
            </Link>
          ) : (
            <Link 
              href="/login" 
              className="px-4 py-2 bg-origin-purple hover:bg-origin-purple-dark text-white rounded-lg transition"
            >
              로그인
            </Link>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <svg
            className={`w-6 h-6 transition-transform ${isMobileMenuOpen ? 'rotate-45' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {isMobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 shadow-lg">
          <nav className="px-4 py-6 space-y-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`block py-2 transition ${
                  pathname === item.href
                    ? 'text-origin-purple font-medium'
                    : 'text-gray-700 hover:text-origin-purple'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            {isLoggedIn ? (
              <Link 
                href="/mypage" 
                className={`block py-2 transition ${
                  pathname === '/mypage'
                    ? 'text-origin-purple font-medium'
                    : 'text-gray-700 hover:text-origin-purple'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                마이페이지
              </Link>
            ) : (
              <Link 
                href="/login" 
                className="block w-full text-center py-3 bg-origin-purple hover:bg-origin-purple-dark text-white rounded-lg transition"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                로그인
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}