import { FormEvent } from "react";
import "./HeroSection.scss";

const HeroSection = ({
  query,
  onQueryChange,
}: {
  query: string;
  onQueryChange: (value: string) => void;
}) => {
  const handleSearch = (event: FormEvent) => {
    event.preventDefault();
    document.getElementById("landing-tools-heading")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <header className="hero">
      <div className="hero-content">
        <h1>Run the numbers</h1>
        <p className="tagline">Before you buy, build, or finance.</p>
        <form className="hero-search" onSubmit={handleSearch} role="search">
          <div className="hero-search-row">
            <input
              id="hero-search"
              type="search"
              value={query}
              onChange={(event) => onQueryChange(event.target.value)}
              placeholder="maximum land price, price per door, construction loan, slope"
              autoComplete="off"
            />
            <button type="submit">Search tools</button>
          </div>
        </form>
      </div>
    </header>
  );
};

export default HeroSection;
