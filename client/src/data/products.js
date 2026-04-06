export const products = [
  {
    id: 1,
    name: "Nike Air Force 1",
    price: 12000,
    image: "/images/nike-air-force-1.jpg",
  },
  {
    id: 2,
    name: "Adidas Superstar",
    price: 10000,
    image: "/images/adidas-superstar.jpg",
  },
  {
    id: 3,
    name: "Puma RS-X",
    price: 11000,
    image: "/images/puma-rs-x.jpg",
  },
  {
    id: 4,
    name: "New Balance 550",
    price: 13000,
    image: "/images/new-balance-550.jpg",
  },
];

export const WHATSAPP_NUMBER = "254700000000"; // Replace with Steve's actual WhatsApp number

export const getWhatsAppLink = (productName) => {
  const message = encodeURIComponent(
    `Hi! I'm interested in ordering the ${productName}. Is it available?`
  );
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;
};