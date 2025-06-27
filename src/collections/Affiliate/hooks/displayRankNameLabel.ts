import { AFFILIATE_RANKS } from "../constants"
import { FieldHookArgs } from "payload"

export const displayRankNameLabel = ({ ...props }): FieldHookArgs => {
  const rankNameLabel = AFFILIATE_RANKS.find(
    (rank) => rank.value === props?.data?.rankName,
  )?.label

  return rankNameLabel || props?.data?.rankName
}