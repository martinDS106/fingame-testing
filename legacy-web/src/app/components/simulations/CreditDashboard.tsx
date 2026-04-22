import { ArrowLeft, TrendingUp, CreditCard, CheckCircle, AlertCircle, Star, Target } from "lucide-react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import { useNavigate } from "react-router";

export function CreditDashboard() {
  const navigate = useNavigate();
  const creditScore = 720;
  const maxScore = 850;
  const scorePercent = (creditScore / maxScore) * 100;

  const getScoreCategory = (score: number) => {
    if (score >= 800) return { label: "Excellent", color: "text-green-600", bg: "bg-green-100" };
    if (score >= 740) return { label: "Very Good", color: "text-blue-600", bg: "bg-blue-100" };
    if (score >= 670) return { label: "Good", color: "text-yellow-600", bg: "bg-yellow-100" };
    if (score >= 580) return { label: "Fair", color: "text-orange-600", bg: "bg-orange-100" };
    return { label: "Poor", color: "text-red-600", bg: "bg-red-100" };
  };

  const category = getScoreCategory(creditScore);

  const factors = [
    { name: "Payment History", score: 95, weight: "35%", status: "excellent" },
    { name: "Credit Utilization", score: 78, weight: "30%", status: "good" },
    { name: "Credit Mix", score: 65, weight: "15%", status: "fair" },
    { name: "Account Age", score: 82, weight: "15%", status: "good" },
    { name: "New Credit", score: 88, weight: "10%", status: "excellent" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-600 to-orange-700 text-white p-4 shadow-md">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <button onClick={() => navigate("/simulation-hub")} className="hover:bg-white/10 p-1 rounded">
                <ArrowLeft className="w-6 h-6" />
              </button>
              <h2 className="text-xl">Credit Score Builder</h2>
            </div>
            <div className="flex items-center gap-2 bg-yellow-400 text-orange-900 px-3 py-1 rounded-full">
              <Star className="w-4 h-4" />
              <span className="text-sm">0 pts</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4 space-y-4">
        {/* Credit Score Meter */}
        <Card className="p-6 bg-gradient-to-br from-orange-600 to-orange-700 text-white border-0 shadow-xl">
          <div className="text-center mb-6">
            <p className="text-sm text-orange-100 mb-2">Your Credit Score</p>
            
            {/* Score Circle */}
            <div className="relative w-48 h-48 mx-auto mb-4">
              <svg className="w-full h-full -rotate-90">
                <circle
                  cx="96"
                  cy="96"
                  r="88"
                  fill="none"
                  stroke="rgba(255,255,255,0.2)"
                  strokeWidth="12"
                />
                <circle
                  cx="96"
                  cy="96"
                  r="88"
                  fill="none"
                  stroke="white"
                  strokeWidth="12"
                  strokeDasharray={`${scorePercent * 5.53} 553`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-6xl">{creditScore}</div>
                <div className="text-sm text-orange-100">out of {maxScore}</div>
              </div>
            </div>

            <Badge className={`${category.bg} ${category.color} border-0 text-lg px-4 py-1`}>
              {category.label}
            </Badge>
          </div>
        </Card>

        {/* Score Factors */}
        <Card className="p-4">
          <h3 className="text-gray-800 mb-4">Credit Score Factors</h3>
          <div className="space-y-4">
            {factors.map((factor, i) => {
              const statusIcon = factor.status === "excellent" 
                ? <CheckCircle className="w-4 h-4 text-green-600" />
                : factor.status === "good"
                ? <CheckCircle className="w-4 h-4 text-blue-600" />
                : <AlertCircle className="w-4 h-4 text-orange-600" />;

              return (
                <div key={i}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {statusIcon}
                      <span className="text-sm text-gray-700">{factor.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">{factor.score}%</span>
                      <Badge variant="outline" className="text-xs">{factor.weight}</Badge>
                    </div>
                  </div>
                  <Progress value={factor.score} className="h-2" />
                </div>
              );
            })}
          </div>
        </Card>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Card 
            className="p-4 cursor-pointer hover:shadow-lg transition-all"
            onClick={() => navigate("/simulation/credit/scenario")}
          >
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-3">
              <AlertCircle className="w-6 h-6 text-purple-600" />
            </div>
            <h4 className="text-sm text-gray-800">Try Scenario</h4>
            <p className="text-xs text-gray-600">See impact</p>
          </Card>

          <Card 
            className="p-4 cursor-pointer hover:shadow-lg transition-all"
            onClick={() => navigate("/simulation/credit/improvement")}
          >
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-3">
              <Target className="w-6 h-6 text-green-600" />
            </div>
            <h4 className="text-sm text-gray-800">Improve Score</h4>
            <p className="text-xs text-gray-600">Get tips</p>
          </Card>
        </div>

        {/* Credit Health Tips */}
        <Card className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <h4 className="text-gray-800 mb-2 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            Credit Health Tips
          </h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>✓ Pay all bills on time - Most important factor</li>
            <li>✓ Keep credit utilization below 30%</li>
            <li>✓ Don't close old credit accounts</li>
            <li>✓ Limit new credit applications</li>
          </ul>
        </Card>

        {/* BNPL Simulator */}
        <Card 
          className="p-4 bg-gradient-to-r from-yellow-400 to-yellow-500 border-0 cursor-pointer hover:shadow-lg transition-all"
          onClick={() => navigate("/simulation/credit/bnpl")}
        >
          <div className="flex items-center gap-3">
            <CreditCard className="w-12 h-12 text-yellow-700" />
            <div className="flex-1">
              <h4 className="text-blue-900 mb-1">BNPL Impact Simulator</h4>
              <p className="text-sm text-blue-800">
                See how Buy Now Pay Later affects your credit
              </p>
            </div>
            <Button variant="secondary" size="sm">
              Try
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
