import { AuthProvider } from '@//providers/CheckIn/useAuth';
import { ReactNode } from 'react';

export default function RootLayout({ children }: { children: ReactNode }) {
  
  return (

        <AuthProvider>{children}</AuthProvider>

  );
}
