/**
 * Enrollment Chart Component
 * 
 * Displays enrollment vs capacity using Chart.js.
 */

"use client";

import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

interface EnrollmentChartProps {
    data: {
        label: string;
        enrolled: number;
        capacity: number;
    }[];
}

export function EnrollmentChart({ data }: EnrollmentChartProps) {
    const chartData = {
        labels: data.map(d => d.label),
        datasets: [
            {
                label: 'Enrolled',
                data: data.map(d => d.enrolled),
                backgroundColor: 'rgba(59, 130, 246, 0.5)', // Blue
                borderColor: 'rgb(59, 130, 246)',
                borderWidth: 1,
            },
            {
                label: 'Capacity',
                data: data.map(d => d.capacity),
                backgroundColor: 'rgba(16, 185, 129, 0.5)', // Green
                borderColor: 'rgb(16, 185, 129)',
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
                display: true,
                text: 'Enrollment vs Capacity',
            },
        },
        scales: {
            y: {
                beginAtZero: true,
            },
        },
    };

    return <Bar options={options} data={chartData} />;
}
