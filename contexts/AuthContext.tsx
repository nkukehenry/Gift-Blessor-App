import React, { createContext, useState, useContext, ReactNode } from "react"
import { User } from "../models/user"

interface AuthContextType {
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null)

  const login = (userData: User) => {
    // In a real app, you'd make an API call here
    setUser(userData)
  }

  const logout = () => {
    // In a real app, you'd make an API call here
    setUser(null)
  }

  const value: AuthContextType = {
    user,
    login,
    logout
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

