import { supabase, DatabaseUser } from '../supabase';

export interface SignUpData {
  email: string;
  password: string;
  name: string;
  birthDate?: string;
  gender?: string;
}

export interface SignInData {
  email: string;
  password: string;
}

export async function signUp(data: SignUpData): Promise<{ user: DatabaseUser | null, error: string | null }> {
  try {
    if (!supabase) {
      return { user: null, error: 'Supabase not configured' };
    }
    
    // Supabase Auth를 사용한 회원가입 (이메일 인증 없음)
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          name: data.name,
          birth_date: data.birthDate,
          gender: data.gender,
        }
      }
    });

    if (authError) {
      // Rate limiting 에러 처리
      if (authError.message.includes('security purposes')) {
        return { user: null, error: '너무 많은 요청입니다. 잠시 후 다시 시도해주세요.' };
      }
      return { user: null, error: authError.message };
    }

    if (!authData.user) {
      return { user: null, error: '회원가입에 실패했습니다.' };
    }

    // Service Role Key를 사용하여 users 테이블에 저장
    // 또는 Database Trigger를 사용하는 것이 더 안전
    try {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .insert([
          {
            id: authData.user.id,
            email: data.email,
            name: data.name,
            birth_date: data.birthDate,
            gender: data.gender,
            email_verified: true,  // 이메일 인증 없이 바로 true
          }
        ])
        .select()
        .single();

      if (userError) {
        console.error('User data insert error:', userError);
        // users 테이블 저장 실패해도 Auth는 성공했으므로 진행
        // 나중에 로그인 시 다시 시도 가능
        return { 
          user: {
            id: authData.user.id,
            email: data.email,
            name: data.name,
            birth_date: data.birthDate,
            gender: data.gender,
            email_verified: true,  // 이메일 인증 없이 바로 true
            created_at: new Date().toISOString()
          } as DatabaseUser, 
          error: null 
        };
      }

      return { user: userData, error: null };
    } catch (error) {
      console.error('User table insert error:', error);
      // Auth는 성공했지만 users 테이블 저장 실패
      return { 
        user: {
          id: authData.user.id,
          email: data.email,
          name: data.name,
          birth_date: data.birthDate,
          gender: data.gender,
          email_verified: false,
          created_at: new Date().toISOString()
        } as DatabaseUser, 
        error: null 
      };
    }
  } catch (error) {
    console.error('Sign up error:', error);
    return { user: null, error: '회원가입 중 오류가 발생했습니다.' };
  }
}

export async function signIn(data: SignInData): Promise<{ user: DatabaseUser | null, error: string | null }> {
  try {
    if (!supabase) {
      return { user: null, error: 'Supabase not configured' };
    }
    
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (authError) {
      return { user: null, error: '이메일 또는 비밀번호가 올바르지 않습니다.' };
    }

    if (!authData.user) {
      return { user: null, error: '로그인에 실패했습니다.' };
    }

    // users 테이블에서 사용자 정보 가져오기
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (userError) {
      console.error('User data fetch error:', userError);
      return { user: null, error: '사용자 정보를 가져오는데 실패했습니다.' };
    }

    return { user: userData, error: null };
  } catch (error) {
    console.error('Sign in error:', error);
    return { user: null, error: '로그인 중 오류가 발생했습니다.' };
  }
}

export async function signOut(): Promise<{ error: string | null }> {
  try {
    if (!supabase) {
      return { error: 'Supabase not configured' };
    }
    
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      return { error: error.message };
    }

    return { error: null };
  } catch (error) {
    console.error('Sign out error:', error);
    return { error: '로그아웃 중 오류가 발생했습니다.' };
  }
}

export async function getCurrentUser(): Promise<DatabaseUser | null> {
  try {
    if (!supabase) {
      return null;
    }
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return null;
    }

    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (userError) {
      console.error('User data fetch error:', userError);
      return null;
    }

    return userData;
  } catch (error) {
    console.error('Get current user error:', error);
    return null;
  }
}