import { supabase, DatabaseAssessmentResult } from '../supabase';
import { AssessmentResult } from '../scoring';

export async function saveAssessmentResult(
  result: AssessmentResult,
  userId?: string,
  sessionId?: string
): Promise<{ data: DatabaseAssessmentResult | null, error: string | null }> {
  try {
    if (!supabase) {
      return { data: null, error: 'Supabase not configured' };
    }
    
    const { data, error } = await supabase
      .from('assessment_results')
      .insert([
        {
          user_id: userId || null,
          session_id: sessionId || null,
          abo_index: result.aboIndex,
          level: result.level,
          category_scores: result.categoryScores,
          demographics: result.demographics,
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Assessment result save error:', error);
      return { data: null, error: '진단 결과 저장에 실패했습니다.' };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Save assessment result error:', error);
    return { data: null, error: '진단 결과 저장 중 오류가 발생했습니다.' };
  }
}

export async function getUserAssessmentResults(
  userId: string
): Promise<{ data: DatabaseAssessmentResult[], error: string | null }> {
  try {
    if (!supabase) {
      return { data: [], error: 'Supabase not configured' };
    }
    
    const { data, error } = await supabase
      .from('assessment_results')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Assessment results fetch error:', error);
      return { data: [], error: '진단 기록을 가져오는데 실패했습니다.' };
    }

    return { data: data || [], error: null };
  } catch (error) {
    console.error('Get user assessment results error:', error);
    return { data: [], error: '진단 기록을 가져오는 중 오류가 발생했습니다.' };
  }
}

export async function getAssessmentResultById(
  resultId: string,
  userId: string
): Promise<{ data: DatabaseAssessmentResult | null, error: string | null }> {
  try {
    if (!supabase) {
      return { data: null, error: 'Supabase not configured' };
    }
    
    const { data, error } = await supabase
      .from('assessment_results')
      .select('*')
      .eq('id', resultId)
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Assessment result fetch error:', error);
      return { data: null, error: '진단 결과를 찾을 수 없습니다.' };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Get assessment result by id error:', error);
    return { data: null, error: '진단 결과를 가져오는 중 오류가 발생했습니다.' };
  }
}

// 임시 결과를 데이터베이스에 저장하는 헬퍼 함수
export async function migrateTemporaryResult(
  tempResult: AssessmentResult,
  userId: string
): Promise<{ success: boolean, error: string | null }> {
  try {
    if (!supabase) {
      return { success: false, error: 'Supabase not configured' };
    }
    
    const { error } = await supabase
      .from('assessment_results')
      .insert([
        {
          user_id: userId,
          abo_index: tempResult.aboIndex,
          level: tempResult.level,
          category_scores: tempResult.categoryScores,
          demographics: tempResult.demographics,
        }
      ]);

    if (error) {
      console.error('Temporary result migration error:', error);
      return { success: false, error: '임시 결과 마이그레이션에 실패했습니다.' };
    }

    return { success: true, error: null };
  } catch (error) {
    console.error('Migrate temporary result error:', error);
    return { success: false, error: '임시 결과 마이그레이션 중 오류가 발생했습니다.' };
  }
}