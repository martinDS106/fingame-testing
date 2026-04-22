import { ArrowLeft, TrendingUp, TrendingDown, Star, AlertTriangle, Info } from "lucide-react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";
import { useNavigate } from "react-router";
import { useState } from "react";

export function StockDetail() {
  const navigate = useNavigate();
  const [timeframe, setTimeframe] = useState("1D");

  const stock = {
    symbol: "CIB",
    name: "Commercial International Bank",
    price: 42.50,
    change: 2.15,
    changePercent: 5.32,
    open: 40.35,
    high: 43.20,
    low: 40.10,
    volume: "2.5M",
    pe: 8.5,
    dividend: 4.2,
    rating: "Buy",
  };

  const isPositive = stock.change >= 0;

  // Generate mock chart data
  const chartData = Array.from({ length: 50 }, (_, i) => {
    const base = 38 + Math.sin(i / 5) * 3;
    const noise = Math.random() * 2;
    return base + noise;
  });

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-4 shadow-md">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <button onClick={() => navigate("/simulation/investment/market")} className="hover:bg-white/10 p-1 rounded">
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div>
                <h2 className="text-xl">{stock.symbol}</h2>
                <p className="text-sm text-green-100">{stock.name}</p>
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
        {/* Price Card */}
        <Card className="p-5">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-3xl text-gray-800 mb-1">EGP {stock.price}</p>
              <div className={`flex items-center gap-1 ${isPositive ? "text-green-600" : "text-red-600"}`}>
                {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                <span>{isPositive ? "+" : ""}{stock.change} ({isPositive ? "+" : ""}{stock.changePercent}%)</span>
              </div>
            </div>
            <Badge className="bg-green-100 text-green-700 border-0">
              {stock.rating}
            </Badge>
          </div>

          {/* Day Stats */}
          <div className="grid grid-cols-3 gap-3 pt-3 border-t">
            <div>
              <p className="text-xs text-gray-600">Open</p>
              <p className="text-sm text-gray-800">EGP {stock.open}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600">High</p>
              <p className="text-sm text-gray-800">EGP {stock.high}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600">Low</p>
              <p className="text-sm text-gray-800">EGP {stock.low}</p>
            </div>
          </div>
        </Card>

        {/* Overvaluation Warning */}
        <Card className="p-4 bg-orange-50 border-orange-200">
          <div className="flex gap-3">
            <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm text-orange-900 mb-1">Educational Alert</h4>
              <p className="text-xs text-orange-700">
                This stock's P/E ratio is below market average. Research the company's fundamentals before investing.
              </p>
            </div>
          </div>
        </Card>

        {/* Chart */}
        <Card className="p-4">
          {/* Time Filters */}
          <Tabs value={timeframe} onValueChange={setTimeframe} className="mb-4">
            <TabsList className="grid grid-cols-5 w-full">
              <TabsTrigger value="1D">1D</TabsTrigger>
              <TabsTrigger value="1W">1W</TabsTrigger>
              <TabsTrigger value="1M">1M</TabsTrigger>
              <TabsTrigger value="1Y">1Y</TabsTrigger>
              <TabsTrigger value="5Y">5Y</TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Candlestick Chart */}
          <div className="h-48 flex items-end gap-0.5">
            {chartData.map((value, i) => {
              const height = (value / 45) * 100;
              const prevValue = chartData[i - 1] || value;
              const isUp = value >= prevValue;
              
              return (
                <div key={i} className="flex-1 flex flex-col justify-end">
                  <div
                    className={`w-full rounded-t ${isUp ? "bg-green-400" : "bg-red-400"}`}
                    style={{ height: `${height}%` }}
                  />
                </div>
              );
            })}
          </div>
        </Card>

        {/* Fundamentals */}
        <Card className="p-4">
          <h3 className="text-gray-800 mb-3">Key Metrics</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-xs text-gray-600">P/E Ratio</p>
                <Info className="w-3 h-3 text-gray-400" />
              </div>
              <p className="text-xl text-blue-600">{stock.pe}</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-xs text-gray-600">Dividend Yield</p>
                <Info className="w-3 h-3 text-gray-400" />
              </div>
              <p className="text-xl text-purple-600">{stock.dividend}%</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-xs text-gray-600">Volume</p>
                <Info className="w-3 h-3 text-gray-400" />
              </div>
              <p className="text-xl text-green-600">{stock.volume}</p>
            </div>
            <div className="p-3 bg-yellow-50 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-xs text-gray-600">Analyst Rating</p>
                <Info className="w-3 h-3 text-gray-400" />
              </div>
              <p className="text-xl text-yellow-600">{stock.rating}</p>
            </div>
          </div>
        </Card>

        {/* Educational Tip */}
        <Card className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <h4 className="text-gray-800 mb-2">💡 Quick Tip</h4>
          <p className="text-sm text-gray-600">
            P/E ratio compares stock price to earnings. Lower P/E might indicate undervaluation, but always research company fundamentals.
          </p>
        </Card>

        {/* Order Buttons */}
        <div className="space-y-2">
          <Button 
            className="w-full bg-green-600 hover:bg-green-700"
            onClick={() => navigate("/simulation/investment/order?type=market")}
          >
            Market Order
          </Button>
          <div className="grid grid-cols-2 gap-2">
            <Button 
              variant="outline"
              onClick={() => navigate("/simulation/investment/order?type=limit")}
            >
              Limit Order
            </Button>
            <Button 
              variant="outline"
              onClick={() => navigate("/simulation/investment/order?type=stop")}
            >
              Stop Loss
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
