'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { saveProgramApplication, getCurrentUser } from '@/lib/storage-migration';
import { ProgramApplication } from '@/lib/storage';

interface Program {
  id: string;
  title: string;
  subtitle: string;
  price: string;
  duration: string;
  sessions: string;
  features: string[];
  recommended: string;
  color: string;
  popular?: boolean;
}

const programs: Program[] = [
  {
    id: 'basic',
    title: '기본 프로그램',
    subtitle: '번아웃 회복의 첫 단계',
    price: '29,000원',
    duration: '7일',
    sessions: '자가 진단 + 회복 가이드',
    features: [
      '개인 맞춤 진단 리포트',
      '7일 회복 가이드',
      '기본 명상 콘텐츠',
      '이메일 지원'
    ],
    recommended: '번아웃 초기 증상을 느끼고 있어요',
    color: 'purple'
  },
  {
    id: 'premium',
    title: '프리미엄 프로그램',
    subtitle: '체계적인 번아웃 회복 프로그램',
    price: '49,000원',
    duration: '21일',
    sessions: '단계별 회복 + 전문가 상담 1회',
    features: [
      '상세 진단 리포트',
      '21일 단계별 회복 프로그램',
      '프리미엄 명상 & 운동 콘텐츠',
      '주간 진행 체크',
      '전문가 1:1 상담 (1회)'
    ],
    recommended: '이번엔 정말 달라지고 싶어서 결심했어요',
    color: 'gold',
    popular: true
  },
  {
    id: 'enterprise',
    title: '기업 프로그램',
    subtitle: '조직 차원의 번아웃 예방 솔루션',
    price: '99,000원',
    duration: '90일',
    sessions: '조직 진단 + 전문 컨설팅',
    features: [
      '팀/조직 진단 분석',
      '관리자용 대시보드',
      '맞춤형 교육 자료',
      '분기별 조직 건강도 체크',
      '전문 컨설턴트 지원',
      '무제한 상담 지원'
    ],
    recommended: '우리 팀/조직의 번아웃을 예방하고 싶어요',
    color: 'navy'
  }
];

const faqs = [
  {
    question: '온라인으로 진행되나요?',
    answer: '네, 모든 프로그램은 줌(Zoom)을 통해 온라인으로 진행됩니다. 편한 공간에서 참여하실 수 있어요.'
  },
  {
    question: '환불 정책은 어떻게 되나요?',
    answer: '첫 세션 후 24시간 내 100% 환불 가능합니다. 이후에는 남은 세션에 대해 부분 환불이 가능해요.'
  },
  {
    question: '어떤 분들이 주로 참여하나요?',
    answer: '20대 후반~30대 직장인, 프리랜서, 창업자분들이 많이 참여하십니다. 번아웃을 예방하거나 회복하고 싶은 모든 분들을 환영해요.'
  },
  {
    question: '코칭은 어떻게 진행되나요?',
    answer: '1:1 대화를 통해 현재 상황을 파악하고, 실천 가능한 솔루션을 함께 찾아갑니다. 강의가 아닌 대화와 질문을 통한 코칭입니다.'
  }
];

