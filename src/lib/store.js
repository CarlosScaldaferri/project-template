import { configureStore } from "@reduxjs/toolkit";
import userFormReducer from "./features/user/userFormSlice";

export const store = configureStore({
  reducer: {
    userForm: userFormReducer,
  },
});
