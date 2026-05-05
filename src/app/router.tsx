import { BrowserRouter } from 'react-router-dom';
import type { ReactNode } from 'react';

export function AppRouter({ children }: { children: ReactNode }) {
  return <BrowserRouter>{children}</BrowserRouter>;
}

