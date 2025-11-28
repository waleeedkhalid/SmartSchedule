/**
 * Charts Formatter Unit Tests
 * Tests chart data formatting for visualization
 */

import { describe, it, expect } from 'vitest';
import { TEST_FIXTURES } from '../../fixtures';
import {
  formatSatisfactionRate,
  formatRoomUtilization,
  formatLoadDistribution,
  formatFeedbackDistribution,
  exportToCSV,
  type ChartData,
  type CSVExportOptions,
} from '@/lib/generators/charts-formatter';

// =====================================================
// TESTS
// =====================================================

describe('Charts Formatter', () => {
  describe('formatSatisfactionRate', () => {
    it('should format satisfaction rate for Chart.js', () => {
      const preferences = TEST_FIXTURES.preferences.all.slice(0, 10);
      const schedules = TEST_FIXTURES.schedules.v1.slice(0, 5);
      
      const data = formatSatisfactionRate(preferences, schedules);
      
      expect(data).toHaveProperty('labels');
      expect(data).toHaveProperty('datasets');
      expect(data.labels).toHaveLength(5); // Top 1-5 choices
      expect(data.datasets).toHaveLength(1);
      expect(data.datasets[0].data).toHaveLength(5);
      expect(data.datasets[0].label).toBe('Satisfaction Rate');
    });
    
    it('should return satisfaction percentages between 0-100', () => {
      const preferences = TEST_FIXTURES.preferences.all.slice(0, 20);
      const schedules = TEST_FIXTURES.schedules.v1.slice(0, 10);
      
      const data = formatSatisfactionRate(preferences, schedules);
      
      data.datasets[0].data.forEach((value: number) => {
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThanOrEqual(100);
      });
    });
    
    it('should handle empty data gracefully', () => {
      const data = formatSatisfactionRate([], []);
      
      expect(data.labels).toHaveLength(5);
      expect(data.datasets[0].data).toEqual([0, 0, 0, 0, 0]);
    });
  });
  
  describe('formatRoomUtilization', () => {
    it('should format room utilization as heatmap data', () => {
      const sections = TEST_FIXTURES.sections.sections.slice(0, 5);
      
      const data = formatRoomUtilization(sections);
      
      expect(data).toHaveProperty('labels');
      expect(data).toHaveProperty('datasets');
      expect(data.labels).toBeInstanceOf(Array);
      expect(data.datasets).toHaveLength(1);
      expect(data.datasets[0].label).toBe('Room Utilization');
    });
    
    it('should calculate utilization percentages correctly', () => {
      const sections = [
        {
          id: 'SEC1',
          room_number: 'A101',
          capacity: 25,
          enrolled_count: 20,
        },
        {
          id: 'SEC2',
          room_number: 'A101',
          capacity: 25,
          enrolled_count: 25,
        },
      ];
      
      const data = formatRoomUtilization(sections as any);
      
      // A101 has (20+25)/(25+25) = 90% utilization
      expect(data.datasets[0].data[0]).toBeCloseTo(90, 0);
    });
    
    it('should handle rooms with zero capacity', () => {
      const sections = [
        {
          id: 'SEC1',
          room_number: 'A101',
          capacity: 0,
          enrolled_count: 0,
        },
      ];
      
      const data = formatRoomUtilization(sections as any);
      
      expect(data.datasets[0].data[0]).toBe(0);
    });
  });
  
  describe('formatLoadDistribution', () => {
    it('should format faculty load as histogram data', () => {
      const sections = TEST_FIXTURES.sections.sections;
      
      const data = formatLoadDistribution(sections);
      
      expect(data).toHaveProperty('labels');
      expect(data).toHaveProperty('datasets');
      expect(data.datasets).toHaveLength(1);
      expect(data.datasets[0].label).toBe('Teaching Load');
    });
    
    it('should calculate load per faculty member', () => {
      const sections = [
        {
          id: 'SEC1',
          instructor_id: 'FAC1',
          instructor_name: 'Dr. Ahmad',
          credits: 3,
        },
        {
          id: 'SEC2',
          instructor_id: 'FAC1',
          instructor_name: 'Dr. Ahmad',
          credits: 3,
        },
        {
          id: 'SEC3',
          instructor_id: 'FAC2',
          instructor_name: 'Dr. Fatima',
          credits: 3,
        },
      ];
      
      const data = formatLoadDistribution(sections as any);
      
      expect(data.labels).toContain('Dr. Ahmad');
      expect(data.labels).toContain('Dr. Fatima');
      expect(data.datasets[0].data).toContain(6); // Dr. Ahmad: 2 sections × 3 credits
      expect(data.datasets[0].data).toContain(3); // Dr. Fatima: 1 section × 3 credits
    });
    
    it('should exclude sections without instructor', () => {
      const sections = [
        {
          id: 'SEC1',
          instructor_id: null,
          instructor_name: null,
          credits: 3,
        },
      ];
      
      const data = formatLoadDistribution(sections as any);
      
      expect(data.labels).toHaveLength(0);
      expect(data.datasets[0].data).toHaveLength(0);
    });
  });
  
  describe('formatFeedbackDistribution', () => {
    it('should format feedback ratings as pie chart data', () => {
      const feedback = TEST_FIXTURES.feedback.all;
      
      const data = formatFeedbackDistribution(feedback);
      
      expect(data).toHaveProperty('labels');
      expect(data).toHaveProperty('datasets');
      expect(data.labels).toEqual(['Very Satisfied', 'Satisfied', 'Neutral', 'Dissatisfied', 'Very Dissatisfied']);
      expect(data.datasets).toHaveLength(1);
      expect(data.datasets[0].label).toBe('Feedback Distribution');
    });
    
    it('should count feedback by rating', () => {
      const feedback = [
        { id: '1', rating: 5, comments: 'Great' },
        { id: '2', rating: 5, comments: 'Excellent' },
        { id: '3', rating: 4, comments: 'Good' },
        { id: '4', rating: 3, comments: 'OK' },
        { id: '5', rating: 2, comments: 'Poor' },
      ];
      
      const data = formatFeedbackDistribution(feedback as any);
      
      // [5: 2, 4: 1, 3: 1, 2: 1, 1: 0]
      expect(data.datasets[0].data).toEqual([2, 1, 1, 1, 0]);
    });
    
    it('should handle empty feedback', () => {
      const data = formatFeedbackDistribution([]);
      
      expect(data.datasets[0].data).toEqual([0, 0, 0, 0, 0]);
    });
  });
  
  describe('exportToCSV', () => {
    it('should export chart data to CSV format', () => {
      const chartData: ChartData = {
        labels: ['A', 'B', 'C'],
        datasets: [
          {
            label: 'Test Data',
            data: [10, 20, 30],
          },
        ],
      };
      
      const csv = exportToCSV(chartData);
      
      expect(csv).toContain('Label,Test Data');
      expect(csv).toContain('A,10');
      expect(csv).toContain('B,20');
      expect(csv).toContain('C,30');
    });
    
    it('should handle multiple datasets', () => {
      const chartData: ChartData = {
        labels: ['X', 'Y'],
        datasets: [
          { label: 'Series 1', data: [5, 10] },
          { label: 'Series 2', data: [15, 20] },
        ],
      };
      
      const csv = exportToCSV(chartData);
      
      expect(csv).toContain('Label,Series 1,Series 2');
      expect(csv).toContain('X,5,15');
      expect(csv).toContain('Y,10,20');
    });
    
    it('should use custom delimiter when specified', () => {
      const chartData: ChartData = {
        labels: ['A'],
        datasets: [{ label: 'Data', data: [100] }],
      };
      
      const csv = exportToCSV(chartData, { delimiter: ';' });
      
      expect(csv).toContain('Label;Data');
      expect(csv).toContain('A;100');
    });
    
    it('should include headers when specified', () => {
      const chartData: ChartData = {
        labels: ['A'],
        datasets: [{ label: 'Data', data: [100] }],
      };
      
      const csv = exportToCSV(chartData, { includeHeaders: true });
      
      expect(csv.split('\n')[0]).toContain('Label');
    });
    
    it('should exclude headers when specified', () => {
      const chartData: ChartData = {
        labels: ['A'],
        datasets: [{ label: 'Data', data: [100] }],
      };
      
      const csv = exportToCSV(chartData, { includeHeaders: false });
      
      expect(csv.split('\n')[0]).not.toContain('Label');
      expect(csv).toContain('A,100');
    });
  });
});
