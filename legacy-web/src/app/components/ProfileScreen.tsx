import { Settings, Award, BookOpen, TrendingUp, ChevronRight, Bell, Globe, CreditCard } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Progress } from "./ui/progress";
import { BottomNav } from "./BottomNav";
import { Badge } from "./ui/badge";

const achievements = [
  { id: 1, title: "First Course", icon: "🎓", earned: true },
  { id: 2, title: "Quiz Master", icon: "🏆", earned: true },
  { id: 3, title: "Trading Pro", icon: "📈", earned: true },
  { id: 4, title: "Streak King", icon: "🔥", earned: false },
  { id: 5, title: "Top 10", icon: "⭐", earned: false },
  { id: 6, title: "Perfect Score", icon: "💯", earned: false },
];

export function ProfileScreen() {
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 shadow-md">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl">My Profile</h2>
            <Settings className="w-6 h-6 cursor-pointer hover:rotate-45 transition-transform" />
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4 space-y-6">
        {/* User Info Card */}
        <Card className="p-6 border-2 border-blue-100">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-3xl">
              👤
            </div>
            <div className="flex-1">
              <h3 className="text-xl text-gray-800">Ahmed Ali</h3>
              <p className="text-sm text-gray-600">ahmed.ali@email.com</p>
              <Badge className="mt-2 bg-yellow-400 text-blue-900 hover:bg-yellow-500">
                <TrendingUp className="w-3 h-3 mr-1" />
                Intermediate Level
              </Badge>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-3 pt-4 border-t">
            <div className="text-center">
              <div className="text-2xl text-blue-600 mb-1">2,450</div>
              <div className="text-xs text-gray-600">Points</div>
            </div>
            <div className="text-center">
              <div className="text-2xl text-green-600 mb-1">12</div>
              <div className="text-xs text-gray-600">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl text-purple-600 mb-1">8</div>
              <div className="text-xs text-gray-600">Badges</div>
            </div>
          </div>
        </Card>

        {/* Progress Overview */}
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg text-gray-800">Learning Progress</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-700">Course Completion</span>
                <span className="text-gray-600">12 of 24 courses</span>
              </div>
              <Progress value={50} className="h-2" />
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-700">Quiz Performance</span>
                <span className="text-gray-600">85% average</span>
              </div>
              <Progress value={85} className="h-2 [&>div]:bg-green-500" />
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-700">Simulation Success</span>
                <span className="text-gray-600">78% win rate</span>
              </div>
              <Progress value={78} className="h-2 [&>div]:bg-purple-500" />
            </div>
          </div>
        </Card>

        {/* Achievements */}
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <Award className="w-5 h-5 text-yellow-500" />
            <h3 className="text-lg text-gray-800">Achievements</h3>
          </div>
          
          <div className="grid grid-cols-3 gap-3">
            {achievements.map((achievement) => (
              <div
                key={achievement.id}
                className={`p-3 rounded-xl text-center transition-all ${
                  achievement.earned 
                    ? "bg-gradient-to-br from-yellow-400 to-yellow-500 shadow-md" 
                    : "bg-gray-100 opacity-50"
                }`}
              >
                <div className="text-3xl mb-1">{achievement.icon}</div>
                <div className="text-xs text-gray-800">{achievement.title}</div>
              </div>
            ))}
          </div>
          
          <Button variant="outline" className="w-full mt-4">
            View All Badges
          </Button>
        </Card>

        {/* Settings & Preferences */}
        <Card className="p-4">
          <h3 className="text-lg text-gray-800 mb-4">Settings & Preferences</h3>
          
          <div className="space-y-2">
            <button className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-gray-600" />
                <span className="text-gray-800">Notifications</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
            
            <button className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-gray-600" />
                <span className="text-gray-800">Language</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">English</span>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
            </button>
            
            <button className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                <CreditCard className="w-5 h-5 text-gray-600" />
                <span className="text-gray-800">Payment Settings</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
            
            <button className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                <Award className="w-5 h-5 text-gray-600" />
                <span className="text-gray-800">Reward Redemption</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </Card>

        {/* Account Actions */}
        <div className="space-y-2">
          <Button variant="outline" className="w-full">
            Edit Profile
          </Button>
          <Button variant="ghost" className="w-full text-red-600 hover:text-red-700 hover:bg-red-50">
            Sign Out
          </Button>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
