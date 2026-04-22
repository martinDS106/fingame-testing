import { Gift, ShoppingBag, Ticket, Star, Coins } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { BottomNav } from "./BottomNav";

const rewards = [
  {
    id: 1,
    title: "Carrefour Gift Card",
    category: "Gift Cards",
    points: 500,
    image: "🛒",
    description: "SAR 50 Carrefour voucher",
    available: true,
  },
  {
    id: 2,
    title: "Amazon Voucher",
    category: "Gift Cards",
    points: 1000,
    image: "📦",
    description: "SAR 100 Amazon credit",
    available: true,
  },
  {
    id: 3,
    title: "Course Discount",
    category: "Discounts",
    points: 200,
    image: "🎓",
    description: "20% off premium courses",
    available: true,
  },
  {
    id: 4,
    title: "Coffee Voucher",
    category: "Discounts",
    points: 150,
    image: "☕",
    description: "Free coffee at selected cafes",
    available: true,
  },
  {
    id: 5,
    title: "Investment Book",
    category: "Exclusive Offers",
    points: 800,
    image: "📚",
    description: "Best-selling finance book",
    available: true,
  },
  {
    id: 6,
    title: "Premium Access",
    category: "Exclusive Offers",
    points: 2000,
    image: "⭐",
    description: "1 month premium features",
    available: false,
  },
];

const categories = [
  { name: "All", icon: ShoppingBag },
  { name: "Gift Cards", icon: Gift },
  { name: "Discounts", icon: Ticket },
  { name: "Exclusive", icon: Star },
];

export function RewardMarketplace() {
  const userPoints = 2450;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 shadow-md">
        <div className="max-w-md mx-auto">
          <h2 className="text-xl mb-4">Reward Marketplace</h2>
          
          {/* Points Balance */}
          <div className="bg-yellow-400 text-blue-900 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Coins className="w-8 h-8" />
              <div>
                <p className="text-sm opacity-80">Your Balance</p>
                <p className="text-2xl">{userPoints} Points</p>
              </div>
            </div>
            <Button size="sm" variant="secondary">
              Earn More
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4 space-y-4">
        {/* Category Filter */}
        <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <Button
                key={category.name}
                variant="outline"
                className="flex-shrink-0 gap-2"
              >
                <Icon className="w-4 h-4" />
                {category.name}
              </Button>
            );
          })}
        </div>

        {/* Rewards Grid */}
        <div className="grid grid-cols-1 gap-4">
          {rewards.map((reward) => {
            const canAfford = userPoints >= reward.points;
            
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
                      <h4 className="text-gray-800">{reward.title}</h4>
                      {!reward.available && (
                        <Badge variant="outline" className="text-xs">
                          Out of Stock
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-2">
                      {reward.description}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Coins className="w-4 h-4 text-yellow-500" />
                        <span className={`text-sm ${
                          canAfford ? "text-blue-600" : "text-red-600"
                        }`}>
                          {reward.points} points
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

        {/* Info Card */}
        <Card className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
          <div className="flex items-center gap-3">
            <div className="text-3xl">💡</div>
            <div>
              <h4 className="text-gray-800 mb-1">Earn More Points!</h4>
              <p className="text-sm text-gray-600">
                Complete courses, ace quizzes, and win simulations to earn points faster.
              </p>
            </div>
          </div>
        </Card>
      </div>

      <BottomNav />
      
      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
