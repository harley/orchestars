interface AdminUser {
  role?: 'admin' | 'super-admin' | 'event-admin' | 'customer'| null
}

export const isAdminOrSuperAdmin = ({ req: { user } }: { req: { user: AdminUser | null } }) => {
  return Boolean(user?.role === 'super-admin' || user?.role === 'admin')
}

export const isSuperAdmin = ({ req: { user } }: { req: { user: AdminUser | null } }) => {
  return Boolean(user?.role === 'super-admin')
}

export const isEventAdmin = ({ req: { user } }: { req: { user: AdminUser | null } }) => {
  return Boolean(user?.role === 'event-admin')
}

export const isAdminOrSuperAdminOrEventAdmin = ({
  req: { user },
}: {
  req: { user: AdminUser | null }
}) => {
  return Boolean(
    user?.role === 'super-admin' || user?.role === 'admin' || user?.role === 'event-admin',
  )
}
