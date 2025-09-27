-- AlmostBurnOut 이메일 인증 비활성화 SQL
-- Supabase SQL Editor에서 실행하세요

-- ==========================================
-- 1. 이메일 확인 없이 회원가입 허용
-- ==========================================

-- Supabase Dashboard에서 설정:
-- Authentication → Settings → Auth Providers → Email
-- "Enable email confirmations" 체크 해제

-- 또는 아래 설정을 사용 (Supabase CLI 필요):
-- UPDATE auth.config 
-- SET enable_email_confirmation = false;

-- ==========================================
-- 2. users 테이블 email_verified 기본값 설정
-- ==========================================

-- email_verified 컬럼 기본값을 true로 변경
ALTER TABLE users 
ALTER COLUMN email_verified SET DEFAULT true;

-- 기존 사용자들의 email_verified를 true로 업데이트
UPDATE users 
SET email_verified = true 
WHERE email_verified = false;

-- ==========================================
-- 3. 트리거 수정 - 이메일 인증 관련 제거
-- ==========================================

-- 기존 이메일 확인 트리거 삭제
DROP TRIGGER IF EXISTS on_email_confirmed ON auth.users;
DROP FUNCTION IF EXISTS public.handle_email_confirmation();

-- 새로운 회원가입 트리거 (email_verified 기본값 true)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- auth.users에 새 사용자가 생성되면 public.users에도 자동 생성
  -- email_verified는 기본적으로 true로 설정
  INSERT INTO public.users (
    id,
    email,
    name,
    birth_date,
    gender,
    email_verified,  -- 기본값 true
    created_at
  )
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'name', ''),
    CASE 
      WHEN new.raw_user_meta_data->>'birth_date' IS NOT NULL 
      THEN (new.raw_user_meta_data->>'birth_date')::date
      ELSE NULL
    END,
    new.raw_user_meta_data->>'gender',
    true,  -- 이메일 인증 없이 바로 true
    now()
  )
  ON CONFLICT (id) DO UPDATE
  SET
    email = EXCLUDED.email,
    updated_at = now();
    
  RETURN new;
END;
$$;

-- 트리거 재생성
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==========================================
-- 4. RLS 정책 확인 (변경 없음)
-- ==========================================

-- 기존 정책 그대로 유지
-- Users can view own profile
-- Users can update own profile  
-- Enable insert for authenticated users only

-- ==========================================
-- 5. 확인 쿼리
-- ==========================================

-- users 테이블 스키마 확인
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'users' AND column_name = 'email_verified';

-- 트리거 확인
SELECT trigger_name, event_manipulation, event_object_table
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY trigger_name;

-- ==========================================
-- 실행 완료 메시지
-- ==========================================
-- 이 스크립트 실행 후:
-- 1. 회원가입 시 이메일 인증이 필요하지 않습니다
-- 2. 모든 신규 회원은 자동으로 email_verified = true로 설정됩니다
-- 3. 회원가입 후 바로 서비스를 이용할 수 있습니다

-- 중요: Supabase Dashboard에서도 설정 변경 필요
-- Authentication → Settings → Auth Providers → Email
-- "Enable email confirmations" 체크 해제