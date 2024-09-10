import { Creator } from '@/components/data-access/crowdfunding-data-access';
import React, { createContext, useContext, ReactNode } from 'react';

interface CreatorContextProps {
  creator: Creator | null;
}

const CreatorContext = createContext<CreatorContextProps | undefined>(
  undefined,
);

interface CreatorProviderProps {
  creator: Creator | null; // Allow creator to be null
  children: ReactNode;
}

export const CreatorProvider = ({
  creator,
  children,
}: CreatorProviderProps) => {
  return (
    <CreatorContext.Provider value={{ creator }}>
      {children}
    </CreatorContext.Provider>
  );
};

export const useCreator = () => {
  const context = useContext(CreatorContext);
  if (!context) {
    throw new Error('useCreator must be used within a CreatorProvider');
  }
  return context;
};
