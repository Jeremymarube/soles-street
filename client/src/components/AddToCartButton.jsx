"use client";

import { ShoppingCart } from "lucide-react";
import { toast } from "sonner";

import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";

const DEFAULT_CLASSNAME = "h-11 bg-secondary text-secondary-foreground hover:bg-secondary/80";

export default function AddToCartButton({
  product,
  selectedSize = null,
  requireSize = false,
  className = DEFAULT_CLASSNAME,
  children = "Add to Cart",
}) {
  const { addToCart } = useCart();

  const handleClick = () => {
    if (!product || !product.id || !product.name) {
      toast.error("This product is missing required cart details.");
      return;
    }

    if (requireSize && !selectedSize) {
      toast.error("Please select a size first.");
      return;
    }

    addToCart({
      ...product,
      selectedSize: selectedSize || null,
      quantity: undefined,
      price: Number(product.price) || 0,
      sizes: Array.isArray(product.sizes) ? product.sizes : [],
    });

    toast.success(
      selectedSize ? `${product.name} size EU ${selectedSize} added to cart.` : `${product.name} added to cart.`
    );
  };

  return (
    <Button type="button" onClick={handleClick} className={className} disabled={requireSize && !selectedSize}>
      <ShoppingCart className="mr-2 h-4 w-4" />
      {children}
    </Button>
  );
}
