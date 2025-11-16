-- ========================================
-- 사용자 프로필 테이블
-- ========================================
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  user_type TEXT CHECK (user_type IN ('senior', 'family')) DEFAULT 'senior',
  phone_number TEXT,
  birth_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================
-- 사용 시간 제한 설정 테이블
-- ========================================
CREATE TABLE time_limits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  daily_limit INTEGER NOT NULL DEFAULT 480, -- 분 단위 (8시간)
  weekly_limit INTEGER NOT NULL DEFAULT 3360, -- 분 단위 (56시간)
  current_daily_usage INTEGER DEFAULT 0,
  current_weekly_usage INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================
-- 가족 연결 테이블
-- ========================================
CREATE TABLE family_connections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  senior_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  family_member_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  relationship TEXT NOT NULL,
  permissions TEXT[] DEFAULT ARRAY['view', 'monitor'],
  status TEXT CHECK (status IN ('pending', 'accepted', 'rejected')) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(senior_id, family_member_id)
);

-- ========================================
-- 사용 로그 테이블
-- ========================================
CREATE TABLE usage_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  app_name TEXT NOT NULL DEFAULT 'Senior Guard App',
  usage_duration INTEGER NOT NULL, -- 분 단위
  session_start TIMESTAMPTZ NOT NULL,
  session_end TIMESTAMPTZ,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================
-- 건강 리포트 테이블
-- ========================================
CREATE TABLE health_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  report_data JSONB NOT NULL,
  recommendations TEXT[],
  report_period TEXT NOT NULL, -- 'daily', 'weekly', 'monthly'
  generated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================
-- 사용 패턴 테이블
-- ========================================
CREATE TABLE usage_patterns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  pattern_type TEXT NOT NULL, -- 'daily', 'weekly', 'peak_hours'
  pattern_data JSONB NOT NULL,
  analysis_date DATE DEFAULT CURRENT_DATE
);

-- ========================================
-- 긴급 상황 해제 테이블
-- ========================================
CREATE TABLE emergency_overrides (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  override_reason TEXT,
  duration INTEGER NOT NULL DEFAULT 60, -- 분 단위
  is_active BOOLEAN DEFAULT true,
  activated_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL
);

-- ========================================
-- 긴급 연락처 테이블
-- ========================================
CREATE TABLE emergency_contacts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  contact_name TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  relationship TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================
-- 눈 건강 관리 설정 테이블
-- ========================================
CREATE TABLE eye_care_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  reminder_interval INTEGER DEFAULT 30, -- 분 단위
  rest_duration INTEGER DEFAULT 5, -- 분 단위
  enabled BOOLEAN DEFAULT true,
  daily_reminders_sent INTEGER DEFAULT 0,
  last_reminder_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================
-- 휴식 세션 테이블
-- ========================================
CREATE TABLE rest_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  session_start TIMESTAMPTZ NOT NULL,
  session_end TIMESTAMPTZ,
  planned_duration INTEGER NOT NULL,
  actual_duration INTEGER,
  exercises_completed TEXT[],
  completed BOOLEAN DEFAULT false
);

-- ========================================
-- RLS (Row Level Security) 정책 활성화
-- ========================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_overrides ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE eye_care_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE rest_sessions ENABLE ROW LEVEL SECURITY;

-- ========================================
-- RLS 정책들
-- ========================================

-- 프로필 정책
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- 사용 시간 제한 정책
CREATE POLICY "Users can manage own time limits" ON time_limits
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Family can view senior time limits" ON time_limits
  FOR SELECT USING (
    EXISTS(
      SELECT 1 FROM family_connections
      WHERE senior_id = user_id
      AND family_member_id = auth.uid()
      AND status = 'accepted'
    )
  );

-- 가족 연결 정책
CREATE POLICY "Users can manage family connections" ON family_connections
  FOR ALL USING (auth.uid() = senior_id OR auth.uid() = family_member_id);

-- 사용 로그 정책
CREATE POLICY "Users can view own usage logs" ON usage_logs
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Family can view senior usage logs" ON usage_logs
  FOR SELECT USING (
    EXISTS(
      SELECT 1 FROM family_connections
      WHERE senior_id = user_id
      AND family_member_id = auth.uid()
      AND status = 'accepted'
    )
  );

-- 기타 테이블 RLS 정책
CREATE POLICY "Users can manage own health reports" ON health_reports
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own usage patterns" ON usage_patterns
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own emergency overrides" ON emergency_overrides
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own emergency contacts" ON emergency_contacts
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own eye care settings" ON eye_care_settings
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own rest sessions" ON rest_sessions
  FOR ALL USING (auth.uid() = user_id);
