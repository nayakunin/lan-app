import { useLocalStorageState } from 'ahooks';
import { createContext, ReactNode } from 'react';

type AuthContextType = {
  jwt?: string;
  setJwt: (jwt: string) => void;
};

export const AuthContext = createContext<AuthContextType>({
  setJwt: () => {
    return;
  },
});

type AuthProviderProps = {
  children: ReactNode;
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [jwt, setJwt] = useLocalStorageState<string | undefined>('jwt');

  return (
    <AuthContext.Provider
      value={{
        jwt,
        setJwt,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
