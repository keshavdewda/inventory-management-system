const TOKEN_KEY = "ims-token";
const USER_KEY = "ims-user";

export const getTokenKey = () => TOKEN_KEY;
export const getUserKey = () => USER_KEY;
export const getToken = () => localStorage.getItem(TOKEN_KEY);

export const isAuthenticated = () => {
  return getToken();
};

export const getUser = () => {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export const hasRole = (...roles) => {
  const user = getUser();
  return !!user?.role && roles.includes(user.role);
};

export const logout = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};
