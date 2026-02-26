import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { User } from "@/api/types";

interface AuthState {
    loginState: User | null;
    loadingState: boolean,
    isAuthenticated: boolean,
    isLoggingIn: boolean,
};

const initialState: AuthState = {
    loginState: null,
    loadingState: false,
    isAuthenticated: false,
    isLoggingIn: false,
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        loginInfo: (state, action: PayloadAction<User>) => {
            state.loginState = action.payload;
            state.loadingState = false;
            state.isAuthenticated = true;
            state.isLoggingIn = false;
        },
        logout: (state) => {
            // Clear Redux state
            state.loginState = null;
            state.loadingState = false;
            state.isAuthenticated = false;
            state.isLoggingIn = false;

            // Clear localStorage
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('tempToken');
            localStorage.removeItem('user');
            localStorage.removeItem('sessionId');
            localStorage.removeItem('isSuperAdmin');
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.loadingState = action.payload;
        },
        setLoggingIn: (state, action: PayloadAction<boolean>) => {
            state.isLoggingIn = action.payload;
        }
    }
});

export const { loginInfo, logout, setLoading, setLoggingIn } = authSlice.actions;
export default authSlice.reducer;