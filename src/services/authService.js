import api from "../api/axios";
import { setAuthData, clearAuthData } from "../utils/storage";

export const loginUser = async (email, password) => {
  const response = await api.post("/auth/login/", {
    email,
    password,
  });

  setAuthData(response.data);

  return response.data;
};

export const logoutUser = async () => {
  const response = await api.post("/auth/logout/");
  // Do NOT call clearAuthData() here, because we still need the token 
  // to unsubscribe from Web Push right after this call returns!
  // AuthContext.jsx will call clearAuthData() in its finally block.
  return response.data;
};
