import { ReactNode } from 'react';
import Header from './Header';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-8">
        {children}
      </main>
      <footer className="border-t bg-card/50 py-6">
        <div className="container text-center text-sm text-muted-foreground">
          <p>© 2024 CreditAI Smart Evaluation System. For authorized underwriter use only.</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
