/**
 * Yjs Test Utilities
 * Helpers for testing real-time collaboration with Yjs
 */

import * as Y from 'yjs';

// =====================================================
// YJS DOCUMENT CREATION
// =====================================================

/**
 * Create a test Yjs document
 */
export function createTestYjsDoc(): Y.Doc {
  return new Y.Doc();
}

/**
 * Create a collaborative text document
 */
export function createCollaborativeText(doc: Y.Doc, key: string = 'content'): Y.Text {
  return doc.getText(key);
}

/**
 * Create a collaborative map (for scheduling rules)
 */
export function createCollaborativeMap(doc: Y.Doc, key: string = 'rules'): Y.Map<any> {
  return doc.getMap(key);
}

// =====================================================
// CONCURRENT EDITING SIMULATION
// =====================================================

/**
 * Simulate concurrent edits from multiple users
 */
export async function simulateConcurrentEdits(docs: Y.Doc[], edits: Array<(doc: Y.Doc, index: number) => void>) {
  // Apply edits concurrently
  edits.forEach((edit, index) => {
    edit(docs[index % docs.length], index);
  });
  
  // Sync documents
  return syncDocuments(docs);
}

/**
 * Sync multiple Yjs documents
 */
export function syncDocuments(docs: Y.Doc[]): void {
  for (let i = 0; i < docs.length; i++) {
    for (let j = i + 1; j < docs.length; j++) {
      const update = Y.encodeStateAsUpdate(docs[i]);
      Y.applyUpdate(docs[j], update);
      
      const update2 = Y.encodeStateAsUpdate(docs[j]);
      Y.applyUpdate(docs[i], update2);
    }
  }
}

// =====================================================
// SCHEDULING RULE COLLABORATION
// =====================================================

/**
 * Create a scheduling rule in collaborative map
 */
export function createCollaborativeRule(
  map: Y.Map<any>,
  ruleId: string,
  rule: {
    name: string;
    type: string;
    priority: number;
    data: any;
  }
) {
  map.set(ruleId, rule);
}

/**
 * Update a scheduling rule
 */
export function updateCollaborativeRule(
  map: Y.Map<any>,
  ruleId: string,
  updates: Partial<any>
) {
  const existing = map.get(ruleId);
  if (existing) {
    map.set(ruleId, { ...existing, ...updates });
  }
}

/**
 * Delete a scheduling rule
 */
export function deleteCollaborativeRule(map: Y.Map<any>, ruleId: string) {
  map.delete(ruleId);
}

// =====================================================
// CONFLICT RESOLUTION TESTING
// =====================================================

/**
 * Test conflict resolution between two edits
 */
export function testConflictResolution(
  doc1: Y.Doc,
  doc2: Y.Doc,
  edit1: (doc: Y.Doc) => void,
  edit2: (doc: Y.Doc) => void
) {
  // Apply conflicting edits
  edit1(doc1);
  edit2(doc2);
  
  // Sync documents
  const update1 = Y.encodeStateAsUpdate(doc1);
  const update2 = Y.encodeStateAsUpdate(doc2);
  
  Y.applyUpdate(doc2, update1);
  Y.applyUpdate(doc1, update2);
  
  // Check if documents converged to same state
  const state1 = Y.encodeStateVector(doc1);
  const state2 = Y.encodeStateVector(doc2);
  
  return {
    converged: state1.toString() === state2.toString(),
    doc1,
    doc2,
  };
}

// =====================================================
// COLLABORATION SESSION MOCKING
// =====================================================

/**
 * Mock a collaboration session with multiple users
 */
export interface MockCollaborationSession {
  sessionId: string;
  users: Array<{
    userId: string;
    userName: string;
    doc: Y.Doc;
    color: string;
  }>;
  sharedDoc: Y.Doc;
}

export function createMockCollaborationSession(
  userIds: string[],
  userNames: string[]
): MockCollaborationSession {
  const sessionId = `session-${Date.now()}`;
  const sharedDoc = new Y.Doc();
  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8'];
  
  const users = userIds.map((userId, index) => ({
    userId,
    userName: userNames[index] || `User ${index + 1}`,
    doc: sharedDoc.clone(),
    color: colors[index % colors.length],
  }));
  
  return {
    sessionId,
    users,
    sharedDoc,
  };
}

/**
 * Apply edit in collaboration session
 */
export function applyCollaborativeEdit(
  session: MockCollaborationSession,
  userIndex: number,
  edit: (doc: Y.Doc) => void
) {
  const user = session.users[userIndex];
  edit(user.doc);
  
  // Sync with all other users
  session.users.forEach((otherUser, index) => {
    if (index !== userIndex) {
      const update = Y.encodeStateAsUpdate(user.doc);
      Y.applyUpdate(otherUser.doc, update);
    }
  });
}

// =====================================================
// CHANGE TRACKING
// =====================================================

/**
 * Track changes in a Yjs document
 */
export function trackDocumentChanges(doc: Y.Doc): Array<{ type: string; changes: any }> {
  const changes: Array<{ type: string; changes: any }> = [];
  
  doc.on('update', (update: Uint8Array, origin: any) => {
    changes.push({
      type: 'update',
      changes: {
        updateSize: update.length,
        origin,
        timestamp: Date.now(),
      },
    });
  });
  
  return changes;
}

// =====================================================
// ASSERTIONS
// =====================================================

/**
 * Assert documents are in sync
 */
export function assertDocumentsInSync(doc1: Y.Doc, doc2: Y.Doc) {
  const state1 = Y.encodeStateVector(doc1);
  const state2 = Y.encodeStateVector(doc2);
  
  expect(state1.toString()).toBe(state2.toString());
}

/**
 * Assert map contains key
 */
export function assertMapHasKey(map: Y.Map<any>, key: string) {
  expect(map.has(key)).toBe(true);
}

/**
 * Assert text content matches
 */
export function assertTextContent(text: Y.Text, expected: string) {
  expect(text.toString()).toBe(expected);
}

// =====================================================
// EXPORTS
// =====================================================

export const yjsTestUtils = {
  createTestYjsDoc,
  createCollaborativeText,
  createCollaborativeMap,
  simulateConcurrentEdits,
  syncDocuments,
  createCollaborativeRule,
  updateCollaborativeRule,
  deleteCollaborativeRule,
  testConflictResolution,
  createMockCollaborationSession,
  applyCollaborativeEdit,
  trackDocumentChanges,
  assertDocumentsInSync,
  assertMapHasKey,
  assertTextContent,
};

export default yjsTestUtils;


