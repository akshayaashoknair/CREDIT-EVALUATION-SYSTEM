import { useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";

export default function Home() {
  const navigate = useNavigate();

  return (
    <Layout>

      {/* ================= HERO (STAYS INTACT) ================= */}
      <section className="sticky top-0 h-screen flex items-center justify-center z-10">
        <div className="relative max-w-4xl mx-auto text-center px-6">

          {/* Glass card */}
          <div className="rounded-3xl bg-black/50 backdrop-blur-xl border border-white/10 p-12 shadow-2xl">
            <h1 className="text-5xl md:text-6xl font-bold text-white leading-tight">
              Smart Credit Evaluation,
              <span className="block text-brand-primary mt-2">
                Powered by AI
              </span>
            </h1>

            <p className="mt-6 text-lg text-white/70 max-w-2xl mx-auto">
              AI-assisted credit risk analysis for faster, smarter lending decisions.
            </p>

            <button
              onClick={() => navigate("/apply")}
              className="
                mt-10 px-10 py-4 rounded-xl
                bg-gradient-to-r from-brand-primary to-brand-secondary
                text-white font-medium text-lg
                shadow-xl hover:scale-105 transition
              "
            >
              Start Loan Application →
            </button>
          </div>

        </div>
      </section>

      {/* ================= ABOUT SECTION (SCROLLS) ================= */}
      <section className="relative z-20 bg-black/90 text-white py-32">
        <div className="container max-w-5xl mx-auto grid gap-16">

          {/* Heading */}
          <div className="text-center">
            <h2 className="text-4xl font-bold">
              About <span className="text-brand-primary">CreditAI</span>
            </h2>
            <p className="mt-4 text-white/60 max-w-2xl mx-auto">
              Built for modern financial institutions that demand speed,
              accuracy, and explainability.
            </p>
          </div>

          {/* Content */}
          <div className="grid md:grid-cols-3 gap-10">
            <div className="rounded-2xl bg-white/5 p-8 border border-white/10">
              <h3 className="text-xl font-semibold mb-3">AI-Driven Decisions</h3>
              <p className="text-white/70 text-sm leading-relaxed">
                Our ML models analyze multi-dimensional risk signals to deliver
                accurate, policy-aligned credit decisions in seconds.
              </p>
            </div>

            <div className="rounded-2xl bg-white/5 p-8 border border-white/10">
              <h3 className="text-xl font-semibold mb-3">Explainable Risk</h3>
              <p className="text-white/70 text-sm leading-relaxed">
                Every decision is backed by transparent risk factors, ensuring
                regulatory trust and underwriter confidence.
              </p>
            </div>

            <div className="rounded-2xl bg-white/5 p-8 border border-white/10">
              <h3 className="text-xl font-semibold mb-3">Enterprise Ready</h3>
              <p className="text-white/70 text-sm leading-relaxed">
                Designed for scalability, security, and seamless integration
                with existing lending workflows.
              </p>
            </div>
          </div>

        </div>
      </section>

    </Layout>
  );
}
