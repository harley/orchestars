export type AuthUser = {
  token: string
  userInfo: { id: number; email: string } & Record<string, any>
}
