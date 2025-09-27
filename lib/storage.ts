import { AssessmentResult } from './scoring';

const STORAGE_KEYS = {
  CURRENT_ANSWERS: 'abo_current_answers',
  ASSESSMENT_RESULTS: 'abo_assessment_results',
  USER_DEMOGRAPHICS: 'abo_user_demographics',
  RESULTS_HISTORY: 'abo_results_history',
  TEMP_RESULT: 'abo_temp_result',  // 로그인 전 임시 결과
  PROGRAM_APPLICATIONS: 'abo_program_applications'  // 프로그램 신청 내역
};

// 프로그램 신청 데이터 모델
export interface ProgramApplication {
  id: string;
  userId?: string;
  sessionId?: string;
  programId: string;
  programTitle: string;
  applicationDate: string;
  applicationType: 'apply' | 'custom';
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  applicantInfo: {
    name: string;
    email: string;
    phone: string;
    message?: string;
  };
  price?: string;
  sessions?: string;
  duration?: string;
}

export function saveAnswers(answers: Record<number, number>): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.CURRENT_ANSWERS, JSON.stringify(answers));
  }
}

export function getAnswers(): Record<number, number> | null {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_ANSWERS);
    return saved ? JSON.parse(saved) : null;
  }
  return null;
}

export function clearAnswers(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_ANSWERS);
  }
}

export function saveResult(result: AssessmentResult): void {
  if (typeof window !== 'undefined') {
    const existingResults = getResults();
    existingResults.push(result);
    // 최대 10개까지만 저장
    if (existingResults.length > 10) {
      existingResults.shift();
    }
    localStorage.setItem(STORAGE_KEYS.ASSESSMENT_RESULTS, JSON.stringify(existingResults));
  }
}

export function getResults(): AssessmentResult[] {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(STORAGE_KEYS.ASSESSMENT_RESULTS);
    return saved ? JSON.parse(saved) : [];
  }
  return [];
}

export function getLatestResult(): AssessmentResult | null {
  const results = getResults();
  return results.length > 0 ? results[results.length - 1] : null;
}

export function saveDemographics(demographics: { gender?: string; ageGroup?: string }): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.USER_DEMOGRAPHICS, JSON.stringify(demographics));
  }
}

export function getDemographics(): { gender?: string; ageGroup?: string } | null {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(STORAGE_KEYS.USER_DEMOGRAPHICS);
    return saved ? JSON.parse(saved) : null;
  }
  return null;
}

// 사용자별 진단 결과 히스토리 관리
export function saveUserResult(result: AssessmentResult, userId?: string): void {
  if (typeof window !== 'undefined') {
    if (userId) {
      // 로그인된 사용자: 사용자별 히스토리에 저장
      const historyKey = `${STORAGE_KEYS.RESULTS_HISTORY}_${userId}`;
      const existingResults = getUserResults(userId);
      
      // 중복 방지: 같은 타임스탬프의 결과가 이미 있는지 확인
      const isDuplicate = existingResults.some(existing => existing.timestamp === result.timestamp);
      if (!isDuplicate) {
        existingResults.push(result);
        
        // 최대 20개까지만 저장
        if (existingResults.length > 20) {
          existingResults.shift();
        }
        
        localStorage.setItem(historyKey, JSON.stringify(existingResults));
        console.log(`Saved result for user ${userId}, total results: ${existingResults.length}`);
      }
      
      // 최신 결과도 별도 저장 (결과 페이지용)
      localStorage.setItem('abo_latest_result', JSON.stringify(result));
    } else {
      // 로그인되지 않은 사용자: 임시 저장
      localStorage.setItem(STORAGE_KEYS.TEMP_RESULT, JSON.stringify(result));
      localStorage.setItem('abo_latest_result', JSON.stringify(result));
    }
  }
}

export function getUserResults(userId: string): AssessmentResult[] {
  if (typeof window !== 'undefined') {
    const historyKey = `${STORAGE_KEYS.RESULTS_HISTORY}_${userId}`;
    const saved = localStorage.getItem(historyKey);
    return saved ? JSON.parse(saved) : [];
  }
  return [];
}

