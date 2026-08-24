// store/store.ts
import { configureStore, combineReducers } from '@reduxjs/toolkit';
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
import storage from 'redux-persist/lib/storage';

import modalReducer from './modalSlice';
import projectReducer from './projectSlice';
import conceptNoteReducer from './conceptNoteSlice';
import purchaseRequestReducer from './purchaseRequestSlice';
import advanceRequestReducer from './advanceRequestSlice';
import travelRequestReducer from './travelRequestSlice';
import paymentRequestReducer from './paymentRequestSlice';
import genericQuerySliceReducer from './genericQuerySlice';
import navigationSliceReducer from './navigationSlice';
import expenseClaimReducer from './expenseClaimSlice';
import vendorReducer from './vendorSlice';
import rfqReducer from './rfqSlice';
import userReducer from './userSlice';
import purchaseOrderReducer from './purchaseOrderSlice';
import goodsReceivedSliceReducer from './goodsReceivedSlice';
import paymentVoucherSliceReducer from './paymentVoucherSlice';
import leaveReducer from './leaveSlice';
import staffStrategyReducer from './staffStrategySlice';
import appraisalReducer from './appraisalSlice';
import reportReducer from './reportSlice';
import userSubTabReducer from './userSubTabSlice';

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
  user: userReducer,
  purchaseOrder: purchaseOrderReducer,
  goodsReceived: goodsReceivedSliceReducer,
  paymentVoucher: paymentVoucherSliceReducer,
  leave: leaveReducer,
  staffStrategy: staffStrategyReducer,
  appraisal: appraisalReducer,
  report: reportReducer,
  userSubTab: userSubTabReducer,
});

// Create persist config
const persistConfig = {
  key: 'root',
  storage,
  blacklist: ['genericQuerySlice'],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

// Configure store - FIXED with type assertion
export const store = configureStore({
  reducer: persistedReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }) as any, // Type assertion to fix the error
});

// Create the persistor
export const persistor = persistStore(store);

// Types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
