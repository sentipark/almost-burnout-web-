# 🚀 AlmostBurnOut 배포 가이드 (완전 초보용)

> **이 가이드는 개발 경험이 전혀 없는 분도 따라할 수 있도록 모든 버튼과 메뉴를 상세히 설명합니다.**

## 📝 준비물 체크리스트
- [ ] 컴퓨터 (Windows/Mac)
- [ ] 인터넷 연결
- [ ] 이메일 주소 2개 (Supabase용, Vercel용)
- [ ] 신용카드/체크카드 (무료 서비스지만 등록 필요)

---

## 1단계: Supabase 계정 생성 및 프로젝트 만들기

### 1-1. Supabase 회원가입
1. **브라우저를 열고** `https://supabase.com` 접속
2. **오른쪽 상단의 [Start your project] 버튼** 클릭
3. **GitHub로 가입하거나 이메일로 가입** 
   - GitHub 없으면 "Sign up with email" 클릭
   - 이메일과 비밀번호 입력 후 가입

### 1-2. 새 프로젝트 생성
1. **로그인 후 대시보드에서 [New project] 버튼** 클릭 (초록색 버튼)
2. **Organization 선택** - "Personal" 선택 (무료)
3. **프로젝트 정보 입력:**
   ```
   Name: almost-burnout-prod
   Database Password: 강력한 비밀번호 (예: MySecurePass123!)
   Region: Southeast Asia (Singapore) 선택
   Pricing Plan: Free ($0/month) 선택
   ```
4. **[Create new project] 버튼** 클릭
5. **2-3분 기다리면 프로젝트 생성 완료**

### 1-3. 데이터베이스 만들기
1. **왼쪽 메뉴에서 [SQL Editor] 클릭**
2. **가운데 [+ New query] 버튼** 클릭
3. **빈 에디터 창이 나타나면, 아래 내용을 모두 복사해서 붙여넣기:**

```sql
-- AlmostBurnOut Database Schema (Updated for Anonymous Users)

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR UNIQUE NOT NULL,
  name VARCHAR NOT NULL,
  birth_date DATE,
  gender VARCHAR(10),
  email_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Assessment results table (supports anonymous users)
CREATE TABLE assessment_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  session_id VARCHAR(100),
  abo_index INTEGER NOT NULL CHECK (abo_index >= 0 AND abo_index <= 100),
  level VARCHAR(20) NOT NULL CHECK (level IN ('safe', 'caution', 'warning', 'danger')),
  category_scores JSONB NOT NULL,
  demographics JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Program applications table (supports anonymous users)
CREATE TABLE program_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  session_id VARCHAR(100),
  program_id VARCHAR NOT NULL,
  program_title VARCHAR NOT NULL,
  application_type VARCHAR(20) NOT NULL CHECK (application_type IN ('apply', 'custom')),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled')),
  applicant_info JSONB NOT NULL,
  program_details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_assessment_results_user_id ON assessment_results(user_id);
CREATE INDEX idx_assessment_results_session_id ON assessment_results(session_id);
CREATE INDEX idx_assessment_results_created_at ON assessment_results(created_at);
CREATE INDEX idx_program_applications_user_id ON program_applications(user_id);
CREATE INDEX idx_program_applications_session_id ON program_applications(session_id);
CREATE INDEX idx_program_applications_status ON program_applications(status);
CREATE INDEX idx_program_applications_created_at ON program_applications(created_at);

-- Row Level Security (RLS) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE program_applications ENABLE ROW LEVEL SECURITY;

-- Users can only access their own data
CREATE POLICY "Users can view their own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Assessment results policies (supports anonymous users)
CREATE POLICY "Users can view their assessment results" ON assessment_results
  FOR SELECT USING (
    (auth.uid() IS NOT NULL AND auth.uid() = user_id) OR
    (auth.uid() IS NULL AND session_id IS NOT NULL)
  );

CREATE POLICY "Anyone can insert assessment results" ON assessment_results
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their assessment results" ON assessment_results
  FOR UPDATE USING (
    auth.uid() IS NOT NULL AND auth.uid() = user_id
  );

-- Program applications policies (supports anonymous users)
CREATE POLICY "Users can view their program applications" ON program_applications
  FOR SELECT USING (
    (auth.uid() IS NOT NULL AND auth.uid() = user_id) OR
    (auth.uid() IS NULL AND session_id IS NOT NULL)
  );

CREATE POLICY "Anyone can insert program applications" ON program_applications
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their program applications" ON program_applications
  FOR UPDATE USING (
    auth.uid() IS NOT NULL AND auth.uid() = user_id
  );

-- Functions for automatic updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for automatic updated_at timestamp
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_assessment_results_updated_at BEFORE UPDATE ON assessment_results
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_program_applications_updated_at BEFORE UPDATE ON program_applications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

4. **오른쪽 하단의 [Run] 버튼** 클릭 (파란색 버튼)
5. **"Success. No rows returned" 메시지가 나오면 성공!**

### 1-4. API 키 복사하기 (매우 중요!)
1. **왼쪽 메뉴에서 [Settings] 클릭** (제일 아래 톱니바퀴 아이콘)
2. **[API] 메뉴** 클릭
3. **다음 3개 값을 메모장에 복사해두세요:**

```
Project URL: https://xxxxxxxxxxxxx.supabase.co
anon public: eyJhbGciOiJIUzI1NiIsI... (매우 긴 텍스트)
service_role: eyJhbGciOiJIUzI1NiIsI... (매우 긴 텍스트)
```

> ⚠️ **중요**: 이 키들은 절대 다른 사람과 공유하지 마세요!

---

## 2단계: Vercel 계정 생성 및 배포

### 2-1. Vercel 회원가입
1. **브라우저를 열고** `https://vercel.com` 접속
2. **오른쪽 상단의 [Sign Up] 버튼** 클릭
3. **GitHub 계정으로 가입하거나 이메일로 가입**
   - GitHub 없으면 "Continue with Email" 클릭

