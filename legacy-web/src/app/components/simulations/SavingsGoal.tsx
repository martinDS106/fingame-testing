import { ArrowLeft, Target, Calendar, DollarSign, Star, Trophy } from "lucide-react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Input } from "../ui/input";
import { Switch } from "../ui/switch";
import { Label } from "../ui/label";
import { useNavigate } from "react-router";
import { useState } from "react";

export function SavingsGoal() {
  const navigate = useNavigate();
  const [goalName, setGoalName] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [deadline, setDeadline] = useState("");
  const [autoSave, setAutoSave] = useState(false);

  const existingGoals = [
    {
      name: "Emergency Fund",
      target: 10000,
      current: 6500,
      deadline: "Dec 2026",
      icon: "🚨",
    },
    {
      name: "Vacation",
      target: 5000,
      current: 3200,
      deadline: "Jun 2026",
      icon: "✈️",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-4 shadow-md">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <button onClick={() => navigate("/simulation/banking")} className="hover:bg-white/10 p-1 rounded">
                <ArrowLeft className="w-6 h-6" />
              </button>
              <h2 className="text-xl">Savings Goals</h2>
            </div>
            <div className="flex items-center gap-2 bg-yellow-400 text-purple-900 px-3 py-1 rounded-full">
              <Star className="w-4 h-4" />
              <span className="text-sm">450 pts</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4 space-y-4">
        {/* Active Goals */}
        <div>
          <h3 className="text-gray-800 mb-3">Your Goals</h3>
          <div className="space-y-3">
            {existingGoals.map((goal, i) => {
              const progress = (goal.current / goal.target) * 100;
              const isComplete = progress >= 100;

              return (
                <Card key={i} className={`p-4 ${isComplete ? "border-2 border-green-500" : ""}`}>
                  <div className="flex items-start gap-3 mb-3">
                    <div className="text-3xl">{goal.icon}</div>
                    <div className="flex-1">
                      <h4 className="text-gray-800 mb-1">{goal.name}</h4>
                      <p className="text-sm text-gray-600">
                        EGP {goal.current.toLocaleString()} of EGP {goal.target.toLocaleString()}
                      </p>
                    </div>
                    {isComplete && (
                      <Trophy className="w-6 h-6 text-yellow-500" />
                    )}
                  </div>

                  <div className="mb-2">
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>{Math.round(progress)}% Complete</span>
                      <span>Due: {goal.deadline}</span>
                    </div>
                    <div className="bg-gray-200 rounded-full h-3">
                      <div 
                        className={`h-full rounded-full ${
                          isComplete 
                            ? "bg-gradient-to-r from-green-400 to-green-600" 
                            : "bg-gradient-to-r from-purple-400 to-purple-600"
                        }`}
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      />
                    </div>
                  </div>

                  {isComplete ? (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-3">
                      <p className="text-sm text-green-700 flex items-center gap-2">
                        <Trophy className="w-4 h-4" />
                        Goal completed! +100 points earned 🎉
                      </p>
                    </div>
                  ) : (
                    <Button variant="outline" size="sm" className="w-full mt-2">
                      Add Funds
                    </Button>
                  )}
                </Card>
              );
            })}
          </div>
        </div>

        {/* Create New Goal */}
        <Card className="p-4">
          <h3 className="text-gray-800 mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-purple-600" />
            Create New Goal
          </h3>

          <div className="space-y-4">
            <div>
              <Label htmlFor="goalName">Goal Name</Label>
              <Input
                id="goalName"
                placeholder="e.g., New Car, Wedding"
                value={goalName}
                onChange={(e) => setGoalName(e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="targetAmount">Target Amount (EGP)</Label>
              <div className="relative mt-1">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="targetAmount"
                  type="number"
                  placeholder="10000"
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="deadline">Deadline</Label>
              <div className="relative mt-1">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="deadline"
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
              <div>
                <Label htmlFor="autoSave" className="text-sm">Auto-Save Monthly</Label>
                <p className="text-xs text-gray-600">Automatically transfer to savings</p>
              </div>
              <Switch
                id="autoSave"
                checked={autoSave}
                onCheckedChange={setAutoSave}
              />
            </div>

            <Button className="w-full bg-purple-600 hover:bg-purple-700">
              Create Goal
            </Button>
          </div>
        </Card>

        {/* Tips Card */}
        <Card className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 border-purple-200">
          <h4 className="text-gray-800 mb-2">💡 Savings Tips</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Set realistic goals based on your income</li>
            <li>• Enable auto-save to build discipline</li>
            <li>• Break large goals into monthly milestones</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
