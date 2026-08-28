'use client';

import { useSyncExternalStore } from 'react';

export type RoleKey = 'sdma_admin' | 'district_collector' | 'geotech_surveyor';

export interface UserRoleSession {
  id: RoleKey;
  title: string;
  shortTitle: string;
  jurisdiction: string;
  badge: string;
}

export const AVAILABLE_ROLES: Record<RoleKey, UserRoleSession> = {
  sdma_admin: {
    id: 'sdma_admin',
    title: 'SDMA Admin',
    shortTitle: 'SDMA Admin',
    jurisdiction: 'State HQ (SDMA)',
    badge: 'FULL ACCESS',
  },
  district_collector: {
    id: 'district_collector',
    title: 'District Collector',
    shortTitle: 'District Collector',
    jurisdiction: 'District Level (Wayanad/Chamoli)',
    badge: 'DISTRICT GOVERNANCE',
  },
  geotech_surveyor: {
    id: 'geotech_surveyor',
    title: 'Field Geotechnical Surveyor',
    shortTitle: 'Geotech Surveyor',
    jurisdiction: 'Field Survey Unit',
    badge: 'FIELD AUDIT',
  },
};

export const DEFAULT_ROLE = AVAILABLE_ROLES.sdma_admin;

const SESSION_STORAGE_KEY = 'sih26191_active_role';

function isRoleKey(key: string): key is RoleKey {
  return key in AVAILABLE_ROLES;
}

export function getActiveRole(): UserRoleSession {
  if (typeof window === 'undefined') return DEFAULT_ROLE;
  try {
    const stored = localStorage.getItem(SESSION_STORAGE_KEY);
    if (stored && isRoleKey(stored)) {
      return AVAILABLE_ROLES[stored];
    }
  } catch {
    // fallback
  }
  return DEFAULT_ROLE;
}

export function setActiveRole(roleId: string): void {
  if (typeof window === 'undefined') return;
  try {
    if (isRoleKey(roleId)) {
      localStorage.setItem(SESSION_STORAGE_KEY, roleId);
      window.dispatchEvent(new CustomEvent('sih26191_role_change', { detail: roleId }));
    }
  } catch {
    // ignore
  }
}

function subscribeRoleChanges(callback: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener('sih26191_role_change', callback);
  window.addEventListener('storage', callback);
  return () => {
    window.removeEventListener('sih26191_role_change', callback);
    window.removeEventListener('storage', callback);
  };
}

export function useActiveRole(): UserRoleSession {
  return useSyncExternalStore(
    subscribeRoleChanges,
    getActiveRole,
    () => DEFAULT_ROLE,
  );
}