### 2-2. 프로젝트 폴더 압축하기
1. **파인더(Mac) 또는 탐색기(Windows)에서** `almost-burnout-web` 폴더를 찾기
2. **폴더를 우클릭** → "압축" 또는 "Compress" 선택
3. **`almost-burnout-web.zip` 파일이 생성됨**

### 2-3. Vercel에 프로젝트 업로드
1. **Vercel 대시보드에서 [Add New...] 버튼** 클릭
2. **[Project] 선택**
3. **[Browse] 버튼** 클릭 (Import Git Repository 섹션 아래)
4. **압축한 `almost-burnout-web.zip` 파일** 선택
5. **자동으로 압축 해제되고 Next.js 프로젝트 감지됨**

### 2-4. 환경변수 설정 (중요!)
배포하기 전에 Supabase 키를 입력해야 합니다:

1. **"Configure Project" 페이지에서 [Environment Variables] 섹션 찾기**
2. **다음 3개 환경변수를 하나씩 추가:**

**첫 번째 환경변수:**
- Name: `NEXT_PUBLIC_SUPABASE_URL`
- Value: (1-4단계에서 복사한 Project URL 붙여넣기)
- [Add] 클릭

**두 번째 환경변수:**
- Name: `NEXT_PUBLIC_SUPABASE_ANON_KEY` 
- Value: (1-4단계에서 복사한 anon public 키 붙여넣기)
- [Add] 클릭

**세 번째 환경변수:**
- Name: `SUPABASE_SERVICE_ROLE_KEY`
- Value: (1-4단계에서 복사한 service_role 키 붙여넣기)
- [Add] 클릭

3. **모든 환경변수 추가 완료 후 [Deploy] 버튼** 클릭

### 2-5. 배포 완료 기다리기
1. **빌드 과정이 시작됨** (2-3분 소요)
2. **"🎉 Your project has been deployed" 메시지 나타나면 성공!**
3. **생성된 URL 클릭하여 사이트 확인** (예: `https://almost-burnout-xxx.vercel.app`)

---

## 3단계: Supabase 추가 설정

### 3-1. Site URL 설정
1. **Supabase 대시보드로 돌아가기**
2. **왼쪽 메뉴에서 [Authentication] 클릭**
3. **[Settings] 탭** 클릭
4. **"Site URL" 찾아서** Vercel에서 받은 URL 입력
   - 예: `https://almost-burnout-xxx.vercel.app`
5. **[Save] 버튼** 클릭

### 3-2. Redirect URLs 설정  
1. **같은 페이지에서 "Redirect URLs" 섹션** 찾기
2. **[Add URL] 버튼** 클릭
3. **다음 URL 입력:** `https://almost-burnout-xxx.vercel.app/auth/callback`
   - (본인의 Vercel URL + `/auth/callback`)
4. **[Save] 버튼** 클릭

---

## 4단계: 배포 완료 테스트

### 4-1. 기본 기능 테스트
배포된 사이트에서 다음 기능들을 테스트해보세요:

1. **홈페이지 접속** ✅
   - 사이트가 정상적으로 로드되나요?

2. **회원가입 테스트** ✅
   - 회원가입 → 이메일 인증 → 로그인

3. **진단 테스트** ✅
   - 진단 시작 → 완료 → 결과 확인

4. **프로그램 신청** ✅
   - 프로그램 페이지 → 신청 → 마이페이지에서 확인

5. **모바일 테스트** ✅
   - 스마트폰에서도 잘 작동하나요?

### 4-2. 데이터 확인
1. **Supabase 대시보드 → [Table editor]** 클릭
2. **`users`, `assessment_results`, `program_applications` 테이블에 데이터가 저장되는지 확인**

---

## 🎉 완료! 

축하합니다! AlmostBurnOut 서비스가 성공적으로 배포되었습니다.

### 📱 서비스 URL
- **본인의 서비스 URL**: `https://almost-burnout-xxx.vercel.app`
- **관리자 대시보드**: Supabase Dashboard

### 🔧 관리 방법
- **Vercel 대시보드**: 배포 상태, 도메인, 성능 모니터링
- **Supabase 대시보드**: 데이터베이스, 사용자, API 사용량

### 📞 문제 발생시
1. **Vercel Functions 탭**: 에러 로그 확인
2. **브라우저 개발자 도구**: Console 탭에서 에러 확인
3. **Supabase Logs**: API 호출 에러 확인

---

## 🌟 추가 설정 (선택사항)

### 커스텀 도메인 연결
1. **도메인 구매** (가비아, 후이즈 등에서)
2. **Vercel 대시보드 → 프로젝트 → [Domains] 탭**
3. **[Add] → 도메인 입력 → DNS 설정 안내 따라하기**

### Google Analytics 연결
1. **Google Analytics 계정 생성**
2. **추적 ID 받기**
3. **Vercel 환경변수에 추가**

---

*이 가이드대로 했는데 안되면 스크린샷과 함께 문의주세요! 😊*