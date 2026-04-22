import { ArrowLeft, Star, TrendingUp, Award } from "lucide-react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Slider } from "../ui/slider";
import { useNavigate } from "react-router";
import { useState } from "react";

export function ScenarioChallenge() {
  const navigate = useNavigate();
  const salary = 5000;
  const [savings, setSavings] = useState(20);
  const [rent, setRent] = useState(30);
  const [food, setFood] = useState(25);
  const [entertainment, setEntertainment] = useState(25);
  const [showResult, setShowResult] = useState(false);

  const total = savings + rent + food + entertainment;
  const isValid = total === 100;

  const calculateScore = () => {
    let score = 0;
    
    // Optimal allocations
    if (savings >= 20) score += 30;
    if (rent <= 35) score += 25;
    if (food <= 30) score += 25;
    if (entertainment <= 15) score += 20;
    
    return Math.min(score, 100);
  };

  const score = calculateScore();
  const pointsEarned = Math.round(score * 2);

  const getTips = () => {
    const tips = [];
    if (savings < 20) tips.push("Try to save at least 20% of your income");
    if (rent > 35) tips.push("Housing costs should ideally be under 35%");
    if (entertainment > 15) tips.push("Consider reducing entertainment spending");
    if (savings >= 20 && entertainment <= 15) tips.push("Great balance between saving and spending!");
    
    return tips;
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white p-4 shadow-md">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <button onClick={() => navigate("/simulation/banking")} className="hover:bg-white/10 p-1 rounded">
                <ArrowLeft className="w-6 h-6" />
              </button>
              <h2 className="text-xl">Scenario Challenge</h2>
            </div>
            <div className="flex items-center gap-2 bg-white text-orange-600 px-3 py-1 rounded-full">
              <Star className="w-4 h-4" />
              <span className="text-sm">450 pts</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4 space-y-4">
        {!showResult ? (
          <>
            {/* Scenario Description */}
            <Card className="p-5 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
              <h3 className="text-gray-800 mb-2">💼 Monthly Salary Scenario</h3>
              <p className="text-gray-700 mb-3">
                You just received your monthly salary of <span className="text-xl text-blue-600">EGP {salary}</span>
              </p>
              <p className="text-sm text-gray-600">
                Allocate your income wisely across the following categories. Aim for a balanced budget!
              </p>
            </Card>

            {/* Allocation Sliders */}
            <Card className="p-5">
              <h3 className="text-gray-800 mb-4">Budget Allocation</h3>

              <div className="space-y-6">
                {/* Savings */}
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-sm text-gray-700">💰 Savings</label>
                    <span className="text-sm text-blue-600">{savings}% (EGP {(salary * savings / 100).toFixed(0)})</span>
                  </div>
                  <Slider
                    value={[savings]}
                    onValueChange={(val) => setSavings(val[0])}
                    max={100}
                    step={5}
                    className="[&>span]:bg-green-500"
                  />
                </div>

                {/* Rent */}
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-sm text-gray-700">🏠 Rent/Housing</label>
                    <span className="text-sm text-blue-600">{rent}% (EGP {(salary * rent / 100).toFixed(0)})</span>
                  </div>
                  <Slider
                    value={[rent]}
                    onValueChange={(val) => setRent(val[0])}
                    max={100}
                    step={5}
                    className="[&>span]:bg-blue-500"
                  />
                </div>

                {/* Food */}
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-sm text-gray-700">🍔 Food & Groceries</label>
                    <span className="text-sm text-blue-600">{food}% (EGP {(salary * food / 100).toFixed(0)})</span>
                  </div>
                  <Slider
                    value={[food]}
                    onValueChange={(val) => setFood(val[0])}
                    max={100}
                    step={5}
                    className="[&>span]:bg-yellow-500"
                  />
                </div>

                {/* Entertainment */}
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-sm text-gray-700">🎮 Entertainment</label>
                    <span className="text-sm text-blue-600">{entertainment}% (EGP {(salary * entertainment / 100).toFixed(0)})</span>
                  </div>
                  <Slider
                    value={[entertainment]}
                    onValueChange={(val) => setEntertainment(val[0])}
                    max={100}
                    step={5}
                    className="[&>span]:bg-purple-500"
                  />
                </div>
              </div>

              {/* Total */}
              <div className="mt-6 pt-4 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Total Allocated</span>
                  <span className={`text-xl ${isValid ? "text-green-600" : "text-red-600"}`}>
                    {total}%
                  </span>
                </div>
                {!isValid && (
                  <p className="text-sm text-red-600 mt-2">
                    ⚠️ Total must equal 100%. Currently {total > 100 ? "over" : "under"} by {Math.abs(100 - total)}%
                  </p>
                )}
              </div>
            </Card>

            {/* Submit Button */}
            <Button
              disabled={!isValid}
              onClick={() => setShowResult(true)}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              Submit Budget
            </Button>
          </>
        ) : (
          <>
            {/* Results */}
            <Card className="p-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0">
              <div className="text-center">
                <Award className="w-16 h-16 mx-auto mb-3" />
                <h2 className="text-2xl mb-2">Financial Score</h2>
                <div className="text-6xl mb-3">{score}</div>
                <p className="text-blue-100">out of 100</p>
              </div>
            </Card>

            {/* Points Earned */}
            <Card className="p-5 bg-gradient-to-r from-yellow-400 to-yellow-500 border-0">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-blue-900 mb-1">Points Earned</h4>
                  <p className="text-3xl text-blue-900">+{pointsEarned}</p>
                </div>
                <Star className="w-12 h-12 text-yellow-600" />
              </div>
            </Card>

            {/* Breakdown */}
            <Card className="p-5">
              <h3 className="text-gray-800 mb-3">Your Budget Breakdown</h3>
              <div className="space-y-2">
                <div className="flex justify-between p-2 bg-green-50 rounded">
                  <span className="text-sm">💰 Savings</span>
                  <span className="text-sm text-green-600">{savings}% - EGP {(salary * savings / 100).toFixed(0)}</span>
                </div>
                <div className="flex justify-between p-2 bg-blue-50 rounded">
                  <span className="text-sm">🏠 Rent</span>
                  <span className="text-sm text-blue-600">{rent}% - EGP {(salary * rent / 100).toFixed(0)}</span>
                </div>
                <div className="flex justify-between p-2 bg-yellow-50 rounded">
                  <span className="text-sm">🍔 Food</span>
                  <span className="text-sm text-yellow-600">{food}% - EGP {(salary * food / 100).toFixed(0)}</span>
                </div>
                <div className="flex justify-between p-2 bg-purple-50 rounded">
                  <span className="text-sm">🎮 Entertainment</span>
                  <span className="text-sm text-purple-600">{entertainment}% - EGP {(salary * entertainment / 100).toFixed(0)}</span>
                </div>
              </div>
            </Card>

            {/* Tips */}
            <Card className="p-5 bg-blue-50 border-blue-200">
              <h4 className="text-gray-800 mb-3 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                Financial Tips
              </h4>
              <ul className="space-y-2">
                {getTips().map((tip, i) => (
                  <li key={i} className="text-sm text-gray-700">• {tip}</li>
                ))}
              </ul>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowResult(false)}
                className="flex-1"
              >
                Try Again
              </Button>
              <Button
                onClick={() => navigate("/simulation/banking")}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                Continue
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
