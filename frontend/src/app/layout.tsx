import type { Metadata } from 'next';
import { IBM_Plex_Mono, Space_Grotesk } from 'next/font/google';
import './globals.css';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['300', '400'], // Thin weights only
  variable: '--font-space-grotesk',
  display: 'swap',
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['300', '400'], // Thin weights only
  variable: '--font-ibm-plex-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'AlgoLens — Algorithm Visualization Workspace',
  description:
    'Interactive workspace for step-by-step algorithm visualization with AI-powered explanations. Visualize sorting, searching, and graph algorithms in real time.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${spaceGrotesk.variable} ${ibmPlexMono.variable} h-screen w-screen overflow-hidden bg-background font-[family-name:var(--font-space-grotesk)] font-light text-foreground antialiased`}
      >
        {children}
      </body>
    </html>
  );
}