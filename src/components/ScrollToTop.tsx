import { useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useLayoutEffect(() => {
    // Force an instant reset before the browser paints the new route,
    // avoiding any smooth-scroll or layout-shift drift.
    window.scrollTo(0, 0);
    if (window.scrollY !== 0) {
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }
  }, [pathname]);

  return null;
};

export default ScrollToTop;
