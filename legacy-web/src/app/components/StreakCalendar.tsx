import { ArrowLeft, Flame, Star, Clock, Coffee } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { useNavigate } from "react-router";

export function StreakCalendar() {
  const navigate = useNavigate();
  const currentStreak = 23;
  const longestStreak = 45;

  // Generate calendar for current month
  const days = Array.from({ length: 30 }, (_, i) => ({
    day: i + 1,
    completed: i < 23,
    isMilestone: [7, 14, 21, 30].includes(i + 1),
  }));

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white p-4 shadow-md">
        <div className="max-w-md mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <button onClick={() => navigate("/dashboard")} className="hover:bg-white/10 p-1 rounded">
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h2 className="text-xl">Learning Streak</h2>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4 space-y-4">
        {/* Streak Stats */}
        <Card className="p-6 bg-gradient-to-br from-orange-500 to-red-600 text-white border-0">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
              <Flame className="w-10 h-10" />
            </div>
            <div>
              <p className="text-sm text-orange-100">Current Streak</p>
              <p className="text-5xl">{currentStreak}</p>
              <p className="text-sm text-orange-100">days</p>
            </div>
          </div>
          
          <div className="flex gap-4 text-center">
            <div className="flex-1 bg-white/20 backdrop-blur-sm rounded-lg p-3">
              <p className="text-sm text-orange-100">Longest</p>
              <p className="text-2xl">{longestStreak}</p>
            </div>
            <div className="flex-1 bg-white/20 backdrop-blur-sm rounded-lg p-3">
              <p className="text-sm text-orange-100">This Month</p>
              <p className="text-2xl">{currentStreak}</p>
            </div>
          </div>
        </Card>

        {/* Calendar */}
        <Card className="p-4">
          <h3 className="text-gray-800 mb-4">March 2026</h3>
          <div className="grid grid-cols-7 gap-2">
            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
              <div key={day} className="text-center text-xs text-gray-600 p-2">
                {day}
              </div>
            ))}
            {days.map((day) => (
              <div
                key={day.day}
                className={`aspect-square flex items-center justify-center rounded-lg text-sm relative ${
                  day.completed
                    ? "bg-gradient-to-br from-orange-400 to-orange-600 text-white"
                    : "bg-gray-100 text-gray-400"
                }`}
              >
                {day.day}
                {day.isMilestone && day.completed && (
                  <Star className="w-3 h-3 text-yellow-300 absolute -top-1 -right-1 fill-yellow-300" />
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* Milestones */}
        <Card className="p-4">
          <h3 className="text-gray-800 mb-3">Upcoming Milestones</h3>
          <div className="space-y-2">
            {[
              { days: 30, reward: "100 Coins", reached: false },
              { days: 50, reward: "Special Badge", reached: false },
              { days: 100, reward: "Lightning Streak", reached: false },
            ].map((milestone, i) => (
              <div
                key={i}
                className={`flex items-center justify-between p-3 rounded-lg ${
                  milestone.reached ? "bg-green-50" : "bg-gray-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    milestone.reached ? "bg-green-500" : "bg-gray-300"
                  }`}>
                    <Flame className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-800">{milestone.days} Days</p>
                    <p className="text-xs text-gray-600">{milestone.reward}</p>
                  </div>
                </div>
                <Badge variant="outline">
                  {milestone.days - currentStreak} to go
                </Badge>
              </div>
            ))}
          </div>
        </Card>

        {/* Streak Protection */}
        <Card className="p-4">
          <h3 className="text-gray-800 mb-3">Streak Protection</h3>
          <div className="grid grid-cols-3 gap-2">
            <Button variant="outline" className="flex flex-col items-center gap-2 h-auto py-3">
              <Clock className="w-5 h-5 text-blue-600" />
              <span className="text-xs">Freeze</span>
              <span className="text-xs text-gray-500">50 coins</span>
            </Button>
            <Button variant="outline" className="flex flex-col items-center gap-2 h-auto py-3">
              <Coffee className="w-5 h-5 text-purple-600" />
              <span className="text-xs">Vacation</span>
              <span className="text-xs text-gray-500">100 coins</span>
            </Button>
            <Button variant="outline" className="flex flex-col items-center gap-2 h-auto py-3">
              <Star className="w-5 h-5 text-yellow-600" />
              <span className="text-xs">Repair</span>
              <span className="text-xs text-gray-500">150 coins</span>
            </Button>
          </div>
        </Card>

        {/* Tips */}
        <Card className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <h4 className="text-gray-800 mb-2">💡 Streak Tips</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Complete any activity daily to maintain your streak</li>
            <li>• Use freeze to protect your streak when needed</li>
            <li>• Reach milestones to earn special rewards</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
