import { supabase, DatabaseProgramApplication } from '../supabase';
import { ProgramApplication } from '../storage';

export async function saveProgramApplication(
  application: Omit<ProgramApplication, 'id'> & { applicationDate: string }
): Promise<{ data: DatabaseProgramApplication | null, error: string | null }> {
  try {
    if (!supabase) {
      return { data: null, error: 'Supabase not configured' };
    }
    
    const { data, error } = await supabase
      .from('program_applications')
      .insert([
        {
          user_id: application.userId,
          program_id: application.programId,
          program_title: application.programTitle,
          application_type: application.applicationType,
          status: application.status,
          applicant_info: application.applicantInfo,
          program_details: {
            price: application.price,
            sessions: application.sessions,
            duration: application.duration,
          },
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Program application save error:', error);
      return { data: null, error: '프로그램 신청 저장에 실패했습니다.' };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Save program application error:', error);
    return { data: null, error: '프로그램 신청 저장 중 오류가 발생했습니다.' };
  }
}

export async function getUserProgramApplications(
  userId: string
): Promise<{ data: DatabaseProgramApplication[], error: string | null }> {
  try {
    if (!supabase) {
      return { data: [], error: 'Supabase not configured' };
    }
    
    const { data, error } = await supabase
      .from('program_applications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Program applications fetch error:', error);
      return { data: [], error: '프로그램 신청 내역을 가져오는데 실패했습니다.' };
    }

    return { data: data || [], error: null };
  } catch (error) {
    console.error('Get user program applications error:', error);
    return { data: [], error: '프로그램 신청 내역을 가져오는 중 오류가 발생했습니다.' };
  }
}

export async function updateProgramApplicationStatus(
  applicationId: string,
  status: DatabaseProgramApplication['status'],
  userId: string
): Promise<{ data: DatabaseProgramApplication | null, error: string | null }> {
  try {
    if (!supabase) {
      return { data: null, error: 'Supabase not configured' };
    }
    
    const { data, error } = await supabase
      .from('program_applications')
      .update({ status })
      .eq('id', applicationId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Program application status update error:', error);
      return { data: null, error: '프로그램 신청 상태 업데이트에 실패했습니다.' };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Update program application status error:', error);
    return { data: null, error: '프로그램 신청 상태 업데이트 중 오류가 발생했습니다.' };
  }
}

export async function getProgramApplicationById(
  applicationId: string,
  userId: string
): Promise<{ data: DatabaseProgramApplication | null, error: string | null }> {
  try {
    if (!supabase) {
      return { data: null, error: 'Supabase not configured' };
    }
    
    const { data, error } = await supabase
      .from('program_applications')
      .select('*')
      .eq('id', applicationId)
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Program application fetch error:', error);
      return { data: null, error: '프로그램 신청을 찾을 수 없습니다.' };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Get program application by id error:', error);
    return { data: null, error: '프로그램 신청을 가져오는 중 오류가 발생했습니다.' };
  }
}