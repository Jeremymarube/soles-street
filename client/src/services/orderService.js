import { buildWhatsAppLink } from "@/lib/whatsappLink";
import { formatCurrency } from "@/lib/formatCurrency";
import { apiFetch } from "@/services/api";

const createLine = (item) =>
  `${item.name}${item.selectedSize ? ` (EU ${item.selectedSize})` : ""} x${item.quantity}`;

export const createProductInquiryMessage = (product) =>
  `Hi, I want to order ${product.name}${product.selectedSize ? ` (EU ${product.selectedSize})` : ""}. Total: ${formatCurrency(product.price)}.`;

export const createCartOrderMessage = ({ cart }) => {
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (cart.length === 1 && (cart[0]?.quantity ?? 0) === 1) {
    return `Hi, I want to order ${cart[0].name}${cart[0].selectedSize ? ` (EU ${cart[0].selectedSize})` : ""}. Total: ${formatCurrency(total)}.`;
  }

  const lines = cart.map(createLine).join("\n");

  return [
    "Hi, I want to order:",
    lines,
    `Total: ${formatCurrency(total)}.`,
  ].join("\n");
};

export const createProductOrderLink = (product) => buildWhatsAppLink(createProductInquiryMessage(product));
export const createCartOrderLink = (payload) => buildWhatsAppLink(createCartOrderMessage(payload));

export const createOrder = async (payload) => {
  const whatsappMessage = createCartOrderMessage(payload);
  return apiFetch("/orders/", {
    method: "POST",
    body: JSON.stringify({ ...payload, whatsappMessage }),
  });
};
