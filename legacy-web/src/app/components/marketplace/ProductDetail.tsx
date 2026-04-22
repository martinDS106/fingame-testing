import { ArrowLeft, Star, CheckCircle2, AlertTriangle, Info, ThumbsUp, Award } from "lucide-react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Progress } from "../ui/progress";
import { CoinsCounter } from "../CoinsCounter";
import { BottomNav } from "../BottomNav";
import { useNavigate } from "react-router";
import { useState } from "react";

export function ProductDetail() {
  const navigate = useNavigate();
  const [showEligibility, setShowEligibility] = useState(false);
  const [age, setAge] = useState(25);
  const [income, setIncome] = useState(8000);
  const [creditScore, setCreditScore] = useState(720);
  const [approvalOdds, setApprovalOdds] = useState(0);

  const product = {
    bank: "CIB",
    logo: "🏦",
    name: "CIB Smart Credit Card",
    rating: 4.5,
    reviews: 124,
    apr: 30,
    annualFee: 300,
    cashback: 2,
  };

  const calculateEligibility = () => {
    let score = 0;
    if (age >= 21 && age <= 65) score += 25;
    if (income >= 5000) score += 35;
    if (creditScore >= 650) score += 40;
    setApprovalOdds(Math.min(score, 95));
    setShowEligibility(true);
  };

  const reviews = [
    {
      id: 1,
      user: "Ahmed M.",
      avatar: "👨",
      rating: 5,
      date: "2 days ago",
      comment: "Great card with excellent cashback rewards. Customer service is responsive.",
      helpful: 24,
    },
    {
      id: 2,
      user: "Sarah K.",
      avatar: "👩",
      rating: 4,
      date: "1 week ago",
      comment: "Good benefits but APR is a bit high. Overall satisfied with the service.",
      helpful: 18,
    },
    {
      id: 3,
      user: "Mohamed S.",
      avatar: "🧑",
      rating: 5,
      date: "2 weeks ago",
      comment: "Airport lounge access is amazing! Worth the annual fee.",
      helpful: 31,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-4 shadow-md">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={() => navigate(-1)} className="hover:bg-white/10 p-1 rounded">
                <ArrowLeft className="w-6 h-6" />
              </button>
              <h2 className="text-xl">Product Details</h2>
            </div>
            <CoinsCounter coins={2450} />
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4 space-y-4">
        {/* Product Header */}
        <Card className="p-6">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-blue-100 rounded-xl flex items-center justify-center text-3xl">
              {product.logo}
            </div>
            <div className="flex-1">
              <h3 className="text-xl text-gray-800 mb-1">{product.name}</h3>
              <p className="text-sm text-gray-600 mb-2">{product.bank}</p>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star 
                      key={i} 
                      className={`w-4 h-4 ${
                        i < Math.floor(product.rating) 
                          ? "text-yellow-500 fill-yellow-500" 
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-700">{product.rating}</span>
                <span className="text-xs text-gray-500">({product.reviews} reviews)</span>
              </div>
            </div>
          </div>

          <Badge className="bg-green-100 text-green-700 border-0">
            <Award className="w-3 h-3 mr-1" />
            Best Value
          </Badge>
        </Card>

        {/* Overview */}
        <Card className="p-4">
          <h4 className="text-gray-800 mb-3">Overview</h4>
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 bg-blue-50 rounded-lg text-center">
              <p className="text-xs text-gray-600 mb-1">APR</p>
              <p className="text-xl text-blue-600">{product.apr}%</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg text-center">
              <p className="text-xs text-gray-600 mb-1">Annual Fee</p>
              <p className="text-xl text-purple-600">EGP {product.annualFee}</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg text-center">
              <p className="text-xs text-gray-600 mb-1">Cashback</p>
              <p className="text-xl text-green-600">{product.cashback}%</p>
            </div>
          </div>
        </Card>

        {/* Pros & Cons */}
        <Card className="p-4">
          <h4 className="text-gray-800 mb-3">Pros & Cons</h4>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-700 mb-2">Pros</p>
              <div className="space-y-1">
                {[
                  "2% cashback on all purchases",
                  "Airport lounge access",
                  "Travel insurance included",
                  "No foreign transaction fees",
                ].map((pro, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-gray-700">
                    <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>{pro}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-700 mb-2">Cons</p>
              <div className="space-y-1">
                {[
                  "Annual fee of EGP 300",
                  "APR higher than market average",
                ].map((con, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-gray-700">
                    <AlertTriangle className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />
                    <span>{con}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Eligibility Checker */}
        <Card className="p-4">
          <h4 className="text-gray-800 mb-3 flex items-center gap-2">
            <Info className="w-5 h-5 text-blue-600" />
            Eligibility Checker
          </h4>
          
          {!showEligibility ? (
            <div className="space-y-3">
              <div>
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="income">Monthly Income (EGP)</Label>
                <Input
                  id="income"
                  type="number"
                  value={income}
                  onChange={(e) => setIncome(Number(e.target.value))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="creditScore">Credit Score (300-850)</Label>
                <Input
                  id="creditScore"
                  type="number"
                  value={creditScore}
                  onChange={(e) => setCreditScore(Number(e.target.value))}
                  className="mt-1"
                />
              </div>
              <Button 
                className="w-full bg-blue-600 hover:bg-blue-700"
                onClick={calculateEligibility}
              >
                Check Eligibility
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Approval Odds Circle */}
              <div className="flex flex-col items-center py-4">
                <div className="relative w-32 h-32">
                  <svg className="w-32 h-32 transform -rotate-90">
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="#e5e7eb"
                      strokeWidth="8"
                      fill="none"
                    />
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke={approvalOdds >= 70 ? "#10b981" : approvalOdds >= 40 ? "#f59e0b" : "#ef4444"}
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray={`${(approvalOdds / 100) * 351.86} 351.86`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <p className="text-3xl text-gray-800">{approvalOdds}%</p>
                    <p className="text-xs text-gray-600">Approval</p>
                  </div>
                </div>
                <p className={`mt-3 text-sm ${
                  approvalOdds >= 70 ? "text-green-600" : approvalOdds >= 40 ? "text-orange-600" : "text-red-600"
                }`}>
                  {approvalOdds >= 70 ? "Excellent chances!" : approvalOdds >= 40 ? "Moderate chances" : "Improve your profile"}
                </p>
              </div>

              {/* Requirements */}
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 bg-green-50 rounded">
                  <span className="text-sm text-gray-700">Age requirement</span>
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                </div>
                <div className="flex items-center justify-between p-2 bg-green-50 rounded">
                  <span className="text-sm text-gray-700">Income requirement</span>
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                </div>
                <div className="flex items-center justify-between p-2 bg-green-50 rounded">
                  <span className="text-sm text-gray-700">Credit score</span>
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                </div>
              </div>

              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => setShowEligibility(false)}
              >
                Check Again
              </Button>
            </div>
          )}
        </Card>

        {/* Reviews */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-gray-800">User Reviews</h4>
            <Button size="sm" variant="outline">
              Write Review (+25 coins)
            </Button>
          </div>

          <div className="space-y-3">
            {reviews.map((review) => (
              <div key={review.id} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                      {review.avatar}
                    </div>
                    <div>
                      <p className="text-sm text-gray-800">{review.user}</p>
                      <p className="text-xs text-gray-500">{review.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star 
                        key={i} 
                        className={`w-3 h-3 ${
                          i < review.rating 
                            ? "text-yellow-500 fill-yellow-500" 
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-gray-700 mb-2">{review.comment}</p>
                <Button size="sm" variant="ghost" className="text-xs">
                  <ThumbsUp className="w-3 h-3 mr-1" />
                  Helpful ({review.helpful})
                </Button>
              </div>
            ))}
          </div>
        </Card>

        {/* Apply Button */}
        <div className="sticky bottom-20 z-10">
          <Button 
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 py-6 text-lg shadow-xl"
            onClick={() => navigate("/marketplace/application-tracking")}
          >
            Apply Now
          </Button>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
