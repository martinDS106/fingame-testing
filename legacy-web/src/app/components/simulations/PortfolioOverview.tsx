import { ArrowLeft, TrendingUp, TrendingDown, PieChart, Star, ShoppingCart } from "lucide-react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { useNavigate } from "react-router";

export function PortfolioOverview() {
  const navigate = useNavigate();
  const portfolioValue = 28450;
  const initialInvestment = 25000;
  const profitLoss = portfolioValue - initialInvestment;
  const profitLossPercent = ((profitLoss / initialInvestment) * 100).toFixed(2);
  const isProfit = profitLoss >= 0;

  const holdings = [
    { symbol: "CIB", name: "Commercial International Bank", shares: 50, value: 8500, allocation: 30, change: 5.2 },
    { symbol: "ETEL", name: "Etisalat Misr", shares: 100, value: 6200, allocation: 22, change: -2.1 },
    { symbol: "HRHO", name: "Hermes Holding", shares: 80, value: 5400, allocation: 19, change: 8.5 },
    { symbol: "PHDC", name: "Palm Hills", shares: 150, value: 4350, allocation: 15, change: 3.7 },
    { symbol: "EMFD", name: "EFG-Hermes", shares: 70, value: 4000, allocation: 14, change: -1.3 },
  ];

  const riskLevel = "Medium";
  const riskScore = 55;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-4 shadow-md">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <button onClick={() => navigate("/simulation-hub")} className="hover:bg-white/10 p-1 rounded">
                <ArrowLeft className="w-6 h-6" />
              </button>
              <h2 className="text-xl">Investment Portfolio</h2>
            </div>
            <div className="flex items-center gap-2 bg-yellow-400 text-green-900 px-3 py-1 rounded-full">
              <Star className="w-4 h-4" />
              <span className="text-sm">280 pts</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4 space-y-4">
        {/* Portfolio Value */}
        <Card className="p-6 bg-gradient-to-br from-green-600 to-green-700 text-white border-0 shadow-xl">
          <p className="text-sm text-green-100 mb-1">Total Portfolio Value</p>
          <h2 className="text-4xl mb-4">EGP {portfolioValue.toLocaleString()}</h2>
          
          <div className={`flex items-center gap-2 p-3 rounded-lg ${
            isProfit ? "bg-green-500/30" : "bg-red-500/30"
          }`}>
            {isProfit ? (
              <TrendingUp className="w-5 h-5" />
            ) : (
              <TrendingDown className="w-5 h-5" />
            )}
            <div>
              <p className="text-sm text-green-100">Profit/Loss</p>
              <p className="text-xl">
                {isProfit ? "+" : ""}EGP {profitLoss.toLocaleString()} ({profitLossPercent}%)
              </p>
            </div>
          </div>
        </Card>

        {/* Risk Meter */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-gray-800">Risk Level</h3>
            <Badge variant="outline" className="border-orange-300 text-orange-700">
              {riskLevel}
            </Badge>
          </div>
          <div className="bg-gray-200 rounded-full h-3 mb-2">
            <div 
              className="bg-gradient-to-r from-green-400 via-yellow-400 to-red-500 h-full rounded-full"
              style={{ width: `${riskScore}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-600">
            <span>Low Risk</span>
            <span>High Risk</span>
          </div>
        </Card>

        {/* Asset Allocation */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-gray-800">Asset Allocation</h3>
            <PieChart className="w-5 h-5 text-gray-600" />
          </div>
          
          <div className="space-y-2">
            {holdings.map((holding, i) => (
              <div key={i} className="flex items-center gap-2">
                <div 
                  className="h-3 rounded-full"
                  style={{ 
                    width: `${holding.allocation}%`,
                    background: `hsl(${i * 60}, 70%, 60%)`
                  }}
                />
                <span className="text-sm text-gray-600">{holding.symbol} ({holding.allocation}%)</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Holdings */}
        <Card className="p-4">
          <h3 className="text-gray-800 mb-3">Your Holdings</h3>
          <div className="space-y-3">
            {holdings.map((holding, i) => (
              <div 
                key={i} 
                className="p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => navigate("/simulation/investment/trade")}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="text-sm text-gray-800">{holding.symbol}</h4>
                    <p className="text-xs text-gray-600">{holding.name}</p>
                  </div>
                  <div className={`flex items-center gap-1 text-sm ${
                    holding.change >= 0 ? "text-green-600" : "text-red-600"
                  }`}>
                    {holding.change >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                    {holding.change >= 0 ? "+" : ""}{holding.change}%
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">{holding.shares} shares</span>
                  <span className="text-gray-800">EGP {holding.value.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <Button 
            onClick={() => navigate("/simulation/investment/market")}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            Browse Market
          </Button>
          <Button 
            onClick={() => navigate("/simulation/investment/challenge")}
            className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-blue-900 hover:from-yellow-500 hover:to-yellow-600"
          >
            Take Challenge
          </Button>
        </div>

        {/* Performance Card */}
        <Card className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
          <h4 className="text-gray-800 mb-2">📈 Portfolio Performance</h4>
          <p className="text-sm text-gray-600">
            Your portfolio is performing well! Consider diversifying into more sectors to reduce risk.
          </p>
        </Card>
      </div>
    </div>
  );
}
