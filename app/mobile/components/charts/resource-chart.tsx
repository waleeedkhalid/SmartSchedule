/**
 * Resource Chart Component
 * 
 * Displays resource distribution using Chart.js (Pie Chart).
 */

"use client";

import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
} from 'chart.js';
import { Pie } from 'react-chartjs-2';

ChartJS.register(
    ArcElement,
    Tooltip,
    Legend
);

interface ResourceChartProps {
    data: {
        label: string;
        value: number;
        color?: string;
    }[];
    title?: string;
}

export function ResourceChart({ data, title }: ResourceChartProps) {
    const chartData = {
        labels: data.map(d => d.label),
        datasets: [
            {
                label: 'Count',
                data: data.map(d => d.value),
                backgroundColor: data.map((d, i) => d.color || `hsl(${(i * 137.5) % 360}, 70%, 50%)`),
                borderColor: data.map((d, i) => d.color || `hsl(${(i * 137.5) % 360}, 70%, 50%)`),
                borderWidth: 1,
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top' as const,
            },
            title: {
                display: !!title,
                text: title,
            },
        },
    };

    return <Pie options={options} data={chartData} />;
}
