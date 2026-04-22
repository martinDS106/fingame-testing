import { useState } from 'react';
import { Gamepad2, GraduationCap, Bell, Menu, TrendingUp, DollarSign, Book, Trophy, HelpCircle, BarChart3 } from 'lucide-react';
import { useNavigate } from 'react-router';

interface Course {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  progress: number;
}

const courses: Course[] = [
  {
    id: '1',
    title: 'Investing Basics',
    description: 'Learn the fundamentals of smart investing',
    icon: <TrendingUp className="size-8 text-blue-600" />,
    progress: 45
  },
  {
    id: '2',
    title: 'Budgeting 101',
    description: 'Master your personal finances',
    icon: <DollarSign className="size-8 text-yellow-600" />,
    progress: 0
  },
  {
    id: '3',
    title: 'Stock Market',
    description: 'Understand how the market works',
    icon: <BarChart3 className="size-8 text-blue-600" />,
    progress: 20
  },
  {
    id: '4',
    title: 'Crypto Basics',
    description: 'Introduction to cryptocurrency',
    icon: <Book className="size-8 text-yellow-600" />,
    progress: 0
  }
];

const leaderboard = [
  { rank: 1, name: 'Sarah Ahmed', points: 2850, avatar: '👩' },
  { rank: 2, name: 'Mohammed Ali', points: 2720, avatar: '👨' },
  { rank: 3, name: 'Fatima Khan', points: 2650, avatar: '👩' }
];

