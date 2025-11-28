/**
 * Yjs Collaboration Manager
 * Handles real-time collaborative editing for scheduling rules
 * 
 * Features:
 * - CRDT-based conflict resolution
 * - Auto-save every 10 seconds
 * - User presence tracking
 * - Session history
 */

import * as Y from 'yjs';
import { createBrowserClient } from '@/lib/supabase/client';
import type { RealtimeChannel } from '@supabase/supabase-js';

export interface CollaborationUser {
  id: string;
  name: string;
  email: string;
  color: string;
  cursor?: { line: number; column: number };
}

export interface CollaborationOptions {
  documentId: string;
  userId: string;
  userName: string;
  userEmail: string;
  autoSaveInterval?: number; // milliseconds, default 10000 (10 seconds)
  onSync?: (state: Uint8Array) => void;
  onPresenceChange?: (users: CollaborationUser[]) => void;
  onError?: (error: Error) => void;
}

export class YjsCollaborationManager {
  private doc: Y.Doc;
  private supabase: ReturnType<typeof createBrowserClient>;
  private channel: RealtimeChannel | null = null;
  private options: Required<CollaborationOptions>;
  private autoSaveTimer: NodeJS.Timeout | null = null;
  private presenceUsers: Map<string, CollaborationUser> = new Map();
  private lastSavedState: Uint8Array | null = null;
  private isConnected: boolean = false;

  constructor(options: CollaborationOptions) {
    this.doc = new Y.Doc();
    this.supabase = createBrowserClient();
    
    this.options = {
      ...options,
      autoSaveInterval: options.autoSaveInterval ?? 10000,
      onSync: options.onSync ?? (() => {}),
      onPresenceChange: options.onPresenceChange ?? (() => {}),
      onError: options.onError ?? ((error) => console.error('Collaboration error:', error)),
    };

    this.setupAutoSave();
  }

  /**
   * Initialize collaboration and connect to Supabase Realtime
   */
  async connect(): Promise<void> {
    try {
      // Load initial document state from database
      await this.loadInitialState();

      // Set up Realtime channel for collaboration
      this.channel = this.supabase.channel(`collab:${this.options.documentId}`, {
        config: {
          presence: {
            key: this.options.userId,
          },
        },
      });

      // Listen for document updates from other users
      this.channel
        .on('broadcast', { event: 'update' }, (payload) => {
          this.handleRemoteUpdate(payload);
        })
        .on('presence', { event: 'sync' }, () => {
          this.handlePresenceSync();
        })
        .on('presence', { event: 'join' }, ({ key, newPresences }) => {
          this.handlePresenceJoin(key, newPresences);
        })
        .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
          this.handlePresenceLeave(key, leftPresences);
        });

      // Subscribe to channel
      await this.channel.subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          this.isConnected = true;
          
