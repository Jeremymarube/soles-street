// src/components/Navbar.jsx
'use client';
import Link from "next/link";
import { ShoppingBag, Menu, X } from "lucide-react";
import { useState } from "react";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav 
      className="fixed top-0 w-full z-50 border-b"
      style={{ 
        backgroundColor: '#0d0d0d',  // Dark background
        color: '#f2f2f2',            // Light text
        borderColor: '#2d2d2d'       // Dark border
      }}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="font-display text-xl font-bold tracking-wider">
            SOLESTREET
          </Link>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-8">
            <Link href="/" className="hover:text-accent transition">Home</Link>
            <Link href="/shop" className="hover:text-accent transition">Shop</Link>
            <Link href="/contact" className="hover:text-accent transition">Contact</Link>
          </div>
          
          <Link href="/cart" className="relative">
            <ShoppingBag className="h-5 w-5" />
          </Link>
          
          {/* Mobile menu button */}
          <button className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
        
        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden py-4 border-t" style={{ borderColor: '#2d2d2d' }}>
            <Link href="/" className="block py-2 hover:text-accent">Home</Link>
            <Link href="/shop" className="block py-2 hover:text-accent">Shop</Link>
            <Link href="/contact" className="block py-2 hover:text-accent">Contact</Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;