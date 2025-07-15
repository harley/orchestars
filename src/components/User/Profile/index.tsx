import React, { useEffect, useState } from 'react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Coins, Target, } from 'lucide-react'
import { ProgressBar } from '@/components/User/Profile/ProgressBar'
import { OrderHistory } from '@/components/User/Profile/OrderHistory'
import { RewardsGallery } from '@/components/User/Profile/RewardsGallery'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { MembershipTier } from '@/components/User/Profile/MembershipTier'
import { User } from '@/payload-types'
import { useUserProfile } from '@/components/User/hooks/useUserProfile'
import { Loader2 } from 'lucide-react'

const UserProfile = ({ userData, className } : { className?: string, userData?: User }) => {
  const [mounted, setMounted] = useState(false)

  const {
    isLoading,
    error,
    membershipPoint,
    histories,
    rewards,
  } = useUserProfile()

  useEffect(() => {
    setMounted(true)
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

  if (isLoading) {
    return (
      <div className="flex-col space-y-8 max-w-4xl mx-auto">
        <div className={containerClass}>
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-col space-y-8 max-w-4xl mx-auto">
        <div className={containerClass}>
          <div className="flex justify-center py-16">
            <p className="text-lg text-red-500">Failed to load user profile data.</p>
          </div>
        </div>
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
                  <MembershipTier tier={membershipPoint?.membershipRank ?? 'Standard'} />
                </div>
                <p className="text-muted-foreground animate-slide-up" style={{ animationDelay: "100ms" }}>
                  Member since {new Date(userData?.createdAt ?? '').toLocaleString('en-US', { month: 'long', year: 'numeric' })}
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
        <OrderHistory orders={histories ?? []} className={containerClass}/>
        <RewardsGallery rewards={rewards ?? []} className={containerClass}/>
      </div>
    </div>
  )
}

export default UserProfile