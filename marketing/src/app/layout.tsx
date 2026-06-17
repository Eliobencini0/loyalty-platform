// Root layout is a passthrough; the real <html>/<body>/metadata lives in src/app/[locale]/layout.tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
