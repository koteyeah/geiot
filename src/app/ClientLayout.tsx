'use client';

import { usePathname } from 'next/navigation';
import Footer from '../common/Footer/Footer';
import styled from 'styled-components';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // 特定のページでのみフッターを表示
  const showFooter = pathname === '/home' || pathname === '/post' || pathname === '/userdata' || pathname === '/ainori' || pathname === '/postList' || pathname === '/userdata1'|| pathname === '/add';

  return (
    <Container>
      <Content>{children}</Content>
      {showFooter && <Footer />}
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
`;

const Content = styled.div`
  flex: 1;
  padding-bottom: 60px; /* Footerの高さ分の余白を確保 */
`;
