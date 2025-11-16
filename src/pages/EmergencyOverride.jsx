import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import Modal from '../components/Modal';
import { AlertCircle, Phone, ShieldOff, Clock, UserPlus, Trash2, CheckCircle } from 'lucide-react';

const EmergencyOverride = () => {
  const { user } = useAuth();
  const [emergencyMode, setEmergencyMode] = useState(false);
  const [emergencyContacts, setEmergencyContacts] = useState([]);
  const [activeOverride, setActiveOverride] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [addContactModalOpen, setAddContactModalOpen] = useState(false);
  const [newContactName, setNewContactName] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');
  const [newContactRelation, setNewContactRelation] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      fetchEmergencyContacts();
      fetchActiveOverride();
    }
  }, [user]);

  const fetchEmergencyContacts = async () => {
    try {
      const { data, error } = await supabase
        .from('emergency_contacts')
        .select('*')
        .eq('user_id', user.id)
        .order('priority', { ascending: true });

      if (error) throw error;
      setEmergencyContacts(data || []);
    } catch (error) {
      console.error('Error fetching emergency contacts:', error);
      setError('긴급 연락처를 불러오는데 실패했습니다.');
    }
  };

  const fetchActiveOverride = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('emergency_overrides')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setActiveOverride(data);
        setEmergencyMode(true);

        // Check if override has expired
        const expiresAt = new Date(data.expires_at);
        if (expiresAt < new Date()) {
          await deactivateEmergencyMode(data.id);
        }
      }
    } catch (error) {
      console.error('Error fetching active override:', error);
      setError('긴급 모드 상태를 확인하는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleActivateEmergency = async () => {
    if (!window.confirm('긴급 모드를 활성화하시겠습니까? 모든 사용 제한이 2시간 동안 해제됩니다.')) {
      return;
    }

    try {
      setSaving(true);
      setError('');
      setSuccess('');

      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 2);

      const { data, error } = await supabase
        .from('emergency_overrides')
        .insert([
          {
            user_id: user.id,
            is_active: true,
            reason: 'user_initiated',
            expires_at: expiresAt.toISOString()
          }
        ])
        .select()
        .single();

      if (error) throw error;

      setActiveOverride(data);
      setEmergencyMode(true);
      setSuccess('긴급 모드가 활성화되었습니다! 2시간 동안 모든 제한이 해제됩니다.');

      // Notify emergency contacts (in real app)
      await notifyEmergencyContacts();
    } catch (error) {
      console.error('Error activating emergency mode:', error);
      setError('긴급 모드 활성화에 실패했습니다: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const deactivateEmergencyMode = async (overrideId = null) => {
    const id = overrideId || activeOverride?.id;
    if (!id) return;

    try {
      const { error } = await supabase
        .from('emergency_overrides')
        .update({
          is_active: false,
          deactivated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      setActiveOverride(null);
      setEmergencyMode(false);
      setSuccess('긴급 모드가 해제되었습니다.');
    } catch (error) {
      console.error('Error deactivating emergency mode:', error);
      setError('긴급 모드 해제에 실패했습니다: ' + error.message);
    }
  };

  const handleDeactivateEmergency = async () => {
    if (!window.confirm('긴급 모드를 해제하시겠습니까?')) {
      return;
    }

    await deactivateEmergencyMode();
  };

  const notifyEmergencyContacts = async () => {
    // In a real application, this would send SMS/email to emergency contacts
    console.log('Notifying emergency contacts...');
    emergencyContacts.forEach(contact => {
      console.log(`Notifying ${contact.name} at ${contact.phone_number}`);
    });
  };

  const handleAddContact = async () => {
    if (!newContactName || !newContactPhone) {
      setError('이름과 연락처를 모두 입력해주세요.');
      return;
    }

    try {
      setSaving(true);
      setError('');
      setSuccess('');

      const { error } = await supabase
        .from('emergency_contacts')
        .insert([
          {
            user_id: user.id,
            name: newContactName,
            phone_number: newContactPhone,
            relationship: newContactRelation || '기타',
            priority: emergencyContacts.length + 1
          }
        ]);

      if (error) throw error;

      setSuccess('긴급 연락처가 추가되었습니다.');
      setAddContactModalOpen(false);
      setNewContactName('');
      setNewContactPhone('');
      setNewContactRelation('');
      await fetchEmergencyContacts();
    } catch (error) {
      console.error('Error adding emergency contact:', error);
      setError('연락처 추가에 실패했습니다: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveContact = async (contactId) => {
    if (!window.confirm('이 긴급 연락처를 삭제하시겠습니까?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('emergency_contacts')
        .delete()
        .eq('id', contactId);

      if (error) throw error;

      setSuccess('긴급 연락처가 삭제되었습니다.');
      await fetchEmergencyContacts();
    } catch (error) {
      console.error('Error removing emergency contact:', error);
      setError('연락처 삭제에 실패했습니다: ' + error.message);
    }
  };

  const getTimeRemaining = () => {
    if (!activeOverride || !activeOverride.expires_at) return null;

    const now = new Date();
    const expires = new Date(activeOverride.expires_at);
    const diff = expires - now;

    if (diff <= 0) return '만료됨';

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return `${hours}시간 ${minutes}분`;
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
          <ShieldOff className="text-red-600" size={32} />
          긴급상황 해제
        </h1>
        <p className="text-gray-600 mt-2">
          응급 상황 시 사용 제한을 일시적으로 해제하고 긴급 연락처에 접근합니다.
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

      {/* Emergency Mode Status */}
      <Card variant={emergencyMode ? 'senior' : 'default'} className="mb-6">
        <div className="text-center">
          {emergencyMode ? (
            <>
              <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShieldOff className="text-red-600" size={48} />
              </div>
              <h2 className="text-2xl font-bold text-red-600 mb-2">
                긴급 모드 활성화됨
              </h2>
              <p className="text-gray-600 mb-4">
                모든 사용 제한이 일시적으로 해제되었습니다.
              </p>
              <div className="flex items-center justify-center gap-2 text-gray-700 mb-6">
                <Clock size={20} />
                <span className="font-semibold">남은 시간: {getTimeRemaining()}</span>
              </div>
              <Button
                variant="secondary"
                size="senior"
                onClick={handleDeactivateEmergency}
                className="w-full max-w-md mx-auto"
              >
                긴급 모드 해제
              </Button>
            </>
          ) : (
            <>
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="text-green-600" size={48} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                정상 모드
              </h2>
              <p className="text-gray-600 mb-6">
                모든 보호 기능이 정상적으로 작동 중입니다.
              </p>
              <Button
                variant="emergency"
                size="senior"
                onClick={handleActivateEmergency}
                disabled={saving}
                className="w-full max-w-md mx-auto text-xl py-6"
              >
                {saving ? '활성화 중...' : '긴급 모드 활성화'}
              </Button>
              <p className="text-sm text-gray-500 mt-3">
                긴급한 상황에서만 사용하세요. 2시간 동안 모든 제한이 해제됩니다.
              </p>
            </>
          )}
        </div>
      </Card>

      {/* Emergency Contacts */}
      <Card title="긴급 연락처" className="mb-6">
        <div className="space-y-3">
          {emergencyContacts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Phone className="mx-auto mb-3 text-gray-400" size={48} />
              <p>등록된 긴급 연락처가 없습니다.</p>
              <p className="text-sm mt-1">아래 버튼을 클릭하여 연락처를 추가하세요.</p>
            </div>
          ) : (
            emergencyContacts.map((contact) => (
              <div
                key={contact.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                    <Phone className="text-red-600" size={24} />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{contact.name}</p>
                    <p className="text-sm text-gray-600">{contact.phone_number}</p>
                    <p className="text-xs text-gray-500">{contact.relationship}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={`tel:${contact.phone_number}`}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-semibold"
                  >
                    통화
                  </a>
                  <button
                    onClick={() => handleRemoveContact(contact.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="삭제"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
        <Button
          variant="primary"
          onClick={() => setAddContactModalOpen(true)}
          className="w-full mt-4"
        >
          <UserPlus className="inline mr-2" size={20} />
          긴급 연락처 추가
        </Button>
      </Card>

      {/* Emergency Info */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <AlertCircle className="text-blue-600" size={24} />
          긴급 모드 안내
        </h3>
        <div className="space-y-3 text-sm text-gray-600">
          <div className="flex items-start gap-2">
            <span className="font-semibold text-gray-900">•</span>
            <p>긴급 모드 활성화 시 2시간 동안 모든 앱 사용 제한이 해제됩니다.</p>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-semibold text-gray-900">•</span>
            <p>등록된 긴급 연락처에 자동으로 알림이 전송됩니다.</p>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-semibold text-gray-900">•</span>
            <p>긴급 모드는 언제든지 수동으로 해제할 수 있습니다.</p>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-semibold text-gray-900">•</span>
            <p>2시간 후 자동으로 정상 모드로 전환됩니다.</p>
          </div>
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="font-semibold text-yellow-800">
              주의: 긴급한 상황에서만 사용하세요
            </p>
            <p className="text-xs text-yellow-700 mt-1">
              긴급 모드는 응급 상황이나 긴급 연락이 필요한 경우에만 사용해야 합니다.
              남용하지 않도록 주의해주세요.
            </p>
          </div>
        </div>
      </Card>

      {/* Add Contact Modal */}
      <Modal
        isOpen={addContactModalOpen}
        onClose={() => {
          setAddContactModalOpen(false);
          setNewContactName('');
          setNewContactPhone('');
          setNewContactRelation('');
          setError('');
        }}
        title="긴급 연락처 추가"
      >
        <div className="space-y-4">
          <Input
            label="이름"
            placeholder="연락처 이름"
            value={newContactName}
            onChange={(e) => setNewContactName(e.target.value)}
          />
          <Input
            label="전화번호"
            type="tel"
            placeholder="010-0000-0000"
            value={newContactPhone}
            onChange={(e) => setNewContactPhone(e.target.value)}
          />
          <Input
            label="관계"
            placeholder="예: 자녀, 배우자, 친구"
            value={newContactRelation}
            onChange={(e) => setNewContactRelation(e.target.value)}
          />
          <div className="flex gap-3 mt-6">
            <Button
              variant="secondary"
              onClick={() => {
                setAddContactModalOpen(false);
                setNewContactName('');
                setNewContactPhone('');
                setNewContactRelation('');
                setError('');
              }}
              className="flex-1"
            >
              취소
            </Button>
            <Button
              variant="primary"
              onClick={handleAddContact}
              disabled={saving}
              className="flex-1"
            >
              {saving ? '추가 중...' : '추가'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default EmergencyOverride;
