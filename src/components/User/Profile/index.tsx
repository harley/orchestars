import React, { useEffect, useState } from 'react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Coins, Target, TrendingUp } from 'lucide-react'
import { ProgressBar } from '@/components/User/Profile/ProgressBar'
import { OrderHistory } from '@/components/User/Profile/OrderHistory'
import { RewardsGallery } from '@/components/User/Profile/RewardsGallery'
import { useToast } from '@/components/ui/use-toast'
import { TicketZoneLabel } from '@/collections/Events/constants'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { MembershipTier } from '@/components/User/Profile/MembershipTier'
import { User } from '@/payload-types'

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
    type: "bonus" as const
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

type MembershipPoint = {
  totalPoints: number,
  membershipRank: "Standard" | "Silver" | "Gold" | "Platinum",
  nextRank: "Standard" | "Silver" | "Gold" | "Platinum",
  pointsToNextRank: number
}

type RewardsTimeline = {
  id: number
  description: string
  date: string
  pointsEarned: number
  amount: number
  type: "purchase" | "bonus"
}[]

type MembershipGifts = {
  id: string
  label: TicketZoneLabel
  type: "giftTicket"
  expiresAt: string
}[]

type PaginationInfo = {
  page: number
  limit: number
  totalPages: number
  totalDocs: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

interface ApiResponse {
  success: boolean
  data: MembershipPoint | RewardsTimeline | MembershipGifts
  pagination?: PaginationInfo
  error?: string
}

const UserProfile = ({ userData, className } : { className?: string, userData?: User }) => {
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const [membershipPoint, setMembershipPoint] = useState<MembershipPoint | null>(null);
  const [histories, setHistories] = useState<RewardsTimeline | null>(null);
  const [rewards, setRewards] = useState<MembershipGifts | null>(null);

  const fetchMembershipPoint = async () => {
    const response = await fetch('/api/user/membership-point');
    const result: ApiResponse = await response.json();
    if (result.success) {
      setMembershipPoint(result.data as MembershipPoint);
    } else {
      setMembershipPoint(null);
      toast({
        title: "Error",
        description: "Failed to fetch some data",
        variant: "destructive",
      })
    }
  }

  const fetchRewardsTimeline = async() => {
    const response = await fetch('/api/user/reward-timeline');
    const result: ApiResponse = await response.json();
    if (result.success) {
      setHistories(result.data as RewardsTimeline);
    } else {
      setHistories(null);
      toast({
        title: "Error",
        description: "Failed to fetch some data",
        variant: "destructive",
      })
    }
  }

  const fetchRewardsGallery = async () => {
    const response = await fetch('/api/user/membership-gifts');
    const result: ApiResponse = await response.json();
    if (result.success) {
      setRewards(result.data as MembershipGifts);
    } else {
      setRewards(null);
      toast({
        title: "Error",
        description: "Failed to fetch some data",
        variant: "destructive",
      })
    }
  }

  const fetchInitialData = async () => {
    setLoading(true);
    await Promise.all([
      fetchMembershipPoint(),
      fetchRewardsTimeline(),
      fetchRewardsGallery()
    ])
    setLoading(false);
  }

  useEffect(() => {
    console.log('User data:', userData);
    setMounted(true)
    fetchInitialData();
  }, [])

  const [pointsCounter, setPointsCounter] = useState(0);

  // Animate points counter on load
  useEffect(() => {
    let animationFrameId: number;
    const startTime = performance.now();
    const duration = 2000; // Animation duration in milliseconds
    const animateCounter = (currentTime: number) => {
      const elapsedTime = currentTime - startTime;
      const progress = Math.min(elapsedTime / duration, 1);
      const currentValue = Math.round(progress * (membershipPoint?.totalPoints || 0));
      setPointsCounter(currentValue);
      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animateCounter);
      }
    };
    animationFrameId = requestAnimationFrame(animateCounter);
    return () => cancelAnimationFrame(animationFrameId);
  }, [membershipPoint]);

  const containerClass = `border-white/20 bg-white rounded-2xl shadow-xl p-8 mt-8 transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} ${className || ''}`

  if (membershipPoint === null || histories === null || rewards === null) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-lg text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex-col space-y-8 max-w-4xl mx-auto">
      {/* Profile Header */}
      <Card className={containerClass}>
        <CardContent className="relative p-6 md:p-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="relative">
              <Avatar className="h-24 w-24 border-4 border-blue-200 shadow-md">
                <AvatarImage src="" alt="avatar" />
                <AvatarFallback className="text-[50px]">👤</AvatarFallback>
              </Avatar>
              <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
                ★
              </div>
            </div>

            <div className="flex-1 space-y-4">
              <div className="space-y-2">
                <div className="flex flex-col md:flex-row md:items-center gap-3">
                  <h1 className="text-3xl font-bold animate-slide-up">
                    {userData?.firstName || ''} {userData?.lastName || ''}
                  </h1>
                  <MembershipTier tier={membershipPoint.membershipRank} />
                </div>
                <p className="text-muted-foreground animate-slide-up" style={{ animationDelay: "100ms" }}>
                  Member since {mockUserData.memberSince}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    <span className="text-sm">Points to {membershipPoint?.nextRank || 'Standard'}</span>
                  </div>
                  <p className="text-2xl font-bold">
                    {((membershipPoint?.pointsToNextRank ?? 0) - (membershipPoint?.totalPoints ?? 0)).toLocaleString()}
                  </p>
                </div>

              {/* <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-sm">Lifetime Points</span>
                </div>
                <p className="text-2xl font-bold">
                  {mockUserData.totalLifetimePoints.toLocaleString()}
                </p>
              </div> */}
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
              Journey to {membershipPoint?.nextRank || 'Standard'} Tier
            </CardTitle>
            <div className="text-sm text-muted-foreground text-gray-600">
              Membership Tier Progression
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ProgressBar 
            current={membershipPoint?.totalPoints || 0}
            target={membershipPoint?.pointsToNextRank || 1000}
            tier={membershipPoint?.nextRank || 'Standard'}
          />
        </CardContent>
      </Card>

      {/* Detail Membership Point Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <OrderHistory orders={histories} className={containerClass}/>
        <RewardsGallery rewards={rewards} className={containerClass}/>
      </div>
    </div>
  )
}

export default UserProfile