-- AlmostBurnOut Database Schema

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

-- Assessment results table
CREATE TABLE assessment_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  abo_index INTEGER NOT NULL CHECK (abo_index >= 0 AND abo_index <= 100),
  level VARCHAR(20) NOT NULL CHECK (level IN ('safe', 'caution', 'warning', 'danger')),
  category_scores JSONB NOT NULL,
  demographics JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Program applications table
CREATE TABLE program_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
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
CREATE INDEX idx_assessment_results_created_at ON assessment_results(created_at);
CREATE INDEX idx_program_applications_user_id ON program_applications(user_id);
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

-- Assessment results policies
CREATE POLICY "Users can view their own assessment results" ON assessment_results
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own assessment results" ON assessment_results
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own assessment results" ON assessment_results
  FOR UPDATE USING (auth.uid() = user_id);

-- Program applications policies
CREATE POLICY "Users can view their own program applications" ON program_applications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own program applications" ON program_applications
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own program applications" ON program_applications
  FOR UPDATE USING (auth.uid() = user_id);

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

-- Sample data for development (optional)
-- INSERT INTO users (id, email, name, birth_date, gender, email_verified) VALUES 
-- ('550e8400-e29b-41d4-a716-446655440000', 'test@example.com', '테스트 사용자', '1990-01-01', '남성', true);