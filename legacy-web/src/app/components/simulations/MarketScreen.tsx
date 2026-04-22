import { ArrowLeft, TrendingUp, TrendingDown, Search, Star, Filter } from "lucide-react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { useNavigate } from "react-router";

const stocks = [
  { symbol: "CIB", name: "Commercial Intl Bank", price: 42.50, change: 5.2, volume: "2.5M", sector: "Banking", risk: "Low" },
  { symbol: "ETEL", name: "Etisalat Misr", price: 18.30, change: -2.1, volume: "1.8M", sector: "Telecom", risk: "Low" },
  { symbol: "HRHO", name: "Hermes Holding", price: 67.80, change: 8.5, volume: "850K", sector: "Finance", risk: "Medium" },
  { symbol: "PHDC", name: "Palm Hills", price: 5.45, change: 3.7, volume: "3.2M", sector: "Real Estate", risk: "High" },
  { symbol: "EMFD", name: "EFG-Hermes", price: 24.10, change: -1.3, volume: "1.2M", sector: "Finance", risk: "Medium" },
  { symbol: "OTMT", name: "Oriental Textiles", price: 12.75, change: 12.4, volume: "450K", sector: "Textiles", risk: "High" },
  { symbol: "SWDY", name: "El Sewedy Electric", price: 31.20, change: -4.2, volume: "980K", sector: "Industry", risk: "Medium" },
  { symbol: "TMGH", name: "TMG Holding", price: 8.90, change: 6.8, volume: "1.5M", sector: "Real Estate", risk: "High" },
];

export function MarketScreen() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 shadow-md">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <button onClick={() => navigate("/simulation/investment")} className="hover:bg-white/10 p-1 rounded">
                <ArrowLeft className="w-6 h-6" />
              </button>
              <h2 className="text-xl">Stock Market</h2>
            </div>
            <div className="flex items-center gap-2 bg-yellow-400 text-blue-900 px-3 py-1 rounded-full">
              <Star className="w-4 h-4" />
              <span className="text-sm">280 pts</span>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search stocks..."
              className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/60"
            />
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4 space-y-4">
        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
          <Button variant="outline" size="sm" className="flex-shrink-0">
            <Filter className="w-4 h-4 mr-1" />
            All Sectors
          </Button>
          <Button variant="outline" size="sm" className="flex-shrink-0">
            Banking
          </Button>
          <Button variant="outline" size="sm" className="flex-shrink-0">
            Finance
          </Button>
          <Button variant="outline" size="sm" className="flex-shrink-0">
            Real Estate
          </Button>
        </div>

        {/* Market Overview */}
        <Card className="p-4 bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">EGX 30 Index</p>
              <p className="text-2xl text-gray-800">24,562.50</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-green-600 flex items-center gap-1">
                <TrendingUp className="w-4 h-4" />
                +142.30
              </p>
              <p className="text-xs text-gray-600">+0.58%</p>
            </div>
          </div>
        </Card>

        {/* Stock List */}
        <div className="space-y-3">
          {stocks.map((stock, i) => {
            const isPositive = stock.change >= 0;
            
            return (
              <Card 
                key={i}
                className="p-4 cursor-pointer hover:shadow-lg transition-all"
                onClick={() => navigate("/simulation/investment/stock")}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="text-gray-800 mb-1">{stock.symbol}</h4>
                    <p className="text-sm text-gray-600">{stock.name}</p>
                  </div>
                  <Badge 
                    variant="outline"
                    className={`text-xs ${
                      stock.risk === "Low" 
                        ? "border-green-300 text-green-700"
                        : stock.risk === "Medium"
                        ? "border-orange-300 text-orange-700"
                        : "border-red-300 text-red-700"
                    }`}
                  >
                    {stock.risk} Risk
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl text-gray-800">EGP {stock.price}</p>
                    <p className="text-xs text-gray-600">Vol: {stock.volume}</p>
                  </div>

                  <div className="text-right">
                    <div className={`flex items-center gap-1 ${
                      isPositive ? "text-green-600" : "text-red-600"
                    }`}>
                      {isPositive ? (
                        <TrendingUp className="w-5 h-5" />
                      ) : (
                        <TrendingDown className="w-5 h-5" />
                      )}
                      <span className="text-lg">
                        {isPositive ? "+" : ""}{stock.change}%
                      </span>
                    </div>
                    <Badge variant="secondary" className="text-xs mt-1">
                      {stock.sector}
                    </Badge>
                  </div>
                </div>

                {/* Mini Chart Placeholder */}
                <div className="mt-3 h-12 flex items-end gap-1">
                  {Array.from({ length: 20 }).map((_, idx) => {
                    const height = Math.random() * 100;
                    return (
                      <div
                        key={idx}
                        className={`flex-1 rounded-t ${
                          isPositive ? "bg-green-200" : "bg-red-200"
                        }`}
                        style={{ height: `${height}%` }}
                      />
                    );
                  })}
                </div>
              </Card>
            );
          })}
        </div>
      </div>

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