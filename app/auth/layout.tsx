import AuthGuard from "@/providers/authGuard";
import Footer from "@/components/Footer";
import StoreProviders from "@/providers/storeProvider";
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
        <StoreProviders>
          <AuthGuard>
            {children}
            <Footer />
          </AuthGuard>
        </StoreProviders>
      </body>
    </html>
  );
}
