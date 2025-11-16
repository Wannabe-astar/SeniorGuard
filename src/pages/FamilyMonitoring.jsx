import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import Modal from '../components/Modal';
import { Users, Mail, Activity, Clock, AlertCircle, UserPlus, Trash2 } from 'lucide-react';

const FamilyMonitoring = () => {
  const { user } = useAuth();
  const [connections, setConnections] = useState([]);
  const [usageStats, setUsageStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (user) {
      fetchFamilyConnections();
      fetchUsageStats();
    }
  }, [user]);

  const fetchFamilyConnections = async () => {
    try {
      const { data, error } = await supabase
        .from('family_connections')
        .select(`
          *,
          guardian:guardian_id (email),
          senior:senior_id (email)
        `)
        .or(`guardian_id.eq.${user.id},senior_id.eq.${user.id}`)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setConnections(data || []);
    } catch (error) {
      console.error('Error fetching family connections:', error);
      setError('가족 연결 정보를 불러오는데 실패했습니다.');
    }
  };

  const fetchUsageStats = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('usage_logs')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsageStats(data || []);
    } catch (error) {
      console.error('Error fetching usage stats:', error);
      setError('사용 통계를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleInviteFamilyMember = async () => {
    if (!inviteEmail || !inviteName) {
      setError('이메일과 이름을 모두 입력해주세요.');
      return;
    }

    setSending(true);
    setError('');
    setSuccess('');

    try {
      // Check if user exists
      const { data: existingUser, error: userError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', inviteEmail)
        .single();

      if (userError && userError.code !== 'PGRST116') throw userError;

      if (existingUser) {
        // Create connection with existing user
        const { error: connectionError } = await supabase
          .from('family_connections')
          .insert([
            {
              guardian_id: user.id,
              senior_id: existingUser.id,
              relationship: 'family',
              status: 'pending'
            }
          ]);

        if (connectionError) throw connectionError;
        setSuccess('가족 구성원에게 연결 요청을 보냈습니다!');
      } else {
        // Send invitation email (in real app, this would trigger an email service)
        setSuccess(`${inviteEmail}로 초대 이메일이 전송되었습니다!`);
      }

      setInviteModalOpen(false);
      setInviteEmail('');
      setInviteName('');
      await fetchFamilyConnections();
    } catch (error) {
      console.error('Error inviting family member:', error);
      setError('초대를 보내는데 실패했습니다: ' + error.message);
    } finally {
      setSending(false);
    }
  };

  const handleRemoveConnection = async (connectionId) => {
    if (!window.confirm('이 가족 구성원과의 연결을 해제하시겠습니까?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('family_connections')
        .update({ status: 'inactive' })
        .eq('id', connectionId);

      if (error) throw error;
      setSuccess('연결이 해제되었습니다.');
      await fetchFamilyConnections();
    } catch (error) {
      console.error('Error removing connection:', error);
      setError('연결 해제에 실패했습니다: ' + error.message);
    }
  };

  const calculateTotalUsageToday = () => {
    const today = new Date().toDateString();
    const todayLogs = usageStats.filter(log =>
      new Date(log.created_at).toDateString() === today
    );
    return todayLogs.reduce((sum, log) => sum + (log.duration || 0), 0);
  };

  const calculateAverageUsage = () => {
    if (usageStats.length === 0) return 0;
    const totalMinutes = usageStats.reduce((sum, log) => sum + (log.duration || 0), 0);
    return Math.round(totalMinutes / 7); // Average per day over 7 days
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
          <Users className="text-purple-600" size={32} />
          가족 모니터링
        </h1>
        <p className="text-gray-600 mt-2">
          가족 구성원의 앱 사용 현황을 확인하고 관리합니다.
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

      {/* Usage Overview */}
      <div className="grid gap-6 md:grid-cols-3 mb-6">
        <Card variant="stats">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">오늘 사용 시간</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">
                {formatMinutesToHours(calculateTotalUsageToday())}
              </p>
            </div>
            <Clock className="text-blue-600" size={32} />
          </div>
        </Card>

        <Card variant="stats">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">일일 평균</p>
              <p className="text-2xl font-bold text-purple-600 mt-1">
                {formatMinutesToHours(calculateAverageUsage())}
              </p>
            </div>
            <Activity className="text-purple-600" size={32} />
          </div>
        </Card>

        <Card variant="stats">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">연결된 가족</p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {connections.length}명
              </p>
            </div>
            <Users className="text-green-600" size={32} />
          </div>
        </Card>
      </div>

      {/* Family Members List */}
      <Card title="가족 구성원" className="mb-6">
        <div className="space-y-4">
          {connections.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Users className="mx-auto mb-3 text-gray-400" size={48} />
              <p>아직 연결된 가족 구성원이 없습니다.</p>
              <p className="text-sm mt-1">아래 버튼을 클릭하여 가족을 초대하세요.</p>
            </div>
          ) : (
            connections.map((connection) => {
              const isGuardian = connection.guardian_id === user.id;
              const memberEmail = isGuardian
                ? connection.senior?.email
                : connection.guardian?.email;

              return (
                <div
                  key={connection.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                      <Users className="text-purple-600" size={24} />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">
                        {memberEmail || '알 수 없음'}
                      </p>
                      <p className="text-sm text-gray-500">
                        {connection.relationship || '가족'} • {isGuardian ? '보호 중' : '보호자'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {connection.status === 'pending' && (
                      <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                        대기 중
                      </span>
                    )}
                    <button
                      onClick={() => handleRemoveConnection(connection.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="연결 해제"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <Button
          variant="primary"
          onClick={() => setInviteModalOpen(true)}
          className="w-full mt-4"
        >
          <UserPlus className="inline mr-2" size={20} />
          가족 구성원 초대
        </Button>
      </Card>

      {/* Recent Activity */}
      <Card title="최근 활동 기록">
        <div className="space-y-3">
          {usageStats.slice(0, 5).map((log, index) => (
            <div
              key={index}
              className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0"
            >
              <div className="flex items-center gap-3">
                <Activity className="text-gray-400" size={20} />
                <div>
                  <p className="font-medium text-gray-900">
                    {log.app_name || '앱 사용'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(log.created_at).toLocaleDateString('ko-KR', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900">
                  {formatMinutesToHours(log.duration || 0)}
                </p>
              </div>
            </div>
          ))}
          {usageStats.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Activity className="mx-auto mb-3 text-gray-400" size={48} />
              <p>최근 활동 기록이 없습니다.</p>
            </div>
          )}
        </div>
      </Card>

      {/* Invite Modal */}
      <Modal
        isOpen={inviteModalOpen}
        onClose={() => {
          setInviteModalOpen(false);
          setInviteEmail('');
          setInviteName('');
          setError('');
        }}
        title="가족 구성원 초대"
      >
        <div className="space-y-4">
          <Input
            label="이름"
            placeholder="가족 구성원의 이름을 입력하세요"
            value={inviteName}
            onChange={(e) => setInviteName(e.target.value)}
          />
          <Input
            label="이메일"
            type="email"
            placeholder="이메일 주소를 입력하세요"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
          />
          <div className="flex gap-3 mt-6">
            <Button
              variant="secondary"
              onClick={() => {
                setInviteModalOpen(false);
                setInviteEmail('');
                setInviteName('');
                setError('');
              }}
              className="flex-1"
            >
              취소
            </Button>
            <Button
              variant="primary"
              onClick={handleInviteFamilyMember}
              disabled={sending}
              className="flex-1"
            >
              {sending ? '초대 중...' : '초대 보내기'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default FamilyMonitoring;
