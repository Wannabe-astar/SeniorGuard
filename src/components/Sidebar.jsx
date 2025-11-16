import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Clock,
  Users,
  Activity,
  AlertCircle,
  Eye,
  X
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();

  const menuItems = [
    {
      name: '사용 시간 제한',
      path: '/time-limits',
      icon: Clock,
      description: '일일 사용 시간 설정'
    },
    {
      name: '가족 모니터링',
      path: '/family-monitoring',
      icon: Users,
      description: '가족 연결 및 모니터링'
    },
    {
      name: '건강 리포트',
      path: '/health-reports',
      icon: Activity,
      description: '사용 패턴 분석'
    },
    {
      name: '긴급 해제',
      path: '/emergency',
      icon: AlertCircle,
      description: '긴급 상황 해제'
    },
    {
      name: '눈 건강 알림',
      path: '/eye-care',
      icon: Eye,
      description: '눈 건강 보호'
    }
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* 모바일 오버레이 */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* 사이드바 */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          w-64 bg-white border-r border-gray-200
          transform transition-transform duration-200 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="flex flex-col h-full">
          {/* 모바일 닫기 버튼 */}
          <div className="flex justify-end p-4 lg:hidden">
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={24} />
            </button>
          </div>

          {/* 메뉴 항목 */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => onClose()}
                  className={`
                    flex items-start space-x-3 px-4 py-3 rounded-lg
                    transition-colors duration-150
                    ${
                      active
                        ? 'bg-purple-50 text-purple-700 border border-purple-200'
                        : 'text-gray-700 hover:bg-gray-50'
                    }
                  `}
                >
                  <Icon
                    size={20}
                    className={`mt-0.5 ${active ? 'text-purple-600' : 'text-gray-500'}`}
                  />
                  <div>
                    <p className={`font-medium ${active ? 'text-purple-700' : 'text-gray-900'}`}>
                      {item.name}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {item.description}
                    </p>
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
