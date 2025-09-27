import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Supabase 클라이언트는 환경변수가 있을 때만 생성
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// 데이터베이스 타입 정의
export interface DatabaseUser {
  id: string;
  email: string;
  name: string;
  birth_date?: string;
  gender?: string;
  email_verified: boolean;
  created_at: string;
}

export interface DatabaseAssessmentResult {
  id: string;
  user_id?: string;
  session_id?: string;
  abo_index: number;
  level: string;
  category_scores: {
    em: number;
    pe: number;
    ph: number;
    or: number;
    im: number;
  };
  demographics?: {
    gender?: string;
    ageGroup?: string;
  };
  created_at: string;
  updated_at?: string;
}

export interface DatabaseProgramApplication {
  id: string;
  user_id?: string;
  session_id?: string;
  program_id: string;
  program_title: string;
  application_type: 'apply' | 'custom';
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  applicant_info: {
    name: string;
    email: string;
    phone: string;
    message?: string;
  };
  program_details?: {
    price?: string;
    sessions?: string;
    duration?: string;
  };
  created_at: string;
  updated_at?: string;
}