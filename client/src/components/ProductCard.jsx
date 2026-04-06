import { getWhatsAppLink } from "@/data/products";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";

const ProductCard = ({ product }) => {
  return (
    <div className="group bg-card border border-border rounded-lg overflow-hidden transition-all duration-300 hover:border-accent hover:border-glow">
      <div className="aspect-square overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          width={800}
          height={800}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
      </div>
      <div className="p-4 space-y-3">
        <h3 className="font-display text-lg tracking-wide text-foreground">{product.name}</h3>
        <p className="text-accent font-body font-semibold text-xl">
          KSh {product.price.toLocaleString()}
        </p>
        <Button asChild className="w-full bg-accent text-accent-foreground hover:bg-accent/90 font-display tracking-wider">
          <a href={getWhatsAppLink(product.name)} target="_blank" rel="noopener noreferrer">
            <MessageCircle className="mr-2 h-4 w-4" />
            Order Now
          </a>
        </Button>
      </div>
    </div>
  );
};

export default ProductCard;