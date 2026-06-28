import type { Metadata } from "next";
import "./globals.css";
import { AppProviders } from "@/components/providers/app-providers";
import { Header } from "@/components/layout/header";
import { LoginDialog } from "@/components/auth/login-dialog";
import { CommandSearch } from "@/components/search/command-search";

export const metadata: Metadata = {
  title: "English App",
  description: "AI English learning platform for vocabulary, courses, and chat.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body>
        <AppProviders>
          <Header />
          <main>{children}</main>
          <CommandSearch />
          <LoginDialog />
        </AppProviders>
      </body>
    </html>
  );
}
