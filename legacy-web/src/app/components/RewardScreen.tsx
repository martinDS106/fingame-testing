import { ChevronLeft, Gift, ShoppingBag, Ticket, Star, Tag } from 'lucide-react';
import { useNavigate } from 'react-router';

interface Reward {
  id: string;
  title: string;
  description: string;
  points: number;
  category: 'discount' | 'giftcard' | 'exclusive';
  image: string;
}

const rewards: Reward[] = [
  {
    id: '1',
    title: '20% Off Carrefour',
    description: 'Valid on purchases over $50',
    points: 500,
    category: 'discount',
    image: '🛒'
  },
  {
    id: '2',
    title: '$10 Amazon Gift Card',
    description: 'Redeemable on Amazon.com',
    points: 1000,
    category: 'giftcard',
    image: '💳'
  },
  {
    id: '3',
    title: 'Premium Course Access',
    description: 'Unlock advanced courses',
    points: 2000,
    category: 'exclusive',
    image: '🎓'
  },
  {
    id: '4',
    title: '15% Off Noon',
    description: 'Electronics & gadgets',
    points: 600,
    category: 'discount',
    image: '📱'
  },
  {
    id: '5',
    title: '$25 Starbucks Card',
    description: 'Coffee on us!',
    points: 1500,
    category: 'giftcard',
    image: '☕'
  },
  {
    id: '6',
    title: 'VIP Webinar Access',
    description: 'Exclusive expert sessions',
    points: 800,
    category: 'exclusive',
    image: '🎤'
  }
];

export function RewardScreen() {
  const navigate = useNavigate();
  const userPoints = 1540;

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'discount':
        return <Tag className="size-4" />;
      case 'giftcard':
        return <Gift className="size-4" />;
      case 'exclusive':
        return <Star className="size-4" />;
      default:
        return <Ticket className="size-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'discount':
        return 'bg-yellow-100 text-yellow-700';
      case 'giftcard':
        return 'bg-blue-100 text-blue-700';
      case 'exclusive':
        return 'bg-purple-100 text-purple-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-yellow-400 to-blue-500 px-4 py-6 shadow-md">
        <div className="flex items-center gap-4 mb-4">
          <button onClick={() => navigate('/dashboard')} className="text-white">
            <ChevronLeft className="size-6" />
          </button>
          <h1 className="text-white flex-1">Rewards</h1>
        </div>

        {/* Points Balance */}
        <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-5 py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm">Available Points</p>
              <p className="text-white text-3xl">{userPoints}</p>
            </div>
            <ShoppingBag className="size-12 text-white/80" />
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="px-4 py-4 bg-white border-b border-gray-200">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          <button className="px-4 py-2 bg-gradient-to-r from-yellow-400 to-blue-500 text-white rounded-full whitespace-nowrap">
            All Rewards
          </button>
          <button className="px-4 py-2 bg-gray-100 text-gray-600 rounded-full whitespace-nowrap hover:bg-gray-200 transition-all">
            Discounts
          </button>
          <button className="px-4 py-2 bg-gray-100 text-gray-600 rounded-full whitespace-nowrap hover:bg-gray-200 transition-all">
            Gift Cards
          </button>
          <button className="px-4 py-2 bg-gray-100 text-gray-600 rounded-full whitespace-nowrap hover:bg-gray-200 transition-all">
            Exclusive
          </button>
        </div>
      </div>

      {/* Rewards Grid */}
      <div className="px-4 py-6">
        <div className="grid grid-cols-1 gap-4">
          {rewards.map((reward) => {
            const canAfford = userPoints >= reward.points;
            return (
              <div
                key={reward.id}
                className={`bg-white rounded-2xl shadow-md overflow-hidden ${
                  !canAfford ? 'opacity-60' : ''
                }`}
              >
                <div className="flex items-start gap-4 p-5">
                  <div className="size-20 bg-gradient-to-br from-yellow-100 to-blue-100 rounded-xl flex items-center justify-center text-4xl flex-shrink-0">
                    {reward.image}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="text-gray-900">{reward.title}</h3>
                      <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs whitespace-nowrap ${getCategoryColor(reward.category)}`}>
                        {getCategoryIcon(reward.category)}
                        <span className="capitalize">{reward.category}</span>
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm mb-3">{reward.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Star className="size-4 text-yellow-500 fill-yellow-500" />
                        <span className="text-gray-900">{reward.points} points</span>
                      </div>
                      <button
                        disabled={!canAfford}
                        className={`px-6 py-2 rounded-xl transition-all ${
                          canAfford
                            ? 'bg-gradient-to-r from-yellow-400 to-blue-500 text-white hover:shadow-lg'
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        {canAfford ? 'Redeem' : 'Locked'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* How to Earn More */}
      <div className="px-4 pb-6">
        <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg p-5 text-white">
          <h3 className="mb-2">Need More Points?</h3>
          <p className="text-white/80 text-sm mb-4">
            Complete courses, take quizzes, and participate in simulations to earn more points!
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-white text-blue-600 px-6 py-2 rounded-xl hover:bg-white/90 transition-all"
          >
            Start Learning
          </button>
        </div>
      </div>
    </div>
  );
}
