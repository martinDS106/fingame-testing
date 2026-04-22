import { ArrowLeft, Coins, Gift, Ticket, Star, ShoppingBag, Trophy } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";
import { BottomNav } from "./BottomNav";
import { useNavigate } from "react-router";
import { useState } from "react";

const rewards = [
  {
    id: 1,
    title: "Carrefour Gift Card",
    category: "vouchers",
    coins: 500,
    image: "🛒",
    description: "EGP 50 shopping voucher",
    available: true,
    stock: 15,
  },
  {
    id: 2,
    title: "Amazon Voucher",
    category: "vouchers",
    coins: 1000,
    image: "📦",
    description: "EGP 100 Amazon credit",
    available: true,
    stock: 8,
  },
  {
    id: 3,
    title: "Premium Course Access",
    category: "courses",
    coins: 200,
    image: "🎓",
    description: "1 month premium access",
    available: true,
    stock: 50,
  },
  {
    id: 4,
    title: "Coffee Voucher",
    category: "discounts",
    coins: 150,
    image: "☕",
    description: "Free coffee at Starbucks",
    available: true,
    stock: 25,
  },
  {
    id: 5,
    title: "Financial Book",
    category: "exclusive",
    coins: 800,
    image: "📚",
    description: "Rich Dad Poor Dad",
    available: true,
    stock: 5,
  },
  {
    id: 6,
    title: "Streak Freeze",
    category: "power-ups",
    coins: 50,
    image: "❄️",
    description: "1-day streak protection",
    available: true,
    stock: 999,
  },
  {
    id: 7,
    title: "XP Booster",
    category: "power-ups",
    coins: 100,
    image: "⚡",
    description: "2x XP for 24 hours",
    available: true,
    stock: 999,
  },
  {
    id: 8,
    title: "Golden Badge",
    category: "exclusive",
    coins: 2000,
    image: "🏆",
    description: "Exclusive profile badge",
    available: false,
    stock: 0,
  },
];

export function EnhancedMarketplace() {
  const navigate = useNavigate();
  const [category, setCategory] = useState("all");
  const userCoins = 2450;

  const filteredRewards = category === "all" 
    ? rewards 
    : rewards.filter(r => r.category === category);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 shadow-md">
        <div className="max-w-md mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <button onClick={() => navigate("/dashboard")} className="hover:bg-white/10 p-1 rounded">
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h2 className="text-xl">Marketplace</h2>
          </div>

          {/* Coins Balance */}
          <div className="bg-yellow-400 text-blue-900 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Coins className="w-8 h-8" />
              <div>
                <p className="text-sm opacity-80">Your Balance</p>
                <p className="text-3xl">{userCoins}</p>
              </div>
            </div>
            <Button 
              size="sm" 
              variant="secondary"
              onClick={() => navigate("/coins-history")}
            >
              History
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4 space-y-4">
        {/* Category Tabs */}
        <Tabs value={category} onValueChange={setCategory}>
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="all" className="text-xs">
              <ShoppingBag className="w-3 h-3 mr-1" />
              All
            </TabsTrigger>
            <TabsTrigger value="vouchers" className="text-xs">
              <Gift className="w-3 h-3 mr-1" />
              Vouchers
            </TabsTrigger>
            <TabsTrigger value="power-ups" className="text-xs">
              <Star className="w-3 h-3 mr-1" />
              Power-Ups
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Featured Offer */}
        <Card className="p-4 bg-gradient-to-r from-purple-500 to-blue-600 text-white border-0">
          <div className="flex items-center gap-3">
            <Trophy className="w-12 h-12" />
            <div className="flex-1">
              <Badge className="bg-yellow-400 text-purple-900 border-0 mb-2">Limited Time</Badge>
              <h4 className="mb-1">Weekend Special</h4>
              <p className="text-sm text-white/80">All vouchers 20% off!</p>
            </div>
          </div>
        </Card>

        {/* Rewards Grid */}
        <div className="grid grid-cols-1 gap-3">
          {filteredRewards.map((reward) => {
            const canAfford = userCoins >= reward.coins;
            
            return (
              <Card 
                key={reward.id} 
                className={`p-4 transition-all hover:shadow-lg ${
                  !reward.available || !canAfford ? "opacity-60" : ""
                }`}
              >
                <div className="flex gap-4">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl flex items-center justify-center text-4xl flex-shrink-0">
                    {reward.image}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-1">
                      <h4 className="text-sm text-gray-800">{reward.title}</h4>
                      {!reward.available ? (
                        <Badge variant="outline" className="text-xs border-red-300 text-red-600">
                          Out of Stock
                        </Badge>
                      ) : reward.stock < 10 ? (
                        <Badge variant="outline" className="text-xs border-orange-300 text-orange-600">
                          Only {reward.stock} left
                        </Badge>
                      ) : null}
                    </div>
                    
                    <p className="text-xs text-gray-600 mb-3">
                      {reward.description}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Coins className="w-4 h-4 text-yellow-500" />
                        <span className={`text-sm ${
                          canAfford ? "text-blue-600" : "text-red-600"
                        }`}>
                          {reward.coins}
                        </span>
                      </div>
                      
                      <Button 
                        size="sm"
                        disabled={!reward.available || !canAfford}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        {!reward.available ? "Unavailable" : !canAfford ? "Not Enough" : "Redeem"}
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Earn More Coins */}
        <Card className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
          <h4 className="text-gray-800 mb-3">💰 Earn More Coins</h4>
          <div className="space-y-2 text-sm text-gray-700">
            <div className="flex justify-between">
              <span>• Complete daily quiz</span>
              <span className="text-yellow-600">+25 coins</span>
            </div>
            <div className="flex justify-between">
              <span>• Finish a course</span>
              <span className="text-yellow-600">+100 coins</span>
            </div>
            <div className="flex justify-between">
              <span>• Execute a trade</span>
              <span className="text-yellow-600">+25 coins</span>
            </div>
            <div className="flex justify-between">
              <span>• 7-day streak</span>
              <span className="text-yellow-600">+50 coins</span>
            </div>
          </div>
        </Card>
      </div>

      <BottomNav />
    </div>
  );
}
