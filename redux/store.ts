import { configureStore } from '@reduxjs/toolkit'
import userReducer from './slice/userReducer'

export const store = configureStore({
  reducer: {
    user: userReducer
  }
})
