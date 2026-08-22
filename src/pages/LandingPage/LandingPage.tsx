import { FormEvent, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "./LandingPage.scss";
import { routes } from "../../config/routes";
import SummerSpecialBanner from "../../components/SummerSpecialBanner/SummerSpecialBanner";
import CalculatorCard from "../../components/CalculatorCard";
import { useAuth } from "../../context/AuthContext";
import {
  getPurchaseRoute,
  PRICING_CTA,
  TRIAL_DAYS,
} from "../../utils/constants";
import {
  searchCalculators,
  TOOL_CATEGORIES,
  type CalculatorTool,
  type ToolCategoryId,
} from "../../config/calculators";

const LandingPage = () => {
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const results = useMemo(() => searchCalculators(query), [query]);
  const hasQuery = Boolean(query.trim());

  const groupedResults = useMemo(() => {
    const byCategory = new Map<ToolCategoryId, CalculatorTool[]>();
    results.forEach((tool) => {
      const existing = byCategory.get(tool.category) ?? [];
      existing.push(tool);
      byCategory.set(tool.category, existing);
    });

    return TOOL_CATEGORIES
      .map((category) => ({
        ...category,
        tools: byCategory.get(category.id) ?? [],
      }))
      .filter((category) => category.tools.length > 0);
  }, [results]);

  const handleSearch = (event: FormEvent) => {
    event.preventDefault();
  };

  return (
    <div className="landing-page">
      <SummerSpecialBanner />
      <section className="landing-intro" aria-labelledby="landing-intro-heading">
        <div className="landing-intro-inner">
          <div className="landing-intro-copy">
            <h1 id="landing-intro-heading">Land, Deals, and Financing calculators</h1>
            <p>
              Run feasibility, pricing, proformas, and loan numbers before you buy, build, or finance.
              Free to use. Sign in to save projects across sessions.
            </p>
          </div>
          <aside className="landing-intro-auth">
            {!user ? (
              <>
                <p className="landing-intro-auth-note">
                  Start a free {TRIAL_DAYS}-day trial. No credit card required.
                </p>
                <Link className="landing-intro-primary" to={routes.SIGN_UP}>
                  {PRICING_CTA}
                </Link>
                <Link className="landing-intro-secondary" to={routes.LOGIN}>
                  Sign in to save
                </Link>
              </>
            ) : !user.is_paid ? (
              <>
                <p className="landing-intro-auth-note">
                  Your trial includes every calculator. Upgrade anytime for lifetime access.
                </p>
                <Link className="landing-intro-primary" to={getPurchaseRoute(user)}>
                  Upgrade
                </Link>
              </>
            ) : (
              <p className="landing-intro-auth-note">
                You are signed in with lifetime access. Pick a calculator below to get started.
              </p>
            )}
          </aside>
        </div>
      </section>
      <section className="landing-tools" aria-labelledby="landing-tools-heading">
        <div className="landing-tools-header">
          <h2 id="landing-tools-heading">
            {hasQuery ? `Matching calculators (${results.length})` : "Choose a calculator"}
          </h2>
          <p>
            {hasQuery
              ? "Results update as you type, with the closest matches first."
              : "Gain an edge before you commit: know the land price, returns, and loan cost up front."}
          </p>
          <form className="landing-tools-search" onSubmit={handleSearch} role="search">
            <label htmlFor="landing-tools-search" className="visually-hidden">
              Search calculators
            </label>
            <div className="landing-tools-search-row">
              <input
                id="landing-tools-search"
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="maximum land price, price per door, construction loan, slope"
                autoComplete="off"
              />
              <button type="submit">Search tools</button>
            </div>
          </form>
          <Link className="landing-tools-all" to={routes.TOOLS}>Browse all tools</Link>
        </div>
        {results.length === 0 ? (
          <p className="landing-tools-empty">No calculators matched "{query.trim()}". Try a shorter phrase.</p>
        ) : (
          <div className="landing-tools-sections" aria-live="polite">
            {groupedResults.map((category) => (
              <section key={category.id} className="landing-tools-section" aria-labelledby={`landing-${category.id}`}>
                <h3 id={`landing-${category.id}`} className="landing-tools-section-title">
                  {category.label}
                </h3>
                <div className="landing-tools-grid">
                  {category.tools.map((tool) => (
                    <CalculatorCard key={tool.id} tool={tool} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default LandingPage;
