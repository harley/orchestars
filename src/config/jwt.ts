export const JWT_USER_SECRET = process.env.JWT_USER_SECRET || '';
export const JWT_USER_EXPIRATION = parseInt(process.env.JWT_USER_EXPIRATION as string, 10) || 3600000;