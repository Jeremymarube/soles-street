export const isAdminAuthenticated = async () => {
  if (typeof window === "undefined") return false;

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000/api"}/admin/session`, {
      credentials: "include",
      cache: "no-store",
    });

    if (!response.ok) return false;
    const data = await response.json();
    return Boolean(data.authenticated);
  } catch {
    return false;
  }
};
