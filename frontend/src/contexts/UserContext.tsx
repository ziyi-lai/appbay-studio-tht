import React, { createContext, useReducer, useEffect, ReactNode } from 'react';
import userService from '@/services/userService';
import { User } from '@/types/User';

interface UserState {
  users: User[];
  loading: boolean;
  currentPage: number;
  pageSize: number;
  totalPages: number;
}

const initialState: UserState = {
  users: [],
  loading: false,
  currentPage: 1,
  pageSize: 10,
  totalPages: 1,
};

type Action =
  | { type: 'FETCH_START' }
  | { type: 'FETCH_SUCCESS'; payload: { records: User[]; totalPages: number } }
  | { type: 'FETCH_FAILURE'; payload: string }
  | { type: 'SET_PAGE'; payload: number }
  | { type: 'SET_PAGE_SIZE'; payload: number };

const UserContext = createContext<{
  state: UserState;
  dispatch: React.Dispatch<Action>;
  fetchUsers: () => void;
} | undefined>(undefined);

const userReducer = (state: UserState, action: Action): UserState => {
  switch (action.type) {
    case 'FETCH_START':
      return { ...state, loading: true };
    case 'FETCH_SUCCESS':
      return {
        ...state,
        loading: false,
        users: action.payload.records,
        totalPages: action.payload.totalPages,
      };
    case 'FETCH_FAILURE':
      return { ...state, loading: false };
    case 'SET_PAGE':
      return { ...state, currentPage: action.payload };
    case 'SET_PAGE_SIZE':
      return { ...state, pageSize: action.payload };
    default:
      return state;
  }
};

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(userReducer, initialState);

  const fetchUsers = async () => {
    dispatch({ type: 'FETCH_START' });
    try {
      const data = await userService.fetchUsers(state.currentPage, state.pageSize);
      dispatch({
        type: 'FETCH_SUCCESS',
        payload: { records: data.records, totalPages: data.totalPages },
      });
    } catch (error) {
      console.error("Error fetching users:", error);
      dispatch({ type: 'FETCH_FAILURE', payload: "An error occurred" });
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.currentPage, state.pageSize]);

  return (
    <UserContext.Provider value={{ state, dispatch, fetchUsers }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUserContext = () => {
  const context = React.useContext(UserContext);
  if (!context) {
    throw new Error("useUserContext must be used within a UserProvider");
  }
  return context;
};
