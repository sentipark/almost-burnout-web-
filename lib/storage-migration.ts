/**
 * localStorage → Supabase 마이그레이션을 위한 호환성 레이어
 * 기존 코드를 변경하지 않고 점진적으로 Supabase로 전환
 */

import { AssessmentResult } from './scoring';
import { ProgramApplication } from './storage';
import * as AuthAPI from './api/auth';
import * as AssessmentAPI from './api/assessments';
import * as ProgramAPI from './api/programs';

// 환경 변수로 Supabase 사용 여부 결정 (개발/배포 환경 분리)
const USE_SUPABASE = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// 기존 localStorage 함수들을 import
import * as LocalStorage from './storage';

/**
 * 익명 사용자를 위한 세션 ID 관리
 */
export function getSessionId(): string {
  if (typeof window === 'undefined') return '';
  
  let sessionId = localStorage.getItem('abo_session_id');
  if (!sessionId) {
    // UUID v4 형식의 세션 ID 생성
    sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('abo_session_id', sessionId);
  }
  return sessionId;
}

/**
 * 사용자 관련 함수들 (호환성 유지)
 */
export async function getCurrentUser() {
  if (USE_SUPABASE) {
    try {
      return await AuthAPI.getCurrentUser();
    } catch (error) {
      console.error('Supabase getCurrentUser error:', error);
      return null; // localStorage fallback 제거
    }
  }
  return LocalStorage.getCurrentUser();
}

/**
 * 진단 결과 관련 함수들
 */
export async function saveUserResult(result: AssessmentResult, userId?: string) {
  // Supabase가 활성화된 경우
  if (USE_SUPABASE) {
    try {
      // 로그인 사용자 또는 익명 사용자 모두 Supabase에 저장
      const sessionId = userId ? undefined : getSessionId();
      const { error } = await AssessmentAPI.saveAssessmentResult(result, userId, sessionId);
      
      if (error) {
        console.error('Supabase save error, saving to localStorage:', error);
        LocalStorage.saveUserResult(result, userId);
      } else {
        // Supabase 성공 시에도 localStorage에 저장 (결과 페이지 전환용)
        LocalStorage.saveUserResult(result, userId);
      }
      return;
    } catch (error) {
      console.error('Supabase saveUserResult error:', error);
      LocalStorage.saveUserResult(result, userId);
      return;
    }
  }
  
  // Supabase 비활성화 시 localStorage에만 저장
  LocalStorage.saveUserResult(result, userId);
}

export async function getUserResults(userId: string): Promise<AssessmentResult[]> {
  if (USE_SUPABASE) {
    try {
      const { data, error } = await AssessmentAPI.getUserAssessmentResults(userId);
      if (!error && data) {
        // Supabase 데이터를 기존 형식으로 변환
        return data.map(item => ({
          categoryScores: item.category_scores,
          aboIndex: item.abo_index,
          level: item.level as 'safe' | 'caution' | 'warning' | 'danger',
          timestamp: item.created_at,
          demographics: item.demographics
        }));
      }
    } catch (error) {
      console.error('Supabase getUserResults error, falling back to localStorage:', error);
    }
  }
  
  // Fallback to localStorage
  return LocalStorage.getUserResults(userId);
}

/**
 * 프로그램 신청 관련 함수들
 */
export async function saveProgramApplication(application: ProgramApplication) {
  if (USE_SUPABASE) {
    try {
      const { error } = await ProgramAPI.saveProgramApplication({
        userId: application.userId,
        programId: application.programId,
        programTitle: application.programTitle,
        applicationDate: application.applicationDate,
        applicationType: application.applicationType,
        status: application.status,
        applicantInfo: application.applicantInfo,
        price: application.price,
        sessions: application.sessions,
        duration: application.duration
      });
      
      if (error) {
        console.error('Supabase save program application error, falling back to localStorage:', error);
        LocalStorage.saveProgramApplication(application);
      }
      return;
    } catch (error) {
      console.error('Supabase saveProgramApplication error, falling back to localStorage:', error);
    }
  }
  
  // Fallback to localStorage
  LocalStorage.saveProgramApplication(application);
}

