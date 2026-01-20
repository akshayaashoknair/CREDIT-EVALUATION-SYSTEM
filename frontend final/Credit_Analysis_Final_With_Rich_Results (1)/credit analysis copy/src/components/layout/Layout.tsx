import { ReactNode } from "react";
import Header from "./Header";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="relative min-h-screen flex flex-col text-white overflow-x-hidden">

      {/* BACKGROUND IMAGE */}
      <div
        className="fixed inset-0 -z-20 bg-cover bg-center"
        style={{ backgroundImage: "url('/backend.jpg')" }}
      />

      {/* DARK GRADIENT OVERLAY (critical for contrast) */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-b from-black/70 via-black/60 to-black/80" />

      {/* HEADER */}
      <Header />

      {/* MAIN CONTENT */}
      <main className="relative z-10 flex-grow container py-16">
        {children}
      </main>

      {/* FOOTER */}
      <footer className="relative z-10 py-6 text-center text-sm text-white/70">
        © 2024 CreditAI Smart Evaluation System. For authorized underwriter use only.
      </footer>

    </div>
  );
};

export default Layout;