export default function ProgramsPage() {
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'apply' | 'custom'>('apply');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });

  const handleApply = (program: Program, type: 'apply' | 'custom' = 'apply') => {
    if (type === 'apply') {
      // 결제페이지로 리다이렉트
      window.location.href = `/checkout?program=${program.id}`;
    } else {
      // 맞춤 프로그램 요청은 기존 모달 사용
      setSelectedProgram(program);
      setModalType(type);
      setShowModal(true);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedProgram) return;
    
    // 로그인 체크
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      alert('프로그램 신청을 위해서는 로그인이 필요합니다.\n\n로그인 페이지로 이동하시겠습니까?');
      if (confirm('로그인 페이지로 이동하시겠습니까?')) {
        window.location.href = '/login';
      }
      return;
    }
    
    // 입력 검증
    const errors = [];
    
    if (!formData.name.trim()) {
      errors.push('이름을 입력해주세요');
    } else if (formData.name.trim().length < 2) {
      errors.push('이름은 최소 2자 이상 입력해주세요');
    }
    
    if (!formData.email.trim()) {
      errors.push('이메일을 입력해주세요');
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.push('유효한 이메일 주소를 입력해주세요');
    }
    
    if (!formData.phone.trim()) {
      errors.push('연락처를 입력해주세요');
    } else if (!/^[0-9-+().\s]+$/.test(formData.phone)) {
      errors.push('유효한 연락처를 입력해주세요');
    }
    
    if (modalType === 'custom' && !formData.message.trim()) {
      errors.push('맞춤 프로그램 요청 시 현재 상황 및 원하는 방향을 구체적으로 작성해주세요');
    } else if (modalType === 'custom' && formData.message.trim().length < 20) {
      errors.push('맞춤 프로그램 요청은 최소 20자 이상 작성해주세요');
    }
    
    if (errors.length > 0) {
      alert('다음 사항을 확인해주세요:\n\n' + errors.map(err => `• ${err}`).join('\n'));
      return;
    }
    
    // 프로그램 신청 데이터 생성
    const application: ProgramApplication = {
      id: `${Date.now()}_${currentUser.id}_${selectedProgram.id}`,
      userId: currentUser.id,
      programId: selectedProgram.id,
      programTitle: selectedProgram.title,
      applicationDate: new Date().toISOString(),
      applicationType: modalType,
      status: 'pending',
      applicantInfo: {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        message: formData.message.trim()
      },
      price: selectedProgram.price,
      sessions: selectedProgram.sessions,
      duration: selectedProgram.duration
    };
    
    // 신청 내역 저장
    await saveProgramApplication(application);
    
    // MyPage 실시간 업데이트를 위한 강제 이벤트 발생
    window.dispatchEvent(new StorageEvent('storage', {
      key: `abo_program_applications_${currentUser.id}`,
      newValue: JSON.stringify([application]),
      oldValue: null
    }));
    
    const messages = {
      apply: `${selectedProgram?.title} 결제 페이지로 이동합니다. 결제 완료 후 24시간 내에 연락드리겠습니다.`,
      custom: `맞춤 프로그램 요청이 접수되었습니다! 2-3일 내에 맞춤 제안서를 보내드리겠습니다.`
    };
    
    alert(messages[modalType]);
    setShowModal(false);
    setFormData({ name: '', email: '', phone: '', message: '' });
  };

  const getModalTitle = () => {
    switch (modalType) {
      case 'apply': return '프로그램 결제';
      case 'custom': return '맞춤 프로그램 요청';
      default: return '프로그램 신청';
    }
  };

  const getModalDescription = () => {
    switch (modalType) {
      case 'apply': 
        return '결제 완료 후 24시간 내에 세션 일정을 안내해드립니다.';
      case 'custom': 
        return '현재 상황에 딱 맞는 맞춤형 프로그램을 제안해드립니다.';
      default: 
        return '';
    }
  };

  const getColorClasses = (color: string) => {
    const colors = {
      purple: 'from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700',
      gold: 'from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700',
      navy: 'from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800'
    };
    return colors[color as keyof typeof colors] || colors.purple;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Header */}
      <Navigation />

      {/* Hero Section */}
      <section className="pt-32 pb-12 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            당신만의 회복 프로그램
          </h1>
          <p className="text-xl text-gray-600 mb-4">
            번아웃에서 벗어나 다시 나답게 살아가는 여정
          </p>
          <p className="text-gray-500">
            전문 코치와 함께하는 1:1 맞춤형 프로그램
          </p>
        </div>
      </section>

      {/* Programs Grid */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {programs.map((program) => (
              <div
                key={program.id}
                className={`relative bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all ${
                  program.popular ? 'ring-2 ring-origin-gold' : ''
                }`}
              >
                {program.popular && (
                  <div className="absolute top-0 right-0 bg-origin-gold text-white px-4 py-1 rounded-bl-lg text-sm font-semibold">
                    인기
                  </div>
                )}
                
                <div className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {program.title}
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {program.subtitle}
                  </p>
                  
                  <div className="mb-6">
                    <div className="text-3xl font-bold text-origin-purple mb-2">
                      {program.price}
                    </div>
                    <div className="text-sm text-gray-500">
                      {program.duration} · {program.sessions}
                    </div>
                  </div>
                  
                  <ul className="space-y-3 mb-6">
                    {program.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <div className="bg-gray-50 -mx-8 -mb-8 px-8 py-4">
                    <p className="text-sm text-gray-600 mb-4">
                      💡 {program.recommended}
                    </p>
                    
                    {/* 메인 CTA 버튼 */}
                    <div className="mb-4">
                      <button
                        onClick={() => handleApply(program, 'apply')}
                        className={`w-full py-3 rounded-lg bg-gradient-to-r ${getColorClasses(
                          program.color
                        )} text-white font-semibold transition transform hover:scale-105`}
                      >
                        결제하기
                      </button>
                    </div>
                    
                    {/* 추가 옵션 */}
                    <div className="text-center">
                      <button
                        onClick={() => handleApply(program, 'custom')}
                        className="text-xs text-gray-500 hover:text-origin-purple transition"
                      >
                        📋 맞춤 프로그램 요청
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-12">
            왜 AlmostBurnOut인가요?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            <div>
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-lg font-semibold mb-2">검증된 방법론</h3>
              <p className="text-gray-600 text-sm">
                한국형 번아웃 척도 기반<br />
                과학적 진단과 코칭
              </p>
            </div>
            <div>
              <div className="text-4xl mb-4">👥</div>
              <h3 className="text-lg font-semibold mb-2">3,847명의 선택</h3>
              <p className="text-gray-600 text-sm">
                이미 많은 분들이<br />
                회복의 여정을 시작했어요
              </p>
            </div>
            <div>
              <div className="text-4xl mb-4">💝</div>
              <h3 className="text-lg font-semibold mb-2">맞춤형 접근</h3>
              <p className="text-gray-600 text-sm">
                당신만의 속도로<br />
                당신만의 방법으로
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-3xl">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            자주 묻는 질문
          </h2>
          
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <details
                key={index}
                className="group bg-white rounded-lg shadow-sm hover:shadow-md transition"
              >
                <summary className="flex justify-between items-center cursor-pointer p-6">
                  <span className="font-medium text-gray-900">{faq.question}</span>
                  <svg
                    className="w-5 h-5 text-gray-500 group-open:rotate-180 transition"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="px-6 pb-6">
                  <p className="text-gray-600">{faq.answer}</p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-origin-purple to-origin-purple-dark">
        <div className="container mx-auto text-center max-w-3xl">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            지금이 시작할 때입니다
          </h2>
          <p className="text-xl text-white/90 mb-10">
            더 늦기 전에, 당신을 위한 시간을 만들어보세요
          </p>
          <Link
            href="/assessment"
            className="inline-flex items-center gap-3 bg-white text-origin-purple hover:bg-gray-100 font-semibold py-4 px-8 rounded-full text-lg transition transform hover:scale-105 shadow-lg"
          >
            <span>먼저 진단 받아보기</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </section>

      {/* Application Modal */}
      {showModal && selectedProgram && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900">
                {getModalTitle()}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <p className="font-semibold text-gray-900">{selectedProgram.title}</p>
              {modalType === 'apply' && (
                <p className="text-sm text-gray-600">{selectedProgram.price}</p>
              )}
              {modalType === 'custom' && (
                <p className="text-sm text-origin-purple">맞춤형 제안서 무료 제공</p>
              )}
              <p className="text-xs text-gray-500 mt-1">{getModalDescription()}</p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  이름 *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-origin-purple focus:border-origin-purple"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  이메일 *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-origin-purple focus:border-origin-purple"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  연락처 *
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-origin-purple focus:border-origin-purple"
                  placeholder="010-0000-0000"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {modalType === 'apply' && '신청 동기 (선택)'}
                  {modalType === 'custom' && '현재 상황 및 원하는 방향 (필수)'}
                </label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  rows={modalType === 'custom' ? 6 : 4}
                  required={modalType === 'custom'}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-origin-purple focus:border-origin-purple"
                  placeholder={
                    modalType === 'apply' 
                      ? "어떤 도움을 받고 싶으신가요?" 
                      : "현재 어떤 상황이신지, 어떻게 달라지고 싶으신지 구체적으로 적어주세요. 이 정보를 바탕으로 맞춤 프로그램을 제안해드립니다."
                  }
                />
              </div>
              
              <button
                type="submit"
                className="w-full py-3 bg-origin-purple hover:bg-origin-purple-dark text-white font-semibold rounded-lg transition"
              >
                {modalType === 'apply' && '결제 진행'}
                {modalType === 'custom' && '맞춤 프로그램 요청'}
              </button>
              
              <p className="text-xs text-gray-500 text-center">
                {modalType === 'apply' && '결제 완료 후 24시간 내에 세션 일정을 안내해드립니다'}
                {modalType === 'custom' && '요청 후 2-3일 내에 맞춤 제안서를 보내드립니다'}
              </p>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <Footer />
    </div>
  );
}