# 🚀 AlmostBurnOut 이메일 인증 없는 회원가입 설정

## 📌 변경 사항 요약

이메일 인증 과정을 제거하고 회원가입 즉시 서비스를 이용할 수 있도록 변경했습니다.

---

## ✅ 완료된 변경 사항

### 1. Frontend 코드 변경
- **login/page.tsx**: 이메일 인증 버튼 및 관련 로직 제거
- **lib/api/auth.ts**: emailRedirectTo 제거, email_verified 기본값 true로 설정
- **auth/callback/page.tsx**: 일반 로그인 콜백으로 단순화

### 2. Database 변경
- **disable-email-confirm.sql**: 이메일 인증 비활성화 SQL 작성
  - email_verified 컬럼 기본값 true
  - 이메일 확인 트리거 제거
  - 회원가입 트리거 수정

---

## 🔧 Supabase 설정 필요

### Supabase Dashboard에서 설정:

1. **Supabase Dashboard 로그인**
   - https://app.supabase.com 접속
   - 프로젝트 선택

2. **이메일 인증 비활성화**
   - 왼쪽 메뉴에서 **Authentication** 클릭
   - **Settings** 탭 클릭
   - **Auth Providers** 섹션에서 **Email** 찾기
   - **"Enable email confirmations"** 체크 해제 ❌
   - **Save** 버튼 클릭

3. **SQL 실행**
   - 왼쪽 메뉴에서 **SQL Editor** 클릭
   - **New query** 클릭
   - `supabase/disable-email-confirm.sql` 내용 복사/붙여넣기
   - **Run** 버튼 클릭

---

## 🎯 테스트 방법

### 1. 회원가입 테스트
```
1. /login 페이지 접속
2. "회원가입" 탭 클릭
3. 정보 입력:
   - 이름
   - 이메일 (인증 버튼 없음)
   - 비밀번호
   - 생년월일
   - 성별
4. 회원가입 버튼 클릭
5. 즉시 마이페이지로 이동 확인
```

### 2. 데이터 확인
```sql
-- Supabase SQL Editor에서 실행
SELECT id, email, name, email_verified, created_at 
FROM users 
ORDER BY created_at DESC 
LIMIT 10;
```

---

## 📝 사용자 경험 개선

### Before (이전):
1. 이메일 입력
2. 인증 버튼 클릭
3. 이메일 확인
4. 인증 링크 클릭
5. 회원가입 완료

### After (현재):
1. 정보 입력
2. 회원가입 완료 ✨

---

## ⚠️ 보안 고려사항

이메일 인증을 제거했지만 다음 보안 조치는 유지됩니다:
- 비밀번호 8자 이상 강제
- HTTPS 통신
- Supabase RLS 정책
- SQL Injection 방어

---

## 🔄 복원 방법

이메일 인증을 다시 활성화하려면:

1. Supabase Dashboard에서 "Enable email confirmations" 다시 체크
2. `auth-fix.sql`의 원래 트리거 복원
3. Frontend 코드에서 이메일 인증 로직 복원

---

## 📞 문제 발생 시

- Supabase Dashboard에서 Auth Logs 확인
- users 테이블 데이터 확인
- 브라우저 개발자 도구 Console 확인