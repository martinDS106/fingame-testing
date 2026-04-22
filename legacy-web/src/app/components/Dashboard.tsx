import { Bell, Menu, TrendingUp, DollarSign, PieChart, Trophy, Play, Award } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Progress } from "./ui/progress";
import { BottomNav } from "./BottomNav";
import { CoinsCounter } from "./CoinsCounter";
import { StreakWidget } from "./StreakWidget";
import { useNavigate } from "react-router";

const courses = [
  {
    id: 1,
    title: "Investing Basics",
    description: "Learn fundamental investment principles",
    icon: TrendingUp,
    progress: 65,
    color: "bg-blue-500"
  },
  {
    id: 2,
    title: "Budgeting 101",
    description: "Master personal finance management",
    icon: DollarSign,
    progress: 40,
    color: "bg-yellow-500"
  },
  {
    id: 3,
    title: "Stock Market",
    description: "Understand market dynamics",
    icon: PieChart,
    progress: 20,
    color: "bg-purple-500"
  },
];

const leaderboard = [
  { rank: 1, name: "Ahmed Ali", points: 2450, avatar: "🏆" },
  { rank: 2, name: "Sara Mohamed", points: 2120, avatar: "🥈" },
  { rank: 3, name: "Omar Hassan", points: 1890, avatar: "🥉" },
];

export function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 shadow-md">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Menu className="w-6 h-6" />
            <span className="text-xl">Fin-Game</span>
          </div>
          <div className="flex items-center gap-3">
            <CoinsCounter coins={2450} />
            <Bell className="w-6 h-6" />
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4 space-y-6">
        {/* Welcome Message */}
        <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-2xl p-6 text-blue-900 shadow-lg">
          <h2 className="text-2xl mb-1">Welcome back!</h2>
          <p className="text-blue-800">Ready to continue learning?</p>
        </div>

        {/* Streak Widget */}
        <StreakWidget days={23} />

        {/* Financial Marketplace Card */}
        <Card 
          className="p-5 bg-gradient-to-r from-purple-500 to-blue-600 text-white cursor-pointer hover:shadow-xl transition-all border-0"
          onClick={() => navigate("/marketplace-home")}
        >
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-lg mb-1">Financial Marketplace</h3>
              <p className="text-sm text-white/80">Compare real Egyptian financial products</p>
            </div>
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>
          <Button className="w-full bg-white text-purple-600 hover:bg-white/90">
            Explore Products
          </Button>
        </Card>

        {/* Featured Courses */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xl text-gray-800">Featured Courses</h3>
            <Button variant="ghost" className="text-blue-600">See All</Button>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2 hide-scrollbar">
            {courses.map((course) => {
              const Icon = course.icon;
              return (
                <Card key={course.id} className="flex-shrink-0 w-64 p-4 border-2 hover:border-blue-300 transition-all cursor-pointer">
                  <div className={`${course.color} w-12 h-12 rounded-xl flex items-center justify-center mb-3`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="mb-1">{course.title}</h4>
                  <p className="text-sm text-gray-600 mb-3">{course.description}</p>
                  <div className="mb-2">
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>Progress</span>
                      <span>{course.progress}%</span>
                    </div>
                    <Progress value={course.progress} className="h-2" />
                  </div>
                  <Button 
                    onClick={() => navigate("/course")}
                    className="w-full bg-blue-600 hover:bg-blue-700 mt-2"
                  >
                    Continue
                  </Button>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Daily Activities */}
        <div className="grid grid-cols-2 gap-4">
          {/* Daily Quiz */}
          <Card className="p-4 bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 cursor-pointer hover:scale-105 transition-transform">
            <div className="flex items-center justify-center w-12 h-12 bg-white/20 rounded-xl mb-3">
              <Award className="w-6 h-6" />
            </div>
            <h4 className="mb-1">Daily Quiz</h4>
            <p className="text-sm text-purple-100 mb-3">Test your knowledge</p>
            <Button variant="secondary" size="sm" className="w-full">
              Take Quiz
            </Button>
          </Card>

          {/* Simulation */}
          <Card className="p-4 bg-gradient-to-br from-green-500 to-green-600 text-white border-0 cursor-pointer hover:scale-105 transition-transform"
            onClick={() => navigate("/simulation-hub")}>
            <div className="flex items-center justify-center w-12 h-12 bg-white/20 rounded-xl mb-3">
              <Play className="w-6 h-6" />
            </div>
            <h4 className="mb-1">Simulation</h4>
            <p className="text-sm text-green-100 mb-3">Practice trading</p>
            <Button variant="secondary" size="sm" className="w-full">
              Start Now
            </Button>
          </Card>
        </div>

        {/* Leaderboard */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              <h3 className="text-xl text-gray-800">Leaderboard</h3>
            </div>
            <Button variant="ghost" className="text-blue-600">View All</Button>
          </div>
          <Card className="p-4">
            <div className="space-y-3">
              {leaderboard.map((user) => (
                <div key={user.rank} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                  <div className="text-2xl">{user.avatar}</div>
                  <div className="flex-1">
                    <p className="text-sm">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.points} points</p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm ${
                    user.rank === 1 
                      ? "bg-yellow-100 text-yellow-700" 
                      : user.rank === 2 
                      ? "bg-gray-100 text-gray-700"
                      : "bg-orange-100 text-orange-700"
                  }`}>
                    #{user.rank}
                  </div>
                </div>
              ))}
            </div>
            <Button className="w-full mt-4 bg-yellow-400 hover:bg-yellow-500 text-blue-900">
              Join Competition
            </Button>
          </Card>
        </div>
      </div>

      <BottomNav />
      
      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}