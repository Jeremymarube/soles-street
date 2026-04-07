const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000/api";

const getErrorMessage = async (response) => {
  try {
    const data = await response.json();
    return data.message ?? data.error ?? "Request failed.";
  } catch {
    return "Request failed.";
  }
};

export const apiFetch = async (path, options = {}) => {
  const isFormData = typeof FormData !== "undefined" && options.body instanceof FormData;
  const { admin: _admin, headers: optionHeaders, ...restOptions } = options;
  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: "include",
    headers: isFormData
      ? { ...(optionHeaders ?? {}) }
      : {
          "Content-Type": "application/json",
          ...(optionHeaders ?? {}),
        },
    cache: "no-store",
    ...restOptions,
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  return response.status === 204 ? null : response.json();
};

export { API_BASE_URL };
