
import { AuthProvider } from "@/context/AuthContext";
import "./globals.css";
import Navbar from "@/components/Navbar";
import ClientOnly from "@/components/ClientOnly";


export default function RootLayout({ children }) {
    return (
        <html lang="fr" suppressHydrationWarning>
            <body>
                <ClientOnly>
                    <AuthProvider>
                        <Navbar />
                        {children}
                    </AuthProvider>
                </ClientOnly>
            </body>
        </html>
    );
}
