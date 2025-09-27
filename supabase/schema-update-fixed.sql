-- AlmostBurnOut Database Schema Update for Anonymous Users
-- 비회원도 진단 결과를 저장할 수 있도록 스키마 수정
-- 이 SQL을 Supabase SQL Editor에서 실행하세요

-- ==========================================
-- 1. assessment_results 테이블 수정
-- ==========================================

-- user_id를 nullable로 변경
ALTER TABLE assessment_results 
  ALTER COLUMN user_id DROP NOT NULL;

-- session_id 컬럼 추가 (이미 존재할 수 있으므로 IF NOT EXISTS 체크)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'assessment_results' 
    AND column_name = 'session_id'
  ) THEN
    ALTER TABLE assessment_results ADD COLUMN session_id VARCHAR(100);
  END IF;
END $$;

-- session_id 인덱스 추가
DROP INDEX IF EXISTS idx_assessment_results_session_id;
CREATE INDEX idx_assessment_results_session_id ON assessment_results(session_id);

-- ==========================================
-- 2. assessment_results RLS 정책 재설정
-- ==========================================

-- 기존 정책 모두 삭제
DROP POLICY IF EXISTS "Users can view their own assessment results" ON assessment_results;
DROP POLICY IF EXISTS "Users can insert their own assessment results" ON assessment_results;
DROP POLICY IF EXISTS "Users can update their own assessment results" ON assessment_results;
DROP POLICY IF EXISTS "Users can view their assessment results" ON assessment_results;
DROP POLICY IF EXISTS "Anyone can insert assessment results" ON assessment_results;
DROP POLICY IF EXISTS "Users can update their assessment results" ON assessment_results;

-- 새로운 정책 생성
-- 조회: 로그인 사용자는 자신의 데이터, 익명은 모든 session_id 데이터 조회 가능
CREATE POLICY "View assessment results" 
  ON assessment_results 
  FOR SELECT 
  USING (
    (auth.uid()::text = user_id::text) OR 
    (session_id IS NOT NULL)
  );

-- 삽입: 누구나 가능
CREATE POLICY "Insert assessment results" 
  ON assessment_results 
  FOR INSERT 
  WITH CHECK (true);

-- 수정: 로그인 사용자만 자신의 데이터 수정
CREATE POLICY "Update assessment results" 
  ON assessment_results 
  FOR UPDATE 
  USING (
    auth.uid()::text = user_id::text
  );

-- ==========================================
-- 3. program_applications 테이블 수정
-- ==========================================

-- user_id를 nullable로 변경
ALTER TABLE program_applications 
  ALTER COLUMN user_id DROP NOT NULL;

-- session_id 컬럼 추가
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'program_applications' 
    AND column_name = 'session_id'
  ) THEN
    ALTER TABLE program_applications ADD COLUMN session_id VARCHAR(100);
  END IF;
END $$;

-- session_id 인덱스 추가
DROP INDEX IF EXISTS idx_program_applications_session_id;
CREATE INDEX idx_program_applications_session_id ON program_applications(session_id);

-- ==========================================
-- 4. program_applications RLS 정책 재설정
-- ==========================================

-- 기존 정책 모두 삭제
DROP POLICY IF EXISTS "Users can view their own program applications" ON program_applications;
DROP POLICY IF EXISTS "Users can insert their own program applications" ON program_applications;
DROP POLICY IF EXISTS "Users can update their own program applications" ON program_applications;
DROP POLICY IF EXISTS "Users can view their program applications" ON program_applications;
DROP POLICY IF EXISTS "Anyone can insert program applications" ON program_applications;
DROP POLICY IF EXISTS "Users can update their program applications" ON program_applications;

-- 새로운 정책 생성
CREATE POLICY "View program applications" 
  ON program_applications 
  FOR SELECT 
  USING (
    (auth.uid()::text = user_id::text) OR 
    (session_id IS NOT NULL)
  );

CREATE POLICY "Insert program applications" 
  ON program_applications 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Update program applications" 
  ON program_applications 
  FOR UPDATE 
  USING (
    auth.uid()::text = user_id::text
  );

-- ==========================================
-- 5. 세션 데이터를 사용자 계정과 연결하는 함수
-- ==========================================

-- 기존 함수가 있다면 삭제
DROP FUNCTION IF EXISTS migrate_session_to_user(VARCHAR, UUID);

-- 새로운 함수 생성
CREATE OR REPLACE FUNCTION migrate_session_to_user(
  p_session_id VARCHAR,
  p_user_id UUID
) 
RETURNS void 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- assessment_results 마이그레이션
  UPDATE assessment_results 
  SET 
    user_id = p_user_id, 
    session_id = NULL,
    updated_at = NOW()
  WHERE 
    session_id = p_session_id 
    AND user_id IS NULL;
  
  -- program_applications 마이그레이션
  UPDATE program_applications 
  SET 
    user_id = p_user_id, 
    session_id = NULL,
    updated_at = NOW()
  WHERE 
    session_id = p_session_id 
    AND user_id IS NULL;
    
  -- 성공 로그 (선택사항)
  RAISE NOTICE 'Migrated session % to user %', p_session_id, p_user_id;
END;
$$;

-- ==========================================
-- 6. 테스트 쿼리 (실행 후 확인용)
-- ==========================================

-- 테이블 구조 확인
-- SELECT column_name, data_type, is_nullable
-- FROM information_schema.columns
-- WHERE table_name IN ('assessment_results', 'program_applications')
-- ORDER BY table_name, ordinal_position;

-- RLS 정책 확인
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
-- FROM pg_policies
-- WHERE tablename IN ('assessment_results', 'program_applications');

-- 함수 확인
-- SELECT proname, prosrc 
-- FROM pg_proc 
-- WHERE proname = 'migrate_session_to_user';

-- ==========================================
-- 실행 완료 메시지
-- ==========================================
-- 이 스크립트가 성공적으로 실행되면:
-- 1. 비회원도 진단 결과와 프로그램 신청이 가능합니다
-- 2. session_id로 데이터가 저장됩니다
-- 3. 나중에 회원가입 시 migrate_session_to_user 함수로 데이터를 연결할 수 있습니다