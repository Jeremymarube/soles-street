"use client";
import { useCart } from "../../context/CartContext";

export default function CheckoutPage() {
  const { cart } = useCart();
  const total = cart.reduce((acc, item) => acc + item.price, 0);

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Checkout</h1>
      {cart.length ? (
        <>
          <ul>
            {cart.map(item => (
              <li key={item.id}>{item.name} - Ksh {item.price}</li>
            ))}
          </ul>
          <h2>Total: Ksh {total}</h2>
          <button>Pay with M-Pesa</button>
        </>
      ) : (
        <p>Your cart is empty.</p>
      )}
    </div>
  );
}