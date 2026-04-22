import { ArrowLeft, Star, TrendingUp, Info, DollarSign } from "lucide-react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";
import { useNavigate } from "react-router";
import { useState } from "react";

export function GoldTrading() {
  const navigate = useNavigate();
  const [goldType, setGoldType] = useState("24K");
  const [quantity, setQuantity] = useState(10);

  const goldPrices = {
    "24K": 3250,
    "22K": 2980,
    "21K": 2845,
    "18K": 2435,
  };

  const currentPrice = goldPrices[goldType as keyof typeof goldPrices];
  const makingCharges = currentPrice * 0.08;
  const totalCost = (currentPrice + makingCharges) * quantity;

  const portfolioGold = [
    { type: "24K", grams: 50, value: 162500, change: 5.2 },
    { type: "21K", grams: 30, value: 85350, change: 4.8 },
  ];

  const totalPortfolioValue = portfolioGold.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white p-4 shadow-md">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <button onClick={() => navigate("/simulation-hub")} className="hover:bg-white/10 p-1 rounded">
                <ArrowLeft className="w-6 h-6" />
              </button>
              <h2 className="text-xl">Gold & Silver Trading</h2>
            </div>
            <div className="flex items-center gap-2 bg-white text-yellow-600 px-3 py-1 rounded-full">
              <Star className="w-4 h-4" />
              <span className="text-sm">180</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4 space-y-4">
        {/* Portfolio Value */}
        <Card className="p-6 bg-gradient-to-br from-yellow-500 to-yellow-600 text-white border-0 shadow-xl">
          <p className="text-sm text-yellow-100 mb-1">Gold Portfolio Value</p>
          <h2 className="text-4xl mb-2">EGP {totalPortfolioValue.toLocaleString()}</h2>
          <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-lg p-2">
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm">+5.1% this month</span>
          </div>
        </Card>

        {/* Gold Type Selector */}
        <Card className="p-4">
          <Label className="mb-3 block">Select Gold Type</Label>
          <Tabs value={goldType} onValueChange={setGoldType}>
            <TabsList className="grid grid-cols-4 w-full">
              <TabsTrigger value="24K">24K</TabsTrigger>
              <TabsTrigger value="22K">22K</TabsTrigger>
              <TabsTrigger value="21K">21K</TabsTrigger>
              <TabsTrigger value="18K">18K</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-600">Current Price per Gram</p>
                <p className="text-2xl text-yellow-600">EGP {currentPrice}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-green-600">+2.3%</p>
                <p className="text-xs text-gray-500">Today</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Quantity Selector */}
        <Card className="p-4">
          <Label htmlFor="quantity" className="mb-2 block">Quantity (grams)</Label>
          <Input
            id="quantity"
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            min={1}
            max={1000}
            className="mb-3"
          />
          <div className="flex gap-2">
            {[10, 50, 100, 500].map((value) => (
              <Button
                key={value}
                variant="outline"
                size="sm"
                onClick={() => setQuantity(value)}
                className="flex-1"
              >
                {value}g
              </Button>
            ))}
          </div>
        </Card>

        {/* Cost Breakdown */}
        <Card className="p-4">
          <h3 className="text-gray-800 mb-3 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-yellow-600" />
            Cost Breakdown
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Gold Price ({quantity}g)</span>
              <span className="text-sm text-gray-800">EGP {(currentPrice * quantity).toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-1">
                <span className="text-sm text-gray-600">Making Charges (8%)</span>
                <Info className="w-3 h-3 text-gray-400" />
              </div>
              <span className="text-sm text-gray-800">EGP {(makingCharges * quantity).toFixed(2)}</span>
            </div>
            <div className="flex justify-between pt-2 border-t">
              <span className="text-sm">Total Amount</span>
              <span className="text-lg text-yellow-600">EGP {totalCost.toFixed(2)}</span>
            </div>
          </div>
        </Card>

        {/* Educational Info */}
        <Card className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <h4 className="text-gray-800 mb-3">💡 Gold Investment Insights</h4>
          <div className="space-y-2 text-sm text-gray-700">
            <div className="flex items-start gap-2">
              <span className="text-blue-600">•</span>
              <p><strong>USD Impact:</strong> Gold prices typically move inversely to the US Dollar</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-600">•</span>
              <p><strong>Inflation Hedge:</strong> Gold often maintains value during inflation</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-600">•</span>
              <p><strong>Seasonal Demand:</strong> Prices usually rise during wedding season (Jun-Aug)</p>
            </div>
          </div>
        </Card>

        {/* Current Holdings */}
        {portfolioGold.length > 0 && (
          <Card className="p-4">
            <h3 className="text-gray-800 mb-3">Your Gold Holdings</h3>
            <div className="space-y-2">
              {portfolioGold.map((holding, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-800">{holding.type} Gold</p>
                    <p className="text-xs text-gray-600">{holding.grams} grams</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-800">EGP {holding.value.toLocaleString()}</p>
                    <p className="text-xs text-green-600">+{holding.change}%</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <Button className="bg-yellow-500 hover:bg-yellow-600">
            Buy Gold
          </Button>
          <Button variant="outline">
            Sell Gold
          </Button>
        </div>
      </div>
    </div>
  );
}
