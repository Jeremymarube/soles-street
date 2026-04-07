import { apiFetch } from "@/services/api";

export const adminLogin = ({ username, password }) =>
  apiFetch("/admin/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });

export const adminLogout = () =>
  apiFetch("/admin/logout", {
    method: "POST",
  });

export const getAdminSession = () => apiFetch("/admin/session");
