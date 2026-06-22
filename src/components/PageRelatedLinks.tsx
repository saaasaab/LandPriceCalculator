import { Link } from "react-router-dom";
import { RelatedLink } from "../utils/pageMetaAio";
import "./PageRelatedLinks.scss";

interface PageRelatedLinksProps {
  links: RelatedLink[];
}

const PageRelatedLinks = ({ links }: PageRelatedLinksProps) => {
  if (!links.length) return null;

  return (
    <nav className="page-related" aria-labelledby="page-related-heading">
      <h2 id="page-related-heading">Related Calculators</h2>
      <ul>
        {links.map((link) => (
          <li key={link.path}>
            <Link to={link.path}>{link.label}</Link>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default PageRelatedLinks;
