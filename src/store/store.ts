// store/store.ts
import { configureStore, combineReducers } from "@reduxjs/toolkit";
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import storage from "redux-persist/lib/storage"; // defaults to localStorage for web

import modalReducer from "./modalSlice";
import projectReducer from "./projectSlice";
import conceptNoteReducer from "./conceptNoteSlice";
import purchaseRequestReducer from "./purchaseRequestSlice";
import advanceRequestReducer from "./advanceRequestSlice";
import travelRequestReducer from "./travelRequestSlice";
import paymentRequestReducer from "./paymentRequestSlice";
import genericQuerySliceReducer from "./genericQuerySlice";
import navigationSliceReducer from "./navigationSlice";
import expenseClaimReducer from "./expenseClaimSlice";
import vendorReducer from "./vendorSlice";
import rfqReducer from "./rfqSlice";
import purchaseOrderReducer from "./purchaseOrderSlice";

// Combine all reducers
const rootReducer = combineReducers({
  modal: modalReducer,
  project: projectReducer,
  conceptNote: conceptNoteReducer,
  purchaseRequest: purchaseRequestReducer,
  advanceRequest: advanceRequestReducer,
  travelRequest: travelRequestReducer,
  paymentRequest: paymentRequestReducer,
  genericQuerySlice: genericQuerySliceReducer,
  navigationSlice: navigationSliceReducer,
  expenseClaim: expenseClaimReducer,
  vendor: vendorReducer,
  rfq: rfqReducer,
  purchaseOrder: purchaseOrderReducer,
});

// Create persist config
const persistConfig = {
  key: "root",
  storage,
  // Optionally blacklist or whitelist slices
  blacklist: ["genericQuerySlice"], // if you don’t want to persist this
  // whitelist: ['purchaseRequest'] // only persist these
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

// Configure store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Required for redux-persist to avoid warnings
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

// Create the persistor
export const persistor = persistStore(store);

// Types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
