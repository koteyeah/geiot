import ClientLayout from './ClientLayout';
import DesignProvider from "../common/providers/design_provider";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ainori",
  description: "GoGo!!",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body style={{ margin: 0, padding: 0, boxSizing: 'border-box', display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <DesignProvider>
          <ClientLayout>{children}</ClientLayout>
        </DesignProvider>
      </body>
    </html>
  );
}
