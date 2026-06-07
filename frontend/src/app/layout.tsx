import './globals.css';

export const metadata = {
  title: 'Synthesise Engine',
  description: 'Minimalistic dark theme knowledge feed',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <main>
          {children}
        </main>
      </body>
    </html>
  );
}
