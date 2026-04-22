import { GraduationCap, Gamepad2 } from "lucide-react";
import { Button } from "./ui/button";
import { useNavigate } from "react-router";

export function WelcomeScreen() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-blue-600 flex flex-col items-center justify-center p-6">
      {/* Logo */}
      <div className="flex flex-col items-center mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="relative">
            <Gamepad2 className="w-20 h-20 text-yellow-400" strokeWidth={2} />
            <GraduationCap className="w-10 h-10 text-yellow-300 absolute -top-2 -right-2" strokeWidth={2} />
          </div>
        </div>
        <h1 className="text-5xl text-white mb-3">Fin-Game</h1>
        <p className="text-2xl text-yellow-300 tracking-wide">
          Game, Learn, Earn
        </p>
      </div>

      {/* Get Started Button */}
      <Button
        onClick={() => navigate("/dashboard")}
        className="bg-yellow-400 hover:bg-yellow-500 text-blue-900 px-12 py-6 rounded-full text-xl shadow-xl"
      >
        Start Learning
      </Button>

      <p className="text-white/80 mt-8 text-center max-w-md">
        Master financial literacy through interactive courses, quizzes, and real-world simulations
      </p>
    </div>
  );
}
