-- 결과 공유를 위한 테이블 생성
CREATE TABLE IF NOT EXISTS result_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  result_data JSONB NOT NULL,
  abo_index INTEGER NOT NULL,
  level TEXT NOT NULL,
  category_scores JSONB NOT NULL,
  demographics JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '30 days'),
  view_count INTEGER DEFAULT 0
);

-- 만료된 공유 링크 자동 삭제를 위한 인덱스
CREATE INDEX IF NOT EXISTS idx_result_shares_expires_at ON result_shares(expires_at);

-- 공유 링크 조회 성능을 위한 인덱스
CREATE INDEX IF NOT EXISTS idx_result_shares_id ON result_shares(id);

-- RLS 정책 (익명 사용자도 읽기 가능)
ALTER TABLE result_shares ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 읽기 가능 (만료되지 않은 것만)
CREATE POLICY "Anyone can view non-expired shared results" 
ON result_shares FOR SELECT 
TO anon, authenticated 
USING (expires_at > NOW());

-- 인증된 사용자만 생성 가능
CREATE POLICY "Authenticated users can create shared results" 
ON result_shares FOR INSERT 
TO authenticated 
WITH CHECK (true);