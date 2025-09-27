# Supabase 설정 가이드

## 1. Supabase 프로젝트 생성

1. [Supabase 대시보드](https://supabase.com/dashboard)에 접속
2. "New project" 클릭
3. 프로젝트 정보 입력:
   - Name: `almost-burnout`
   - Database Password: 안전한 비밀번호 생성
   - Region: `Southeast Asia (Singapore)`
4. "Create new project" 클릭하여 생성 (약 2분 소요)

## 2. 데이터베이스 스키마 설정

1. Supabase 대시보드에서 "SQL Editor" 탭으로 이동
2. "New query" 클릭
3. `supabase/schema.sql` 파일의 내용을 복사하여 붙여넣기
4. "Run" 버튼 클릭하여 실행

## 3. 환경변수 설정

1. Supabase 대시보드에서 "Settings" > "API" 탭으로 이동
2. 다음 값들을 복사:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role secret` key → `SUPABASE_SERVICE_ROLE_KEY`



3. 프로젝트 루트에 `.env.local` 파일 생성:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## 4. Authentication 설정

1. Supabase 대시보드에서 "Authentication" > "Settings" 탭으로 이동
2. "Site URL" 설정:
   - Development: `http://localhost:3000`
   - Production: `https://your-domain.com`
3. "Redirect URLs" 추가:
   - `http://localhost:3000/auth/callback`
   - `https://your-domain.com/auth/callback`

## 5. Row Level Security (RLS) 확인

스키마 실행 후 다음 테이블들에 RLS가 활성화되었는지 확인:
- `users`
- `assessment_results`  
- `program_applications`

## 6. 테스트 데이터 (선택사항)

개발 중 테스트를 위해 샘플 데이터를 추가하려면:

```sql
-- 테스트 사용자 추가
INSERT INTO auth.users (id, email) VALUES 
('550e8400-e29b-41d4-a716-446655440000', 'test@example.com');

INSERT INTO users (id, email, name, birth_date, gender, email_verified) VALUES 
('550e8400-e29b-41d4-a716-446655440000', 'test@example.com', '테스트 사용자', '1990-01-01', '남성', true);
```

## 7. 로컬 개발 확인

환경변수 설정 후 로컬에서 확인:
```bash
npm run dev
```

Supabase 연결이 정상적이면 콘솔에 에러가 없어야 합니다.

## 8. 배포 시 환경변수

Vercel 배포 시 환경변수를 다음과 같이 설정:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

## 트러블슈팅

### RLS 정책 문제
사용자가 자신의 데이터에 접근할 수 없다면:
```sql
-- 정책 확인
SELECT * FROM pg_policies WHERE tablename = 'users';

-- auth.uid() 함수 테스트
SELECT auth.uid();
```

### 연결 문제
- 환경변수가 올바르게 설정되었는지 확인
- Supabase 프로젝트가 활성화되어 있는지 확인
- API 키가 정확한지 확인

### 마이그레이션 문제
기존 localStorage 데이터 마이그레이션 시:
- 브라우저 개발자 도구에서 localStorage 확인
- 네트워크 탭에서 API 호출 상태 확인