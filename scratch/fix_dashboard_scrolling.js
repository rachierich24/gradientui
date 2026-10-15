const fs = require('fs');
const path = require('path');

// 1. Update ProductSections.tsx
const prodPath = path.join(__dirname, '../src/components/landing/ProductSections.tsx');
let prod = fs.readFileSync(prodPath, 'utf8');

// Remove onWheel in SupplierSection
const wheelPattern = /\/\/ Contained wheel scrolling:[^}]+\}\);\s+return \(\) => el\.removeEventListener\('wheel', onWheel\);\s+\}, \[\]\);/gs;

prod = prod.replace(wheelPattern, '');

// If CRLF pattern didn't match, let's do a targeted replace
const supplierWheelChunk = `  // Contained wheel scrolling: allows mouse wheel over dashboard to smoothly scroll the inner container without scrolling the landing page
  useEffect(() => {
    const el = mainScrollRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) < Math.abs(e.deltaX)) return;
      const { scrollTop, scrollHeight, clientHeight } = el;
      const canScrollDown = e.deltaY > 0 && scrollTop + clientHeight < scrollHeight - 1;
      const canScrollUp = e.deltaY < 0 && scrollTop > 1;

      if (canScrollDown || canScrollUp) {
        e.preventDefault();
        e.stopPropagation();
        el.scrollTop += e.deltaY;
        setHasScrolled(true);
      }
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);`;

prod = prod.replace(supplierWheelChunk, '');
prod = prod.replace(supplierWheelChunk.replace(/\n/g, '\r\n'), '');

// Replace second occurrence (for BrandSection)
prod = prod.replace(supplierWheelChunk, '');
prod = prod.replace(supplierWheelChunk.replace(/\n/g, '\r\n'), '');

// Add data-lenis-prevent to <main in SupplierSection and BrandSection
prod = prod.replace(
  '<main\n                  ref={mainScrollRef}\n                  className="dashboard-main"',
  '<main\n                  ref={mainScrollRef}\n                  className="dashboard-main"\n                  data-lenis-prevent'
);
prod = prod.replace(
  '<main\r\n                  ref={mainScrollRef}\r\n                  className="dashboard-main"',
  '<main\r\n                  ref={mainScrollRef}\r\n                  className="dashboard-main"\r\n                  data-lenis-prevent'
);

// Second occurrence (BrandSection)
prod = prod.replace(
  '<main\n                  ref={mainScrollRef}\n                  className="dashboard-main"',
  '<main\n                  ref={mainScrollRef}\n                  className="dashboard-main"\n                  data-lenis-prevent'
);
prod = prod.replace(
  '<main\r\n                  ref={mainScrollRef}\r\n                  className="dashboard-main"',
  '<main\r\n                  ref={mainScrollRef}\r\n                  className="dashboard-main"\r\n                  data-lenis-prevent'
);

fs.writeFileSync(prodPath, prod, 'utf8');
console.log('Successfully updated ProductSections.tsx for fast smooth scrolling!');

// 2. Update product-sections.css
const cssPath = path.join(__dirname, '../src/app/product-sections.css');
let css = fs.readFileSync(cssPath, 'utf8');

css = css.replace('scroll-behavior: smooth;', 'scroll-behavior: auto;');
css = css.replace('scroll-behavior: smooth;\r\n', 'scroll-behavior: auto;\r\n');

// Also update the bottom rule
css += `
/* Ensure native smooth momentum trackpad scrolling without artificial latency */
.dashboard-main {
  scroll-behavior: auto !important;
  overscroll-behavior-y: contain !important;
  -webkit-overflow-scrolling: touch !important;
  touch-action: pan-y !important;
}
`;

fs.writeFileSync(cssPath, css, 'utf8');
console.log('Successfully updated product-sections.css for native trackpad inertia!');
