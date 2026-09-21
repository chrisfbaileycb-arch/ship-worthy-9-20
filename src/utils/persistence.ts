import { useState, useEffect, useCallback } from "react";
import { AppRegistryItem } from "../types";
import { INITIAL_REGISTRY_APPS } from "../data/samples";

export const STORAGE_KEY_REGISTRY = "1without_apps_registry";
export const REGISTRY_CHANGE_EVENT = "1without_registry_changed";

/**
 * Retrieve current apps from localStorage.
 * If empty or uninitialized, returns empty array by default unless fallback is provided.
 */
export function getStoredApps(): AppRegistryItem[] {
  if (typeof window === "undefined") return [];
  const saved = localStorage.getItem(STORAGE_KEY_REGISTRY);
  if (!saved) return [];
  try {
    const parsed = JSON.parse(saved);
    if (Array.isArray(parsed)) {
      return parsed.map((item: any) => ({
        ...item,
        lifecyclePhase:
          item.lifecyclePhase ||
          (item.environment === "Production"
            ? "deployed_monitored"
            : item.environment === "Staging"
            ? "ready_for_deployment"
            : "in_development"),
        projectScope: item.projectScope || "master_core_ip",
      }));
    }
  } catch (err) {
    console.error("Failed to parse registry apps from storage:", err);
  }
  return [];
}

/**
 * Save apps to localStorage and dispatch a notification event for reactive subscribers.
 */
export function saveStoredApps(apps: AppRegistryItem[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY_REGISTRY, JSON.stringify(apps));
    window.dispatchEvent(new CustomEvent(REGISTRY_CHANGE_EVENT, { detail: apps }));
  } catch (err) {
    console.error("Failed to save registry apps to storage:", err);
  }
}

/**
 * Add a new app to storage
 */
export function addStoredApp(app: AppRegistryItem): AppRegistryItem[] {
  const current = getStoredApps();
  const existsIndex = current.findIndex((a) => a.id === app.id);
  let updated: AppRegistryItem[];
  if (existsIndex >= 0) {
    updated = [...current];
    updated[existsIndex] = app;
  } else {
    updated = [app, ...current];
  }
  saveStoredApps(updated);
  return updated;
}

/**
 * Update an existing app in storage
 */
export function updateStoredApp(app: AppRegistryItem): AppRegistryItem[] {
  const current = getStoredApps();
  const updated = current.map((a) => (a.id === app.id ? app : a));
  saveStoredApps(updated);
  return updated;
}

/**
 * Remove an app from storage
 */
export function removeStoredApp(appId: string): AppRegistryItem[] {
  const current = getStoredApps();
  const updated = current.filter((a) => a.id !== appId);
  saveStoredApps(updated);
  return updated;
}

/**
 * Load the 4 original sample blueprints as optional templates.
 */
export function loadExampleTemplates(): AppRegistryItem[] {
  saveStoredApps(INITIAL_REGISTRY_APPS);
  return INITIAL_REGISTRY_APPS;
}

/**
 * Clear all tracked apps
 */
export function clearStoredApps(): void {
  saveStoredApps([]);
}

/**
 * Reactive React hook to connect any component directly to the dynamic apps list.
 * Automatically synchronizes with storage changes and updates reactively.
 */
export function useRegistryApps(initialFallback?: AppRegistryItem[]) {
  const [apps, setApps] = useState<AppRegistryItem[]>(() => {
    const stored = getStoredApps();
    if (stored.length > 0) return stored;
    if (initialFallback && initialFallback.length > 0) {
      return initialFallback;
    }
    return [];
  });

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY_REGISTRY) {
        setApps(getStoredApps());
      }
    };

    const handleCustomChange = (e: Event) => {
      const customEvent = e as CustomEvent<AppRegistryItem[]>;
      if (customEvent.detail && Array.isArray(customEvent.detail)) {
        setApps(customEvent.detail);
      } else {
        setApps(getStoredApps());
      }
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener(REGISTRY_CHANGE_EVENT, handleCustomChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener(REGISTRY_CHANGE_EVENT, handleCustomChange);
    };
  }, []);

  const addApp = useCallback((newApp: AppRegistryItem) => {
    return addStoredApp(newApp);
  }, []);

  const updateApp = useCallback((updatedApp: AppRegistryItem) => {
    return updateStoredApp(updatedApp);
  }, []);

  const removeApp = useCallback((appId: string) => {
    return removeStoredApp(appId);
  }, []);

  const loadTemplates = useCallback(() => {
    return loadExampleTemplates();
  }, []);

  const clearApps = useCallback(() => {
    clearStoredApps();
  }, []);

  return {
    apps,
    setApps,
    addApp,
    updateApp,
    removeApp,
    loadTemplates,
    clearApps,
  };
}
