import "./globals.css";

export const metadata = {
  title: "SoleStreet",
  description: "Your go-to sneakers shop",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}