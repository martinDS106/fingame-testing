import { ArrowLeft, DollarSign, AlertTriangle, TrendingUp } from "lucide-react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Label } from "../ui/label";
import { Slider } from "../ui/slider";
import { Input } from "../ui/input";
import { CoinsCounter } from "../CoinsCounter";
import { BottomNav } from "../BottomNav";
import { useNavigate } from "react-router";
import { useState } from "react";

export function LoanCalculator() {
  const navigate = useNavigate();
  const [loanAmount, setLoanAmount] = useState(100000);
  const [interestRate, setInterestRate] = useState(12);
  const [termYears, setTermYears] = useState(5);
  const [monthlyIncome, setMonthlyIncome] = useState(15000);

  // Calculate monthly payment
  const monthlyRate = interestRate / 100 / 12;
  const numPayments = termYears * 12;
  const monthlyPayment = (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
                         (Math.pow(1 + monthlyRate, numPayments) - 1);
  const totalPaid = monthlyPayment * numPayments;
  const totalInterest = totalPaid - loanAmount;
  
  // Affordability check
  const affordabilityRatio = (monthlyPayment / monthlyIncome) * 100;
  const isAffordable = affordabilityRatio <= 40;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-4 shadow-md">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={() => navigate(-1)} className="hover:bg-white/10 p-1 rounded">
                <ArrowLeft className="w-6 h-6" />
              </button>
              <h2 className="text-xl">Loan Calculator</h2>
            </div>
            <CoinsCounter coins={2450} />
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4 space-y-4">
        {/* Monthly Payment Card */}
        <Card className="p-6 bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-xl">
          <p className="text-sm text-green-100 mb-1">Monthly Installment</p>
          <h2 className="text-4xl mb-2">EGP {monthlyPayment.toFixed(0)}</h2>
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            <span className="text-sm">For {termYears} years</span>
          </div>
        </Card>

        {/* Loan Amount Slider */}
        <Card className="p-4">
          <Label className="mb-2 block">Loan Amount</Label>
          <div className="flex items-center gap-3 mb-3">
            <Input
              type="number"
              value={loanAmount}
              onChange={(e) => setLoanAmount(Number(e.target.value))}
              className="flex-1"
            />
            <span className="text-sm text-gray-600">EGP</span>
          </div>
          <Slider
            value={[loanAmount]}
            onValueChange={([value]) => setLoanAmount(value)}
            min={5000}
            max={500000}
            step={5000}
            className="mb-2"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>5K</span>
            <span>500K</span>
          </div>
        </Card>

        {/* Interest Rate Slider */}
        <Card className="p-4">
          <Label className="mb-2 block">Interest Rate (%)</Label>
          <div className="flex items-center gap-3 mb-3">
            <Input
              type="number"
              value={interestRate}
              onChange={(e) => setInterestRate(Number(e.target.value))}
              className="flex-1"
              step={0.1}
            />
            <span className="text-sm text-gray-600">%</span>
          </div>
          <Slider
            value={[interestRate]}
            onValueChange={([value]) => setInterestRate(value)}
            min={5}
            max={25}
            step={0.5}
            className="mb-2"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>5%</span>
            <span>25%</span>
          </div>
        </Card>

        {/* Term Selector */}
        <Card className="p-4">
          <Label className="mb-3 block">Loan Term</Label>
          <div className="grid grid-cols-4 gap-2">
            {[1, 3, 5, 10].map((years) => (
              <Button
                key={years}
                variant={termYears === years ? "default" : "outline"}
                onClick={() => setTermYears(years)}
                className={termYears === years ? "bg-green-600 hover:bg-green-700" : ""}
              >
                {years} {years === 1 ? "yr" : "yrs"}
              </Button>
            ))}
          </div>
        </Card>

        {/* Monthly Income */}
        <Card className="p-4">
          <Label className="mb-2 block">Monthly Income (for affordability check)</Label>
          <div className="flex items-center gap-3">
            <Input
              type="number"
              value={monthlyIncome}
              onChange={(e) => setMonthlyIncome(Number(e.target.value))}
              className="flex-1"
            />
            <span className="text-sm text-gray-600">EGP</span>
          </div>
        </Card>

        {/* Results Breakdown */}
        <Card className="p-4">
          <h4 className="text-gray-800 mb-3">Payment Breakdown</h4>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Total Amount Paid</span>
              <span className="text-sm text-gray-800">EGP {totalPaid.toFixed(0)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Total Interest</span>
              <span className="text-sm text-orange-600">EGP {totalInterest.toFixed(0)}</span>
            </div>
            <div className="flex justify-between pt-2 border-t">
              <span className="text-sm text-gray-600">Principal Amount</span>
              <span className="text-sm text-gray-800">EGP {loanAmount.toFixed(0)}</span>
            </div>
          </div>

          {/* Visual Breakdown */}
          <div className="mt-4">
            <div className="flex gap-1 h-8 rounded-lg overflow-hidden">
              <div 
                className="bg-green-500 flex items-center justify-center"
                style={{ width: `${(loanAmount / totalPaid) * 100}%` }}
              >
                <span className="text-xs text-white">{((loanAmount / totalPaid) * 100).toFixed(0)}%</span>
              </div>
              <div 
                className="bg-orange-500 flex items-center justify-center"
                style={{ width: `${(totalInterest / totalPaid) * 100}%` }}
              >
                <span className="text-xs text-white">{((totalInterest / totalPaid) * 100).toFixed(0)}%</span>
              </div>
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-600">
              <span>Principal</span>
              <span>Interest</span>
            </div>
          </div>
        </Card>

        {/* Affordability Check */}
        <Card className={`p-4 ${
          isAffordable 
            ? "bg-gradient-to-r from-green-50 to-blue-50 border-green-200" 
            : "bg-gradient-to-r from-red-50 to-orange-50 border-red-200"
        }`}>
          <div className="flex items-start gap-3">
            {isAffordable ? (
              <TrendingUp className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5 animate-pulse" />
            )}
            <div className="flex-1">
              <h4 className={`mb-2 ${isAffordable ? "text-green-900" : "text-red-900"}`}>
                Affordability Check
              </h4>
              <p className={`text-sm mb-2 ${isAffordable ? "text-green-700" : "text-red-700"}`}>
                Payment is {affordabilityRatio.toFixed(1)}% of monthly income
              </p>
              <div className="bg-white/50 rounded-full h-3 mb-2">
                <div 
                  className={`h-full rounded-full ${
                    isAffordable ? "bg-green-500" : "bg-red-500"
                  }`}
                  style={{ width: `${Math.min(affordabilityRatio, 100)}%` }}
                />
              </div>
              <p className="text-xs text-gray-700">
                {isAffordable 
                  ? "✓ This loan is within recommended 40% threshold" 
                  : "⚠ This exceeds the recommended 40% threshold"}
              </p>
            </div>
          </div>
        </Card>

        {/* Educational Tip */}
        <Card className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <h4 className="text-gray-800 mb-2">💡 Loan Tips</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Keep payments below 40% of income for financial safety</li>
            <li>• Shorter terms mean less total interest paid</li>
            <li>• Compare rates from multiple lenders</li>
            <li>• Consider making extra payments to reduce interest</li>
          </ul>
        </Card>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <Button 
            variant="outline"
            onClick={() => navigate("/marketplace/loans")}
          >
            Compare Loans
          </Button>
          <Button 
            className="bg-green-600 hover:bg-green-700"
            onClick={() => navigate("/marketplace/loans")}
          >
            Find Best Rates
          </Button>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
