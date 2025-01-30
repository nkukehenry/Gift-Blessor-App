import React, { createContext, useState, useContext, ReactNode } from "react"
import { Group, CreateGroupData, JoinGroupData } from "../models/group"
import { User } from "../models/user"
import { api } from "../services/api"
import { useAuth } from "./AuthContext"

interface GroupContextType {
  groups: Group[];
  setGroups: React.Dispatch<React.SetStateAction<Group[]>>;
  createGroup: (groupData: CreateGroupData, creator: User) => void;
  joinGroup: (data: JoinGroupData, user: User) => void;
  refreshGroups: () => Promise<void>;
}

const GroupContext = createContext<GroupContextType | undefined>(undefined)

export const useGroup = (): GroupContextType => {
  const context = useContext(GroupContext)
  if (context === undefined) {
    throw new Error('useGroup must be used within a GroupProvider')
  }
  return context
}

interface GroupProviderProps {
  children: ReactNode;
}

export const GroupProvider = ({ children }: GroupProviderProps) => {
  const { user } = useAuth()
  const [groups, setGroups] = useState<Group[]>([])

  const createGroup = (groupData: CreateGroupData, creator: User) => {
    const newGroup: Group = {
      id: crypto.randomUUID(),
      ...groupData,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: creator,
      members: [creator],
      admins: [creator],
      status: 'active'
    }
    setGroups([...groups, newGroup])
  }

  const joinGroup = ({ groupId, userId }: JoinGroupData, user: User) => {
    const updatedGroups = groups.map((group) => {
      if (group.id === groupId) {
        const isMember = group.members.some(member => member.id === userId)
        if (!isMember) {
          return {
            ...group,
            members: [...group.members, user],
            updatedAt: new Date()
          }
        }
      }
      return group
    })
    setGroups(updatedGroups)
  }

  const refreshGroups = async () => {
    if (user) {
      const userGroups = await api.getUserGroups(user.id)
      setGroups(userGroups)
    }
  }

  const value: GroupContextType = {
    groups,
    setGroups,
    createGroup,
    joinGroup,
    refreshGroups
  }

  return <GroupContext.Provider value={value}>{children}</GroupContext.Provider>
}

