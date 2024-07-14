'use client';

import React from 'react';
import styled from 'styled-components';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';
import { ThemeProvider } from 'styled-components';

const Footer: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  return (
    <ThemeProvider theme={theme}>
      <FooterContainer>
        <FooterItem active={pathname === '/post'} onClick={() => handleNavigation('/post')}>
          <IconWrapper size="large">
            <Image src="/icons/ainori.svg" alt="投稿" width={50} height={50} />
          </IconWrapper>
          <FooterLabel active={pathname === '/post'}>投稿</FooterLabel>
        </FooterItem>
        <FooterItem active={pathname === '/postList'} onClick={() => handleNavigation('/postList')}>
          <IconWrapper>
            <Image src="/icons/postlist.svg" alt="掲示板" width={24} height={24} />
          </IconWrapper>
          <FooterLabel active={pathname === '/postList'}>掲示板</FooterLabel>
        </FooterItem>
        <FooterItem active={pathname === '/ainori'} onClick={() => handleNavigation('/ainori')}>
          <IconWrapper>
            <Image src="/icons/seiritsu.svg" alt="マッチング" width={24} height={24} />
          </IconWrapper>
          <FooterLabel active={pathname === '/ainori'}>マッチング</FooterLabel>
        </FooterItem>
        <FooterItem active={pathname === '/add'} onClick={() => handleNavigation('/add')}>
          <IconWrapper>
            <Image src="/icons/add.svg" alt="広告" width={24} height={24} />
          </IconWrapper>
          <FooterLabel active={pathname === '/add'}>広告</FooterLabel>
        </FooterItem>
        <FooterItem active={pathname === '/userdata'} onClick={() => handleNavigation('/userdata')}>
          <IconWrapper>
            <Image src="/icons/setting.svg" alt="設定" width={24} height={24} />
          </IconWrapper>
          <FooterLabel active={pathname === '/userdata'}>設定</FooterLabel>
        </FooterItem>
      </FooterContainer>
    </ThemeProvider>
  );
};

export default Footer;

interface FooterItemProps {
  active: boolean;
}

const FooterContainer = styled.div`
  display: flex;
  justify-content: space-around;
  align-items: center;
  height: 60px;
  background-color: #fff;
  box-shadow: 0 -2px 5px rgba(0, 0, 0, 0.1);
  position: fixed;
  bottom: 0;
  width: 100%;
`;

const FooterItem = styled.div<FooterItemProps>`
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 24px;
  color: ${({ active }) => (active ? '#38B2AC' : '#000')};
  cursor: pointer;
`;

const FooterLabel = styled.span<FooterItemProps>`
  font-size: 12px;
  margin-top: 4px;
  color: ${({ active }) => (active ? '#38B2AC' : '#000')};
`;

const IconWrapper = styled.div<{ size?: string }>`
  display: flex;
  justify-content: center;
  align-items: center;
  width: ${({ size }) => (size === 'large' ? '50px' : '24px')};
  height: ${({ size }) => (size === 'large' ? '27px' : '24px')};
  ${({ theme, size }) => size === 'large' && `color: ${theme.activeColor};`}
`;

const theme = {
  activeColor: '#38B2AC',
};

// Use the theme in your styled-components
<ThemeProvider theme={theme}>
  <Footer />
</ThemeProvider>
