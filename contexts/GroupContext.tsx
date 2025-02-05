import { createContext, useContext, useState } from 'react';
import { groupsAPI } from '@/services/api';

interface GroupContextType {
  groups: any[];
  loading: boolean;
  error: string | null;
  fetchGroups: () => Promise<void>;
  createGroup: (data: any) => Promise<void>;
  updateGroup: (id: string, data: any) => Promise<void>;
  deleteGroup: (id: string) => Promise<void>;
}

const GroupContext = createContext<GroupContextType | undefined>(undefined);

export function GroupProvider({ children }: { children: React.ReactNode }) {
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const response = await groupsAPI.getAllGroups();
      setGroups(response);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createGroup = async (data: any) => {
    try {
      setLoading(true);
      await groupsAPI.createGroup(data);
      await fetchGroups();
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateGroup = async (id: string, data: any) => {
    try {
      setLoading(true);
      await groupsAPI.updateGroup(id, data);
      await fetchGroups();
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteGroup = async (id: string) => {
    try {
      setLoading(true);
      await groupsAPI.deleteGroup(id);
      await fetchGroups();
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <GroupContext.Provider
      value={{
        groups,
        loading,
        error,
        fetchGroups,
        createGroup,
        updateGroup,
        deleteGroup,
      }}
    >
      {children}
    </GroupContext.Provider>
  );
}

export function useGroups() {
  const context = useContext(GroupContext);
  if (context === undefined) {
    throw new Error('useGroups must be used within a GroupProvider');
  }
  return context;
}