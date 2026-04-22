import { Coins } from "lucide-react";
import { useNavigate } from "react-router";

interface CoinsCounterProps {
  coins: number;
  className?: string;
}

export function CoinsCounter({ coins, className = "" }: CoinsCounterProps) {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate("/marketplace")}
      className={`flex items-center gap-2 bg-yellow-400 text-blue-900 px-3 py-1.5 rounded-full hover:bg-yellow-500 transition-colors shadow-md ${className}`}
    >
      <Coins className="w-4 h-4" />
      <span className="text-sm font-medium">{coins.toLocaleString()}</span>
    </button>
  );
}
