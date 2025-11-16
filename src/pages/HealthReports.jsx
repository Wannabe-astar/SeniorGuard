import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import Card from '../components/Card';
import Button from '../components/Button';
import { Heart, TrendingUp, AlertCircle, Calendar, BarChart3, Lightbulb } from 'lucide-react';

const HealthReports = () => {
  const { user } = useAuth();
  const [healthReport, setHealthReport] = useState(null);
  const [usagePatterns, setUsagePatterns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('daily'); // daily, weekly, monthly

  useEffect(() => {
    if (user) {
      fetchHealthReport();
      fetchUsagePatterns();
    }
  }, [user, selectedPeriod]);

  const fetchHealthReport = async () => {
    try {
      const { data, error } = await supabase
        .from('health_reports')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setHealthReport(data);
      } else {
        // Generate initial health report
        await generateHealthReport();
      }
    } catch (error) {
      console.error('Error fetching health report:', error);
      setError('건강 리포트를 불러오는데 실패했습니다.');
    }
  };

  const fetchUsagePatterns = async () => {
    try {
      setLoading(true);
      let dateFilter;
      const now = new Date();

      switch (selectedPeriod) {
        case 'daily':
          dateFilter = new Date(now.setHours(0, 0, 0, 0)).toISOString();
          break;
        case 'weekly':
          dateFilter = new Date(now.setDate(now.getDate() - 7)).toISOString();
          break;
        case 'monthly':
          dateFilter = new Date(now.setDate(now.getDate() - 30)).toISOString();
          break;
        default:
          dateFilter = new Date(now.setHours(0, 0, 0, 0)).toISOString();
      }

      const { data, error } = await supabase
        .from('usage_patterns')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', dateFilter)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setUsagePatterns(data || []);
    } catch (error) {
      console.error('Error fetching usage patterns:', error);
      setError('사용 패턴을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const generateHealthReport = async () => {
    try {
      const healthScore = calculateHealthScore();
      const recommendations = generateRecommendations(healthScore);

      const { data, error } = await supabase
        .from('health_reports')
        .insert([
          {
            user_id: user.id,
            health_score: healthScore,
            recommendations: recommendations,
            report_date: new Date().toISOString()
          }
        ])
        .select()
        .single();

      if (error) throw error;
      setHealthReport(data);
    } catch (error) {
      console.error('Error generating health report:', error);
    }
  };

  const calculateHealthScore = () => {
    if (usagePatterns.length === 0) return 85;

    const totalMinutes = usagePatterns.reduce((sum, pattern) => sum + (pattern.total_usage || 0), 0);
    const avgDaily = totalMinutes / Math.max(usagePatterns.length, 1);

    // Calculate score based on usage (lower usage = higher score)
    let score = 100;
    if (avgDaily > 360) score -= 30; // More than 6 hours
    else if (avgDaily > 240) score -= 20; // More than 4 hours
    else if (avgDaily > 180) score -= 10; // More than 3 hours

    // Check for late night usage
    const lateNightUsage = usagePatterns.filter(p => p.night_usage > 30).length;
    if (lateNightUsage > usagePatterns.length * 0.3) score -= 10;

    // Check for rest breaks
    const restBreaks = usagePatterns.filter(p => p.rest_breaks >= 3).length;
    if (restBreaks < usagePatterns.length * 0.5) score -= 5;

    return Math.max(0, Math.min(100, score));
  };

  const generateRecommendations = (score) => {
    const recommendations = [];

    if (score < 60) {
      recommendations.push('전반적인 스마트폰 사용 시간을 줄이는 것을 권장합니다.');
      recommendations.push('하루 3-4시간 이내로 사용 시간을 제한해보세요.');
    } else if (score < 80) {
      recommendations.push('사용 패턴이 괜찮지만 개선의 여지가 있습니다.');
      recommendations.push('취침 2시간 전에는 스마트폰 사용을 자제하세요.');
    } else {
      recommendations.push('매우 건강한 디지털 습관을 유지하고 계십니다!');
      recommendations.push('현재의 습관을 계속 유지하세요.');
    }

    recommendations.push('20-20-20 규칙: 20분마다 20초간 20피트(6m) 거리를 바라보세요.');
    recommendations.push('정기적인 눈 운동과 휴식을 취하세요.');

    return recommendations;
  };

  const getHealthScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getHealthScoreLabel = (score) => {
    if (score >= 80) return '우수';
    if (score >= 60) return '보통';
    return '주의';
  };

  const formatMinutesToHours = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}시간 ${mins}분` : `${hours}시간`;
  };

  const getTotalUsage = () => {
    return usagePatterns.reduce((sum, pattern) => sum + (pattern.total_usage || 0), 0);
  };

  const getAverageUsage = () => {
    if (usagePatterns.length === 0) return 0;
    return Math.round(getTotalUsage() / usagePatterns.length);
  };

  const renderSimpleBarChart = () => {
    if (usagePatterns.length === 0) return null;

    const maxUsage = Math.max(...usagePatterns.map(p => p.total_usage || 0));

    return (
      <div className="space-y-2">
        {usagePatterns.slice(-7).map((pattern, index) => {
          const percentage = maxUsage > 0 ? (pattern.total_usage / maxUsage) * 100 : 0;
          const date = new Date(pattern.created_at);

          return (
            <div key={index}>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-gray-600">
                  {date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
                </span>
                <span className="font-semibold text-gray-900">
                  {formatMinutesToHours(pattern.total_usage || 0)}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  const healthScore = healthReport?.health_score || calculateHealthScore();
  const recommendations = healthReport?.recommendations || generateRecommendations(healthScore);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Heart className="text-purple-600" size={32} />
          건강 분석 리포트
        </h1>
        <p className="text-gray-600 mt-2">
          스마트폰 사용 패턴을 분석하고 건강한 디지털 습관을 제안합니다.
        </p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Period Selector */}
      <div className="mb-6 flex gap-2">
        <Button
          variant={selectedPeriod === 'daily' ? 'primary' : 'secondary'}
          onClick={() => setSelectedPeriod('daily')}
        >
          일간
        </Button>
        <Button
          variant={selectedPeriod === 'weekly' ? 'primary' : 'secondary'}
          onClick={() => setSelectedPeriod('weekly')}
        >
          주간
        </Button>
        <Button
          variant={selectedPeriod === 'monthly' ? 'primary' : 'secondary'}
          onClick={() => setSelectedPeriod('monthly')}
        >
          월간
        </Button>
      </div>

      {/* Health Score Overview */}
      <div className="grid gap-6 md:grid-cols-3 mb-6">
        <Card variant="stats">
          <div className="text-center">
            <Heart className={`mx-auto mb-2 ${getHealthScoreColor(healthScore)}`} size={48} />
            <p className="text-sm font-medium text-gray-600 mb-1">건강 점수</p>
            <p className={`text-4xl font-bold ${getHealthScoreColor(healthScore)}`}>
              {healthScore}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {getHealthScoreLabel(healthScore)}
            </p>
          </div>
        </Card>

        <Card variant="stats">
          <div className="text-center">
            <Calendar className="mx-auto mb-2 text-blue-600" size={48} />
            <p className="text-sm font-medium text-gray-600 mb-1">총 사용 시간</p>
            <p className="text-4xl font-bold text-blue-600">
              {formatMinutesToHours(getTotalUsage()).split('시간')[0]}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {selectedPeriod === 'daily' ? '오늘' : selectedPeriod === 'weekly' ? '이번 주' : '이번 달'}
            </p>
          </div>
        </Card>

        <Card variant="stats">
          <div className="text-center">
            <TrendingUp className="mx-auto mb-2 text-purple-600" size={48} />
            <p className="text-sm font-medium text-gray-600 mb-1">일평균 사용</p>
            <p className="text-4xl font-bold text-purple-600">
              {formatMinutesToHours(getAverageUsage()).split('시간')[0]}
            </p>
            <p className="text-sm text-gray-500 mt-1">시간</p>
          </div>
        </Card>
      </div>

      {/* Usage Pattern Chart */}
      <Card title="사용 패턴 분석" className="mb-6">
        <div className="flex items-center gap-2 mb-4 text-sm text-gray-600">
          <BarChart3 size={20} />
          <span>최근 7일간의 사용 패턴</span>
        </div>
        {usagePatterns.length > 0 ? (
          renderSimpleBarChart()
        ) : (
          <div className="text-center py-8 text-gray-500">
            <BarChart3 className="mx-auto mb-3 text-gray-400" size={48} />
            <p>아직 사용 패턴 데이터가 없습니다.</p>
          </div>
        )}
      </Card>

      {/* AI Recommendations */}
      <Card title="AI 기반 건강 권장사항" className="mb-6">
        <div className="space-y-3">
          {recommendations.map((recommendation, index) => (
            <div
              key={index}
              className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg"
            >
              <Lightbulb className="text-purple-600 flex-shrink-0 mt-0.5" size={20} />
              <p className="text-sm text-gray-700">{recommendation}</p>
            </div>
          ))}
        </div>
        <Button
          variant="primary"
          onClick={generateHealthReport}
          className="w-full mt-4"
        >
          새로운 분석 리포트 생성
        </Button>
      </Card>

      {/* Health Tips */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Heart className="text-red-500" size={24} />
          건강한 디지털 습관 만들기
        </h3>
        <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
          <div className="space-y-2">
            <h4 className="font-semibold text-gray-900">눈 건강</h4>
            <ul className="space-y-1">
              <li>• 20-20-20 규칙 준수</li>
              <li>• 화면 밝기 적정 수준 유지</li>
              <li>• 블루라이트 필터 사용</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="font-semibold text-gray-900">수면 건강</h4>
            <ul className="space-y-1">
              <li>• 취침 2시간 전 사용 중단</li>
              <li>• 침실에 스마트폰 두지 않기</li>
              <li>• 야간 모드 활성화</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="font-semibold text-gray-900">자세 건강</h4>
            <ul className="space-y-1">
              <li>• 바른 자세로 사용하기</li>
              <li>• 목과 어깨 스트레칭</li>
              <li>• 적절한 화면 거리 유지</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="font-semibold text-gray-900">정신 건강</h4>
            <ul className="space-y-1">
              <li>• 디지털 디톡스 시간 갖기</li>
              <li>• 야외 활동 증가</li>
              <li>• 대면 소통 시간 늘리기</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default HealthReports;
