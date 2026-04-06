import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { MessageCircle, Phone } from "lucide-react";
import { WHATSAPP_NUMBER } from "@/data/products";

// Instagram Icon Component
const InstagramIcon = () => (
  <svg 
    className="h-6 w-6 text-accent" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2"
    strokeLinecap="round" 
    strokeLinejoin="round"
    viewBox="0 0 24 24"
  >
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

const Contact = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container pt-24 pb-10">
        <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-2">Contact Us</h1>
        <p className="text-muted-foreground mb-12">Get in touch — we'd love to hear from you</p>

        <div className="max-w-lg mx-auto space-y-6">
          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 p-6 bg-card border border-border rounded-lg hover:border-accent transition-colors group"
          >
            <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
              <MessageCircle className="h-6 w-6 text-accent" />
            </div>
            <div>
              <p className="font-display tracking-wide text-foreground">WhatsApp</p>
              <p className="text-muted-foreground text-sm">+254 700 000 000</p>
            </div>
          </a>

          <a
            href="tel:+254700000000"
            className="flex items-center gap-4 p-6 bg-card border border-border rounded-lg hover:border-accent transition-colors group"
          >
            <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
              <Phone className="h-6 w-6 text-accent" />
            </div>
            <div>
              <p className="font-display tracking-wide text-foreground">Phone</p>
              <p className="text-muted-foreground text-sm">+254 700 000 000</p>
            </div>
          </a>

          <a
            href="https://instagram.com/solestreet"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 p-6 bg-card border border-border rounded-lg hover:border-accent transition-colors group"
          >
            <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
              <InstagramIcon /> {/* Using custom SVG component */}
            </div>
            <div>
              <p className="font-display tracking-wide text-foreground">Instagram</p>
              <p className="text-muted-foreground text-sm">@solestreet</p>
            </div>
          </a>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Contact;