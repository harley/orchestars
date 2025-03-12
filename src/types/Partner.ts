export type Partner = {
  id: number
  name: string
  description: string
  link?: string
  logo?: {
    id: number
    alt: string
    url: string
    [k: string]: any
  }
}
