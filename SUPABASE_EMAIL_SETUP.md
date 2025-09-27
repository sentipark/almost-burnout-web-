# 🔧 Supabase 이메일 설정 가이드

## 📧 이메일 발송이 안 되는 이유와 해결 방법

### 1. 현재 문제
- Supabase 무료 플랜은 **하루 3개**의 이메일만 발송 가능
- Rate limiting: 3초 이내 재요청 시 보안 에러 발생
- SMTP 설정이 안 되어 있으면 이메일 발송 불가

---

## 🚀 즉시 해결 방법

### 방법 1: Supabase 기본 이메일 사용 (제한적)
1. **Supabase 대시보드** → **Authentication** → **Settings**
2. **Email Settings** 섹션 확인
3. **Enable Email Confirmations** 활성화
4. **Site URL** 설정: `https://almost-burnout-web.vercel.app`
5. **Redirect URLs** 추가: `https://almost-burnout-web.vercel.app/auth/callback`

**⚠️ 제한사항:**
- 무료 플랜: 하루 3개 이메일만 발송
- 테스트용으로만 적합

---

### 방법 2: Custom SMTP 설정 (권장) 

#### Gmail SMTP 설정 예시:
1. **Gmail 계정에서 앱 비밀번호 생성**
   - Google 계정 설정 → 보안 → 2단계 인증 활성화
   - 앱 비밀번호 생성 (16자리)

2. **Supabase SMTP 설정**
   ```
   Host: smtp.gmail.com
   Port: 587
   Username: your-email@gmail.com
   Password: 16자리 앱 비밀번호
   Sender email: your-email@gmail.com
   Sender name: AlmostBurnOut
   ```

3. **Supabase 대시보드에서 설정**
   - **Settings** → **Auth** → **SMTP Settings**
   - 위 정보 입력 후 **Save**

#### SendGrid 설정 (프로덕션 권장):
1. **SendGrid 계정 생성** (무료 100개/일)
2. **API Key 생성**
3. **Supabase SMTP 설정**
   ```
   Host: smtp.sendgrid.net
   Port: 587
   Username: apikey
   Password: SendGrid API Key
   Sender email: verified-email@yourdomain.com
   ```

---

## 📝 이메일 템플릿 커스터마이징

### Supabase 대시보드에서:
1. **Authentication** → **Email Templates**
2. 각 템플릿 수정 가능:
   - **Confirm signup**: 회원가입 확인
   - **Reset password**: 비밀번호 재설정
   - **Magic Link**: 매직 링크 로그인

### 한국어 템플릿 예시:
```html
<h2>AlmostBurnOut 회원가입을 환영합니다!</h2>
<p>안녕하세요 {{ .Email }}님,</p>
<p>아래 버튼을 클릭하여 이메일 인증을 완료해주세요:</p>
<p><a href="{{ .ConfirmationURL }}">이메일 인증하기</a></p>
<p>링크는 24시간 동안 유효합니다.</p>
<p>감사합니다,<br>AlmostBurnOut 팀</p>
```

---

## 🔍 문제 해결

### "For security purposes, you can only request this after 3 seconds" 에러
**원인**: Rate limiting
**해결**: 
- 3초 이상 기다린 후 재시도
- 프론트엔드에 디바운싱 추가
- 버튼 연속 클릭 방지

### 이메일이 도착하지 않는 경우
1. **스팸 폴더 확인**
2. **Supabase Logs 확인**
   - Dashboard → Logs → Auth
3. **SMTP 설정 확인**
   - Test Email 발송으로 테스트

### users 테이블에 데이터가 저장되지 않는 경우
1. **SQL Editor에서 `auth-fix.sql` 실행**
2. **RLS 정책 확인**
3. **Trigger 동작 확인**

---

## ✅ 체크리스트

### Supabase 설정:
- [ ] Site URL 설정 완료
- [ ] Redirect URLs 설정 완료
- [ ] Email Confirmations 활성화
- [ ] SMTP 설정 (선택사항)
- [ ] 이메일 템플릿 커스터마이징 (선택사항)

### SQL 실행:
- [ ] `schema-update-fixed.sql` 실행 (익명 사용자 지원)
- [ ] `auth-fix.sql` 실행 (회원가입 문제 해결)

### 코드 배포:
- [ ] 최신 코드 Vercel 배포
- [ ] `/auth/callback` 페이지 동작 확인

---

## 🎯 테스트 순서

1. **회원가입 테스트**
   - 새 이메일로 회원가입
   - 이메일 도착 확인 (스팸 폴더 포함)
   - 인증 링크 클릭
   - `/auth/callback`으로 리다이렉트 확인

2. **데이터 저장 확인**
   - Supabase Dashboard → Table Editor
   - `users` 테이블에 데이터 확인
   - `auth.users`와 `public.users` 동기화 확인

3. **익명 → 회원 전환**
   - 비로그인 상태로 진단 완료
   - 회원가입
   - 기존 진단 결과가 계정과 연결되는지 확인

---

## 📞 추가 지원

문제가 지속되면:
1. Supabase Support 문의
2. Vercel 배포 로그 확인
3. 브라우저 개발자 도구 Console/Network 탭 확인