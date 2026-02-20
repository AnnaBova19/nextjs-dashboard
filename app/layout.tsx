import { inter } from '@/app/ui/fonts';
import '@/app/ui/global.css';
import '@/app/ui/variables.module.scss';
import { Metadata } from 'next';
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from '@/components/ui/tooltip';

export const metadata: Metadata = {
  title: {
    template: '%s | Acme Dashboard',
    default: 'Acme Dashboard',
  },
  description: 'The official Next.js Course Dashboard, built with App Router.',
  metadataBase: new URL('https://next-learn-dashboard.vercel.sh'),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        <TooltipProvider>
          <main>{children}</main>
          <Toaster position="top-center" />
        </TooltipProvider>
      </body>
    </html>
  );
}
