import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
  _id: string;
  username: string;
  email: string;
  createdAt: string;
  admin: boolean;
}

interface AuthStore {
  currentUser: User | null;
  tokenExpiry: number | null;
  setCurrentUser: (newUser: User) => void;
  removeCurrentUser: () => void;
  checkTokenExpiry: () => void;
  isTokenExpired: () => boolean;
}

const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      currentUser: null,
      tokenExpiry: null,
      setCurrentUser: (newUser) => {
        const expiry = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
        set({ currentUser: newUser, tokenExpiry: expiry });
      },
      removeCurrentUser: () => set({ currentUser: null, tokenExpiry: null }),
      checkTokenExpiry: () => {
        const { tokenExpiry } = get();
        if (tokenExpiry && Date.now() > tokenExpiry) {
          set({ currentUser: null, tokenExpiry: null });
          return true;
        }
        return false;
      },
      isTokenExpired: () => {
        const { tokenExpiry } = get();
        return tokenExpiry ? Date.now() > tokenExpiry : false;
      },
    }),
    { name: "auth-storage" },
  ),
);

// Check token expiry every minute
setInterval(() => {
  useAuthStore.getState().checkTokenExpiry();
}, 60000); 

// Check token expiry on app load
if (typeof window !== 'undefined') {
  useAuthStore.getState().checkTokenExpiry();
}

export default useAuthStore;