export function getTempResult(): AssessmentResult | null {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(STORAGE_KEYS.TEMP_RESULT);
    return saved ? JSON.parse(saved) : null;
  }
  return null;
}

export function clearTempResult(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEYS.TEMP_RESULT);
  }
}

export function migrateTemporaryResult(userId: string): void {
  if (typeof window !== 'undefined') {
    const tempResult = getTempResult();
    console.log('Migrating temporary result for user:', userId, tempResult);
    
    if (tempResult) {
      // 임시 결과를 사용자 히스토리로 이동
      const existingResults = getUserResults(userId);
      existingResults.push(tempResult);
      
      const historyKey = `${STORAGE_KEYS.RESULTS_HISTORY}_${userId}`;
      localStorage.setItem(historyKey, JSON.stringify(existingResults));
      
      console.log(`Migrated temporary result to user ${userId}, total results: ${existingResults.length}`);
      
      // 임시 결과 삭제
      clearTempResult();
    } else {
      console.log('No temporary result to migrate');
    }
  }
}

export function getCurrentUser(): any | null {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('abo_current_user');
    return saved ? JSON.parse(saved) : null;
  }
  return null;
}

// 디버깅 헬퍼 함수들
export function debugStorage(): void {
  if (typeof window !== 'undefined') {
    console.log('=== Storage Debug ===');
    console.log('Current User:', getCurrentUser());
    console.log('Temp Result:', getTempResult());
    
    const currentUser = getCurrentUser();
    if (currentUser) {
      const userResults = getUserResults(currentUser.id);
      console.log(`User ${currentUser.id} Results (${userResults.length}):`, userResults);
    }
    
    console.log('Latest Result:', localStorage.getItem('abo_latest_result'));
    console.log('===================');
  }
}

export function clearAllStorage(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('abo_current_user');
    localStorage.removeItem('abo_latest_result');
    localStorage.removeItem(STORAGE_KEYS.TEMP_RESULT);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_ANSWERS);
    localStorage.removeItem(STORAGE_KEYS.USER_DEMOGRAPHICS);
    
    // 모든 사용자 히스토리 삭제
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.includes('abo_results_history_')) {
        localStorage.removeItem(key);
      }
    });
    
    console.log('All storage cleared');
  }
}

// 프로그램 신청 관련 함수들
export function saveProgramApplication(application: ProgramApplication): void {
  if (typeof window !== 'undefined') {
    const key = application.userId 
      ? `${STORAGE_KEYS.PROGRAM_APPLICATIONS}_${application.userId}`
      : `${STORAGE_KEYS.PROGRAM_APPLICATIONS}_${application.sessionId || 'anonymous'}`;
    
    const existingApplications = getUserProgramApplications(application.userId || '');
    
    // 중복 방지: 같은 ID의 신청이 이미 있는지 확인
    const isDuplicate = existingApplications.some(existing => existing.id === application.id);
    if (!isDuplicate) {
      existingApplications.push(application);
      localStorage.setItem(key, JSON.stringify(existingApplications));
      console.log(`Saved program application, total applications: ${existingApplications.length}`);
    }
  }
}

export function getUserProgramApplications(userId: string): ProgramApplication[] {
  if (typeof window !== 'undefined') {
    const historyKey = `${STORAGE_KEYS.PROGRAM_APPLICATIONS}_${userId}`;
    const saved = localStorage.getItem(historyKey);
    return saved ? JSON.parse(saved) : [];
  }
  return [];
}

export function updateProgramApplicationStatus(userId: string, applicationId: string, status: ProgramApplication['status']): void {
  if (typeof window !== 'undefined') {
    const applications = getUserProgramApplications(userId);
    const updatedApplications = applications.map(app => 
      app.id === applicationId ? { ...app, status } : app
    );
    
    const historyKey = `${STORAGE_KEYS.PROGRAM_APPLICATIONS}_${userId}`;
    localStorage.setItem(historyKey, JSON.stringify(updatedApplications));
    console.log(`Updated application ${applicationId} status to ${status}`);
  }
}