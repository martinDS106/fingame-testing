import { ArrowLeft, CheckCircle2, XCircle, Award } from "lucide-react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { CoinsCounter } from "../CoinsCounter";
import { BottomNav } from "../BottomNav";
import { useNavigate } from "react-router";

const comparisonData = [
  {
    id: 1,
    bank: "CIB",
    logo: "🏦",
    name: "CIB Smart Card",
    apr: 30,
    annualFee: 300,
    minIncome: 5000,
    cashback: 2,
    lounge: true,
    insurance: true,
    isBestValue: true,
  },
  {
    id: 2,
    bank: "NBE",
    logo: "🏛️",
    name: "NBE Platinum",
    apr: 35,
    annualFee: 500,
    minIncome: 8000,
    cashback: 1.5,
    lounge: true,
    insurance: false,
    isBestValue: false,
  },
  {
    id: 5,
    bank: "Alex Bank",
    logo: "🏬",
    name: "Alex Student",
    apr: 28,
    annualFee: 0,
    minIncome: 0,
    cashback: 0.5,
    lounge: false,
    insurance: false,
    isBestValue: false,
  },
];

const features = [
  { label: "APR", key: "apr", suffix: "%" },
  { label: "Annual Fee", key: "annualFee", prefix: "EGP " },
  { label: "Min Income", key: "minIncome", prefix: "EGP " },
  { label: "Cashback", key: "cashback", suffix: "%" },
  { label: "Airport Lounge", key: "lounge", type: "boolean" },
  { label: "Travel Insurance", key: "insurance", type: "boolean" },
];

export function ProductComparison() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-4 shadow-md">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={() => navigate(-1)} className="hover:bg-white/10 p-1 rounded">
                <ArrowLeft className="w-6 h-6" />
              </button>
              <h2 className="text-xl">Compare Products</h2>
            </div>
            <CoinsCounter coins={2450} />
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 space-y-4">
        {/* Reward Banner */}
        <Card className="p-4 bg-gradient-to-r from-yellow-400 to-orange-400 border-0">
          <p className="text-sm text-yellow-900">
            🎉 You earned <strong>+10 coins</strong> for comparing products!
          </p>
        </Card>

        {/* Product Headers */}
        <div className="overflow-x-auto">
          <div className="min-w-max">
            <div className="grid grid-cols-4 gap-3 mb-4">
              <div className="w-32" /> {/* Empty space for feature names */}
              {comparisonData.map((product) => (
                <Card key={product.id} className="p-4 relative">
                  {product.isBestValue && (
                    <Badge className="absolute -top-2 left-1/2 -translate-x-1/2 bg-green-500 text-white border-0">
                      <Award className="w-3 h-3 mr-1" />
                      Best Value
                    </Badge>
                  )}
                  <div className="flex flex-col items-center text-center mt-2">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-blue-100 rounded-xl flex items-center justify-center text-3xl mb-2">
                      {product.logo}
                    </div>
                    <h4 className="text-sm text-gray-800 mb-1">{product.name}</h4>
                    <p className="text-xs text-gray-600">{product.bank}</p>
                  </div>
                </Card>
              ))}
            </div>

            {/* Comparison Rows */}
            <div className="space-y-2">
              {features.map((feature, index) => (
                <div key={index} className="grid grid-cols-4 gap-3">
                  <div className="w-32 flex items-center">
                    <p className="text-sm text-gray-700">{feature.label}</p>
                  </div>
                  {comparisonData.map((product) => {
                    const value = product[feature.key as keyof typeof product];
                    
                    return (
                      <Card key={product.id} className="p-3 flex items-center justify-center">
                        {feature.type === "boolean" ? (
                          value ? (
                            <CheckCircle2 className="w-5 h-5 text-green-600" />
                          ) : (
                            <XCircle className="w-5 h-5 text-gray-300" />
                          )
                        ) : (
                          <p className="text-sm text-gray-800">
                            {feature.prefix}{value}{feature.suffix}
                          </p>
                        )}
                      </Card>
                    );
                  })}
                </div>
              ))}
            </div>

            {/* Best For */}
            <div className="grid grid-cols-4 gap-3 mt-4">
              <div className="w-32 flex items-center">
                <p className="text-sm text-gray-700">Best For</p>
              </div>
              <Card className="p-3">
                <p className="text-xs text-gray-700 text-center">Regular spenders with travel needs</p>
              </Card>
              <Card className="p-3">
                <p className="text-xs text-gray-700 text-center">High earners seeking premium perks</p>
              </Card>
              <Card className="p-3">
                <p className="text-xs text-gray-700 text-center">Students & first-time users</p>
              </Card>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-4 gap-3 mt-4">
              <div className="w-32" />
              {comparisonData.map((product) => (
                <Button 
                  key={product.id}
                  className={`${
                    product.isBestValue 
                      ? "bg-green-600 hover:bg-green-700" 
                      : "bg-purple-600 hover:bg-purple-700"
                  }`}
                  onClick={() => navigate(`/marketplace/product/${product.id}`)}
                >
                  View Details
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Educational Tips */}
        <Card className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <h4 className="text-gray-800 mb-2">💡 Comparison Tips</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Lower APR is better if you carry a balance</li>
            <li>• Consider if annual fee is worth the benefits</li>
            <li>• Match minimum income requirements to your salary</li>
            <li>• Check if rewards align with your spending habits</li>
          </ul>
        </Card>
      </div>

      <BottomNav />
    </div>
  );
}
