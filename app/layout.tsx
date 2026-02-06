import { inter } from '@/app/ui/fonts';
import '@/app/ui/global.css';
import '@/app/ui/variables.module.scss';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>{children}</body>
    </html>
  );
}
