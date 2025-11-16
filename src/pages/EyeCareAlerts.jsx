import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import Card from '../components/Card';
import Button from '../components/Button';
import { Eye, Bell, Clock, AlertCircle, CheckCircle, Play, TrendingUp } from 'lucide-react';

const EyeCareAlerts = () => {
  const { user } = useAuth();
  const [eyeCareSettings, setEyeCareSettings] = useState(null);
  const [restSessions, setRestSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [reminderInterval, setReminderInterval] = useState(20); // minutes
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [restDuration, setRestDuration] = useState(20); // seconds
  const [saving, setSaving] = useState(false);

  const eyeExercises = [
    {
      title: '20-20-20 규칙',
      description: '20분마다 20초 동안 20피트(6m) 거리의 물체를 바라보세요.',
      duration: '20초',
      icon: '👁️'
    },
    {
      title: '눈 깜빡이기',
      description: '10-15회 천천히 눈을 깜빡여 눈의 건조함을 예방하세요.',
      duration: '30초',
      icon: '✨'
    },
    {
      title: '눈동자 운동',
      description: '상하좌우로 눈동자를 천천히 움직여 눈 근육을 풀어주세요.',
      duration: '1분',
      icon: '🔄'
    },
    {
      title: '팔머링',
      description: '손바닥을 비벼 따뜻하게 한 후 눈을 감고 눈 위에 올려 휴식을 취하세요.',
      duration: '2분',
      icon: '🤲'
    },
    {
      title: '먼 곳 바라보기',
      description: '창밖의 먼 풍경을 바라보며 눈의 피로를 풀어주세요.',
      duration: '1분',
      icon: '🌄'
    },
    {
      title: '눈 마사지',
      description: '눈 주변을 부드럽게 마사지하여 혈액 순환을 도와주세요.',
      duration: '1분',
      icon: '💆'
    }
  ];

  useEffect(() => {
    if (user) {
      fetchEyeCareSettings();
      fetchRestSessions();
    }
  }, [user]);

  const fetchEyeCareSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('eye_care_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setEyeCareSettings(data);
        setReminderInterval(data.reminder_interval || 20);
        setReminderEnabled(data.reminder_enabled ?? true);
        setRestDuration(data.rest_duration || 20);
      }
    } catch (error) {
      console.error('Error fetching eye care settings:', error);
      setError('눈 건강 설정을 불러오는데 실패했습니다.');
    }
  };

  const fetchRestSessions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('rest_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setRestSessions(data || []);
    } catch (error) {
      console.error('Error fetching rest sessions:', error);
      setError('휴식 기록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      if (eyeCareSettings) {
        // Update existing settings
        const { error } = await supabase
          .from('eye_care_settings')
          .update({
            reminder_interval: reminderInterval,
            reminder_enabled: reminderEnabled,
            rest_duration: restDuration,
            updated_at: new Date().toISOString()
          })
          .eq('id', eyeCareSettings.id);

        if (error) throw error;
      } else {
        // Create new settings
        const { data, error } = await supabase
          .from('eye_care_settings')
          .insert([
            {
              user_id: user.id,
              reminder_interval: reminderInterval,
              reminder_enabled: reminderEnabled,
              rest_duration: restDuration
            }
          ])
          .select()
          .single();

        if (error) throw error;
        setEyeCareSettings(data);
      }

      setSuccess('눈 건강 설정이 저장되었습니다!');
      await fetchEyeCareSettings();
    } catch (error) {
      console.error('Error saving eye care settings:', error);
      setError('설정 저장에 실패했습니다: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleStartRestSession = async () => {
    try {
      setError('');
      setSuccess('');

      const { error } = await supabase
        .from('rest_sessions')
        .insert([
          {
            user_id: user.id,
            duration: restDuration,
            completed: true
          }
        ]);

      if (error) throw error;

      setSuccess('휴식 세션이 기록되었습니다!');
      await fetchRestSessions();
    } catch (error) {
      console.error('Error starting rest session:', error);
      setError('휴식 세션 기록에 실패했습니다: ' + error.message);
    }
  };

  const getTodayRestSessions = () => {
    const today = new Date().toDateString();
    return restSessions.filter(session =>
      new Date(session.created_at).toDateString() === today
    ).length;
  };

  const getWeeklyRestSessions = () => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return restSessions.filter(session =>
      new Date(session.created_at) >= weekAgo
    ).length;
  };

  const getAverageRestPerDay = () => {
    const weeklyRest = getWeeklyRestSessions();
    return Math.round(weeklyRest / 7);
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Eye className="text-purple-600" size={32} />
          눈 건강 보호 알림
        </h1>
        <p className="text-gray-600 mt-2">
          일정 시간 사용 후 눈의 피로 방지를 위한 휴식 알림과 눈 운동 가이드를 제공합니다.
        </p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
          <CheckCircle className="text-green-600 flex-shrink-0 mt-0.5" size={20} />
          <p className="text-sm text-green-600">{success}</p>
        </div>
      )}

      {/* Rest Statistics */}
      <div className="grid gap-6 md:grid-cols-3 mb-6">
        <Card variant="stats">
          <div className="text-center">
            <Eye className="mx-auto mb-2 text-blue-600" size={48} />
            <p className="text-sm font-medium text-gray-600 mb-1">오늘 휴식</p>
            <p className="text-4xl font-bold text-blue-600">
              {getTodayRestSessions()}
            </p>
            <p className="text-sm text-gray-500 mt-1">회</p>
          </div>
        </Card>

        <Card variant="stats">
          <div className="text-center">
            <TrendingUp className="mx-auto mb-2 text-purple-600" size={48} />
            <p className="text-sm font-medium text-gray-600 mb-1">주간 평균</p>
            <p className="text-4xl font-bold text-purple-600">
              {getAverageRestPerDay()}
            </p>
            <p className="text-sm text-gray-500 mt-1">회/일</p>
          </div>
        </Card>

        <Card variant="stats">
          <div className="text-center">
            <Bell className="mx-auto mb-2 text-green-600" size={48} />
            <p className="text-sm font-medium text-gray-600 mb-1">알림 간격</p>
            <p className="text-4xl font-bold text-green-600">
              {reminderInterval}
            </p>
            <p className="text-sm text-gray-500 mt-1">분</p>
          </div>
        </Card>
      </div>

      {/* Quick Rest Session */}
      <Card variant="senior" className="mb-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            지금 바로 휴식하기
          </h2>
          <p className="text-gray-600 mb-6">
            {restDuration}초 동안 화면에서 눈을 떼고 먼 곳을 바라보세요.
          </p>
          <Button
            variant="senior"
            size="senior"
            onClick={handleStartRestSession}
            className="mx-auto"
          >
            <Play className="inline mr-2" size={24} />
            휴식 시작하기
          </Button>
        </div>
      </Card>

      {/* Settings */}
      <Card title="알림 설정" className="mb-6">
        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-semibold text-gray-900">휴식 알림 활성화</p>
              <p className="text-sm text-gray-600">정기적인 휴식 알림을 받습니다</p>
            </div>
            <button
              onClick={() => setReminderEnabled(!reminderEnabled)}
              className={`relative w-14 h-8 rounded-full transition-colors ${
                reminderEnabled ? 'bg-purple-600' : 'bg-gray-300'
              }`}
            >
              <div
                className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
                  reminderEnabled ? 'transform translate-x-6' : ''
                }`}
              />
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              알림 간격 (분)
            </label>
            <input
              type="range"
              min="10"
              max="60"
              step="5"
              value={reminderInterval}
              onChange={(e) => setReminderInterval(parseInt(e.target.value))}
              disabled={!reminderEnabled}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
            />
            <div className="flex justify-between items-center mt-2">
              <span className="text-xs text-gray-500">10분</span>
              <span className="text-lg font-semibold text-purple-600">
                {reminderInterval}분
              </span>
              <span className="text-xs text-gray-500">60분</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              휴식 시간 (초)
            </label>
            <input
              type="range"
              min="10"
              max="60"
              step="10"
              value={restDuration}
              onChange={(e) => setRestDuration(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between items-center mt-2">
              <span className="text-xs text-gray-500">10초</span>
              <span className="text-lg font-semibold text-blue-600">
                {restDuration}초
              </span>
              <span className="text-xs text-gray-500">60초</span>
            </div>
          </div>

          <Button
            variant="primary"
            onClick={handleSaveSettings}
            disabled={saving}
            className="w-full"
          >
            {saving ? '저장 중...' : '설정 저장'}
          </Button>
        </div>
      </Card>

      {/* Eye Exercises Guide */}
      <Card title="눈 건강 운동 가이드" className="mb-6">
        <div className="grid md:grid-cols-2 gap-4">
          {eyeExercises.map((exercise, index) => (
            <div
              key={index}
              className="p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-all"
            >
              <div className="flex items-start gap-3">
                <span className="text-3xl">{exercise.icon}</span>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-1">
                    {exercise.title}
                  </h4>
                  <p className="text-sm text-gray-600 mb-2">
                    {exercise.description}
                  </p>
                  <div className="flex items-center gap-1 text-xs text-purple-600">
                    <Clock size={14} />
                    <span>{exercise.duration}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Rest Session History */}
      <Card title="최근 휴식 기록">
        <div className="space-y-3">
          {restSessions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Eye className="mx-auto mb-3 text-gray-400" size={48} />
              <p>아직 휴식 기록이 없습니다.</p>
              <p className="text-sm mt-1">위의 버튼을 클릭하여 휴식을 시작하세요.</p>
            </div>
          ) : (
            restSessions.map((session, index) => (
              <div
                key={index}
                className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="text-purple-600" size={20} />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      휴식 세션 완료
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatTime(session.created_at)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-purple-600">
                    {session.duration}초
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Tips */}
      <Card className="mt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Eye className="text-blue-600" size={24} />
          눈 건강을 위한 팁
        </h3>
        <div className="space-y-2 text-sm text-gray-600">
          <p>• <strong>20-20-20 규칙:</strong> 가장 효과적인 눈 건강 습관입니다</p>
          <p>• <strong>적절한 밝기:</strong> 화면 밝기를 주변 환경과 비슷하게 맞추세요</p>
          <p>• <strong>적절한 거리:</strong> 화면과 눈 사이 거리를 50-70cm 유지하세요</p>
          <p>• <strong>자주 깜빡이기:</strong> 눈 건조를 예방하기 위해 자주 깜빡이세요</p>
          <p>• <strong>충분한 수분:</strong> 하루 8잔 이상의 물을 마시세요</p>
          <p>• <strong>정기 검진:</strong> 1년에 한 번 안과 검진을 받으세요</p>
        </div>
      </Card>
    </div>
  );
};

export default EyeCareAlerts;
