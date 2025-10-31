import './globals.css';

export const metadata = {
  title: 'Carbon Credits Classroom',
  description: 'Carbon credit registry and blockchain demo',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

