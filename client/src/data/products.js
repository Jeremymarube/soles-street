const rawWhatsAppNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "";

export const WHATSAPP_NUMBER = rawWhatsAppNumber.replace(/[^\d]/g, "");
export const WHATSAPP_DISPLAY_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_DISPLAY ?? rawWhatsAppNumber;
export const INSTAGRAM_URL = process.env.NEXT_PUBLIC_INSTAGRAM_URL ?? "";
export const TIKTOK_URL = process.env.NEXT_PUBLIC_TIKTOK_URL ?? "";

export const productCategories = ["All", "Men", "Women", "Kids", "Both"];
export const productBrands = ["All", "Nike", "Adidas", "Puma", "New Balance"];
