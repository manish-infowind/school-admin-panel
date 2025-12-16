import { createSlice } from "@reduxjs/toolkit";


interface CounterState {
    loginState: {},
    login2FAState: {},
    loadingState: boolean,
    isAuthenticated: boolean,
    isLoggingIn: boolean,
    isVerifying2FA: boolean,
};

const initialState: CounterState = {
    loginState: {},
    login2FAState: {},
    loadingState: false,
    isAuthenticated: false,
    isLoggingIn: false,
    isVerifying2FA: false,
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        loginInfo: (state, action) => {
            state.loginState = action.payload;
            state.loadingState = false;
            state.isAuthenticated = true;
            state.isLoggingIn = true;
        },
        login2FAInfo: (state, action) => {
            state.login2FAState = action.payload;
            state.loadingState = false;
            state.isAuthenticated = true;
            state.isLoggingIn = true;
            state.isVerifying2FA = true;
        },
        logout: (state) => {
            state.loginState = {};
            state.loadingState = false;
            state.isAuthenticated = false;
            state.isLoggingIn = false;
            state.isVerifying2FA = false;
        }
    }
});

export const { loginInfo, login2FAInfo, logout } = authSlice.actions;
export default authSlice.reducer;