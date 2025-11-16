import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Input from '../components/Input';
import Button from '../components/Button';
import Card from '../components/Card';

const Register = () => {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    userType: 'senior',
    phoneNumber: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }

    if (formData.password.length < 6) {
      setError('비밀번호는 최소 6자 이상이어야 합니다.');
      return;
    }

    setLoading(true);

    const { error } = await signUp(formData.email, formData.password, {
      full_name: formData.fullName,
      user_type: formData.userType,
      phone_number: formData.phoneNumber,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      navigate('/time-limits');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-purple-600 mb-2">
            SeniorGuard
          </h1>
          <p className="text-gray-600">
            어르신의 건강한 디지털 라이프를 위한 파트너
          </p>
        </div>

        <Card>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            회원가입
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="이름"
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="홍길동"
              required
            />

            <Input
              label="이메일"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="example@email.com"
              required
            />

            <Input
              label="전화번호"
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              placeholder="010-1234-5678"
            />

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                사용자 유형
              </label>
              <select
                name="userType"
                value={formData.userType}
                onChange={handleChange}
                className="bg-white border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 px-4 py-3 rounded-lg text-base w-full transition-all duration-200"
              >
                <option value="senior">어르신</option>
                <option value="family">가족 구성원</option>
              </select>
            </div>

            <Input
              label="비밀번호"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="최소 6자 이상"
              required
            />

            <Input
              label="비밀번호 확인"
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="비밀번호 재입력"
              required
            />

            <Button
              type="submit"
              variant="primary"
              disabled={loading}
              className="w-full"
            >
              {loading ? '가입 중...' : '회원가입'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              이미 계정이 있으신가요?{' '}
              <Link
                to="/login"
                className="text-purple-600 hover:text-purple-700 font-medium"
              >
                로그인
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Register;
