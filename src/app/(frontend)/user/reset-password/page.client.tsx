'use client';

import ResetPasswordForm from '@/components/User/ResetPasswordForm';

interface ResetPasswordClientPageProps {
  token: string;
}

export default function ResetPasswordClientPage({ token }: ResetPasswordClientPageProps) {
  // Render the ResetPasswordForm and pass the token down
  return (
    <div className="w-full p-4 max-w-sm mx-auto  py-20">
      <ResetPasswordForm initialToken={token} />
    </div>
  );
}
