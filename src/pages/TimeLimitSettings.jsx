import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import Card from '../components/Card';
import Button from '../components/Button';
import { Clock, AlertCircle } from 'lucide-react';

const TimeLimitSettings = () => {
  const { user } = useAuth();
  const [timeLimit, setTimeLimit] = useState(null);
  const [dailyLimit, setDailyLimit] = useState(480); // 8시간 기본값
  const [weeklyLimit, setWeeklyLimit] = useState(3360); // 56시간 기본값
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (user) {
      fetchTimeLimit();
    }
  }, [user]);

  const fetchTimeLimit = async () => {
    try {
      const { data, error } = await supabase
        .from('time_limits')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setTimeLimit(data);
        setDailyLimit(data.daily_limit);
        setWeeklyLimit(data.weekly_limit);
      }
    } catch (error) {
      console.error('Error fetching time limit:', error);
      setError('시간 제한 설정을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      if (timeLimit) {
        // 업데이트
        const { error } = await supabase
          .from('time_limits')
          .update({
            daily_limit: dailyLimit,
            weekly_limit: weeklyLimit,
            updated_at: new Date().toISOString(),
          })
          .eq('id', timeLimit.id);

        if (error) throw error;
      } else {
        // 생성
        const { error } = await supabase
          .from('time_limits')
          .insert([
            {
              user_id: user.id,
              daily_limit: dailyLimit,
              weekly_limit: weeklyLimit,
            }
          ]);

        if (error) throw error;
      }

      setSuccess('설정이 저장되었습니다!');
      await fetchTimeLimit();
    } catch (error) {
      console.error('Error saving time limit:', error);
      setError('설정 저장에 실패했습니다: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const formatMinutesToHours = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}시간 ${mins}분`;
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
          <Clock className="text-purple-600" size={32} />
          사용 시간 제한 설정
        </h1>
        <p className="text-gray-600 mt-2">
          일일 및 주간 앱 사용 시간을 설정하고 관리합니다.
        </p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-600">{success}</p>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* 현재 사용 현황 */}
        <Card variant="stats" title="오늘 사용 현황">
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">일일 사용량</span>
                <span className="text-sm font-semibold text-blue-600">
                  {formatMinutesToHours(timeLimit?.current_daily_usage || 0)} / {formatMinutesToHours(dailyLimit)}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.min(((timeLimit?.current_daily_usage || 0) / dailyLimit) * 100, 100)}%`
                  }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">주간 사용량</span>
                <span className="text-sm font-semibold text-purple-600">
                  {formatMinutesToHours(timeLimit?.current_weekly_usage || 0)} / {formatMinutesToHours(weeklyLimit)}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-purple-600 h-3 rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.min(((timeLimit?.current_weekly_usage || 0) / weeklyLimit) * 100, 100)}%`
                  }}
                ></div>
              </div>
            </div>
          </div>
        </Card>

        {/* 시간 제한 설정 */}
        <Card title="시간 제한 설정">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                일일 사용 시간 제한
              </label>
              <input
                type="range"
                min="60"
                max="720"
                step="30"
                value={dailyLimit}
                onChange={(e) => setDailyLimit(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between items-center mt-2">
                <span className="text-xs text-gray-500">1시간</span>
                <span className="text-lg font-semibold text-blue-600">
                  {formatMinutesToHours(dailyLimit)}
                </span>
                <span className="text-xs text-gray-500">12시간</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                주간 사용 시간 제한
              </label>
              <input
                type="range"
                min="420"
                max="5040"
                step="60"
                value={weeklyLimit}
                onChange={(e) => setWeeklyLimit(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between items-center mt-2">
                <span className="text-xs text-gray-500">7시간</span>
                <span className="text-lg font-semibold text-purple-600">
                  {formatMinutesToHours(weeklyLimit)}
                </span>
                <span className="text-xs text-gray-500">84시간</span>
              </div>
            </div>

            <Button
              variant="primary"
              onClick={handleSave}
              disabled={saving}
              className="w-full"
            >
              {saving ? '저장 중...' : '설정 저장'}
            </Button>
          </div>
        </Card>
      </div>

      {/* 도움말 */}
      <Card className="mt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          💡 사용 팁
        </h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li>• 전문가들은 하루 2-4시간의 스마트폰 사용을 권장합니다</li>
          <li>• 수면 전 2시간은 스크린 사용을 피하는 것이 좋습니다</li>
          <li>• 규칙적인 휴식을 통해 눈 건강을 지키세요</li>
          <li>• 제한 시간 도달 시 알림을 받을 수 있습니다</li>
        </ul>
      </Card>
    </div>
  );
};

export default TimeLimitSettings;
