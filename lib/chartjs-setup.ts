/**
 * Chart.js Setup - Centralized registration of all Chart.js components
 *
 * This file ensures all Chart.js elements are registered once at app startup,
 * preventing "X is not a registered element" errors that can occur when
 * components try to use Chart.js before registration.
 *
 * Import this file early in the app (e.g., in client-providers.tsx) to ensure
 * Chart.js is fully configured before any charts render.
 */

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

// Register all Chart.js components used in the application
ChartJS.register(
  // Scales
  CategoryScale,
  LinearScale,
  RadialLinearScale,

  // Elements
  BarElement,
  LineElement,
  PointElement,
  ArcElement, // Required for Pie/Doughnut charts

  // Plugins
  Title,
  Tooltip,
  Legend,
  Filler
);

// Export for type checking - indicates setup is complete
export const chartJsInitialized = true;
