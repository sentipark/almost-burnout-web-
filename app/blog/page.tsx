'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  author: string;
  date: string;
  readTime: string;
  thumbnail: string;
  tags: string[];
  featured?: boolean;
}

const blogPosts: BlogPost[] = [
  {
    id: '1',
    title: '번아웃, 미리 알아차리는 7가지 신호',
    excerpt: '몸과 마음이 보내는 번아웃 경고 신호를 무시하고 계신가요? 초기에 발견하면 쉽게 회복할 수 있는 번아웃의 전조 증상들을 알아보세요.',
    category: '진단과 예방',
    author: 'Dr. 김민지',
    date: '2025.10.01',
    readTime: '5분',
    thumbnail: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    tags: ['초기증상', '자가진단', '예방'],
    featured: true
  },
  {
    id: '2',
    title: '퇴근 후 완전히 스위치 오프하는 법',
    excerpt: '집에 와서도 일 생각이 떠나지 않나요? 일과 삶의 경계를 명확히 하고, 진정한 휴식을 취하는 실용적인 방법들을 소개합니다.',
    category: '회복 가이드',
    author: '이현우 코치',
    date: '2024.01.12',
    readTime: '7분',
    thumbnail: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    tags: ['워라밸', '휴식', '일상회복']
  },
  {
    id: '3',
    title: '5분 호흡법으로 스트레스 즉시 해소하기',
    excerpt: '회의실에서, 지하철에서, 어디서든 할 수 있는 간단한 호흡법. 과학적으로 입증된 스트레스 해소 테크닉을 배워보세요.',
    category: '실천 팁',
    author: '박지영 트레이너',
    date: '2024.01.10',
    readTime: '3분',
    thumbnail: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    tags: ['호흡법', '명상', '즉시실천']
  },
  {
    id: '4',
    title: '나의 에너지 충전소 만들기',
    excerpt: '번아웃을 예방하는 가장 좋은 방법은 나만의 충전 루틴을 만드는 것. 당신만의 에너지 충전소를 설계하는 방법을 알려드립니다.',
    category: '라이프스타일',
    author: '최서연 작가',
    date: '2024.01.08',
    readTime: '8분',
    thumbnail: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    tags: ['루틴', '자기관리', '에너지']
  },
  {
    id: '5',
    title: '거절의 기술: No라고 말하는 건강한 방법',
    excerpt: '모든 요청을 수락하다 지쳐버린 당신을 위해. 관계를 해치지 않으면서도 건강한 경계를 설정하는 방법을 배워보세요.',
    category: '관계와 소통',
    author: 'Dr. 김민지',
    date: '2024.01.05',
    readTime: '6분',
    thumbnail: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    tags: ['경계설정', '커뮤니케이션', '자기보호']
  },
  {
    id: '6',
    title: '번아웃에서 번업으로: 회복 후 더 강해지기',
    excerpt: '번아웃은 끝이 아니라 새로운 시작입니다. 번아웃을 극복하고 더 강하고 지혜로운 자신으로 성장한 사람들의 이야기.',
    category: '회복 스토리',
    author: '정수민 에디터',
    date: '2024.01.03',
    readTime: '10분',
    thumbnail: 'https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    tags: ['회복사례', '성장', '동기부여']
  }
];

const categories = [
  '전체',
  '진단과 예방',
  '회복 가이드',
  '실천 팁',
  '라이프스타일',
  '관계와 소통',
  '회복 스토리'
];

