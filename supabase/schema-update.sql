-- AlmostBurnOut Database Schema Update for Anonymous Users
-- 비회원도 진단 결과를 저장할 수 있도록 스키마 수정

-- 1. assessment_results 테이블 수정
-- user_id를 nullable로 변경하고 session_id 추가
ALTER TABLE assessment_results 
  ALTER COLUMN user_id DROP NOT NULL;

ALTER TABLE assessment_results 
  ADD COLUMN session_id VARCHAR(100);

-- session_id에 인덱스 추가 (성능 향상)
CREATE INDEX idx_assessment_results_session_id ON assessment_results(session_id);

-- 2. RLS 정책 수정 - 기존 정책 삭제
DROP POLICY IF EXISTS "Users can view their own assessment results" ON assessment_results;
DROP POLICY IF EXISTS "Users can insert their own assessment results" ON assessment_results;
DROP POLICY IF EXISTS "Users can update their own assessment results" ON assessment_results;

-- 3. 새로운 RLS 정책 생성 (로그인 사용자 + 익명 사용자 모두 지원)
-- 조회: 로그인 사용자는 자신의 데이터만, 익명은 session_id로 조회
CREATE POLICY "Users can view their assessment results" ON assessment_results
  FOR SELECT USING (
    (auth.uid() IS NOT NULL AND auth.uid() = user_id) OR
    (auth.uid() IS NULL AND session_id IS NOT NULL)
  );

-- 삽입: 누구나 삽입 가능 (익명 포함)
CREATE POLICY "Anyone can insert assessment results" ON assessment_results
  FOR INSERT WITH CHECK (true);

-- 수정: 로그인 사용자는 자신의 데이터만 수정 가능
CREATE POLICY "Users can update their assessment results" ON assessment_results
  FOR UPDATE USING (
    auth.uid() IS NOT NULL AND auth.uid() = user_id
  );

-- 4. program_applications 테이블도 동일하게 수정 (선택사항)
ALTER TABLE program_applications 
  ALTER COLUMN user_id DROP NOT NULL;

ALTER TABLE program_applications 
  ADD COLUMN session_id VARCHAR(100);

CREATE INDEX idx_program_applications_session_id ON program_applications(session_id);

-- 기존 정책 삭제
DROP POLICY IF EXISTS "Users can view their own program applications" ON program_applications;
DROP POLICY IF EXISTS "Users can insert their own program applications" ON program_applications;
DROP POLICY IF EXISTS "Users can update their own program applications" ON program_applications;

-- 새로운 정책 생성
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

-- 5. 세션 데이터를 사용자 계정과 연결하는 함수 (나중에 회원가입 시 사용)
CREATE OR REPLACE FUNCTION migrate_session_to_user(
  p_session_id VARCHAR,
  p_user_id UUID
) RETURNS void AS $$
BEGIN
  -- assessment_results 마이그레이션
  UPDATE assessment_results 
  SET user_id = p_user_id, session_id = NULL
  WHERE session_id = p_session_id AND user_id IS NULL;
  
  -- program_applications 마이그레이션
  UPDATE program_applications 
  SET user_id = p_user_id, session_id = NULL
  WHERE session_id = p_session_id AND user_id IS NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;