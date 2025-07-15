import { useState, useCallback, useEffect } from 'react'
import { TicketZoneLabel } from '@/collections/Events/constants'

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

export function useUserProfile() {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [membershipPoint, setMembershipPoint] = useState<MembershipPoint | null>(null);
  const [histories, setHistories] = useState<RewardsTimeline | null>(null);
  const [rewards, setRewards] = useState<MembershipGifts | null>(null);

  const fetchMembershipPoint = async () => {
    try {
      const response = await fetch('/api/user/membership-point');
      const result: ApiResponse = await response.json();
      if (result.success) {
        setMembershipPoint(result.data as MembershipPoint);
      } else {
        setMembershipPoint(null);
        setError(result.error || 'Failed to fetch membership point');
      }
    } catch (err) {
      setMembershipPoint(null);
      setError('Failed to fetch membership point');
      console.error('Error fetching membership point:', err);
    }
  }

  const fetchRewardsTimeline = async () => {
    try {
      const response = await fetch('/api/user/reward-timeline');
      const result: ApiResponse = await response.json();
      if (result.success) {
        setHistories(result.data as RewardsTimeline);
      } else {
        setHistories(null);
        setError(result.error || 'Failed to fetch rewards timeline');
      }
    } catch (err) {
      setHistories(null);
      setError('Failed to fetch rewards timeline');
      console.error('Error fetching rewards timeline:', err);
    }
  }

  const fetchRewardsGallery = async () => {
    try {
      const response = await fetch('/api/user/membership-gifts');
      const result: ApiResponse = await response.json();
      if (result.success) {
        setRewards(result.data as MembershipGifts);
      } else {
        setRewards(null);
        setError(result.error || 'Failed to fetch rewards gallery');
      }
    } catch (err) {
      setRewards(null);
      setError('Failed to fetch rewards gallery');
      console.error('Error fetching rewards gallery:', err);
    }
  }

  const fetchInitialData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    await fetchMembershipPoint();
    await fetchRewardsTimeline();
    await fetchRewardsGallery();
    setIsLoading(false);
  }, [fetchMembershipPoint, fetchRewardsTimeline, fetchRewardsGallery]);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData])

  return {
    isLoading,
    error,
    membershipPoint,
    histories,
    rewards,
    // refresh: () => fetchInitialData()
  }
}