          // Track own presence
          await this.channel?.track({
            user_id: this.options.userId,
            user_name: this.options.userName,
            user_email: this.options.userEmail,
            color: this.generateUserColor(this.options.userId),
            online_at: new Date().toISOString(),
          });
        }
      });

      // Set up local document update listener
      this.doc.on('update', this.handleLocalUpdate.bind(this));

    } catch (error) {
      this.options.onError(error as Error);
      throw error;
    }
  }

  /**
   * Disconnect from collaboration
   */
  async disconnect(): Promise<void> {
    // Stop auto-save
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer);
      this.autoSaveTimer = null;
    }

    // Save final state
    await this.saveState();

    // Unsubscribe from channel
    if (this.channel) {
      await this.supabase.removeChannel(this.channel);
      this.channel = null;
    }

    this.isConnected = false;
  }

  /**
   * Get the Yjs document for direct manipulation
   */
  getDocument(): Y.Doc {
    return this.doc;
  }

  /**
   * Get a shared type from the document
   */
  getSharedType<T = any>(name: string): Y.Map<T> {
    return this.doc.getMap<T>(name);
  }

  /**
   * Get current presence users
   */
  getPresenceUsers(): CollaborationUser[] {
    return Array.from(this.presenceUsers.values());
  }

  /**
   * Check if connected
   */
  isConnectedToChannel(): boolean {
    return this.isConnected;
  }

  /**
   * Manually trigger save
   */
  async save(): Promise<void> {
    await this.saveState();
  }

  // ========== Private Methods ==========

  private async loadInitialState(): Promise<void> {
    try {
      const { data, error } = await this.supabase
        .from('collaboration_documents')
        .select('state, updated_at')
        .eq('id', this.options.documentId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data?.state) {
        // Apply saved state to document
        const stateBuffer = Buffer.from(data.state, 'base64');
        Y.applyUpdate(this.doc, new Uint8Array(stateBuffer));
        this.lastSavedState = Y.encodeStateAsUpdate(this.doc);
      }
    } catch (error) {
      this.options.onError(error as Error);
    }
  }

  private async saveState(): Promise<void> {
    try {
      const state = Y.encodeStateAsUpdate(this.doc);
      
      // Check if state has changed
      if (this.lastSavedState && this.arraysEqual(state, this.lastSavedState)) {
        return; // No changes, skip save
      }

      const stateBase64 = Buffer.from(state).toString('base64');

      const { error } = await this.supabase
        .from('collaboration_documents')
        .upsert({
          id: this.options.documentId,
          state: stateBase64,
          updated_by: this.options.userId,
          updated_at: new Date().toISOString(),
        });

      if (error) {
        throw error;
      }

      this.lastSavedState = state;
      this.options.onSync(state);
    } catch (error) {
      this.options.onError(error as Error);
    }
  }

  private setupAutoSave(): void {
    this.autoSaveTimer = setInterval(() => {
      this.saveState();
    }, this.options.autoSaveInterval);
  }

  private handleLocalUpdate(update: Uint8Array, origin: any): void {
    // Don't broadcast updates that came from remote
    if (origin !== 'remote') {
      this.broadcastUpdate(update);
    }
  }

  private broadcastUpdate(update: Uint8Array): void {
    if (!this.isConnected || !this.channel) {
      return;
    }

    const updateBase64 = Buffer.from(update).toString('base64');
    
    this.channel.send({
      type: 'broadcast',
      event: 'update',
      payload: {
        update: updateBase64,
        user_id: this.options.userId,
        timestamp: Date.now(),
      },
    });
  }

  private handleRemoteUpdate(payload: any): void {
    try {
      const { update, user_id } = payload.payload;
      
      // Don't apply own updates
      if (user_id === this.options.userId) {
        return;
      }

      const updateBuffer = Buffer.from(update, 'base64');
      Y.applyUpdate(this.doc, new Uint8Array(updateBuffer), 'remote');
    } catch (error) {
      this.options.onError(error as Error);
    }
  }

  private handlePresenceSync(): void {
    if (!this.channel) return;

    const state = this.channel.presenceState();
    this.updatePresenceUsers(state);
  }

  private handlePresenceJoin(key: string, newPresences: any[]): void {
    newPresences.forEach((presence) => {
      this.presenceUsers.set(presence.user_id, {
        id: presence.user_id,
        name: presence.user_name,
        email: presence.user_email,
        color: presence.color,
      });
    });

    this.options.onPresenceChange(this.getPresenceUsers());
  }

  private handlePresenceLeave(key: string, leftPresences: any[]): void {
    leftPresences.forEach((presence) => {
      this.presenceUsers.delete(presence.user_id);
    });

    this.options.onPresenceChange(this.getPresenceUsers());
  }

  private updatePresenceUsers(state: any): void {
    this.presenceUsers.clear();

    Object.values(state).forEach((presences: any) => {
      presences.forEach((presence: any) => {
        this.presenceUsers.set(presence.user_id, {
          id: presence.user_id,
          name: presence.user_name,
          email: presence.user_email,
          color: presence.color,
        });
      });
    });

    this.options.onPresenceChange(this.getPresenceUsers());
  }

  private generateUserColor(userId: string): string {
    // Generate a consistent color based on user ID
    const colors = [
      '#EF4444', '#F59E0B', '#10B981', '#3B82F6', 
      '#8B5CF6', '#EC4899', '#14B8A6', '#F97316',
    ];
    
    const hash = userId.split('').reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);
    
    return colors[Math.abs(hash) % colors.length];
  }

  private arraysEqual(a: Uint8Array, b: Uint8Array): boolean {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) return false;
    }
    return true;
  }
}

/**
 * Create a new collaboration manager instance
 */
export function createCollaborationManager(
  options: CollaborationOptions
): YjsCollaborationManager {
  return new YjsCollaborationManager(options);
}


