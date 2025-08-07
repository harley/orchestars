import { POINT_PER_VND } from '@/config/affiliate'

export const exchangeVNDToPoint = (vnd: number) => {
  return Math.ceil(vnd / POINT_PER_VND)
}
