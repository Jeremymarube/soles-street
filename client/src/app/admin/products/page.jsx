import Link from "next/link";

export default function ProductList() {
  // Placeholder, you can fetch products from backend here
  const products = [
    { id: 1, name: "Nike Air Force 1", price: 12000 },
    { id: 2, name: "Adidas Superstar", price: 10000 }
  ];

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Products</h1>
      <Link href="/admin/products/add">Add New Product</Link>
      <ul>
        {products.map(p => (
          <li key={p.id}>
            {p.name} - Ksh {p.price} - <Link href={`/admin/products/edit/${p.id}`}>Edit</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}