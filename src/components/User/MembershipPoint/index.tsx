import React, { useEffect, useState } from 'react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Coins, Target, TrendingUp } from 'lucide-react'
import { ProgressBar } from '@/components/User/MembershipPoint/ProgressBar'
import { OrderHistory } from '@/components/User/MembershipPoint/OrderHistory'
import { RewardsGallery } from '@/components/User/MembershipPoint/RewardsGallery'

// Mock data - in real app this would come from API
const mockUserData = {
  id: "1",
  name: "Sarah Johnson",
  email: "sarah@example.com",
  // avatar: userAvatar,
  currentTier: "gold" as const,
  nextTier: "platinum" as const,
  currentPoints: 8750,
  pointsToNextTier: 10000,
  totalLifetimePoints: 25600,
  memberSince: "January 2022"
};

const mockOrders = [
  {
    id: "1",
    date: "Dec 15, 2024",
    description: "Premium Coffee Subscription",
    amount: 89.99,
    pointsEarned: 450,
    type: "purchase" as const
  },
  {
    id: "2", 
    date: "Dec 10, 2024",
    description: "Holiday Bonus Points",
    amount: 0,
    pointsEarned: 1000,
    type: "bonus" as const
  },
  {
    id: "3",
    date: "Dec 5, 2024", 
    description: "Friend Referral Bonus",
    amount: 0,
    pointsEarned: 500,
    type: "purchase" as const
  },
  {
    id: "4",
    date: "Nov 28, 2024",
    description: "Black Friday Purchase",
    amount: 156.50,
    pointsEarned: 780,
    type: "purchase" as const
  }
];

const mockRewards = [
  {
    id: "1",
    name: "Premium Coffee Tumbler",
    description: "Insulated stainless steel tumbler with premium branding",
    imageUrl: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&h=200&fit=crop",
    dateReceived: "Nov 15, 2024",
    pointsCost: 2500,
    category: "product" as const
  },
  // {
  //   id: "2",
  //   name: "VIP Tasting Experience",
  //   description: "Exclusive coffee tasting session with our master roaster",
  //   imageUrl: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&h=200&fit=crop",
  //   dateReceived: "Oct 20, 2024",
  //   pointsCost: 5000,
  //   category: "experience" as const
  // },
  {
    id: "3",
    name: "20% Off Next Order",
    description: "Special discount for loyal members",
    imageUrl: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=300&h=200&fit=crop",
    dateReceived: "Sep 30, 2024", 
    pointsCost: 1000,
    category: "discount" as const
  }
];

const MembershipPoint = ({ className } : { className?: string }) => {
  const [mounted, setMounted] = useState(false)

  const [pointsCounter, setPointsCounter] = useState(0);

  // Animate points counter on load
  useEffect(() => {
    const timer = setInterval(() => {
      setPointsCounter(prev => {
        if (prev < mockUserData.currentPoints) {
          return Math.min(prev + 150, mockUserData.currentPoints);
        }
        clearInterval(timer);
        return prev;
      });
    }, 20);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    setMounted(true)
  }, [])

  const containerClass = `border-white/20 bg-white rounded-2xl shadow-xl p-8 mt-8 transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} ${className || ''}`

  return (
    <div className="flex-col space-y-8 max-w-4xl mx-auto">
      {/* Membership Point Header */}
      <Card className={containerClass}>
        <CardContent className="relative p-6 md:p-8">
          <div className="flex-1 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Coins className="w-4 h-4" />
                  <span className="text-sm">Current Points</span>
                </div>
                <p className="text-3xl font-bold">
                  {pointsCounter.toLocaleString()}
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Target className="w-4 h-4" />
                  <span className="text-sm">Points to {mockUserData.nextTier}</span>
                </div>
                <p className="text-2xl font-bold">
                  {(mockUserData.pointsToNextTier - mockUserData.currentPoints).toLocaleString()}
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-sm">Lifetime Points</span>
                </div>
                <p className="text-2xl font-bold">
                  {mockUserData.totalLifetimePoints.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Membership Progress Card */}
      <Card className={containerClass}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl">
              Journey to {mockUserData.nextTier.charAt(0).toUpperCase() + mockUserData.nextTier.slice(1)}
            </CardTitle>
            <div className="text-sm text-muted-foreground text-gray-600">
              Membership Tier Progression
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ProgressBar 
            current={mockUserData.currentPoints}
            target={mockUserData.pointsToNextTier}
            tier={mockUserData.currentTier}
          />
        </CardContent>
      </Card>

      {/* Detail Membership Point Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <OrderHistory orders={mockOrders} className={containerClass}/>
        <RewardsGallery rewards={mockRewards} className={containerClass}/>
      </div>
    </div>
  )
}

export default MembershipPoint