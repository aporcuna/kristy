import type { ReactNode } from 'react';
import { NavBar } from '../organisms/NavBar';

interface PageTemplateProps {
  title: string;
  actions?: ReactNode;
  /** Hide the navigation menu (e.g. on the auction screen). */
  hideNav?: boolean;
  children: ReactNode;
}

export function PageTemplate({ title, actions, hideNav, children }: PageTemplateProps) {
  return (
    <>
      {!hideNav && <NavBar />}
      <main className="page">
        <header className="page__header">
          <h1>{title}</h1>
          {actions}
        </header>
        {children}
      </main>
    </>
  );
}
