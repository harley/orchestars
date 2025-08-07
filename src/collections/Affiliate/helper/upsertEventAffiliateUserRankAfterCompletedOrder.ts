import { EventAffiliateRank, EventAffiliateUserRank } from "@/payload-types"
import { FieldHookArgs } from "payload"

export const upsertEventAffiliateUserRankAfterCompletedOrder = async (
    {
      eventAffiliateUserRank,
      affiliateUserId,
      totalPoints,
      totalBeforeDiscountValue,
      totalValueAfterTaxAfterDiscount,
      totalValueBeforeTaxAfterDiscount,
      totalTicketSold,
      eventAffiliateRank,
    }: {
      eventAffiliateUserRank?: EventAffiliateUserRank
      affiliateUserId: number
      totalPoints: number
      totalBeforeDiscountValue: number
      totalValueAfterTaxAfterDiscount: number
      totalValueBeforeTaxAfterDiscount: number
      totalTicketSold: number
      eventAffiliateRank: EventAffiliateRank
    },
    req: FieldHookArgs['req'],
  ) => {
    const commonData = {
      totalPoints,
      totalRevenue: totalValueBeforeTaxAfterDiscount,
      totalRevenueBeforeTax: totalValueBeforeTaxAfterDiscount,
      totalRevenueAfterTax: totalValueAfterTaxAfterDiscount,
      totalRevenueBeforeDiscount: totalBeforeDiscountValue,
      totalTicketsSold: totalTicketSold,
      totalCommissionEarned: 0,
      totalTicketsRewarded: 0,
      lastActivityDate: new Date().toISOString(),
    }

    
  
    // get total totalTicketsRewarded based on the current eventAffiliateRank
    if (eventAffiliateRank.eventRewards?.ticketRewards) {
      // now check by totalRevenueBeforeDiscount first in eventAffiliateRank.eventRewards?.ticketRewards array
      // sort by minRevenue desc first
      const ticketRewards = eventAffiliateRank.eventRewards?.ticketRewards?.sort(
        (a, b) => b.minRevenue - a.minRevenue,
      )
      const ticketReward = ticketRewards?.find(
        (reward) => reward.minRevenue <= totalValueBeforeTaxAfterDiscount,
      )
      if (ticketReward) {
        commonData.totalTicketsRewarded = ticketReward.rewardTickets || 0
      }
    }
  
    if (eventAffiliateRank.eventRewards?.commissionRewards) {
      // sort by minRevenue desc first
      const commissionRewards = eventAffiliateRank.eventRewards?.commissionRewards?.sort(
        (a, b) => b.minRevenue - a.minRevenue,
      )
      const commissionReward = commissionRewards?.find(
        (reward) => reward.minRevenue <= totalValueBeforeTaxAfterDiscount,
      )
      if (commissionReward) {
        const commissionRate = commissionReward.commissionRate || 0
  
        commonData.totalCommissionEarned = Number(
          ((totalValueBeforeTaxAfterDiscount * commissionRate) / 100).toFixed(2),
        )
      }
    }

    console.log('commonData', commonData)
  
    if (!eventAffiliateUserRank) {
      // create affiliate user rank
      return req.payload.create({
        collection: 'event-affiliate-user-ranks',
        data: {
          ...commonData,
          affiliateUser: Number(affiliateUserId),
          eventAffiliateRank: eventAffiliateRank.id,
          event: eventAffiliateRank.event,
          status: 'active',
        },
        req,
      })
    }
  
    return req.payload.update({
      collection: 'event-affiliate-user-ranks',
      id: eventAffiliateUserRank.id,
      data: {
        ...commonData,
      },
      req,
    })
  }
  