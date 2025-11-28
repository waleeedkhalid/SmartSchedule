/**
 * Chart.js Global Configuration
 * Theme-aware colors and default settings
 */

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

/**
 * Chart colors (compatible with dark/light theme)
 */
export const chartColors = {
  primary: "hsl(221.2, 83.2%, 53.3%)", // Primary blue
  secondary: "hsl(210, 40%, 96.1%)", // Secondary gray
  success: "hsl(142.1, 76.2%, 36.3%)", // Green
  warning: "hsl(38, 92%, 50%)", // Yellow
  destructive: "hsl(0, 84.2%, 60.2%)", // Red
  info: "hsl(199, 89%, 48%)", // Cyan
  purple: "hsl(262.1, 83.3%, 57.8%)",
  pink: "hsl(336.2, 83.2%, 58%)",
  orange: "hsl(24.6, 95%, 53.1%)",
  teal: "hsl(173, 58%, 39%)",
};

/**
 * Get chart color palette for datasets
 */
export function getChartColorPalette(count: number): string[] {
  const colors = Object.values(chartColors);
  const palette: string[] = [];

  for (let i = 0; i < count; i++) {
    palette.push(colors[i % colors.length]);
  }

  return palette;
}

/**
 * Default Chart.js options
 */
export const defaultChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "top" as const,
      labels: {
        usePointStyle: true,
        padding: 15,
        font: {
          size: 12,
          family: "Inter, system-ui, sans-serif",
        },
      },
    },
    tooltip: {
      backgroundColor: "rgba(0, 0, 0, 0.8)",
      padding: 12,
      titleFont: {
        size: 14,
        weight: "bold" as const,
      },
      bodyFont: {
        size: 13,
      },
      cornerRadius: 8,
      displayColors: true,
      usePointStyle: true,
    },
  },
  scales: {
    x: {
      grid: {
        display: false,
      },
      ticks: {
        font: {
          size: 11,
        },
      },
    },
    y: {
      beginAtZero: true,
      grid: {
        color: "rgba(0, 0, 0, 0.05)",
      },
      ticks: {
        font: {
          size: 11,
        },
      },
    },
  },
};

/**
 * Options for bar charts
 */
export const barChartOptions = {
  ...defaultChartOptions,
  scales: {
    ...defaultChartOptions.scales,
    y: {
      ...defaultChartOptions.scales.y,
      ticks: {
        ...defaultChartOptions.scales.y.ticks,
        precision: 0, // No decimals for counts
      },
    },
  },
};

/**
 * Options for pie/doughnut charts
 */
export const pieChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "right" as const,
      labels: {
        usePointStyle: true,
        padding: 15,
        font: {
          size: 12,
          family: "Inter, system-ui, sans-serif",
        },
      },
    },
    tooltip: {
      backgroundColor: "rgba(0, 0, 0, 0.8)",
      padding: 12,
      titleFont: {
        size: 14,
        weight: "bold" as const,
      },
      bodyFont: {
        size: 13,
      },
      cornerRadius: 8,
      callbacks: {
        label: function (context: any) {
          const label = context.label || "";
          const value = context.parsed || 0;
          const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
          const percentage = ((value / total) * 100).toFixed(1);
          return `${label}: ${value} (${percentage}%)`;
        },
      },
    },
  },
};

/**
 * Options for line charts
 */
export const lineChartOptions = {
  ...defaultChartOptions,
  elements: {
    line: {
      tension: 0.4, // Curved lines
      borderWidth: 2,
    },
    point: {
      radius: 4,
      hoverRadius: 6,
    },
  },
};

