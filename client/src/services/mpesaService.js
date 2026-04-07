import { apiFetch } from "@/services/api";

export const initiateMpesaPayment = ({ phone, amount, orderId }) =>
  apiFetch("/payments/mpesa", {
    method: "POST",
    body: JSON.stringify({ phone, amount, orderId }),
  });
