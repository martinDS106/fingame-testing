import { ArrowLeft, ArrowRight, Star, CheckCircle, Circle } from "lucide-react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { useNavigate } from "react-router";
import { useState } from "react";

const steps = [
  "Business Type",
  "Registration",
  "Startup Costs",
  "Monthly Costs",
  "Revenue",
  "Cash Flow",
  "Decisions",
  "Statements",
  "Taxes",
  "Outcome"
];

export function BusinessSimulation() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [businessType, setBusinessType] = useState("");
  const [startupCost, setStartupCost] = useState(0);

  const businessTypes = [
    { id: "cafe", name: "Coffee Shop", cost: 150000, icon: "☕" },
    { id: "tech", name: "Tech Startup", cost: 50000, icon: "💻" },
    { id: "retail", name: "Retail Store", cost: 200000, icon: "🏪" },
    { id: "services", name: "Consulting", cost: 30000, icon: "💼" },
  ];

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <Card className="p-6">
            <h3 className="text-xl text-gray-800 mb-4">Choose Your Business Type</h3>
            <RadioGroup value={businessType} onValueChange={setBusinessType}>
              <div className="space-y-3">
                {businessTypes.map((type) => (
                  <div key={type.id} className="flex items-center space-x-3 p-4 border-2 rounded-xl hover:border-blue-300 cursor-pointer transition-all">
                    <RadioGroupItem value={type.id} id={type.id} />
                    <Label htmlFor={type.id} className="flex-1 cursor-pointer flex items-center gap-3">
                      <span className="text-3xl">{type.icon}</span>
                      <div>
                        <p className="text-sm">{type.name}</p>
                        <p className="text-xs text-gray-600">Startup: EGP {type.cost.toLocaleString()}</p>
                      </div>
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </Card>
        );

      case 1:
        return (
          <Card className="p-6">
            <h3 className="text-xl text-gray-800 mb-4">Legal Registration</h3>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="text-sm text-gray-800 mb-2">Required Documents</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    Commercial Register
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    Tax Card
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    Business License
                  </li>
                </ul>
              </div>
              <div className="p-4 bg-yellow-50 rounded-lg">
                <p className="text-sm text-gray-700">
                  <strong>Registration Cost:</strong> EGP 5,000 - 15,000
                </p>
                <p className="text-sm text-gray-700 mt-1">
                  <strong>Processing Time:</strong> 2-4 weeks
                </p>
              </div>
            </div>
          </Card>
        );

      case 2:
        return (
          <Card className="p-6">
            <h3 className="text-xl text-gray-800 mb-4">Startup Cost Breakdown</h3>
            <div className="space-y-3">
              {[
                { name: "Equipment & Furniture", amount: 60000, percent: 40 },
                { name: "Initial Inventory", amount: 30000, percent: 20 },
                { name: "Rent Deposit", amount: 20000, percent: 13 },
                { name: "Marketing & Branding", amount: 15000, percent: 10 },
                { name: "Legal & Licenses", amount: 10000, percent: 7 },
                { name: "Contingency Fund", amount: 15000, percent: 10 },
              ].map((item, i) => (
                <div key={i}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-700">{item.name}</span>
                    <span className="text-gray-800">EGP {item.amount.toLocaleString()}</span>
                  </div>
                  <div className="bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-400 to-blue-600 h-full rounded-full"
                      style={{ width: `${item.percent}%` }}
                    />
                  </div>
                </div>
              ))}
              <div className="pt-3 border-t flex justify-between">
                <span className="text-gray-800">Total Startup Cost</span>
                <span className="text-xl text-blue-600">EGP 150,000</span>
              </div>
            </div>
          </Card>
        );

      case 3:
        return (
          <Card className="p-6">
            <h3 className="text-xl text-gray-800 mb-4">Monthly Operating Costs</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-red-50 rounded-lg">
                  <p className="text-xs text-gray-600">Rent</p>
                  <p className="text-lg text-gray-800">EGP 8,000</p>
                </div>
                <div className="p-3 bg-orange-50 rounded-lg">
                  <p className="text-xs text-gray-600">Salaries</p>
                  <p className="text-lg text-gray-800">EGP 15,000</p>
                </div>
                <div className="p-3 bg-yellow-50 rounded-lg">
                  <p className="text-xs text-gray-600">Utilities</p>
                  <p className="text-lg text-gray-800">EGP 2,500</p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="text-xs text-gray-600">Supplies</p>
                  <p className="text-lg text-gray-800">EGP 5,000</p>
                </div>
              </div>
              <div className="p-4 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-xl">
                <p className="text-sm mb-1">Total Monthly Burn Rate</p>
                <p className="text-3xl">EGP 30,500</p>
              </div>
            </div>
          </Card>
        );

      case 9:
        return (
          <Card className="p-6 bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
            <div className="text-center">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-2xl mb-3">Business Simulation Complete!</h2>
              <p className="text-green-100 mb-6">
                You've successfully navigated the business journey
              </p>
              
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 mb-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-green-100">Final Profit</p>
                    <p className="text-2xl">EGP 85,000</p>
                  </div>
                  <div>
                    <p className="text-sm text-green-100">XP Earned</p>
                    <p className="text-2xl">+500</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Button 
                  variant="secondary" 
                  className="w-full"
                  onClick={() => setCurrentStep(0)}
                >
                  Start New Business
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full bg-transparent border-white text-white hover:bg-white/10"
                  onClick={() => navigate("/simulation-hub")}
                >
                  Return to Simulations
                </Button>
              </div>
            </div>
          </Card>
        );

      default:
        return (
          <Card className="p-6">
            <h3 className="text-xl text-gray-800 mb-4">Step {currentStep + 1}</h3>
            <p className="text-gray-600">Content for {steps[currentStep]} coming soon...</p>
          </Card>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-4 shadow-md">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <button onClick={() => navigate("/simulation-hub")} className="hover:bg-white/10 p-1 rounded">
                <ArrowLeft className="w-6 h-6" />
              </button>
              <h2 className="text-xl">Business Simulation</h2>
            </div>
            <div className="flex items-center gap-2 bg-yellow-400 text-purple-900 px-3 py-1 rounded-full">
              <Star className="w-4 h-4" />
              <span className="text-sm">320</span>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center gap-1 overflow-x-auto pb-2 hide-scrollbar">
            {steps.map((step, i) => (
              <div key={i} className="flex items-center flex-shrink-0">
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    i < currentStep 
                      ? "bg-green-400" 
                      : i === currentStep 
                      ? "bg-yellow-400 text-purple-900" 
                      : "bg-white/20"
                  }`}>
                    {i < currentStep ? (
                      <CheckCircle className="w-5 h-5 text-white" />
                    ) : (
                      <span className="text-xs">{i + 1}</span>
                    )}
                  </div>
                  <p className="text-xs mt-1 text-center w-16">{step}</p>
                </div>
                {i < steps.length - 1 && (
                  <div className={`h-0.5 w-4 ${i < currentStep ? "bg-green-400" : "bg-white/20"}`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4 space-y-4">
        {renderStep()}

        {/* Navigation */}
        <div className="flex gap-3">
          {currentStep > 0 && (
            <Button
              variant="outline"
              onClick={() => setCurrentStep(currentStep - 1)}
              className="flex-1"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>
          )}
          {currentStep < steps.length - 1 && (
            <Button
              onClick={() => setCurrentStep(currentStep + 1)}
              disabled={currentStep === 0 && !businessType}
              className="flex-1 bg-purple-600 hover:bg-purple-700"
            >
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
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
