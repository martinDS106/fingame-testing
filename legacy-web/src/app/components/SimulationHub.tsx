import { ArrowLeft, Wallet, TrendingUp, PiggyBank, CreditCard, Lock, Star, Trophy, DollarSign, Briefcase } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { BottomNav } from "./BottomNav";
import { useNavigate } from "react-router";

const simulations = [
  {
    id: "banking",
    title: "Virtual Banking",
    description: "Manage accounts, track expenses, and set savings goals",
    icon: Wallet,
    difficulty: "Beginner",
    color: "from-blue-500 to-blue-600",
    unlocked: true,
    progress: 75,
    points: 450,
    path: "/simulation/banking",
  },
  {
    id: "investment",
    title: "Investment Portfolio",
    description: "Trade stocks and build a diversified portfolio",
    icon: TrendingUp,
    difficulty: "Intermediate",
    color: "from-green-500 to-green-600",
    unlocked: true,
    progress: 40,
    points: 280,
    path: "/simulation/investment",
  },
  {
    id: "gold",
    title: "Gold & Silver Trading",
    description: "Invest in precious metals and understand market dynamics",
    icon: DollarSign,
    difficulty: "Intermediate",
    color: "from-yellow-500 to-yellow-600",
    unlocked: true,
    progress: 30,
    points: 180,
    path: "/simulation/gold",
  },
  {
    id: "business",
    title: "Business Simulation",
    description: "Start and manage your own business from scratch",
    icon: Briefcase,
    difficulty: "Advanced",
    color: "from-purple-500 to-purple-600",
    unlocked: true,
    progress: 15,
    points: 320,
    path: "/simulation/business",
  },
  {
    id: "finance",
    title: "Personal Finance",
    description: "Budget planning and expense management",
    icon: PiggyBank,
    difficulty: "Beginner",
    color: "from-indigo-500 to-indigo-600",
    unlocked: true,
    progress: 60,
    points: 220,
    path: "/simulation/banking",
  },
  {
    id: "credit",
    title: "Credit Score Builder",
    description: "Understand and improve your credit health",
    icon: CreditCard,
    difficulty: "Advanced",
    color: "from-orange-500 to-red-500",
    unlocked: false,
    progress: 0,
    points: 0,
    path: "/simulation/credit",
  },
];

export function SimulationHub() {
  const navigate = useNavigate();
  const userLevel = 8;
  const userXP = 3250;
  const nextLevelXP = 4000;
  const xpProgress = ((userXP % 1000) / 1000) * 100;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header with XP */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 shadow-md">
        <div className="max-w-md mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <button onClick={() => navigate("/dashboard")} className="hover:bg-white/10 p-1 rounded">
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h2 className="text-xl flex-1">Simulations</h2>
            
            {/* Points Display */}
            <div className="flex items-center gap-2 bg-yellow-400 text-blue-900 px-3 py-1 rounded-full">
              <Star className="w-4 h-4" />
              <span className="text-sm">2,450 pts</span>
            </div>
          </div>

          {/* Level & XP Bar */}
          <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-300" />
                <span className="text-sm">Level {userLevel}</span>
              </div>
              <span className="text-sm text-white/80">{userXP} / {nextLevelXP} XP</span>
            </div>
            <div className="bg-white/20 rounded-full h-2">
              <div 
                className="bg-yellow-400 h-full rounded-full transition-all"
                style={{ width: `${xpProgress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4 space-y-4">
        {/* Intro Card */}
        <Card className="p-4 bg-gradient-to-r from-yellow-50 to-blue-50 border-blue-200">
          <h3 className="text-gray-800 mb-2">🎮 Choose Your Simulation</h3>
          <p className="text-sm text-gray-600">
            Practice real-world financial scenarios in a safe environment. Complete challenges to earn points and unlock new levels!
          </p>
        </Card>

        {/* Simulation Cards */}
        <div className="space-y-4">
          {simulations.map((sim) => {
            const Icon = sim.icon;
            
            return (
              <Card 
                key={sim.id}
                className={`p-4 transition-all ${
                  sim.unlocked 
                    ? "hover:shadow-lg cursor-pointer border-2 hover:border-blue-300" 
                    : "opacity-60"
                }`}
                onClick={() => sim.unlocked && navigate(sim.path)}
              >
                <div className="flex gap-4">
                  <div className={`w-16 h-16 bg-gradient-to-br ${sim.color} rounded-xl flex items-center justify-center flex-shrink-0 relative`}>
                    {sim.unlocked ? (
                      <Icon className="w-8 h-8 text-white" />
                    ) : (
                      <Lock className="w-8 h-8 text-white" />
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-1">
                      <h4 className="text-gray-800">{sim.title}</h4>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${
                          sim.difficulty === "Beginner" 
                            ? "border-green-300 text-green-700" 
                            : sim.difficulty === "Intermediate"
                            ? "border-blue-300 text-blue-700"
                            : "border-red-300 text-red-700"
                        }`}
                      >
                        {sim.difficulty}
                      </Badge>
                    </div>

                    <p className="text-sm text-gray-600 mb-3">{sim.description}</p>

                    {sim.unlocked ? (
                      <>
                        <div className="flex justify-between text-xs text-gray-600 mb-1">
                          <span>Progress</span>
                          <span>{sim.progress}%</span>
                        </div>
                        <div className="bg-gray-200 rounded-full h-2 mb-2">
                          <div 
                            className={`bg-gradient-to-r ${sim.color} h-full rounded-full`}
                            style={{ width: `${sim.progress}%` }}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                            <span>{sim.points} points earned</span>
                          </div>
                          <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                            Continue
                          </Button>
                        </div>
                      </>
                    ) : (
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Lock className="w-4 h-4" />
                        <span>Complete "Personal Finance" to unlock</span>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Achievement Preview */}
        <Card className="p-4 bg-gradient-to-r from-purple-500 to-blue-600 text-white border-0">
          <div className="flex items-center gap-3">
            <Trophy className="w-12 h-12" />
            <div>
              <h4 className="mb-1">Master All Simulations</h4>
              <p className="text-sm text-white/80">
                Complete all 4 simulations to earn the "Financial Expert" badge and 2000 bonus points!
              </p>
            </div>
          </div>
        </Card>
      </div>

      <BottomNav />
    </div>
  );
}