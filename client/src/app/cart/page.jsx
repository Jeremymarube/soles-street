"use client";
import { useCart } from "../../context/CartContext";

export default function CartPage() {
  const { cart, removeFromCart, clearCart } = useCart();

  if (!cart.length) return <p style={{ textAlign: "center", padding: "2rem" }}>Your cart is empty.</p>;

  const total = cart.reduce((acc, item) => acc + item.price, 0);

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Your Cart</h1>
      <ul>
        {cart.map(item => (
          <li key={item.id}>
            {item.name} - Ksh {item.price}{" "}
            <button onClick={() => removeFromCart(item.id)}>Remove</button>
          </li>
        ))}
      </ul>
      <h2>Total: Ksh {total}</h2>
      <button onClick={clearCart}>Clear Cart</button>
    </div>
  );
}