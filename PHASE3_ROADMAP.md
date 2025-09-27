# Phase 3 배포 로드맵

## 🎯 현재 상태 (Phase 2 완료)
✅ **완료된 기능들:**
- 진단 히스토리 사용자별 저장/조회
- 프로그램 신청 내역 관리
- 로그인/회원가입 + 이메일 인증 시뮬레이션
- 이용약관/개인정보처리방침
- 반응형 디자인
- Footer 컴포넌트 (비오리진 브랜드)

## 🚀 Phase 3 주요 작업

### 1. 데이터베이스 연동 (Supabase)
**우선순위: HIGH**

#### 1.1 Supabase 프로젝트 설정
- [ ] Supabase 프로젝트 생성
- [ ] 환경변수 설정 (.env.local)
- [ ] Supabase 클라이언트 설정

#### 1.2 데이터베이스 스키마 설계
```sql
-- 사용자 테이블
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR UNIQUE NOT NULL,
  name VARCHAR NOT NULL,
  birth_date DATE,
  gender VARCHAR(10),
  email_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 진단 결과 테이블
CREATE TABLE assessment_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  abo_index INTEGER NOT NULL,
  level VARCHAR(20) NOT NULL,
  category_scores JSONB NOT NULL,
  demographics JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 프로그램 신청 테이블
CREATE TABLE program_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  program_id VARCHAR NOT NULL,
  program_title VARCHAR NOT NULL,
  application_type VARCHAR(20) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  applicant_info JSONB NOT NULL,
  program_details JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### 1.3 API 레이어 구현
- [ ] `/lib/supabase.ts` - Supabase 클라이언트
- [ ] `/lib/api/` - API 함수들
- [ ] 기존 localStorage 로직을 Supabase로 마이그레이션

### 2. 인증 시스템 개선
**우선순위: HIGH**

#### 2.1 Supabase Auth 연동
- [ ] 이메일/패스워드 인증
- [ ] 이메일 인증 (실제 메일 발송)
- [ ] 패스워드 리셋
- [ ] 세션 관리

#### 2.2 보안 강화
- [ ] Row Level Security (RLS) 정책 설정
- [ ] API 보호
- [ ] 환경변수 보안

### 3. 결제 시스템 연동
**우선순위: MEDIUM**

#### 3.1 PG 선택 및 연동
- [ ] 토스페이먼츠 또는 아임포트 선택
- [ ] 결제 API 연동
- [ ] 결제 테스트 환경 구축

#### 3.2 결제 플로우
- [ ] 프로그램 결제 페이지
- [ ] 결제 완료/실패 처리
- [ ] 결제 내역 관리
- [ ] 환불 처리

### 4. 배포 및 운영
**우선순위: HIGH**

#### 4.1 Vercel 배포 준비
- [ ] `next.config.js` 최적화
- [ ] 환경변수 설정
- [ ] 빌드 최적화

#### 4.2 도메인 및 SSL
- [ ] 도메인 구입/설정
- [ ] SSL 인증서
- [ ] DNS 설정

#### 4.3 운영 모니터링
- [ ] Google Analytics
- [ ] 에러 모니터링 (Sentry)
- [ ] 성능 모니터링

### 5. 추가 기능 개선
**우선순위: LOW**

#### 5.1 실시간 기능
- [ ] 프로그램 진행 상황 업데이트
- [ ] 실시간 알림
- [ ] 코칭 스케줄링

#### 5.2 관리자 기능
- [ ] 관리자 대시보드
- [ ] 사용자 관리
- [ ] 프로그램 신청 승인/거절
- [ ] 통계 및 분석

## 📋 구현 순서 권장사항

### 1단계: 데이터베이스 마이그레이션 (1-2주)
1. Supabase 설정
2. 스키마 생성
3. 기존 localStorage → Supabase 마이그레이션
4. 테스트

### 2단계: 인증 개선 (1주)
1. Supabase Auth 연동
2. 실제 이메일 인증
3. 세션 관리 개선

### 3단계: 배포 준비 (1주)
1. 환경변수 정리
2. 빌드 최적화
3. Vercel 배포 테스트

### 4단계: 결제 연동 (2-3주)
1. PG 연동
2. 결제 플로우 구현
3. 테스트

### 5단계: 운영 준비 (1주)
1. 모니터링 설정
2. 도메인 연결
3. 최종 테스트

## 🔧 기술적 고려사항

### 환경변수
```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
PAYMENT_API_KEY=
```

### 폴더 구조 개선 제안
```
lib/
├── supabase.ts          # Supabase 클라이언트
├── api/
│   ├── auth.ts         # 인증 관련 API
│   ├── assessments.ts  # 진단 관련 API
│   └── programs.ts     # 프로그램 관련 API
├── types/
│   └── database.ts     # 타입 정의
└── utils/
    ├── storage.ts      # 기존 storage 로직 (호환성)
    └── validation.ts   # 입력 검증

app/
├── api/               # API 라우트
│   ├── auth/
│   ├── payments/
│   └── webhooks/
└── admin/            # 관리자 페이지 (추후)
```

## 📊 예상 비용 및 리소스

### 월간 운영 비용 (초기)
- **Supabase**: 무료 → $25 (Pro)
- **Vercel**: 무료 → $20 (Pro) 
- **도메인**: ~$15/년
- **결제 수수료**: 거래량에 따라

### 개발 시간 예상
- **총 6-8주**
- **1-2명 개발자**
- **주당 20-30시간**

---

*이 로드맵은 현재 Phase 2 완료 상태를 기준으로 작성되었으며, 실제 개발 과정에서 조정될 수 있습니다.*