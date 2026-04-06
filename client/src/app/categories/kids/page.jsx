import ProductCard from "../../../components/ProductCard";
import { useEffect, useState } from "react";
import axios from "axios";

export default function MenPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("http://127.0.0.1:5000/api/products?category=men")
      .then(res => setProducts(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p style={{ textAlign: "center" }}>Loading...</p>;

  return (
    <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "1rem", padding: "2rem" }}>
      {products.map(product => <ProductCard key={product.id} product={product} />)}
    </div>
  );
}