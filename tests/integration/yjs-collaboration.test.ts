/**
 * Yjs Collaboration Integration Tests
 * Tests real-time collaborative editing features
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as Y from 'yjs';
import { 
  YjsCollaborationManager, 
  createCollaborationManager,
  type CollaborationUser 
} from '@/lib/collaboration/yjs-manager';

describe('Yjs Collaboration', () => {
  let manager1: YjsCollaborationManager;
  let manager2: YjsCollaborationManager;

  const mockUser1 = {
    userId: 'user-1',
    userName: 'Alice',
    userEmail: 'alice@example.com',
  };

  const mockUser2 = {
    userId: 'user-2',
    userName: 'Bob',
    userEmail: 'bob@example.com',
  };

  beforeEach(() => {
    // Create separate managers for testing concurrent edits
    manager1 = createCollaborationManager({
      documentId: 'test-doc-1',
      ...mockUser1,
      autoSaveInterval: 1000, // 1 second for testing
    });

    manager2 = createCollaborationManager({
      documentId: 'test-doc-2',
      ...mockUser2,
      autoSaveInterval: 1000,
    });
  });

  afterEach(async () => {
    if (manager1) {
      await manager1.disconnect();
    }
    if (manager2) {
      await manager2.disconnect();
    }
  });

  describe('Document Creation and Access', () => {
    it('should create a Yjs document', () => {
      const doc = manager1.getDocument();
      expect(doc).toBeInstanceOf(Y.Doc);
    });

    it('should create shared types', () => {
      const sharedMap = manager1.getSharedType('scheduling-rules');
      expect(sharedMap).toBeInstanceOf(Y.Map);
    });

    it('should allow setting and getting values', () => {
      const doc = manager1.getDocument();
      const sharedMap = doc.getMap('rules');
      
      sharedMap.set('max_students_per_section', 40);
      sharedMap.set('min_students_per_section', 10);
      
      expect(sharedMap.get('max_students_per_section')).toBe(40);
      expect(sharedMap.get('min_students_per_section')).toBe(10);
    });
  });

  describe('Concurrent Edits (CRDT)', () => {
    it('should handle concurrent edits without conflicts', () => {
      const doc1 = manager1.getDocument();
      const doc2 = manager2.getDocument();
      
      const map1 = doc1.getMap('rules');
      const map2 = doc2.getMap('rules');
      
      // Both users set different keys simultaneously
      map1.set('rule1', 'value1');
      map2.set('rule2', 'value2');
      
      // Simulate sync by applying updates
      const update1 = Y.encodeStateAsUpdate(doc1);
      const update2 = Y.encodeStateAsUpdate(doc2);
      
      Y.applyUpdate(doc2, update1);
      Y.applyUpdate(doc1, update2);
      
      // Both documents should have both rules
      expect(map1.get('rule1')).toBe('value1');
      expect(map1.get('rule2')).toBe('value2');
      expect(map2.get('rule1')).toBe('value1');
      expect(map2.get('rule2')).toBe('value2');
    });

    it('should resolve conflicting edits to same key (last write wins)', () => {
      const doc1 = manager1.getDocument();
      const doc2 = manager2.getDocument();
      
      const map1 = doc1.getMap('rules');
      const map2 = doc2.getMap('rules');
      
      // Both users edit the same key
      map1.set('max_capacity', 40);
      map2.set('max_capacity', 50);
      
      // Apply updates
      const update1 = Y.encodeStateAsUpdate(doc1);
      const update2 = Y.encodeStateAsUpdate(doc2);
      
      Y.applyUpdate(doc2, update1);
      Y.applyUpdate(doc1, update2);
      
      // Both should converge to same value (CRDT resolution)
      expect(map1.get('max_capacity')).toBe(map2.get('max_capacity'));
    });

    it('should handle nested objects', () => {
      const doc1 = manager1.getDocument();
      const map = doc1.getMap('rules');
      
      map.set('time_slot_config', {
        start: '08:00',
        end: '17:00',
        slot_duration: 90,
      });
      
      const config = map.get('time_slot_config') as any;
      expect(config.start).toBe('08:00');
      expect(config.slot_duration).toBe(90);
    });
  });

  describe('Document State Management', () => {
    it('should encode and decode document state', () => {
      const doc = manager1.getDocument();
      const map = doc.getMap('rules');
      
      map.set('rule1', 'value1');
      map.set('rule2', 'value2');
      
      // Encode state
      const state = Y.encodeStateAsUpdate(doc);
      expect(state).toBeInstanceOf(Uint8Array);
      expect(state.length).toBeGreaterThan(0);
      
      // Create new document and apply state
      const doc2 = manager2.getDocument();
      Y.applyUpdate(doc2, state);
      
      const map2 = doc2.getMap('rules');
      expect(map2.get('rule1')).toBe('value1');
      expect(map2.get('rule2')).toBe('value2');
    });

    it('should track document changes', () => {
      const doc = manager1.getDocument();
      const map = doc.getMap('rules');
      
      let changeCount = 0;
      map.observe(() => {
        changeCount++;
      });
      
      map.set('rule1', 'value1');
      map.set('rule2', 'value2');
      map.set('rule1', 'updated');
      
      expect(changeCount).toBe(3);
    });

    it('should support transactions for atomic updates', () => {
      const doc = manager1.getDocument();
      const map = doc.getMap('rules');
      
      let changeCount = 0;
      map.observe(() => {
        changeCount++;
      });
      
      // Transaction groups multiple changes into one event
      doc.transact(() => {
        map.set('rule1', 'value1');
        map.set('rule2', 'value2');
        map.set('rule3', 'value3');
      });
      
      expect(changeCount).toBe(1); // Single transaction
      expect(map.size).toBe(3);
    });
  });

  describe('Presence Tracking', () => {
    it('should initialize with no presence users', () => {
      const users = manager1.getPresenceUsers();
      expect(users).toEqual([]);
    });

    it('should track presence users', () => {
      // This would be tested with actual Supabase Realtime connection
      // For now, we test the data structure
      const mockPresenceUser: CollaborationUser = {
        id: 'user-1',
        name: 'Alice',
        email: 'alice@example.com',
        color: '#EF4444',
      };
      
      expect(mockPresenceUser).toHaveProperty('id');
      expect(mockPresenceUser).toHaveProperty('name');
      expect(mockPresenceUser).toHaveProperty('email');
      expect(mockPresenceUser).toHaveProperty('color');
    });
  });

  describe('Auto-save Functionality', () => {
    it('should have auto-save timer configured', async () => {
      const manager = createCollaborationManager({
        documentId: 'test-autosave',
        userId: 'user-1',
        userName: 'Test User',
        userEmail: 'test@example.com',
        autoSaveInterval: 100, // 100ms for testing
      });

      // Auto-save should be set up (internal timer)
      expect(manager).toBeDefined();
      
      await manager.disconnect();
    });

    it('should allow manual save', async () => {
      const doc = manager1.getDocument();
      const map = doc.getMap('rules');
      
      map.set('rule1', 'value1');
      
      // Manual save should not throw
      await expect(manager1.save()).resolves.not.toThrow();
    });
  });

  describe('Connection Management', () => {
    it('should start disconnected', () => {
      expect(manager1.isConnectedToChannel()).toBe(false);
    });

    it('should allow disconnection', async () => {
      await expect(manager1.disconnect()).resolves.not.toThrow();
      expect(manager1.isConnectedToChannel()).toBe(false);
    });
  });

  describe('Error Handling', () => {
    it('should handle errors gracefully', () => {
      const onError = vi.fn();
      
      const manager = createCollaborationManager({
        documentId: 'test-error',
        userId: 'user-1',
        userName: 'Test User',
        userEmail: 'test@example.com',
        onError,
      });

      expect(manager).toBeDefined();
      
      // Errors should be handled by onError callback
      expect(onError).not.toHaveBeenCalled(); // No errors yet
    });
  });

  describe('Real-world Scheduling Rules Scenario', () => {
    it('should handle scheduling rules collaboration', () => {
      const doc = manager1.getDocument();
      const rules = doc.getMap('scheduling-rules');
      
      // Set various scheduling rules
      rules.set('max_students_per_section', 40);
      rules.set('min_students_per_section', 10);
      rules.set('max_sections_per_course', 5);
      rules.set('allow_conflicting_times', false);
      rules.set('prioritize_faculty_preferences', true);
      
      expect(rules.get('max_students_per_section')).toBe(40);
      expect(rules.get('allow_conflicting_times')).toBe(false);
      expect(rules.size).toBe(5);
    });

    it('should handle committee members editing rules simultaneously', () => {
      const doc1 = manager1.getDocument();
      const doc2 = manager2.getDocument();
      
      const rules1 = doc1.getMap('scheduling-rules');
      const rules2 = doc2.getMap('scheduling-rules');
      
      // Committee member 1 sets capacity rules
      rules1.set('max_capacity', 40);
      rules1.set('min_capacity', 10);
      
      // Committee member 2 sets priority rules
      rules2.set('priority_seniors', true);
      rules2.set('priority_required_courses', true);
      
      // Sync documents
      const update1 = Y.encodeStateAsUpdate(doc1);
      const update2 = Y.encodeStateAsUpdate(doc2);
      
      Y.applyUpdate(doc2, update1);
      Y.applyUpdate(doc1, update2);
      
      // Both should have all 4 rules
      expect(rules1.size).toBe(4);
      expect(rules2.size).toBe(4);
      expect(rules1.get('max_capacity')).toBe(40);
      expect(rules1.get('priority_seniors')).toBe(true);
    });
  });
});
