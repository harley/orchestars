import { getPayload } from '@/payload-config/getPayloadConfig';

export async function validateResetPasswordToken(token: string) {
  if (!token) {
    return { valid: false, message: 'Token is missing.' };
  }

  try {
    const payload = await getPayload();

    const userRes = await payload.find({
      collection: 'users',
      where: { resetPasswordToken: { equals: token } },
      limit: 1,
      select: { resetPasswordExpiration: true, resetPasswordToken: true },
      showHiddenFields: true,
    });

    const user = userRes.docs[0];

    if (!user || !user.resetPasswordExpiration || new Date(user.resetPasswordExpiration) < new Date()) {
      return { valid: false, message: 'Invalid or expired token.' };
    }

    // Token is valid
    return { valid: true, user: user };

  } catch (error) {
    console.error('Server-side token validation error:', error);
    return { valid: false, message: 'An error occurred during token validation.' };
  }
} 