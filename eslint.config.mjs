import nextConfig from "eslint-config-next/core-web-vitals";

// Extend the base Next.js config to relax some React Compiler rules that are noisy
// in our current setup. We also silence unused disable directives since many files
// still carry legacy comments.
const config = [
  ...nextConfig,
  {
    rules: {
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/static-components": "off",
      "react-hooks/incompatible-library": "off",
      "react-hooks/preserve-manual-memoization": "off",
    },
    linterOptions: {
      reportUnusedDisableDirectives: false,
    },
  },
];

export default config;