export default function BlogPage() {
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPosts = blogPosts.filter(post => {
    const matchesCategory = selectedCategory === '전체' || post.category === selectedCategory;
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const featuredPost = blogPosts.find(post => post.featured);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Header */}
      <Navigation />

      {/* Hero Section */}
      <section className="pt-32 pb-12 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            번아웃 회복 가이드
          </h1>
          <p className="text-xl text-gray-600 mb-4">
            작은 변화로 시작하는 큰 회복
          </p>
          <p className="text-gray-500">
            전문가들이 전하는 실용적인 번아웃 예방과 회복 이야기
          </p>
        </div>
      </section>

      {/* Search Bar */}
      <section className="px-4 mb-8">
        <div className="container mx-auto max-w-2xl">
          <div className="relative">
            <input
              type="text"
              placeholder="키워드로 검색하세요..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-12 py-4 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-origin-purple focus:border-origin-purple"
            />
            <svg
              className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="px-4 mb-12">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-2 rounded-full font-medium transition ${
                  selectedCategory === category
                    ? 'bg-origin-purple text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Post */}
      {featuredPost && selectedCategory === '전체' && !searchQuery && (
        <section className="px-4 mb-12">
          <div className="container mx-auto max-w-6xl">
            <div className="bg-gradient-to-r from-origin-purple/10 to-origin-purple/5 rounded-3xl p-8 md:p-12">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-sm font-medium text-origin-purple bg-origin-purple/20 px-3 py-1 rounded-full">
                      추천 글
                    </span>
                    <span className="text-sm text-gray-500">{featuredPost.category}</span>
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">
                    {featuredPost.title}
                  </h2>
                  <p className="text-gray-600 mb-6">
                    {featuredPost.excerpt}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
                    <span>{featuredPost.author}</span>
                    <span>·</span>
                    <span>{featuredPost.date}</span>
                    <span>·</span>
                    <span>{featuredPost.readTime} 읽기</span>
                  </div>
                  <button className="px-6 py-3 bg-origin-purple hover:bg-origin-purple-dark text-white rounded-lg font-medium transition">
                    자세히 읽기
                  </button>
                </div>
                <div className="flex justify-center items-center">
                  <div className="relative w-48 h-48 rounded-xl overflow-hidden">
                    <Image 
                      src={featuredPost.thumbnail} 
                      alt={featuredPost.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Blog Grid */}
      <section className="px-4 pb-20">
        <div className="container mx-auto max-w-6xl">
          {filteredPosts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {filteredPosts.map((post) => (
                <article
                  key={post.id}
                  className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all group cursor-pointer"
                >
                  <div className="p-8">
                    {/* Thumbnail */}
                    <div className="relative h-32 mb-6 rounded-lg overflow-hidden">
                      <Image 
                        src={post.thumbnail} 
                        alt={post.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    
                    {/* Category */}
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs font-medium text-origin-purple bg-origin-purple/10 px-2 py-1 rounded">
                        {post.category}
                      </span>
                      <span className="text-xs text-gray-500">{post.readTime} 읽기</span>
                    </div>
                    
                    {/* Title */}
                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-origin-purple transition">
                      {post.title}
                    </h3>
                    
                    {/* Excerpt */}
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {post.excerpt}
                    </p>
                    
                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {post.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                    
                    {/* Author & Date */}
                    <div className="flex items-center justify-between text-xs text-gray-500 pt-4 border-t border-gray-100">
                      <span>{post.author}</span>
                      <span>{post.date}</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="w-32 h-32 mx-auto mb-6 relative rounded-full overflow-hidden bg-gray-100">
                <Image 
                  src="https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" 
                  alt="검색 결과 없음"
                  fill
                  className="object-cover grayscale opacity-60"
                />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                검색 결과가 없습니다
              </h3>
              <p className="text-gray-600">
                다른 키워드나 카테고리로 검색해보세요
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="py-20 px-4 bg-gradient-to-r from-origin-purple to-origin-purple-dark">
        <div className="container mx-auto text-center max-w-3xl">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            매주 번아웃 회복 레터 받기
          </h2>
          <p className="text-xl text-white/90 mb-10">
            실용적인 회복 팁과 영감을 주는 이야기를 매주 전달합니다
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="이메일 주소"
              className="flex-1 px-6 py-3 rounded-full text-gray-900 focus:outline-none focus:ring-4 focus:ring-white/30"
            />
            <button className="px-8 py-3 bg-white text-origin-purple hover:bg-gray-100 font-semibold rounded-full transition">
              구독하기
            </button>
          </div>
          <p className="text-sm text-white/70 mt-4">
            언제든지 구독 취소 가능합니다
          </p>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}