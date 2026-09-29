"use client";

import React, { createContext, useContext, useCallback, useRef, ReactNode } from "react";

export type ListenerType = "type1" | "type2";

export interface EventConfig {
  key: string;
  label: string;
  listenerType: ListenerType;
}

export interface EventPayload {
  nodeId?: string;
  data?: any;
  targetNodeId?: string;
}

type EventListener = (payload: EventPayload) => void;

interface EventBusContextType {
  emit: (eventKey: string, payload: EventPayload) => void;
  subscribe: (eventKey: string, nodeId: string, listener: EventListener) => () => void;
  subscribeGlobal: (eventKey: string, listener: EventListener) => () => void;
}

const EventBusContext = createContext<EventBusContextType | undefined>(undefined);

export const EventBusProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Store for type1 (global) listeners
  const globalListeners = useRef<Map<string, Set<EventListener>>>(new Map());

  // Store for type2 (node-specific) listeners
  const nodeListeners = useRef<Map<string, Map<string, Set<EventListener>>>>(new Map());

  const emit = useCallback((eventKey: string, payload: EventPayload) => {
    // Emit to global listeners (type1)
    const globalSet = globalListeners.current.get(eventKey);
    if (globalSet) {
      globalSet.forEach(listener => {
        try {
          listener(payload);
        } catch (error) {
          console.error(`Error in global listener for ${eventKey}:`, error);
        }
      });
    }

    // Emit to node-specific listeners (type2)
    if (payload.targetNodeId) {
      const nodeMap = nodeListeners.current.get(eventKey);
      if (nodeMap) {
        const nodeSet = nodeMap.get(payload.targetNodeId);
        if (nodeSet) {
          nodeSet.forEach(listener => {
            try {
              listener(payload);
            } catch (error) {
              console.error(`Error in node listener for ${eventKey}:`, error);
            }
          });
        }
      }
    }
  }, []);

  const subscribe = useCallback((eventKey: string, nodeId: string, listener: EventListener) => {
    // Subscribe to node-specific events (type2)
    if (!nodeListeners.current.has(eventKey)) {
      nodeListeners.current.set(eventKey, new Map());
    }

    const nodeMap = nodeListeners.current.get(eventKey)!;
    if (!nodeMap.has(nodeId)) {
      nodeMap.set(nodeId, new Set());
    }

    const listenerSet = nodeMap.get(nodeId)!;
    listenerSet.add(listener);

    // Return unsubscribe function
    return () => {
      listenerSet.delete(listener);
      if (listenerSet.size === 0) {
        nodeMap.delete(nodeId);
      }
      if (nodeMap.size === 0) {
        nodeListeners.current.delete(eventKey);
      }
    };
  }, []);

  const subscribeGlobal = useCallback((eventKey: string, listener: EventListener) => {
    // Subscribe to global events (type1)
    if (!globalListeners.current.has(eventKey)) {
      globalListeners.current.set(eventKey, new Set());
    }

    const listenerSet = globalListeners.current.get(eventKey)!;
    listenerSet.add(listener);

    // Return unsubscribe function
    return () => {
      listenerSet.delete(listener);
      if (listenerSet.size === 0) {
        globalListeners.current.delete(eventKey);
      }
    };
  }, []);

  return (
    <EventBusContext.Provider value={{ emit, subscribe, subscribeGlobal }}>
      {children}
    </EventBusContext.Provider>
  );
};

export const useEventBus = () => {
  const context = useContext(EventBusContext);
  if (context === undefined) {
    throw new Error("useEventBus must be used within an EventBusProvider");
  }
  return context;
};
