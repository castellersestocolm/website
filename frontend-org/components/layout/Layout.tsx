"use server";

import Footer from "./Footer";
import Header from "./Header";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`min-h-screen bg-background`}>
      <Header />
      <main>{children}</main>
      <Footer />
    </div>
  );
}
