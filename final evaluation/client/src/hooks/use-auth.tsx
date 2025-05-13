import { createContext, ReactNode, useContext } from "react";
import {
  useQuery,
  useMutation,
} from "@tanstack/react-query";
import { InsertUser, User } from "@shared/schema";
import { apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

type LoginCredentials = {
  email: string;
  password: string;
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: ReturnType<typeof useLoginMutation>;
  logoutMutation: ReturnType<typeof useLogoutMutation>;
  registerMutation: ReturnType<typeof useRegisterMutation>;
};

export const AuthContext = createContext<AuthContextType | null>(null);

function useUserQuery() {
  return useQuery<User | null, Error>({
    queryKey: ["/api/user"],
    queryFn: async ({ queryKey }) => {
      try {
        const response = await fetch(queryKey[0] as string, {
          credentials: "include",
        });
        
        if (response.status === 401) {
          return null;
        }
        
        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        return await response.json();
      } catch (error) {
        console.error("Failed to fetch user", error);
        return null;
      }
    },
  });
}

function useLoginMutation() {
  const { toast } = useToast();
  const [, navigate] = useLocation();

  return useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const res = await apiRequest("POST", "/api/login", credentials);
      return await res.json();
    },
    onSuccess: (user: User) => {
      queryClient.setQueryData(["/api/user"], user);
      toast({
        title: "Login successful",
        description: `Welcome back, ${user.name}!`,
      });
      navigate("/dashboard");
    },
    onError: (error: Error) => {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

function useRegisterMutation() {
  const { toast } = useToast();
  const [, navigate] = useLocation();

  return useMutation({
    mutationFn: async (userData: InsertUser) => {
      const res = await apiRequest("POST", "/api/register", userData);
      return await res.json();
    },
    onSuccess: (user: User) => {
      queryClient.setQueryData(["/api/user"], user);
      toast({
        title: "Registration successful",
        description: `Welcome to TravelHub, ${user.name}!`,
      });
      navigate("/dashboard");
    },
    onError: (error: Error) => {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

function useLogoutMutation() {
  const { toast } = useToast();
  const [, navigate] = useLocation();

  return useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/logout");
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/user"], null);
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
      navigate("/auth");
    },
    onError: (error: Error) => {
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: user, error, isLoading } = useUserQuery();
  const loginMutation = useLoginMutation();
  const registerMutation = useRegisterMutation();
  const logoutMutation = useLogoutMutation();

  return (
    <AuthContext.Provider
      value={{
        user: user || null,
        isLoading,
        error,
        loginMutation,
        logoutMutation,
        registerMutation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
