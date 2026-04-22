import { Flame, Zap } from "lucide-react";
import { Card } from "./ui/card";
import { useNavigate } from "react-router";

interface StreakWidgetProps {
  days: number;
}

export function StreakWidget({ days }: StreakWidgetProps) {
  const navigate = useNavigate();

  const getFlameColor = () => {
    if (days >= 100) return { bg: "bg-gradient-to-br from-yellow-300 to-yellow-500", icon: <Zap className="w-6 h-6 text-yellow-600" /> };
    if (days >= 30) return { bg: "bg-gradient-to-br from-red-400 to-red-600", icon: <Flame className="w-6 h-6 text-white" /> };
    if (days >= 14) return { bg: "bg-gradient-to-br from-purple-400 to-purple-600", icon: <Flame className="w-6 h-6 text-white" /> };
    if (days >= 7) return { bg: "bg-gradient-to-br from-blue-400 to-blue-600", icon: <Flame className="w-6 h-6 text-white" /> };
    return { bg: "bg-gradient-to-br from-orange-400 to-orange-600", icon: <Flame className="w-6 h-6 text-white" /> };
  };

  const flame = getFlameColor();

  return (
    <Card 
      className="p-4 cursor-pointer hover:shadow-lg transition-all"
      onClick={() => navigate("/streak-calendar")}
    >
      <div className="flex items-center gap-3">
        <div className={`w-14 h-14 ${flame.bg} rounded-full flex items-center justify-center shadow-lg`}>
          {flame.icon}
        </div>
        <div>
          <p className="text-2xl text-gray-800">{days} Days</p>
          <p className="text-sm text-gray-600">Learning Streak 🔥</p>
        </div>
      </div>
    </Card>
  );
}
