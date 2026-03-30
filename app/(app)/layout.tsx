import "./globals.css";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body 
        className="min-h-screen flex flex-col justify-between"
        cz-shortcut-listen="true"
      >
        {children}
      </body>
    </html>
  );
}
