import axios from "axios";

export const login = async (username, password) => {
  const response = await axios.post("/api/auth/login", {
    username,
    password,
  });
  return response.data;
};

export const register = async (username, password) => {
  return axios.post("/api/auth/register", {
    username,
    password,
  });
};

export const logout = () => {
  localStorage.removeItem("token");
};
