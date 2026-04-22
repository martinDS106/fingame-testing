import { ArrowLeft, Wallet, Send, Receipt, PiggyBank, Target, TrendingUp, Star } from "lucide-react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { useNavigate } from "react-router";

export function BankingDashboard() {
  const navigate = useNavigate();
  const balance = 15420.50;
  const savings = 8500.00;
  const financialHealth = 78;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 shadow-md">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <button onClick={() => navigate("/simulation-hub")} className="hover:bg-white/10 p-1 rounded">
                <ArrowLeft className="w-6 h-6" />
              </button>
              <h2 className="text-xl">Virtual Bank</h2>
            </div>
            <div className="flex items-center gap-2 bg-yellow-400 text-blue-900 px-3 py-1 rounded-full">
              <Star className="w-4 h-4" />
              <span className="text-sm">450 pts</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4 space-y-4">
        {/* Balance Card */}
        <Card className="p-6 bg-gradient-to-br from-blue-600 to-blue-700 text-white border-0 shadow-xl">
          <p className="text-sm text-blue-100 mb-1">Total Balance</p>
          <h2 className="text-4xl mb-4">EGP {balance.toLocaleString()}</h2>
          <div className="flex gap-3">
            <div className="flex-1 bg-white/20 backdrop-blur-sm rounded-lg p-3">
              <p className="text-xs text-blue-100">Wallet</p>
              <p className="text-lg">EGP {(balance - savings).toLocaleString()}</p>
            </div>
            <div className="flex-1 bg-white/20 backdrop-blur-sm rounded-lg p-3">
              <p className="text-xs text-blue-100">Savings</p>
              <p className="text-lg">EGP {savings.toLocaleString()}</p>
            </div>
          </div>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Card 
            className="p-4 cursor-pointer hover:shadow-lg transition-all"
            onClick={() => navigate("/simulation/banking/send")}
          >
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-3">
              <Send className="w-6 h-6 text-blue-600" />
            </div>
            <h4 className="text-sm text-gray-800">Send Money</h4>
          </Card>

          <Card 
            className="p-4 cursor-pointer hover:shadow-lg transition-all"
            onClick={() => navigate("/simulation/banking/bills")}
          >
            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center mb-3">
              <Receipt className="w-6 h-6 text-yellow-600" />
            </div>
            <h4 className="text-sm text-gray-800">Pay Bills</h4>
          </Card>

          <Card 
            className="p-4 cursor-pointer hover:shadow-lg transition-all"
            onClick={() => navigate("/simulation/banking/deposit")}
          >
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-3">
              <Wallet className="w-6 h-6 text-green-600" />
            </div>
            <h4 className="text-sm text-gray-800">Deposit</h4>
          </Card>

          <Card 
            className="p-4 cursor-pointer hover:shadow-lg transition-all"
            onClick={() => navigate("/simulation/banking/savings-goal")}
          >
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-3">
              <Target className="w-6 h-6 text-purple-600" />
            </div>
            <h4 className="text-sm text-gray-800">Savings Goal</h4>
          </Card>
        </div>

        {/* Financial Health */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-gray-800">Financial Health Score</h3>
            <TrendingUp className="w-5 h-5 text-green-600" />
          </div>
          <div className="flex items-end gap-2 mb-2">
            <span className="text-3xl text-blue-600">{financialHealth}</span>
            <span className="text-sm text-gray-600 mb-1">/ 100</span>
          </div>
          <div className="bg-gray-200 rounded-full h-3 mb-3">
            <div 
              className="bg-gradient-to-r from-green-400 to-green-600 h-full rounded-full"
              style={{ width: `${financialHealth}%` }}
            />
          </div>
          <p className="text-sm text-gray-600">
            Great job! Your financial habits are healthy. Keep saving regularly to reach 85+
          </p>
        </Card>

        {/* Recent Transactions */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-gray-800">Recent Activity</h3>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-blue-600"
              onClick={() => navigate("/simulation/banking/transactions")}
            >
              See All
            </Button>
          </div>
          <div className="space-y-3">
            {[
              { name: "Grocery Shopping", amount: -250, category: "Food", icon: "🛒" },
              { name: "Salary Deposit", amount: 5000, category: "Income", icon: "💰" },
              { name: "Netflix Subscription", amount: -150, category: "Entertainment", icon: "🎬" },
            ].map((tx, i) => (
              <div key={i} className="flex items-center gap-3 pb-3 border-b last:border-b-0">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-xl">
                  {tx.icon}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-800">{tx.name}</p>
                  <p className="text-xs text-gray-500">{tx.category}</p>
                </div>
                <span className={`text-sm ${tx.amount > 0 ? "text-green-600" : "text-gray-800"}`}>
                  {tx.amount > 0 ? "+" : ""}EGP {Math.abs(tx.amount)}
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* Challenge Button */}
        <Card 
          className="p-4 bg-gradient-to-r from-yellow-400 to-yellow-500 border-0 cursor-pointer hover:shadow-lg transition-all"
          onClick={() => navigate("/simulation/banking/challenge")}
        >
          <div className="flex items-center gap-3">
            <div className="text-3xl">🎯</div>
            <div className="flex-1">
              <h4 className="text-blue-900 mb-1">Try Scenario Challenge</h4>
              <p className="text-sm text-blue-800">
                Test your budgeting skills with real-life scenarios
              </p>
            </div>
            <Button variant="secondary" size="sm">
              Start
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
