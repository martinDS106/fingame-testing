import { ArrowLeft, CheckCircle, Circle, XCircle, Clock, Award, Coins } from "lucide-react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { CoinsCounter } from "../CoinsCounter";
import { BottomNav } from "../BottomNav";
import { useNavigate } from "react-router";
import { useState } from "react";

const steps = [
  { id: 1, label: "Submitted", status: "completed" },
  { id: 2, label: "Documents Verified", status: "completed" },
  { id: 3, label: "Under Review", status: "current" },
  { id: 4, label: "Decision", status: "pending" },
];

const alternativeProducts = [
  {
    id: 1,
    bank: "Banque Misr",
    logo: "🏢",
    name: "Misr Gold Card",
    apr: 32,
    annualFee: 250,
    approvalOdds: 85,
  },
  {
    id: 2,
    bank: "Alex Bank",
    logo: "🏬",
    name: "Alex Student Card",
    apr: 28,
    annualFee: 0,
    approvalOdds: 95,
  },
];

export function ApplicationTracking() {
  const navigate = useNavigate();
  const [showSuccess, setShowSuccess] = useState(false);

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Award className="w-10 h-10 text-green-600" />
          </div>
          
          <h2 className="text-2xl text-gray-800 mb-2">Application Submitted!</h2>
          <p className="text-gray-600 mb-6">
            Your credit card application has been received
          </p>

          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="p-4 bg-yellow-50 rounded-xl">
              <Coins className="w-6 h-6 text-yellow-600 mx-auto mb-2" />
              <p className="text-sm text-gray-600 mb-1">Coins Earned</p>
              <p className="text-2xl text-yellow-600">+100</p>
            </div>
            <div className="p-4 bg-blue-50 rounded-xl">
              <Badge className="bg-blue-100 text-blue-600 border-0 mx-auto mb-2">
                New Badge
              </Badge>
              <p className="text-sm text-gray-600">First Application</p>
            </div>
          </div>

          <div className="space-y-2">
            <Button 
              className="w-full bg-green-600 hover:bg-green-700"
              onClick={() => setShowSuccess(false)}
            >
              Track Application
            </Button>
            <Button 
              variant="outline"
              className="w-full"
              onClick={() => navigate("/marketplace-home")}
            >
              Back to Marketplace
            </Button>
          </div>
        </Card>
      </div>
    );
  }

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
              <h2 className="text-xl">Application Status</h2>
            </div>
            <CoinsCounter coins={2550} />
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4 space-y-4">
        {/* Application Info */}
        <Card className="p-4">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-blue-100 rounded-lg flex items-center justify-center text-2xl">
              🏦
            </div>
            <div className="flex-1">
              <h4 className="text-gray-800 mb-1">CIB Smart Credit Card</h4>
              <p className="text-sm text-gray-600">Application ID: #CIB-2024-12345</p>
              <Badge className="mt-2 bg-blue-100 text-blue-700 border-0">
                <Clock className="w-3 h-3 mr-1" />
                In Progress
              </Badge>
            </div>
          </div>
          
          <div className="pt-3 border-t">
            <p className="text-xs text-gray-600">Submitted on March 1, 2026</p>
            <p className="text-xs text-gray-600">Expected decision: 3-5 business days</p>
          </div>
        </Card>

        {/* Progress Steps */}
        <Card className="p-4">
          <h4 className="text-gray-800 mb-4">Application Progress</h4>
          
          <div className="space-y-4">
            {steps.map((step, index) => {
              const isCompleted = step.status === "completed";
              const isCurrent = step.status === "current";
              const isPending = step.status === "pending";
              
              return (
                <div key={step.id} className="flex items-start gap-3">
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      isCompleted 
                        ? "bg-green-500" 
                        : isCurrent 
                        ? "bg-blue-500 animate-pulse" 
                        : "bg-gray-200"
                    }`}>
                      {isCompleted ? (
                        <CheckCircle className="w-6 h-6 text-white" />
                      ) : isCurrent ? (
                        <Clock className="w-6 h-6 text-white" />
                      ) : (
                        <Circle className="w-6 h-6 text-gray-400" />
                      )}
                    </div>
                    {index < steps.length - 1 && (
                      <div className={`w-0.5 h-12 ${
                        isCompleted ? "bg-green-500" : "bg-gray-200"
                      }`} />
                    )}
                  </div>
                  
                  <div className="flex-1 pt-2">
                    <p className={`text-sm ${
                      isCompleted || isCurrent ? "text-gray-800" : "text-gray-500"
                    }`}>
                      {step.label}
                    </p>
                    {isCurrent && (
                      <p className="text-xs text-gray-600 mt-1">
                        Our team is reviewing your application...
                      </p>
                    )}
                    {isCompleted && (
                      <p className="text-xs text-green-600 mt-1">
                        ✓ Completed
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Next Steps */}
        <Card className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <h4 className="text-gray-800 mb-2">What happens next?</h4>
          <ul className="text-sm text-gray-700 space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-blue-600">1.</span>
              <span>Bank reviews your application and documents</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600">2.</span>
              <span>You'll receive an email with the decision</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600">3.</span>
              <span>If approved, your card will be delivered in 7-10 days</span>
            </li>
          </ul>
        </Card>

        {/* Alternative Products */}
        <div>
          <h4 className="text-gray-800 mb-3">While you wait, check these out</h4>
          <div className="space-y-3">
            {alternativeProducts.map((product) => (
              <Card key={product.id} className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-blue-100 rounded-lg flex items-center justify-center text-2xl">
                    {product.logo}
                  </div>
                  <div className="flex-1">
                    <h5 className="text-sm text-gray-800 mb-1">{product.name}</h5>
                    <p className="text-xs text-gray-600 mb-2">{product.bank}</p>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="text-xs">
                        APR {product.apr}%
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        Fee EGP {product.annualFee}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="bg-green-100 rounded-full px-2 py-1">
                          <span className="text-xs text-green-700">{product.approvalOdds}% approval odds</span>
                        </div>
                      </div>
                      <Button size="sm" variant="outline">
                        View
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Support */}
        <Card className="p-4">
          <h4 className="text-gray-800 mb-3">Need Help?</h4>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" size="sm">
              Chat Support
            </Button>
            <Button variant="outline" size="sm">
              Call Bank
            </Button>
          </div>
        </Card>
      </div>

      <BottomNav />
    </div>
  );
}
