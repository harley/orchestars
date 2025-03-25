export interface ZaloPayOrder {
  title?: string
  app_id: string
  app_trans_id: string
  app_user: string
  app_time: number
  item: string
  embed_data: string
  amount: number
  description: string
  mac: string
  callback_url?: string
}
