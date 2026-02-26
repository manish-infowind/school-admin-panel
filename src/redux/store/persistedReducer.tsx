import { combineReducers } from "@reduxjs/toolkit";
import storage from 'redux-persist/lib/storage';
import { persistReducer } from "redux-persist";
import authSlice from "../features/authSlice"

const rootReducers = combineReducers({
    auth: authSlice,
});

const persisteConfig = {
    key: "root",
    version: 1,
    storage,
};

const persistedReducer = persistReducer(persisteConfig, rootReducers);
export default persistedReducer;