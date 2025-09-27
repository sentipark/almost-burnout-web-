-- AlmostBurnOut Auth & Email 문제 해결 SQL
-- 이 스크립트를 Supabase SQL Editor에서 실행하세요

-- ==========================================
-- 1. users 테이블 RLS 정책 수정
-- ==========================================

-- 기존 정책 삭제
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Users can insert their own profile" ON users;
DROP POLICY IF EXISTS "Service role can insert users" ON users;

-- 새로운 정책 생성

-- 1-1. 사용자는 자신의 프로필만 조회 가능
CREATE POLICY "Users can view own profile" 
  ON users 
  FOR SELECT 
  USING (auth.uid() = id);

-- 1-2. 사용자는 자신의 프로필만 수정 가능
CREATE POLICY "Users can update own profile" 
  ON users 
  FOR UPDATE 
  USING (auth.uid() = id);

-- 1-3. 신규 사용자 INSERT 허용 (회원가입 시)
-- 중요: 이 정책이 있어야 회원가입 시 users 테이블에 데이터 저장 가능
CREATE POLICY "Enable insert for authenticated users only" 
  ON users 
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- ==========================================
-- 2. Auth Trigger 생성 (선택사항 - 더 안전한 방법)
-- ==========================================

-- 회원가입 시 자동으로 users 테이블에 데이터 삽입하는 트리거
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- auth.users에 새 사용자가 생성되면 public.users에도 자동 생성
  INSERT INTO public.users (
    id,
    email,
    name,
    birth_date,
    gender,
    email_verified,
    created_at
  )
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'name', ''),
    (new.raw_user_meta_data->>'birth_date')::date,
    new.raw_user_meta_data->>'gender',
    false,
    now()
  )
  ON CONFLICT (id) DO UPDATE
  SET
    email = EXCLUDED.email,
    updated_at = now();
    
  RETURN new;
END;
$$;

-- 기존 트리거 삭제 (있을 경우)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 새 트리거 생성
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==========================================
-- 3. 이메일 인증 후 email_verified 업데이트 함수
-- ==========================================

CREATE OR REPLACE FUNCTION public.handle_email_confirmation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- 이메일 인증 완료 시 users 테이블 업데이트
  IF new.email_confirmed_at IS NOT NULL AND old.email_confirmed_at IS NULL THEN
    UPDATE public.users
    SET 
      email_verified = true,
      updated_at = now()
    WHERE id = new.id;
  END IF;
  
  RETURN new;
END;
$$;

-- 기존 트리거 삭제
DROP TRIGGER IF EXISTS on_email_confirmed ON auth.users;

-- 새 트리거 생성
CREATE TRIGGER on_email_confirmed
  AFTER UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_email_confirmation();

-- ==========================================
-- 4. 세션 데이터 마이그레이션 함수 개선
-- ==========================================

CREATE OR REPLACE FUNCTION public.migrate_session_to_user_on_signup()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_session_id VARCHAR;
BEGIN
  -- localStorage의 session_id를 metadata에서 가져오기
  v_session_id := new.raw_user_meta_data->>'session_id';
  
  IF v_session_id IS NOT NULL THEN
    -- 익명 사용자의 진단 결과를 새 사용자에게 연결
    UPDATE assessment_results 
    SET 
      user_id = new.id, 
      session_id = NULL,
      updated_at = now()
    WHERE 
      session_id = v_session_id 
      AND user_id IS NULL;
    
    -- 익명 사용자의 프로그램 신청을 새 사용자에게 연결
    UPDATE program_applications 
    SET 
      user_id = new.id, 
      session_id = NULL,
      updated_at = now()
    WHERE 
      session_id = v_session_id 
      AND user_id IS NULL;
      
    RAISE NOTICE 'Migrated session % to user %', v_session_id, new.id;
  END IF;
  
  RETURN new;
END;
$$;

-- 트리거 생성
DROP TRIGGER IF EXISTS migrate_session_on_signup ON auth.users;
CREATE TRIGGER migrate_session_on_signup
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.migrate_session_to_user_on_signup();

-- ==========================================
-- 5. 권한 확인 쿼리
-- ==========================================

-- RLS 정책 확인
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE tablename = 'users'
ORDER BY policyname;

-- 트리거 확인
SELECT trigger_name, event_manipulation, event_object_table, action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY trigger_name;

-- ==========================================
-- 실행 완료 메시지
-- ==========================================
-- 이 스크립트 실행 후:
-- 1. 회원가입 시 users 테이블에 자동으로 데이터가 저장됩니다
-- 2. 이메일 인증 완료 시 email_verified가 자동 업데이트됩니다
-- 3. 익명 사용자 데이터가 회원가입 시 자동으로 마이그레이션됩니다