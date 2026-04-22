import { ArrowLeft, Filter, Star, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { Checkbox } from "../ui/checkbox";
import { CoinsCounter } from "../CoinsCounter";
import { BottomNav } from "../BottomNav";
import { useNavigate } from "react-router";
import { useState } from "react";

const creditCards = [
  {
    id: 1,
    bank: "CIB",
    logo: "🏦",
    name: "CIB Smart Credit Card",
    apr: 30,
    annualFee: 300,
    cashback: 2,
    rating: 4.5,
    tier: "strong",
    minIncome: 5000,
    benefits: ["Airport lounge", "Cashback", "Travel insurance"],
  },
  {
    id: 2,
    bank: "NBE",
    logo: "🏛️",
    name: "NBE Platinum Card",
    apr: 35,
    annualFee: 500,
    cashback: 1.5,
    rating: 4.2,
    tier: "moderate",
    minIncome: 8000,
    benefits: ["Reward points", "Purchase protection"],
  },
  {
    id: 3,
    bank: "Banque Misr",
    logo: "🏢",
    name: "Misr Gold Card",
    apr: 32,
    annualFee: 250,
    cashback: 1,
    rating: 4.0,
    tier: "strong",
    minIncome: 4000,
    benefits: ["Free ATM withdrawals", "Balance transfer"],
  },
  {
    id: 4,
    bank: "HSBC",
    logo: "🏪",
    name: "HSBC Premier Card",
    apr: 42,
    annualFee: 800,
    cashback: 3,
    rating: 4.8,
    tier: "high",
    minIncome: 15000,
    benefits: ["Concierge service", "Priority banking", "Global coverage"],
  },
  {
    id: 5,
    bank: "Alex Bank",
    logo: "🏬",
    name: "Alex Student Card",
    apr: 28,
    annualFee: 0,
    cashback: 0.5,
    rating: 3.8,
    tier: "strong",
    minIncome: 0,
    benefits: ["No annual fee", "Student discounts"],
  },
];

export function CreditCardListing() {
  const navigate = useNavigate();
  const [selectedCards, setSelectedCards] = useState<number[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  const toggleCardSelection = (id: number) => {
    if (selectedCards.includes(id)) {
      setSelectedCards(selectedCards.filter(cid => cid !== id));
    } else if (selectedCards.length < 5) {
      setSelectedCards([...selectedCards, id]);
    }
  };

  const getTierStyle = (tier: string) => {
    switch (tier) {
      case "strong":
        return "bg-green-100 text-green-700 border-green-300";
      case "moderate":
        return "bg-yellow-100 text-yellow-700 border-yellow-300";
      case "high":
        return "bg-red-100 text-red-700 border-red-300";
      default:
        return "bg-gray-100 text-gray-700 border-gray-300";
    }
  };

  const getTierLabel = (tier: string) => {
    switch (tier) {
      case "strong":
        return "Strong Offer";
      case "moderate":
        return "Moderate";
      case "high":
        return "High Cost";
      default:
        return "";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-4 shadow-md">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <button onClick={() => navigate("/marketplace-home")} className="hover:bg-white/10 p-1 rounded">
                <ArrowLeft className="w-6 h-6" />
              </button>
              <h2 className="text-xl">Credit Cards</h2>
            </div>
            <CoinsCounter coins={2450} />
          </div>

          {/* Filter Bar */}
          <button 
            className="w-full bg-white/20 backdrop-blur-sm rounded-lg p-3 flex items-center justify-between hover:bg-white/30 transition-colors"
            onClick={() => setShowFilters(!showFilters)}
          >
            <span className="text-sm">Smart Filters</span>
            <Filter className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter Bottom Sheet */}
      {showFilters && (
        <div className="fixed inset-0 bg-black/50 z-50" onClick={() => setShowFilters(false)}>
          <div 
            className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl p-6 max-w-md mx-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl text-gray-800 mb-4">Filter Products</h3>
            <div className="space-y-4 mb-6">
              <div>
                <label className="text-sm text-gray-700 mb-2 block">Age Range</label>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">18-25</Button>
                  <Button variant="outline" size="sm">26-35</Button>
                  <Button variant="outline" size="sm">36-50</Button>
                  <Button variant="outline" size="sm">50+</Button>
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-700 mb-2 block">Monthly Income</label>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">&lt;5K</Button>
                  <Button variant="outline" size="sm">5K-10K</Button>
                  <Button variant="outline" size="sm">10K+</Button>
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-700 mb-2 block">Purpose</label>
                <div className="flex gap-2 flex-wrap">
                  <Button variant="outline" size="sm">Cashback</Button>
                  <Button variant="outline" size="sm">Travel</Button>
                  <Button variant="outline" size="sm">Shopping</Button>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setShowFilters(false)}>
                Cancel
              </Button>
              <Button className="flex-1 bg-purple-600 hover:bg-purple-700" onClick={() => setShowFilters(false)}>
                Apply Filters
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-md mx-auto p-4 space-y-4">
        {/* Comparison Bar */}
        {selectedCards.length > 0 && (
          <Card className="p-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 sticky top-0 z-10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/80">Selected for comparison</p>
                <p className="text-lg">{selectedCards.length} of 5 cards</p>
              </div>
              <Button 
                variant="secondary"
                onClick={() => navigate("/marketplace/compare", { state: { selectedCards } })}
                disabled={selectedCards.length < 2}
              >
                Compare Now
              </Button>
            </div>
          </Card>
        )}

        {/* Product Cards */}
        <div className="space-y-3">
          {creditCards.map((card) => {
            const isSelected = selectedCards.includes(card.id);
            
            return (
              <Card 
                key={card.id}
                className={`p-4 transition-all ${
                  isSelected ? "ring-2 ring-purple-500" : ""
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-blue-100 rounded-lg flex items-center justify-center text-2xl">
                      {card.logo}
                    </div>
                    <div>
                      <h4 className="text-sm text-gray-800">{card.name}</h4>
                      <p className="text-xs text-gray-600">{card.bank}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => toggleCardSelection(card.id)}
                    />
                  </div>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-1 mb-3">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  <span className="text-sm text-gray-700">{card.rating}</span>
                  <span className="text-xs text-gray-500 ml-1">(124 reviews)</span>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-3 gap-3 mb-3">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <p className="text-xs text-gray-600">APR</p>
                    <p className="text-lg text-blue-600">{card.apr}%</p>
                  </div>
                  <div className="p-2 bg-purple-50 rounded-lg">
                    <p className="text-xs text-gray-600">Annual Fee</p>
                    <p className="text-lg text-purple-600">EGP {card.annualFee}</p>
                  </div>
                  <div className="p-2 bg-green-50 rounded-lg">
                    <p className="text-xs text-gray-600">Cashback</p>
                    <p className="text-lg text-green-600">{card.cashback}%</p>
                  </div>
                </div>

                {/* Benefits */}
                <div className="mb-3">
                  <div className="flex flex-wrap gap-1">
                    {card.benefits.slice(0, 3).map((benefit, i) => (
                      <Badge key={i} variant="outline" className="text-xs">
                        {benefit}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Tier Badge */}
                <div className="flex items-center justify-between">
                  <Badge className={`text-xs border ${getTierStyle(card.tier)}`}>
                    {getTierLabel(card.tier)}
                  </Badge>
                  <Button 
                    size="sm" 
                    className="bg-purple-600 hover:bg-purple-700"
                    onClick={() => navigate(`/marketplace/product/${card.id}`)}
                  >
                    View Details
                  </Button>
                </div>

                {/* Eligibility Hint */}
                {card.minIncome > 0 && (
                  <div className="mt-3 pt-3 border-t flex items-center gap-2 text-xs text-gray-600">
                    <AlertCircle className="w-3 h-3" />
                    <span>Min. income: EGP {card.minIncome.toLocaleString()}/mo</span>
                  </div>
                )}
              </Card>
            );
          })}
        </div>

        {/* Educational Tip */}
        <Card className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <h4 className="text-gray-800 mb-2">💡 Credit Card Tips</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Lower APR means less interest on balances</li>
            <li>• Consider annual fee vs. benefits value</li>
            <li>• Pay full balance monthly to avoid interest</li>
          </ul>
        </Card>
      </div>

      <BottomNav />
    </div>
  );
}