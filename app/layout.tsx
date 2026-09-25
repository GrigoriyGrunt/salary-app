import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ShiftEditorProvider } from "@/components/common/ShiftEditorProvider/ShiftEditorProvider";
import AuthGuard from "@/components/common/AuthGuard/AuthGuard";
import AppHydration from "@/components/common/AppHydration/AppHydration";
import GlobalLoading from "@/components/GlobalLoading/GlobalLoading";
const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Калькулятор ЗП",
  description: "Твой личный калькулятор зарплаты",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className={inter.variable}>
      <body>
  <AppHydration>
    <AuthGuard>
      <ShiftEditorProvider>
        {children}
      </ShiftEditorProvider>
    </AuthGuard>
  </AppHydration>

  <GlobalLoading />
</body>
    </html>
  );
}
