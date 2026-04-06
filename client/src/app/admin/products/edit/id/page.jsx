"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function EditProduct({ params }) {
  const router = useRouter();
  const { id } = params;

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    // PATCH to backend
    alert(`Edited product ${id}: ${name} - Ksh ${price}`);
    router.push("/admin/products");
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Edit Product #{id}</h1>
      <form onSubmit={handleSubmit}>
        <input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required />
        <input placeholder="Price" type="number" value={price} onChange={(e) => setPrice(e.target.value)} required />
        <button type="submit">Save</button>
      </form>
    </div>
  );
}