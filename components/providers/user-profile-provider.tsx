"use client";

import { createContext, useContext, useState, ReactNode } from "react";

export interface UserProfileState {
  id?: string;
  name: string;
  username: string;
  avatarUrl: string | null;
  coverUrl: string | null;
  bio?: string | null;
  homeArea?: string | null;
}

interface UserProfileContextType {
  profile: UserProfileState | null;
  setProfile: (profile: UserProfileState) => void;
  updateProfile: (partial: Partial<UserProfileState>) => void;
}

const UserProfileContext = createContext<UserProfileContextType | undefined>(undefined);

export function UserProfileProvider({
  children,
  initialProfile,
}: {
  children: ReactNode;
  initialProfile?: UserProfileState | null;
}) {
  const [profile, setProfileState] = useState<UserProfileState | null>(initialProfile || null);

  const setProfile = (newProfile: UserProfileState) => {
    setProfileState(newProfile);
  };

  const updateProfile = (partial: Partial<UserProfileState>) => {
    setProfileState((prev) => (prev ? { ...prev, ...partial } : (partial as UserProfileState)));
  };

  return (
    <UserProfileContext.Provider value={{ profile, setProfile, updateProfile }}>
      {children}
    </UserProfileContext.Provider>
  );
}

export function useUserProfile() {
  const context = useContext(UserProfileContext);
  if (!context) {
    // Graceful fallback for components used outside provider
    return {
      profile: null,
      setProfile: () => {},
      updateProfile: () => {},
    };
  }
  return context;
}
