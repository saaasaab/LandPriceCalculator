import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import CalculatorCard from "../../components/CalculatorCard";
import {
  CALCULATORS,
  searchCalculators,
  TOOL_AUDIENCES,
  TOOL_CATEGORIES,
  type ToolAudienceId,
  type ToolCategoryId,
} from "../../config/calculators";
import "./ToolsDirectory.scss";

type CategoryFilter = ToolCategoryId | "all" | "labs";
type AudienceFilter = ToolAudienceId | "all";

const ToolsDirectory = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("q") ?? "";
  const category = (searchParams.get("category") as CategoryFilter) || "all";
  const audience = (searchParams.get("audience") as AudienceFilter) || "all";

  const results = useMemo(
    () => searchCalculators(query, category, audience),
    [query, category, audience],
  );

  const updateParams = (next: { q?: string; category?: string; audience?: string }) => {
    const params = new URLSearchParams(searchParams);
    Object.entries(next).forEach(([key, value]) => {
      if (!value || value === "all") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });
    setSearchParams(params, { replace: true });
  };

  return (
    <main className="tools-directory">
      <header className="tools-directory-header">
        <h1>All calculators</h1>
        <p>Find the tool that answers the question you are actually trying to solve.</p>
        <form
          className="tools-directory-search"
          onSubmit={(event) => event.preventDefault()}
          role="search"
        >
          <label htmlFor="tools-search">What are you trying to calculate?</label>
          <input
            id="tools-search"
            type="search"
            value={query}
            onChange={(event) => updateParams({ q: event.target.value })}
            placeholder="maximum land price, price per door, construction loan, slope"
            autoComplete="off"
          />
        </form>
      </header>

      <div className="tools-directory-filters">
        <fieldset>
          <legend>Purpose</legend>
          <div className="filter-row">
            <button
              type="button"
              className={category === "all" ? "is-active" : ""}
              onClick={() => updateParams({ category: "all" })}
            >
              All ({CALCULATORS.length})
            </button>
            {TOOL_CATEGORIES.map((item) => (
              <button
                key={item.id}
                type="button"
                className={category === item.id ? "is-active" : ""}
                onClick={() => updateParams({ category: item.id })}
              >
                {item.label}
              </button>
            ))}
            <button
              type="button"
              className={category === "labs" ? "is-active" : ""}
              onClick={() => updateParams({ category: "labs" })}
            >
              Labs
            </button>
          </div>
        </fieldset>

        <fieldset>
          <legend>Audience</legend>
          <div className="filter-row">
            <button
              type="button"
              className={audience === "all" ? "is-active" : ""}
              onClick={() => updateParams({ audience: "all" })}
            >
              All
            </button>
            {TOOL_AUDIENCES.map((item) => (
              <button
                key={item.id}
                type="button"
                className={audience === item.id ? "is-active" : ""}
                onClick={() => updateParams({ audience: item.id })}
              >
                {item.label}
              </button>
            ))}
          </div>
        </fieldset>
      </div>

      {results.length === 0 ? (
        <p className="tools-directory-empty">No calculators matched that search. Try a shorter phrase or a different category.</p>
      ) : (
        <section className="tools-directory-grid" aria-live="polite">
          {results.map((tool) => (
            <CalculatorCard key={tool.id} tool={tool} />
          ))}
        </section>
      )}
    </main>
  );
};

export default ToolsDirectory;
