import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { applyPageMeta, getPageMeta } from "../utils/pageMeta";

const PageMeta = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    applyPageMeta(getPageMeta(pathname));
  }, [pathname]);

  return null;
};

export default PageMeta;
