export type Partner = {
  id: number
  name: string
  description: string
  logo?: {
    id: number
    alt: string
    url: string
    [k: string]: any
  }
}
