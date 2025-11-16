import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, User, Menu } from 'lucide-react';
import Button from './Button';

const Header = ({ onMenuClick }) => {
  const { user, profile, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* 로고 및 메뉴 버튼 */}
          <div className="flex items-center space-x-4">
            <button
              onClick={onMenuClick}
              className="lg:hidden text-gray-500 hover:text-gray-700"
            >
              <Menu size={24} />
            </button>
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-purple-600">
                SeniorGuard
              </h1>
            </div>
          </div>

          {/* 사용자 정보 */}
          {user && (
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-2">
                <User size={20} className="text-gray-500" />
                <div className="text-sm">
                  <p className="font-medium text-gray-900">
                    {profile?.full_name || user.email}
                  </p>
                  <p className="text-gray-500">
                    {profile?.user_type === 'senior' ? '어르신' : '가족'}
                  </p>
                </div>
              </div>
              <Button
                variant="secondary"
                onClick={handleSignOut}
                className="flex items-center space-x-2"
              >
                <LogOut size={18} />
                <span className="hidden sm:inline">로그아웃</span>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
