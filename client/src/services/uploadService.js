import { apiFetch } from "@/services/api";

export const uploadProductImage = async (file) => {
  const formData = new FormData();
  formData.append("image", file);
  return apiFetch("/uploads/", {
    method: "POST",
    body: formData,
    admin: true,
  });
};
