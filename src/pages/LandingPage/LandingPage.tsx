import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "./LandingPage.scss";
import { routes } from "../../config/routes";
import HeroSection from "./HeroSection";
import SummerSpecialBanner from "../../components/SummerSpecialBanner/SummerSpecialBanner";
import CalculatorCard from "../../components/CalculatorCard";
import { searchCalculators } from "../../config/calculators";

const LandingPage = () => {
  const [query, setQuery] = useState("");
  const results = useMemo(() => searchCalculators(query), [query]);

  return (
    <div className="landing-page">
      <SummerSpecialBanner />
      <HeroSection query={query} onQueryChange={setQuery} />
      <section className="landing-tools" aria-labelledby="landing-tools-heading">
        <div className="landing-tools-header">
          <h2 id="landing-tools-heading">
            {query.trim() ? `Matching calculators (${results.length})` : "Choose a calculator"}
          </h2>
          <p>
            {query.trim()
              ? "Results update as you type, with the closest matches first."
              : "Each card opens its own page so you can bookmark, share, and use the back button."}
          </p>
          <Link className="landing-tools-all" to={routes.TOOLS}>Browse all tools</Link>
        </div>
        {results.length === 0 ? (
          <p className="landing-tools-empty">No calculators matched "{query.trim()}". Try a shorter phrase.</p>
        ) : (
          <div className="landing-tools-grid" aria-live="polite">
            {results.map((tool) => (
              <CalculatorCard key={tool.id} tool={tool} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default LandingPage;
