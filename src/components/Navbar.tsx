import { FormEvent, type ReactNode, useEffect, useId, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ChevronDown,
  LogIn,
  LogOut,
  Search,
  Sparkles,
} from "lucide-react";
import logo from "../assets/LandCalculatorLogo.svg";
import "./Navbar.scss";
import Hamburger from "./Hamburger";
import { useAuth } from "../context/AuthContext";
import { getPurchaseRoute } from "../utils/constants";
import { routes } from "../config/routes";
import {
  LEARN_LINKS,
  TOOL_CATEGORIES,
  CALCULATORS,
  WORKFLOWS,
} from "../config/calculators";
import CalculatorIcon from "./CalculatorIcon";

export { routes };

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const navRef = useRef<HTMLElement>(null);

  const closeMenus = () => {
    setIsMobileMenuOpen(false);
    setOpenMenu(null);
  };

  const handleToggleMenu = () => {
    setIsMobileMenuOpen((prev) => !prev);
    setOpenMenu(null);
  };

  useEffect(() => {
    const handlePointer = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setOpenMenu(null);
      }
    };
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpenMenu(null);
      }
    };
    document.addEventListener("mousedown", handlePointer);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handlePointer);
      document.removeEventListener("keydown", handleKey);
    };
  }, []);

  const handleSearch = (event: FormEvent) => {
    event.preventDefault();
    const query = searchQuery.trim();
    closeMenus();
    navigate(query ? `${routes.TOOLS}?q=${encodeURIComponent(query)}` : routes.TOOLS);
  };

  return (
    <nav
      ref={navRef}
      className={`navbar ${isMobileMenuOpen ? "is-open-navbar" : ""}`}
    >
      <Hamburger isOpen={isMobileMenuOpen} onClick={handleToggleMenu} />

      <Link className="navbar-logo" to={routes.HOME} onClick={closeMenus}>
        <img src={logo} alt="Land Price Calculator" />
        <h3>Land Price Calculator</h3>
      </Link>

      <div className={`navbar-menu ${isMobileMenuOpen ? "is-open" : ""}`}>
        <ul className="navbar-links">
          <NavDropdown
            id="tools"
            label="Tools"
            isOpen={openMenu === "tools"}
            enableHover={!isMobileMenuOpen}
            onOpen={() => setOpenMenu("tools")}
            onClose={() => setOpenMenu((current) => (current === "tools" ? null : current))}
            onToggle={() => setOpenMenu((current) => (current === "tools" ? null : "tools"))}
          >
            <Link className="dropdown-overview" to={routes.TOOLS} onClick={closeMenus}>
              All calculators
            </Link>
            {TOOL_CATEGORIES.map((category) => (
              <div key={category.id} className="dropdown-group">
                <p className="dropdown-heading">{category.label}</p>
                {CALCULATORS.filter((tool) => tool.category === category.id).map((tool) => (
                  <Link key={tool.id} to={tool.route} onClick={closeMenus}>
                    <span className="calculator-icon">
                      <CalculatorIcon name={tool.icon} size={16} />
                    </span>
                    <span className="icon-link-text">{tool.name}</span>
                  </Link>
                ))}
              </div>
            ))}
          </NavDropdown>

          <NavDropdown
            id="workflows"
            label="Workflows"
            isOpen={openMenu === "workflows"}
            enableHover={!isMobileMenuOpen}
            onOpen={() => setOpenMenu("workflows")}
            onClose={() => setOpenMenu((current) => (current === "workflows" ? null : current))}
            onToggle={() => setOpenMenu((current) => (current === "workflows" ? null : "workflows"))}
          >
            {WORKFLOWS.map((workflow) => (
              <Link key={workflow.question} to={workflow.route} onClick={closeMenus}>
                {workflow.question}
              </Link>
            ))}
          </NavDropdown>

          <NavDropdown
            id="learn"
            label="Learn"
            isOpen={openMenu === "learn"}
            enableHover={!isMobileMenuOpen}
            onOpen={() => setOpenMenu("learn")}
            onClose={() => setOpenMenu((current) => (current === "learn" ? null : current))}
            onToggle={() => setOpenMenu((current) => (current === "learn" ? null : "learn"))}
          >
            {LEARN_LINKS.map((link) => (
              <Link key={link.route} to={link.route} onClick={closeMenus}>
                {link.label}
              </Link>
            ))}
          </NavDropdown>

          <li>
            <Link className="nav-text-link" to={routes.SIGN_UP} onClick={closeMenus}>
              Pricing
            </Link>
          </li>
        </ul>

        <div className="navbar-actions">
          <form className="navbar-search" onSubmit={handleSearch} role="search">
            <label htmlFor="navbar-search" className="visually-hidden">
              Search calculators
            </label>
            <Search size={14} aria-hidden />
            <input
              id="navbar-search"
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search"
            />
          </form>

          <div className="navbar-auth">
            {user ? (
              <>
                {!user.is_paid ? (
                  <Link
                    to={getPurchaseRoute(user)}
                    className="upgrade-btn"
                    onClick={closeMenus}
                  >
                    <Sparkles size={14} strokeWidth={2} aria-hidden />
                    <span>Upgrade</span>
                  </Link>
                ) : null}
                <button type="button" onClick={logout} className="logout-btn">
                  <LogOut size={14} strokeWidth={2} aria-hidden />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <Link className="navbar-auth-link" to={routes.LOGIN} onClick={closeMenus}>
                <LogIn size={14} strokeWidth={2} aria-hidden />
                <span>Sign in</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

const NavDropdown = ({
  id,
  label,
  isOpen,
  enableHover,
  onOpen,
  onClose,
  onToggle,
  children,
}: {
  id: string;
  label: string;
  isOpen: boolean;
  enableHover: boolean;
  onOpen: () => void;
  onClose: () => void;
  onToggle: () => void;
  children: ReactNode;
}) => {
  const menuId = useId();

  return (
    <li
      className={`dropdown ${isOpen ? "is-open" : ""}`}
      onMouseEnter={enableHover ? onOpen : undefined}
      onMouseLeave={enableHover ? onClose : undefined}
    >
      <button
        type="button"
        className="dropdown-title"
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-controls={menuId}
        id={`${id}-button`}
        onClick={onToggle}
      >
        {label}
        <ChevronDown size={14} aria-hidden />
      </button>
      <div
        id={menuId}
        className="dropdown-content"
        role="menu"
        aria-labelledby={`${id}-button`}
        hidden={!isOpen}
      >
        {children}
      </div>
    </li>
  );
};

export default Navbar;
