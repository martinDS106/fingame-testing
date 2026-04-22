import { ArrowLeft, Search, Filter, CreditCard, Wallet, TrendingUp, Shield, Smartphone, Building2, DollarSign } from "lucide-react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { CoinsCounter } from "../CoinsCounter";
import { BottomNav } from "../BottomNav";
import { useNavigate } from "react-router";

const categories = [
  {
    id: "bank-accounts",
    title: "Bank Accounts",
    description: "Compare savings & current accounts",
    icon: Building2,
    color: "from-blue-500 to-blue-600",
    count: 24,
  },
  {
    id: "credit-cards",
    title: "Credit Cards",
    description: "Find the best card for you",
    icon: CreditCard,
    color: "from-purple-500 to-purple-600",
    count: 18,
  },
  {
    id: "loans",
    title: "Loans",
    description: "Personal, car & home loans",
    icon: DollarSign,
    color: "from-green-500 to-green-600",
    count: 32,
  },
  {
    id: "investments",
    title: "Investment Products",
    description: "Mutual funds & certificates",
    icon: TrendingUp,
    color: "from-orange-500 to-orange-600",
    count: 15,
  },
  {
    id: "insurance",
    title: "Insurance",
    description: "Life, health & auto coverage",
    icon: Shield,
    color: "from-red-500 to-red-600",
    count: 21,
  },
  {
    id: "mobile-wallets",
    title: "Mobile Wallets",
    description: "Digital payment solutions",
    icon: Smartphone,
    color: "from-indigo-500 to-indigo-600",
    count: 12,
  },
  {
    id: "fintech-apps",
    title: "Fintech Apps",
    description: "Modern financial services",
    icon: Wallet,
    color: "from-yellow-500 to-yellow-600",
    count: 9,
  },
];

export function MarketplaceHome() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 shadow-md">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <button onClick={() => navigate("/dashboard")} className="hover:bg-white/10 p-1 rounded">
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div>
                <h2 className="text-xl">Marketplace</h2>
                <p className="text-sm text-blue-100">Compare. Learn. Choose Smart.</p>
              </div>
            </div>
            <CoinsCounter coins={2450} />
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search financial products..."
              className="pl-10 pr-10 bg-white border-gray-200"
            />
            <button className="absolute right-3 top-1/2 -translate-y-1/2">
              <Filter className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4 space-y-4">
        {/* Marketplace Level Progress */}
        <Card className="p-4 bg-gradient-to-r from-purple-500 to-blue-600 text-white border-0">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-sm text-white/80">Marketplace Level</p>
              <p className="text-2xl">Explorer</p>
            </div>
            <Badge className="bg-yellow-400 text-purple-900 border-0">
              Level 3
            </Badge>
          </div>
          <div className="bg-white/20 rounded-full h-2">
            <div className="bg-yellow-400 h-full rounded-full" style={{ width: "60%" }} />
          </div>
          <p className="text-xs text-white/80 mt-2">Compare 4 more products to level up</p>
        </Card>

        {/* Recommended For You */}
        <div>
          <h3 className="text-gray-800 mb-3 flex items-center gap-2">
            <span>🌟</span>
            Recommended For You
          </h3>
          <Card className="p-4 bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm text-gray-800 mb-1">Student Credit Card</h4>
                <p className="text-xs text-gray-600 mb-2">Based on your profile & budget habits</p>
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                  View Details
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Categories */}
        <div>
          <h3 className="text-gray-800 mb-3">Browse Categories</h3>
          <div className="grid grid-cols-1 gap-3">
            {categories.map((category) => {
              const Icon = category.icon;
              
              return (
                <Card 
                  key={category.id}
                  className="p-4 cursor-pointer hover:shadow-lg transition-all"
                  onClick={() => {
                    if (category.id === "credit-cards") {
                      navigate("/marketplace/credit-cards");
                    } else if (category.id === "loans") {
                      navigate("/marketplace/loan-calculator");
                    } else {
                      navigate(`/marketplace/${category.id}`);
                    }
                  }}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 bg-gradient-to-br ${category.color} rounded-xl flex items-center justify-center flex-shrink-0 shadow-md`}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-gray-800 mb-1">{category.title}</h4>
                      <p className="text-sm text-gray-600">{category.description}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className="text-xs">
                        {category.count}
                      </Badge>
                      <Button 
                        size="sm" 
                        className="mt-2 bg-blue-600 hover:bg-blue-700 text-xs"
                      >
                        Compare
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Earn Coins */}
        <Card className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
          <h4 className="text-gray-800 mb-3">💰 Earn Coins in Marketplace</h4>
          <div className="space-y-2 text-sm text-gray-700">
            <div className="flex justify-between">
              <span>• Compare 10 products</span>
              <span className="text-yellow-600">+50 coins</span>
            </div>
            <div className="flex justify-between">
              <span>• Submit first application</span>
              <span className="text-yellow-600">+100 coins</span>
            </div>
            <div className="flex justify-between">
              <span>• Write a review</span>
              <span className="text-yellow-600">+25 coins</span>
            </div>
            <div className="flex justify-between">
              <span>• Referral application</span>
              <span className="text-yellow-600">+150 coins</span>
            </div>
          </div>
        </Card>
      </div>

      <BottomNav />
    </div>
  );
}