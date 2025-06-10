'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Trophy, 
  TrendingUp, 
  Ticket, 
  DollarSign, 
  Gift,
  Users,
  Calendar,
  Award
} from 'lucide-react';

interface TierQualification {
  qualifiedTier: any | null;
  tierLevel: number;
  commissionAmount: number;
  freeTicketsEarned: Array<{
    ticketType: string;
    quantity: number;
    ticketValue: number;
  }>;
  totalRewardValue: number;
}

interface AffiliateSalesData {
  totalTicketsSold: number;
  totalNetRevenue: number;
  ticketsByType: Record<string, number>;
  revenueByType: Record<string, number>;
}

interface AffiliatePerformance {
  salesData: AffiliateSalesData;
  tierQualification: TierQualification;
  settings: any;
}

interface AffiliateTierDashboardProps {
  affiliateId: number;
  eventId: number;
  className?: string;
}

export function AffiliateTierDashboard({ 
  affiliateId, 
  eventId, 
  className = '' 
}: AffiliateTierDashboardProps) {
  const [performance, setPerformance] = useState<AffiliatePerformance | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPerformanceData();
  }, [affiliateId, eventId]);

  const fetchPerformanceData = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/affiliate-tiers?action=affiliate-performance&affiliateId=${affiliateId}&eventId=${eventId}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch performance data');
      }
      
      const result = await response.json();
      setPerformance(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getTierBadgeColor = (tierLevel: number) => {
    switch (tierLevel) {
      case 1: return 'bg-green-100 text-green-800';
      case 2: return 'bg-blue-100 text-blue-800';
      case 3: return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getNextTierProgress = () => {
    if (!performance?.settings?.tiers || !performance.salesData) return null;
    
    const currentTierLevel = performance.tierQualification.tierLevel;
    const nextTier = performance.settings.tiers.find(
      (tier: any) => tier.tierLevel === currentTierLevel + 1
    );
    
    if (!nextTier) return null;
    
    const currentTickets = performance.salesData.totalTicketsSold;
    const requiredTickets = nextTier.qualificationCriteria.minTicketsSold;
    const progress = Math.min((currentTickets / requiredTickets) * 100, 100);
    
    return {
      nextTier,
      progress,
      ticketsNeeded: Math.max(0, requiredTickets - currentTickets),
    };
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="animate-pulse">
          <div className="h-32 bg-gray-200 rounded-lg mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <p className="text-red-600">Error: {error}</p>
        <Button onClick={fetchPerformanceData} className="mt-4">
          Retry
        </Button>
      </div>
    );
  }

  if (!performance) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <p className="text-gray-600">No performance data available</p>
      </div>
    );
  }

  const { salesData, tierQualification, settings } = performance;
  const nextTierInfo = getNextTierProgress();

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Current Tier Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Current Tier Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          {tierQualification.qualifiedTier ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Badge className={getTierBadgeColor(tierQualification.tierLevel)}>
                    {tierQualification.qualifiedTier.tierName}
                  </Badge>
                  <p className="text-sm text-gray-600 mt-1">
                    Level {tierQualification.tierLevel}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-green-600">
                    {tierQualification.qualifiedTier.rewards.commissionPercentage}%
                  </p>
                  <p className="text-sm text-gray-600">Commission Rate</p>
                </div>
              </div>
              
              {tierQualification.freeTicketsEarned.length > 0 && (
                <div className="bg-blue-50 p-3 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
                    <Gift className="h-4 w-4" />
                    Free Tickets Earned
                  </h4>
                  {tierQualification.freeTicketsEarned.map((ticket, index) => (
                    <p key={index} className="text-blue-800 text-sm">
                      {ticket.quantity}x {ticket.ticketType.toUpperCase()} tickets
                      {ticket.ticketValue > 0 && (
                        <span className="text-blue-600">
                          {' '}({formatCurrency(ticket.ticketValue)} each)
                        </span>
                      )}
                    </p>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-600">No tier qualification yet</p>
              <p className="text-sm text-gray-500">Start selling tickets to qualify for rewards!</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Ticket className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{salesData.totalTicketsSold}</p>
                <p className="text-sm text-gray-600">Tickets Sold</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-2xl font-bold">
                  {formatCurrency(salesData.totalNetRevenue)}
                </p>
                <p className="text-sm text-gray-600">Net Revenue</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">
                  {formatCurrency(tierQualification.commissionAmount)}
                </p>
                <p className="text-sm text-gray-600">Commission Earned</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4 text-orange-600" />
              <div>
                <p className="text-2xl font-bold">
                  {formatCurrency(tierQualification.totalRewardValue)}
                </p>
                <p className="text-sm text-gray-600">Total Rewards</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Next Tier Progress */}
      {nextTierInfo && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Progress to Next Tier
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{nextTierInfo.nextTier.tierName}</p>
                  <p className="text-sm text-gray-600">
                    Level {nextTierInfo.nextTier.tierLevel}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-blue-600">
                    {nextTierInfo.nextTier.rewards.commissionPercentage}%
                  </p>
                  <p className="text-sm text-gray-600">Commission Rate</p>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Progress</span>
                  <span>{Math.round(nextTierInfo.progress)}%</span>
                </div>
                <Progress value={nextTierInfo.progress} className="h-2" />
                <p className="text-sm text-gray-600 mt-2">
                  {nextTierInfo.ticketsNeeded > 0 
                    ? `${nextTierInfo.ticketsNeeded} more tickets needed`
                    : 'Qualification criteria met!'
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Ticket Breakdown */}
      {Object.keys(salesData.ticketsByType).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Ticket Sales Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(salesData.ticketsByType).map(([type, count]) => (
                <div key={type} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{type.toUpperCase()}</p>
                    <p className="text-sm text-gray-600">
                      {formatCurrency(salesData.revenueByType[type] || 0)} revenue
                    </p>
                  </div>
                  <Badge variant="outline">{count} tickets</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
