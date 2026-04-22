import { ArrowLeft, Star, TrendingUp, Coins, Award } from "lucide-react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { useNavigate, useSearchParams } from "react-router";
import { useState } from "react";

export function OrderExecution() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderType = searchParams.get("type") || "market";
  
  const [quantity, setQuantity] = useState(10);
  const [limitPrice, setLimitPrice] = useState(42.50);
  const [showSuccess, setShowSuccess] = useState(false);

  const stock = {
    symbol: "CIB",
    name: "Commercial International Bank",
    price: 42.50,
  };

  const portfolioValue = 28450;
  const totalCost = quantity * (orderType === "limit" ? limitPrice : stock.price);
  const newAllocation = ((totalCost / (portfolioValue + totalCost)) * 100).toFixed(1);
  const xpEarned = 50;
  const coinsEarned = 25;

  const handleConfirm = () => {
    setShowSuccess(true);
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Award className="w-10 h-10 text-green-600" />
          </div>
          
          <h2 className="text-2xl text-gray-800 mb-2">Order Executed!</h2>
          <p className="text-gray-600 mb-6">
            Successfully purchased {quantity} shares of {stock.symbol}
          </p>

          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="p-4 bg-yellow-50 rounded-xl">
              <Coins className="w-6 h-6 text-yellow-600 mx-auto mb-2" />
              <p className="text-sm text-gray-600 mb-1">Coins Earned</p>
              <p className="text-2xl text-yellow-600">+{coinsEarned}</p>
            </div>
            <div className="p-4 bg-blue-50 rounded-xl">
              <TrendingUp className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <p className="text-sm text-gray-600 mb-1">XP Earned</p>
              <p className="text-2xl text-blue-600">+{xpEarned}</p>
            </div>
          </div>

          <div className="space-y-2">
            <Button 
              className="w-full bg-green-600 hover:bg-green-700"
              onClick={() => navigate("/simulation/investment")}
            >
              View Portfolio
            </Button>
            <Button 
              variant="outline"
              className="w-full"
              onClick={() => navigate("/simulation/investment/market")}
            >
              Continue Trading
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-4 shadow-md">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <button onClick={() => navigate(-1)} className="hover:bg-white/10 p-1 rounded">
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div>
                <h2 className="text-xl capitalize">{orderType} Order</h2>
                <p className="text-sm text-green-100">{stock.symbol}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-yellow-400 text-green-900 px-3 py-1 rounded-full">
              <Star className="w-4 h-4" />
              <span className="text-sm">280</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4 space-y-4">
        {/* Current Price */}
        <Card className="p-4 bg-gradient-to-r from-green-50 to-blue-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Current Price</p>
              <p className="text-2xl text-gray-800">EGP {stock.price}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Available Cash</p>
              <p className="text-lg text-green-600">EGP 71,550</p>
            </div>
          </div>
        </Card>

        {/* Order Type Selection */}
        <Card className="p-4">
          <Label className="mb-3 block">Order Type</Label>
          <RadioGroup value={orderType} className="space-y-2">
            <div className="flex items-center space-x-2 p-3 border rounded-lg">
              <RadioGroupItem value="market" id="market" />
              <Label htmlFor="market" className="flex-1 cursor-pointer">
                <div>
                  <p className="text-sm">Market Order</p>
                  <p className="text-xs text-gray-600">Execute immediately at current price</p>
                </div>
              </Label>
            </div>
            <div className="flex items-center space-x-2 p-3 border rounded-lg">
              <RadioGroupItem value="limit" id="limit" />
              <Label htmlFor="limit" className="flex-1 cursor-pointer">
                <div>
                  <p className="text-sm">Limit Order</p>
                  <p className="text-xs text-gray-600">Set your maximum buy price</p>
                </div>
              </Label>
            </div>
            <div className="flex items-center space-x-2 p-3 border rounded-lg">
              <RadioGroupItem value="stop" id="stop" />
              <Label htmlFor="stop" className="flex-1 cursor-pointer">
                <div>
                  <p className="text-sm">Stop Loss</p>
                  <p className="text-xs text-gray-600">Automatically sell if price drops</p>
                </div>
              </Label>
            </div>
          </RadioGroup>
        </Card>

        {/* Quantity Selector */}
        <Card className="p-4">
          <Label htmlFor="quantity" className="mb-2 block">Quantity</Label>
          <Input
            id="quantity"
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            min={1}
            className="mb-3"
          />
          
          {orderType === "limit" && (
            <>
              <Label htmlFor="limitPrice" className="mb-2 block">Limit Price (EGP)</Label>
              <Input
                id="limitPrice"
                type="number"
                value={limitPrice}
                onChange={(e) => setLimitPrice(Number(e.target.value))}
                step={0.01}
              />
            </>
          )}
        </Card>

        {/* Estimated Impact */}
        <Card className="p-4">
          <h3 className="text-gray-800 mb-3">Estimated Impact</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Total Cost</span>
              <span className="text-sm text-gray-800">EGP {totalCost.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Commission (0.5%)</span>
              <span className="text-sm text-gray-800">EGP {(totalCost * 0.005).toFixed(2)}</span>
            </div>
            <div className="flex justify-between pt-2 border-t">
              <span className="text-sm text-gray-800">Total Amount</span>
              <span className="text-sm text-green-600">EGP {(totalCost * 1.005).toFixed(2)}</span>
            </div>
          </div>
        </Card>

        {/* Portfolio Allocation Preview */}
        <Card className="p-4 bg-blue-50 border-blue-200">
          <h4 className="text-gray-800 mb-2">Portfolio Impact</h4>
          <p className="text-sm text-gray-600 mb-2">
            {stock.symbol} will represent {newAllocation}% of your portfolio
          </p>
          <div className="bg-gray-200 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-green-400 to-green-600 h-full rounded-full"
              style={{ width: `${newAllocation}%` }}
            />
          </div>
        </Card>

        {/* Confirm Button */}
        <Button 
          className="w-full bg-green-600 hover:bg-green-700 py-6 text-lg"
          onClick={handleConfirm}
        >
          Confirm Order
        </Button>
      </div>
    </div>
  );
}
