import { Heart, MessageCircle, Share2, Bookmark, TrendingUp, Play } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { BottomNav } from "./BottomNav";
import { useState } from "react";

const videos = [
  {
    id: 1,
    title: "5 Tips to Save Money Fast",
    creator: "Ahmed Finance",
    avatar: "👨‍💼",
    likes: 12500,
    comments: 234,
    shares: 89,
    linkedSimulation: "banking",
    thumbnail: "bg-gradient-to-br from-blue-400 to-purple-600",
  },
  {
    id: 2,
    title: "Stock Market for Beginners",
    creator: "Sara Investor",
    avatar: "👩‍💼",
    likes: 28300,
    comments: 512,
    shares: 156,
    linkedSimulation: "investment",
    thumbnail: "bg-gradient-to-br from-green-400 to-blue-600",
  },
  {
    id: 3,
    title: "How to Build Your Credit Score",
    creator: "Mohamed Expert",
    avatar: "🧑‍💻",
    likes: 15700,
    comments: 298,
    shares: 112,
    linkedSimulation: "credit",
    thumbnail: "bg-gradient-to-br from-orange-400 to-red-600",
  },
];

export function FinTok() {
  const [currentVideo, setCurrentVideo] = useState(0);
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);

  const video = videos[currentVideo];

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Video Content */}
      <div 
        className={`absolute inset-0 ${video.thumbnail} flex items-center justify-center`}
      >
        <Play className="w-20 h-20 text-white/80" />
      </div>

      {/* Video Info Overlay */}
      <div className="absolute bottom-20 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
        <div className="max-w-md mx-auto">
          {/* Creator Info */}
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-xl">
              {video.avatar}
            </div>
            <div className="flex-1">
              <p className="text-white text-sm">{video.creator}</p>
              <p className="text-white/60 text-xs">Financial Educator</p>
            </div>
            <Button size="sm" className="bg-yellow-400 hover:bg-yellow-500 text-blue-900">
              Follow
            </Button>
          </div>

          {/* Video Title */}
          <h3 className="text-white text-lg mb-2">{video.title}</h3>

          {/* Try This CTA */}
          <Button 
            className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-blue-900 mb-3"
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            Try This Simulation
          </Button>

          {/* Watch Rewards */}
          <div className="flex items-center gap-2">
            <Badge className="bg-yellow-400/20 text-yellow-300 border-yellow-400/30">
              +5 Coins for watching
            </Badge>
            <Badge className="bg-blue-400/20 text-blue-300 border-blue-400/30">
              +10 XP
            </Badge>
          </div>
        </div>
      </div>

      {/* Right Side Actions */}
      <div className="absolute right-4 bottom-32 flex flex-col gap-6">
        <button 
          className="flex flex-col items-center gap-1"
          onClick={() => setLiked(!liked)}
        >
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
            liked ? "bg-red-500" : "bg-white/20 backdrop-blur-sm"
          }`}>
            <Heart className={`w-6 h-6 ${liked ? "fill-white" : ""} text-white`} />
          </div>
          <span className="text-white text-xs">{(video.likes + (liked ? 1 : 0)).toLocaleString()}</span>
        </button>

        <button className="flex flex-col items-center gap-1">
          <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
            <MessageCircle className="w-6 h-6 text-white" />
          </div>
          <span className="text-white text-xs">{video.comments}</span>
        </button>

        <button 
          className="flex flex-col items-center gap-1"
          onClick={() => setSaved(!saved)}
        >
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
            saved ? "bg-yellow-500" : "bg-white/20 backdrop-blur-sm"
          }`}>
            <Bookmark className={`w-6 h-6 ${saved ? "fill-white" : ""} text-white`} />
          </div>
          <span className="text-white text-xs">Save</span>
        </button>

        <button className="flex flex-col items-center gap-1">
          <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
            <Share2 className="w-6 h-6 text-white" />
          </div>
          <span className="text-white text-xs">{video.shares}</span>
        </button>
      </div>

      {/* Swipe Navigation (simulated) */}
      <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 flex justify-between px-4 opacity-0 hover:opacity-100 transition-opacity">
        <button
          onClick={() => setCurrentVideo(Math.max(0, currentVideo - 1))}
          disabled={currentVideo === 0}
          className="text-white/60 disabled:opacity-30"
        >
          ↑ Previous
        </button>
        <button
          onClick={() => setCurrentVideo(Math.min(videos.length - 1, currentVideo + 1))}
          disabled={currentVideo === videos.length - 1}
          className="text-white/60 disabled:opacity-30"
        >
          ↓ Next
        </button>
      </div>

      <BottomNav />
    </div>
  );
}
