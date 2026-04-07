import { WHATSAPP_NUMBER } from "@/data/products";

const normalizePhone = (phone) => (phone ?? "").replace(/[^\d]/g, "");

export const buildWhatsAppLink = (message, phone = WHATSAPP_NUMBER) => {
  const normalizedPhone = normalizePhone(phone);
  const text = encodeURIComponent(message.trim());

  if (!normalizedPhone) {
    return "#";
  }

  return `https://wa.me/${normalizedPhone}?text=${text}`;
};
