/**
 * React Hook for Yjs Collaboration
 * Provides real-time collaborative editing functionality
 */

'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { 
  YjsCollaborationManager, 
  createCollaborationManager,
  type CollaborationUser,
  type CollaborationOptions 
} from '@/lib/collaboration/yjs-manager';
import type * as Y from 'yjs';

export interface UseCollaborationOptions {
  documentId: string;
  userId: string;
  userName: string;
  userEmail: string;
  autoSaveInterval?: number;
  enabled?: boolean; // Allow conditional enabling
}

export interface UseCollaborationReturn {
  manager: YjsCollaborationManager | null;
  doc: Y.Doc | null;
  isConnected: boolean;
  presenceUsers: CollaborationUser[];
  error: Error | null;
  isLoading: boolean;
  reconnect: () => Promise<void>;
}

export function useCollaboration(
  options: UseCollaborationOptions
): UseCollaborationReturn {
  const {
    documentId,
    userId,
    userName,
    userEmail,
    autoSaveInterval,
    enabled = true,
  } = options;

  const [manager, setManager] = useState<YjsCollaborationManager | null>(null);
  const [doc, setDoc] = useState<Y.Doc | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [presenceUsers, setPresenceUsers] = useState<CollaborationUser[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const managerRef = useRef<YjsCollaborationManager | null>(null);

  const connect = useCallback(async () => {
    if (!enabled) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const collabOptions: CollaborationOptions = {
        documentId,
        userId,
        userName,
        userEmail,
        autoSaveInterval,
        onPresenceChange: (users) => {
          setPresenceUsers(users);
        },
        onError: (err) => {
          console.error('Collaboration error:', err);
          setError(err);
        },
      };

      const newManager = createCollaborationManager(collabOptions);
      await newManager.connect();

      managerRef.current = newManager;
      setManager(newManager);
      setDoc(newManager.getDocument());
      setIsConnected(true);
    } catch (err) {
      setError(err as Error);
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  }, [documentId, userId, userName, userEmail, autoSaveInterval, enabled]);

  const reconnect = useCallback(async () => {
    // Disconnect existing manager
    if (managerRef.current) {
      await managerRef.current.disconnect();
      managerRef.current = null;
    }

    // Reconnect
    await connect();
  }, [connect]);

  useEffect(() => {
    connect();

    return () => {
      if (managerRef.current) {
        managerRef.current.disconnect();
        managerRef.current = null;
      }
    };
  }, [connect]);

  return {
    manager,
    doc,
    isConnected,
    presenceUsers,
    error,
    isLoading,
    reconnect,
  };
}

/**
 * Hook for observing a shared Yjs Map
 */
export function useSharedMap<T = any>(
  manager: YjsCollaborationManager | null,
  mapName: string
): Y.Map<T> | null {
  const [sharedMap, setSharedMap] = useState<Y.Map<T> | null>(null);

  useEffect(() => {
    if (!manager) {
      setSharedMap(null);
      return;
    }

    const map = manager.getSharedType<T>(mapName);
    setSharedMap(map);
  }, [manager, mapName]);

  return sharedMap;
}

/**
 * Hook for observing changes to a shared Map
 */
export function useSharedMapValue<T = any>(
  sharedMap: Y.Map<T> | null,
  key: string
): T | undefined {
  const [value, setValue] = useState<T | undefined>(
    sharedMap?.get(key)
  );

  useEffect(() => {
    if (!sharedMap) {
      setValue(undefined);
      return;
    }

    // Set initial value
    setValue(sharedMap.get(key));

    // Listen for changes
    const observer = (event: any) => {
      if (event.keysChanged.has(key)) {
        setValue(sharedMap.get(key));
      }
    };

    sharedMap.observe(observer);

    return () => {
      sharedMap.unobserve(observer);
    };
  }, [sharedMap, key]);

  return value;
}

/**
 * Hook for observing all entries in a shared Map
 */
export function useSharedMapEntries<T = any>(
  sharedMap: Y.Map<T> | null
): Record<string, T> {
  const [entries, setEntries] = useState<Record<string, T>>({});

  useEffect(() => {
    if (!sharedMap) {
      setEntries({});
      return;
    }

    // Set initial entries
    const initialEntries: Record<string, T> = {};
    sharedMap.forEach((value, key) => {
      initialEntries[key] = value;
    });
    setEntries(initialEntries);

    // Listen for changes
    const observer = () => {
      const newEntries: Record<string, T> = {};
      sharedMap.forEach((value, key) => {
        newEntries[key] = value;
      });
      setEntries(newEntries);
    };

    sharedMap.observe(observer);

    return () => {
      sharedMap.unobserve(observer);
    };
  }, [sharedMap]);

  return entries;
}


