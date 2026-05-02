import React from 'react';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-background via-surface to-background relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/5 rounded-full blur-[120px]" />
      
      <main className="w-full max-w-md px-4 z-10">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-primary">AlgoLens</h1>
          <p className="text-muted-foreground mt-2">Visualize and master algorithms in real-time</p>
        </div>
        {children}
      </main>
      
      <footer className="mt-8 text-center text-sm text-muted-foreground z-10">
        &copy; {new Date().getFullYear()} ProGyan AlgoLens. All rights reserved.
      </footer>
    </div>
  );
}