export async function getUserProgramApplications(userId: string): Promise<ProgramApplication[]> {
  if (USE_SUPABASE) {
    try {
      const { data, error } = await ProgramAPI.getUserProgramApplications(userId);
      if (!error && data) {
        // Supabase 데이터를 기존 형식으로 변환
        return data.map(item => ({
          id: item.id,
          userId: item.user_id,
          programId: item.program_id,
          programTitle: item.program_title,
          applicationDate: item.created_at,
          applicationType: item.application_type as 'apply' | 'custom',
          status: item.status as 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled',
          applicantInfo: item.applicant_info,
          price: item.program_details?.price,
          sessions: item.program_details?.sessions,
          duration: item.program_details?.duration
        }));
      }
    } catch (error) {
      console.error('Supabase getUserProgramApplications error, falling back to localStorage:', error);
    }
  }
  
  // Fallback to localStorage
  return LocalStorage.getUserProgramApplications(userId);
}

/**
 * 인증 관련 함수들
 */
export async function signUp(userData: {
  email: string;
  password: string;
  name: string;
  birthDate?: string;
  gender?: string;
}): Promise<{ success: boolean; user?: any; error?: string }> {
  if (USE_SUPABASE) {
    try {
      const { user, error } = await AuthAPI.signUp(userData);
      if (error) {
        return { success: false, error };
      }
      return { success: true, user };
    } catch (error) {
      console.error('Supabase signUp error:', error);
      return { success: false, error: '회원가입 중 오류가 발생했습니다.' };
    }
  }
  
  // localStorage 방식 (기존 코드 유지)
  return { success: false, error: 'localStorage mode - not implemented' };
}

export async function signIn(credentials: {
  email: string;
  password: string;
}): Promise<{ success: boolean; user?: any; error?: string }> {
  if (USE_SUPABASE) {
    try {
      const { user, error } = await AuthAPI.signIn(credentials);
      if (error) {
        return { success: false, error };
      }
      return { success: true, user };
    } catch (error) {
      console.error('Supabase signIn error:', error);
      return { success: false, error: '로그인 중 오류가 발생했습니다.' };
    }
  }
  
  // localStorage 방식 (기존 코드 유지)
  return { success: false, error: 'localStorage mode - not implemented' };
}

/**
 * 임시 결과 마이그레이션
 */
export async function migrateTemporaryResult(userId: string) {
  // localStorage에서 임시 결과 가져오기
  const tempResult = LocalStorage.getTempResult();
  
  if (tempResult && USE_SUPABASE) {
    try {
      const { success, error } = await AssessmentAPI.migrateTemporaryResult(tempResult, userId);
      if (success) {
        // 성공적으로 마이그레이션되면 localStorage에서 삭제
        LocalStorage.clearTempResult();
        console.log('Successfully migrated temporary result to Supabase');
        return;
      } else {
        console.error('Supabase migration error:', error);
      }
    } catch (error) {
      console.error('Supabase migrateTemporaryResult error:', error);
    }
  }
  
  // Fallback to localStorage migration
  LocalStorage.migrateTemporaryResult(userId);
}

/**
 * 개발 모드에서 현재 사용 중인 스토리지 확인
 */
export function getCurrentStorageMode(): string {
  return USE_SUPABASE ? 'Supabase' : 'localStorage';
}

/**
 * 헬스체크 함수 - Supabase 연결 상태 확인
 */
export async function checkSupabaseConnection(): Promise<{ connected: boolean; error?: string }> {
  if (!USE_SUPABASE) {
    return { connected: false, error: 'Supabase not configured' };
  }
  
  try {
    const user = await AuthAPI.getCurrentUser();
    return { connected: true };
  } catch (error) {
    return { connected: false, error: String(error) };
  }
}