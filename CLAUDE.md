# AlmostBurnOut 프로젝트 가이드

## 프로젝트 개요
AlmostBurnOut은 번아웃 직전 단계의 사람들을 위한 진단 및 코칭 서비스입니다.

## 브랜드 정보
- 회사명: BeOrigin (비오리진)
- 서비스명: AlmostBurnOut
- 슬로건: "나는 자주, 나로 돌아온다"
- 철학: 자기다움을 회복하는 여정

## 기술 스택
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui components
- 로컬스토리지 (MVP)
- Vercel + Supabase (Production)

## 디자인 시스템
### 브랜드 컬러
- Purple: #A0568C (메인)
- Gold: #B8860B (포인트)
- Navy: #2C3E80 (액센트)
- Gray: #5A5A5A (텍스트)

### 로고 사용
- 가로형 (logo-A.png): 헤더, 푸터
- 세로형 (logo-B.png): 모바일, 로딩

## 보안 및 품질 관리 Subagents

### 필수 사용 Subagents
1. **security-auditor**: 보안 취약점 검사
   - XSS, CSRF 방어 확인
   - 입력 검증 확인
   - 민감정보 노출 방지

2. **code-reviewer**: 코드 품질 검토
   - 각 기능 완료 시 실행
   - 코드 스타일 일관성
   - 최적화 제안

3. **performance-engineer**: 성능 최적화
   - 차트 렌더링 최적화
   - 모바일 성능 체크
   - 번들 사이즈 최적화

4. **test-automator**: 테스트 자동화
   - 단위 테스트 작성
   - 통합 테스트 구성

5. **architect-reviewer**: 아키텍처 검증
   - 프로젝트 구조 검토
   - 확장성 평가

### 검증 체크포인트
- 매 기능 완료 시: code-reviewer
- Phase 완료 시: security-auditor, architect-reviewer
- 배포 전: 모든 subagents 종합 검토

## 개발 명령어
```bash
# 개발 서버 실행
npm run dev

# 빌드
npm run build

# 린트 검사
npm run lint

# 타입 체크
npx tsc --noEmit
```

## 핵심 기능
1. 39문항 진단 설문
2. ABO Index 계산 (5개 요인)
3. 결과 시각화 (게이지, 레이더 차트)
4. Quick Wins 제안
5. 프로그램 추천

## 주의사항
- 사용자 입력은 항상 검증
- 민감정보는 환경변수로 관리
- 로컬스토리지 데이터는 암호화 고려
- HTTPS 필수
- 에러 핸들링 철저히

## Phase별 목표
### Phase 1 (MVP)
- 홈, 진단, 결과 페이지
- 로컬스토리지 기반 동작
- 기본 보안/품질 검증

### Phase 2 (확장)
- 프로그램, 회원, 블로그
- 반응형 완성
- 종합 테스트

### Phase 3 (배포)
- Supabase 연동
- 결제 시스템
- Vercel 배포