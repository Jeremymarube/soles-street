// src/components/Footer.jsx
'use client';
import Link from "next/link";

// Custom SVG Icons
const InstagramIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" strokeWidth="2" stroke="currentColor"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" strokeWidth="2" stroke="currentColor"/>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" strokeWidth="2" stroke="currentColor"/>
  </svg>
);

const TwitterIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" strokeWidth="2" stroke="currentColor"/>
  </svg>
);

const FacebookIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" strokeWidth="2" stroke="currentColor"/>
  </svg>
);

const Footer = () => {
  return (
    <footer 
      className="border-t py-8 mt-auto"
      style={{ 
        backgroundColor: '#0d0d0d',
        color: '#f2f2f2',
        borderColor: '#2d2d2d'
      }}
    >
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-display text-lg font-bold mb-4">SOLESTREET</h3>
            <p className="text-sm opacity-70">Premium sneakers for the modern streetwear enthusiast.</p>
          </div>
          
          <div>
            <h4 className="font-display font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/shop" className="hover:text-accent transition">Shop</Link></li>
              <li><Link href="/contact" className="hover:text-accent transition">Contact</Link></li>
              <li><Link href="/about" className="hover:text-accent transition">About Us</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-display font-semibold mb-4">Contact</h4>
            <ul className="space-y-2 text-sm">
              <li>Email: info@solestreet.com</li>
              <li>Phone: +254 700 000 000</li>
              <li>Nairobi, Kenya</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-display font-semibold mb-4">Follow Us</h4>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-accent transition">
                <InstagramIcon />
              </a>
              
            </div>
          </div>
        </div>
        
        <div className="border-t mt-8 pt-8 text-center text-sm opacity-60" style={{ borderColor: '#2d2d2d' }}>
          <p>&copy; 2024 SOLESTREET. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;