export function DashboardScreen() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('home');

  const navigateToTab = (tab: string) => {
    setActiveTab(tab);
    if (tab === 'courses') navigate('/dashboard');
    if (tab === 'rewards') navigate('/rewards');
    if (tab === 'profile') navigate('/profile');
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-yellow-400 to-blue-500 px-4 py-6 shadow-md">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Gamepad2 className="size-8 text-blue-900" strokeWidth={2} />
              <GraduationCap className="size-6 text-yellow-700 absolute -top-1 -right-1" strokeWidth={2} />
            </div>
            <span className="text-xl text-white">Fin-Game</span>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative">
              <Bell className="size-6 text-white" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full size-4 flex items-center justify-center">3</span>
            </button>
            <button>
              <Menu className="size-6 text-white" />
            </button>
          </div>
        </div>
        
        {/* User Points */}
        <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-4 py-3 flex items-center justify-between">
          <div>
            <p className="text-white/80 text-sm">Your Points</p>
            <p className="text-white text-2xl">1,540</p>
          </div>
          <Trophy className="size-10 text-yellow-300" />
        </div>
      </div>

      {/* Featured Courses */}
      <div className="px-4 py-6">
        <h2 className="text-gray-900 mb-4">Featured Courses</h2>
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
          {courses.map((course) => (
            <div
              key={course.id}
              className="min-w-[280px] bg-white rounded-2xl shadow-md p-5 flex-shrink-0"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="bg-yellow-50 p-3 rounded-xl">
                  {course.icon}
                </div>
                {course.progress > 0 && (
                  <span className="bg-blue-100 text-blue-600 text-xs px-2 py-1 rounded-full">
                    {course.progress}%
                  </span>
                )}
              </div>
              <h3 className="text-gray-900 mb-2">{course.title}</h3>
              <p className="text-gray-600 text-sm mb-4">{course.description}</p>
              {course.progress > 0 && (
                <div className="mb-3">
                  <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-blue-500 h-full rounded-full"
                      style={{ width: `${course.progress}%` }}
                    />
                  </div>
                </div>
              )}
              <button
                onClick={() => navigate('/course')}
                className="w-full bg-gradient-to-r from-yellow-400 to-blue-500 text-white py-2 rounded-xl hover:shadow-lg transition-all"
              >
                {course.progress > 0 ? 'Continue' : 'Start'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Daily Quiz & Simulation */}
      <div className="px-4 pb-6">
        <h2 className="text-gray-900 mb-4">Daily Challenges</h2>
        <div className="grid grid-cols-1 gap-4">
          <div className="bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-2xl p-5 shadow-md">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="bg-yellow-400 p-3 rounded-xl">
                  <HelpCircle className="size-6 text-yellow-900" />
                </div>
                <div>
                  <h3 className="text-gray-900">Daily Quiz</h3>
                  <p className="text-gray-600 text-sm">3/5 completed</p>
                </div>
              </div>
              <span className="text-yellow-600 text-sm">+50 pts</span>
            </div>
            <div className="bg-white/50 rounded-full h-2 overflow-hidden mb-3">
              <div className="bg-yellow-600 h-full rounded-full" style={{ width: '60%' }} />
            </div>
            <button className="w-full bg-yellow-500 hover:bg-yellow-600 text-white py-2 rounded-xl transition-all">
              Take Quiz
            </button>
          </div>

          <div className="bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl p-5 shadow-md">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="bg-blue-400 p-3 rounded-xl">
                  <BarChart3 className="size-6 text-blue-900" />
                </div>
                <div>
                  <h3 className="text-gray-900">Stock Simulation</h3>
                  <p className="text-gray-600 text-sm">Practice trading</p>
                </div>
              </div>
              <span className="text-blue-600 text-sm">+100 pts</span>
            </div>
            <button className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-xl transition-all">
              Start Simulation
            </button>
          </div>
        </div>
      </div>

      {/* Leaderboard */}
      <div className="px-4 pb-6">
        <h2 className="text-gray-900 mb-4">Leaderboard</h2>
        <div className="bg-white rounded-2xl shadow-md p-5">
          {leaderboard.map((user) => (
            <div
              key={user.rank}
              className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0"
            >
              <div className="flex items-center gap-4">
                <div className={`size-10 rounded-full flex items-center justify-center ${
                  user.rank === 1 ? 'bg-yellow-400' :
                  user.rank === 2 ? 'bg-gray-300' :
                  'bg-yellow-700'
                }`}>
                  <span className="text-xl">{user.rank}</span>
                </div>
                <div className="size-12 bg-blue-100 rounded-full flex items-center justify-center text-2xl">
                  {user.avatar}
                </div>
                <div>
                  <p className="text-gray-900">{user.name}</p>
                  <p className="text-gray-500 text-sm">{user.points} points</p>
                </div>
              </div>
              {user.rank === 1 && <Trophy className="size-6 text-yellow-500" />}
            </div>
          ))}
          <button className="w-full mt-4 bg-gradient-to-r from-yellow-400 to-blue-500 text-white py-2 rounded-xl hover:shadow-lg transition-all">
            Join Competition
          </button>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 shadow-lg">
        <div className="flex items-center justify-around max-w-md mx-auto">
          <button
            onClick={() => navigateToTab('home')}
            className={`flex flex-col items-center gap-1 ${activeTab === 'home' ? 'text-blue-600' : 'text-gray-400'}`}
          >
            <Gamepad2 className="size-6" />
            <span className="text-xs">Home</span>
          </button>
          <button
            onClick={() => navigateToTab('courses')}
            className={`flex flex-col items-center gap-1 ${activeTab === 'courses' ? 'text-blue-600' : 'text-gray-400'}`}
          >
            <Book className="size-6" />
            <span className="text-xs">Courses</span>
          </button>
          <button
            onClick={() => navigateToTab('rewards')}
            className={`flex flex-col items-center gap-1 ${activeTab === 'rewards' ? 'text-blue-600' : 'text-gray-400'}`}
          >
            <Trophy className="size-6" />
            <span className="text-xs">Rewards</span>
          </button>
          <button
            onClick={() => navigateToTab('profile')}
            className={`flex flex-col items-center gap-1 ${activeTab === 'profile' ? 'text-blue-600' : 'text-gray-400'}`}
          >
            <div className="size-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs">
              U
            </div>
            <span className="text-xs">Profile</span>
          </button>
        </div>
      </div>
    </div>
  );
}
