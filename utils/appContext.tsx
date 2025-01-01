import { createContext, useContext, useState } from "react";

interface AppState {
  avatar: "Giraffe" | "Elephant" | "Bear" | "Tiger";
  frustrated: boolean;
}

interface AppContextType {
  state: AppState;
  updateState: (key: keyof AppState, value: any) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const initialState: AppState = {
  avatar: "Giraffe",
  frustrated: false,
};

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, setState] = useState<AppState>(initialState);

  const updateState = (key: keyof AppState, value: any) => {
    setState((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <AppContext.Provider value={{ state, updateState }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};

export default AppContext;
