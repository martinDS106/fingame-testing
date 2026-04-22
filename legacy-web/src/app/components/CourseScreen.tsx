import { ArrowLeft, Play, CheckCircle, Lock, Award, MessageSquare } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Progress } from "./ui/progress";
import { BottomNav } from "./BottomNav";
import { useNavigate } from "react-router";
import { useState } from "react";

const courseSections = [
  { id: 1, title: "Introduction to Investing", type: "video", duration: "8 min", completed: true, locked: false },
  { id: 2, title: "Understanding Risk & Return", type: "video", duration: "12 min", completed: true, locked: false },
  { id: 3, title: "Quiz: Investment Basics", type: "quiz", questions: 10, completed: true, locked: false },
  { id: 4, title: "Stock Market Fundamentals", type: "video", duration: "15 min", completed: false, locked: false },
  { id: 5, title: "Portfolio Diversification", type: "video", duration: "10 min", completed: false, locked: false },
  { id: 6, title: "Simulation: Build Your Portfolio", type: "simulation", duration: "20 min", completed: false, locked: false },
  { id: 7, title: "Advanced Strategies", type: "video", duration: "18 min", completed: false, locked: true },
];

export function CourseScreen() {
  const navigate = useNavigate();
  const [currentSection] = useState(4);
  const completedSections = courseSections.filter(s => s.completed).length;
  const progressPercent = Math.round((completedSections / courseSections.length) * 100);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 shadow-md">
        <div className="max-w-md mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <button onClick={() => navigate("/dashboard")} className="hover:bg-white/10 p-1 rounded">
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h2 className="text-xl">Investing Basics</h2>
          </div>
          
          {/* Progress Tracker */}
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex justify-between text-sm mb-2">
              <span>Course Progress</span>
              <span>{progressPercent}% Complete</span>
            </div>
            <Progress value={progressPercent} className="h-2 bg-white/20" />
            <div className="flex items-center gap-4 mt-3 text-sm">
              <div className="flex items-center gap-1">
                <CheckCircle className="w-4 h-4" />
                <span>{completedSections}/{courseSections.length} Lessons</span>
              </div>
              <div className="flex items-center gap-1">
                <Award className="w-4 h-4 text-yellow-300" />
                <span className="text-yellow-300">450 Points Earned</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4 space-y-4">
        {/* Current Section Preview */}
        <Card className="p-0 overflow-hidden border-2 border-blue-200">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-48 flex items-center justify-center">
            <div className="text-center text-white">
              <Play className="w-16 h-16 mx-auto mb-3 bg-white/20 p-3 rounded-full" />
              <h3 className="text-lg">Stock Market Fundamentals</h3>
              <p className="text-sm text-blue-100">15 minutes</p>
            </div>
          </div>
          <div className="p-4">
            <p className="text-gray-600 mb-4">
              Learn how stock markets work, understand market orders, and discover how to analyze stock performance.
            </p>
            <Button className="w-full bg-blue-600 hover:bg-blue-700">
              <Play className="w-4 h-4 mr-2" />
              Continue Learning
            </Button>
          </div>
        </Card>

        {/* Course Sections */}
        <div>
          <h3 className="text-lg text-gray-800 mb-3">Course Content</h3>
          <div className="space-y-2">
            {courseSections.map((section) => {
              const isActive = section.id === currentSection;
              
              return (
                <Card 
                  key={section.id} 
                  className={`p-4 cursor-pointer transition-all ${
                    isActive ? "border-2 border-blue-500 bg-blue-50" : ""
                  } ${section.locked ? "opacity-50" : "hover:border-blue-300"}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${
                      section.completed 
                        ? "bg-green-100" 
                        : section.locked 
                        ? "bg-gray-100" 
                        : "bg-blue-100"
                    }`}>
                      {section.completed ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : section.locked ? (
                        <Lock className="w-5 h-5 text-gray-400" />
                      ) : section.type === "video" ? (
                        <Play className="w-5 h-5 text-blue-600" />
                      ) : section.type === "quiz" ? (
                        <Award className="w-5 h-5 text-purple-600" />
                      ) : (
                        <MessageSquare className="w-5 h-5 text-green-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm">{section.title}</h4>
                      <p className="text-xs text-gray-500">
                        {section.type === "video" && section.duration}
                        {section.type === "quiz" && `${section.questions} questions`}
                        {section.type === "simulation" && section.duration}
                      </p>
                    </div>
                    {section.completed && (
                      <div className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                        Completed
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Discussion Forum */}
        <Card className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
          <div className="flex items-center gap-3 mb-2">
            <MessageSquare className="w-5 h-5 text-purple-600" />
            <h4 className="text-gray-800">Discussion Forum</h4>
          </div>
          <p className="text-sm text-gray-600 mb-3">
            Join the conversation with other learners and instructors
          </p>
          <Button variant="outline" className="w-full border-purple-300 text-purple-700 hover:bg-purple-50">
            View Discussions
          </Button>
        </Card>

        {/* Reward Card */}
        <Card className="p-4 bg-gradient-to-r from-yellow-400 to-yellow-500 border-0 text-blue-900">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Award className="w-5 h-5" />
                <h4>Course Completion Reward</h4>
              </div>
              <p className="text-sm text-blue-800">
                Complete all lessons to earn 1000 points!
              </p>
            </div>
            <div className="text-3xl">🎁</div>
          </div>
        </Card>
      </div>

      <BottomNav />
    </div>
  );
}
