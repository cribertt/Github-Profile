import './globals.css';

export const metadata = {
  title: 'Mi perfil de GitHub',
  description: 'Perfil de GitHub servido desde una API en NestJS',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
