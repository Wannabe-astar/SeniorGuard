# SeniorGuard - 시니어 앱 사용 시간 관리 애플리케이션

어르신의 스마트폰 사용 시간을 체계적으로 관리하고 건강한 디지털 라이프를 지원하는 시니어 전용 애플리케이션입니다.

## 📋 프로젝트 개요

SeniorGuard는 만 60세 이상의 어르신과 그 가족 구성원을 위한 스마트폰 사용 시간 관리 솔루션입니다. 가족 구성원이 원격으로 모니터링하고 설정할 수 있으며, 어르신의 눈 건강과 수면 패턴을 보호합니다.

### 🎯 핵심 기능

1. **사용 시간 제한 설정** - 일일/주간 사용 시간 한도 설정 및 실시간 모니터링
2. **가족 원격 모니터링** - 가족 구성원이 어르신의 사용 패턴을 확인하고 관리
3. **건강 분석 리포트** - AI 기반 사용 패턴 분석 및 건강한 습관 제안
4. **긴급상황 해제** - 응급 상황 시 모든 제한을 일시 해제하고 긴급 연락처 접근
5. **눈 건강 보호** - 20-20-20 규칙 기반 휴식 알림 및 눈 운동 가이드

## 🛠 기술 스택

- **Frontend**: React.js
- **Backend**: Supabase (실시간 데이터베이스, 인증)
- **Styling**: TailwindCSS
- **Charts**: Chart.js + react-chartjs-2
- **Routing**: React Router
- **Date**: date-fns
- **Icons**: lucide-react

## 📦 설치 방법

### 1. 사전 요구사항

- Node.js 14.0 이상
- npm 6.0 이상
- Supabase 계정

### 2. 프로젝트 클론 및 패키지 설치

```bash
# 프로젝트 디렉토리로 이동
cd seniorguard

# 패키지 설치
npm install
```

### 3. 환경 변수 설정

`.env.example` 파일을 복사하여 `.env` 파일을 생성하고 Supabase 정보를 입력합니다:

```bash
cp .env.example .env
```

`.env` 파일 내용:
```env
REACT_APP_SUPABASE_URL=your_supabase_project_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Supabase 데이터베이스 설정

1. [Supabase](https://supabase.com)에서 새 프로젝트 생성
2. Supabase SQL Editor에서 `supabase/schema.sql` 파일의 내용을 복사하여 실행
3. 프로젝트 설정에서 URL과 anon key를 복사하여 `.env` 파일에 입력

### 5. 애플리케이션 실행

```bash
# 개발 서버 실행
npm start
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 애플리케이션을 확인합니다.

## 🚀 사용 방법

### 회원가입 및 로그인

1. 애플리케이션 실행 후 "회원가입" 클릭
2. 이메일, 비밀번호, 이름, 전화번호 입력
3. 사용자 유형 선택 (어르신 / 가족 구성원)
4. 회원가입 완료 후 자동 로그인

### 주요 기능 사용

#### 사용 시간 제한 설정
- 좌측 메뉴에서 "사용 시간 제한" 선택
- 일일/주간 사용 시간 슬라이더로 조정
- "설정 저장" 버튼 클릭

#### 가족 모니터링
- "가족 모니터링" 메뉴 선택
- "가족 구성원 초대" 버튼으로 가족 초대
- 연결된 가족의 사용 현황 확인

#### 건강 리포트
- "건강 리포트" 메뉴에서 일간/주간/월간 선택
- 건강 점수 및 사용 패턴 그래프 확인
- AI 기반 개선 권장사항 확인

#### 긴급 모드
- "긴급 해제" 메뉴에서 긴급 모드 활성화
- 2시간 동안 모든 사용 제한 해제
- 긴급 연락처 추가 및 빠른 통화

#### 눈 건강 알림
- "눈 건강 알림" 메뉴에서 알림 설정
- 휴식 간격 및 시간 조정
- 눈 운동 가이드 확인

## 📁 프로젝트 구조

```
seniorguard/
├── public/                 # 정적 파일
├── src/
│   ├── components/         # 재사용 가능한 컴포넌트
│   │   ├── Button.jsx
│   │   ├── Card.jsx
│   │   ├── Input.jsx
│   │   ├── Modal.jsx
│   │   ├── Header.jsx
│   │   ├── Sidebar.jsx
│   │   ├── Layout.jsx
│   │   ├── LoadingSpinner.jsx
│   │   ├── ErrorBoundary.jsx
│   │   └── Toast.jsx
│   ├── contexts/           # React Context
│   │   └── AuthContext.jsx
│   ├── lib/               # 라이브러리 설정
│   │   └── supabase.js
│   ├── pages/             # 페이지 컴포넌트
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── TimeLimitSettings.jsx
│   │   ├── FamilyMonitoring.jsx
│   │   ├── HealthReports.jsx
│   │   ├── EmergencyOverride.jsx
│   │   └── EyeCareAlerts.jsx
│   ├── App.js             # 메인 앱 컴포넌트
│   ├── index.js           # 진입점
│   └── index.css          # 글로벌 스타일
├── supabase/
│   └── schema.sql         # 데이터베이스 스키마
├── .env.example           # 환경 변수 예시
├── package.json
├── tailwind.config.js     # Tailwind 설정
└── README.md
```

## 🗄 데이터베이스 스키마

### 주요 테이블

- **profiles** - 사용자 프로필 (어르신/가족 구성원)
- **time_limits** - 사용 시간 제한 설정
- **family_connections** - 가족 연결 관계
- **usage_logs** - 앱 사용 기록
- **health_reports** - 건강 분석 리포트
- **usage_patterns** - 사용 패턴 데이터
- **emergency_overrides** - 긴급 모드 기록
- **emergency_contacts** - 긴급 연락처
- **eye_care_settings** - 눈 건강 알림 설정
- **rest_sessions** - 휴식 세션 기록

## 🔒 보안 및 권한

- Supabase Row Level Security (RLS) 정책 적용
- 사용자는 자신의 데이터만 접근 가능
- 가족 구성원은 연결된 어르신의 데이터만 조회 가능
- 모든 민감한 작업은 인증 필요

## 🎨 디자인 시스템

### 컬러 팔레트
- Primary: #2563EB (파란색)
- Senior Accent: #7C3AED (보라색)
- Success: #16A34A (초록색)
- Error: #DC2626 (빨간색)
- Background: #F8FAFC (연한 회색)

### 타이포그래피
- 시니어 전용 UI는 최소 18px 이상의 큰 폰트 사용
- 버튼은 최소 48px × 48px 터치 타겟
- 높은 색상 대비율 (WCAG AA 준수)

## 🧪 테스트

```bash
# 테스트 실행
npm test

# 빌드 테스트
npm run build
```

## 📱 브라우저 지원

- Chrome (최신 2개 버전)
- Firefox (최신 2개 버전)
- Safari (최신 2개 버전)
- Edge (최신 2개 버전)

## 🐛 문제 해결

### Supabase 연결 오류
- `.env` 파일의 SUPABASE_URL과 ANON_KEY가 올바른지 확인
- Supabase 프로젝트가 활성화 상태인지 확인

### 빌드 오류
```bash
# node_modules 삭제 후 재설치
rm -rf node_modules package-lock.json
npm install
```

### 스타일이 적용되지 않음
```bash
# TailwindCSS 재빌드
npm run build:css
```

## 📝 라이선스

MIT License

## 👥 기여자

- CloudHospital PM Team

## 📞 문의

프로젝트에 대한 문의사항이 있으시면 이슈를 등록해주세요.

---

**버전**: v1.0
**최종 업데이트**: 2025-11-16
