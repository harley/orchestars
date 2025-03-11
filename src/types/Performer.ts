export type Performer = {
  id: number
  name: string
  description: string
  genre: string
  role?: string
  avatar?: {
    id: number
    alt: string
    url: string
    [k: string]: any
  }
}
