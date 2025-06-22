// temp, should be deleted in the future after full affiliate ranks applied on production
const env = process.env.NEXT_PUBLIC_ENVIRONMENT

export const HIDE_AFFILIATE_RANK_CONFIG = !env || env === 'production'

console.log('HIDE_AFFILIATE_RANK_CONFIG', HIDE_AFFILIATE_RANK_CONFIG)
