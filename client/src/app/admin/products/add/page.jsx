"use client";
import { useState } from "react";

export default function AddProduct() {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    // POST to backend
    alert(`Added: ${name} - Ksh ${price}`);
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Add Product</h1>
      <form onSubmit={handleSubmit}>
        <input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required />
        <input placeholder="Price" type="number" value={price} onChange={(e) => setPrice(e.target.value)} required />
        <button type="submit">Add</button>
      </form>
    </div>
  );
}