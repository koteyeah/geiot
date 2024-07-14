'use client';

import React from 'react';
import styled from 'styled-components';
import { FaVideo, FaTruck, FaUserFriends, FaSearch, FaCog } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';

const Footer: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  return (
    <FooterContainer>
      <FooterItem active={pathname === '/post'} onClick={() => handleNavigation('/post')}>
        <FaTruck />
        <FooterLabel active={pathname === '/post'}>投稿</FooterLabel>
      </FooterItem>
      <FooterItem active={pathname === '/postList'} onClick={() => handleNavigation('/postList')}>
        <FaSearch />
        <FooterLabel active={pathname === '/postList'}>探す</FooterLabel>
      </FooterItem>
      <FooterItem active={pathname === '/ainori'} onClick={() => handleNavigation('/ainori')}>
        <FaUserFriends />
        <FooterLabel active={pathname === '/ainori'}>マッチング</FooterLabel>
      </FooterItem>
      <FooterItem active={pathname === '/add'} onClick={() => handleNavigation('/add')}>
        <FaVideo />
        <FooterLabel active={pathname === '/add'}>広告</FooterLabel>
      </FooterItem>
      <FooterItem active={pathname === '/userdata'} onClick={() => handleNavigation('/userdata')}>
        <FaCog />
        <FooterLabel active={pathname === '/userdata'}>設定</FooterLabel>
      </FooterItem>
    </FooterContainer>
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
`;

const FooterLabel = styled.span<FooterItemProps>`
  font-size: 12px;
  margin-top: 4px;
  color: ${({ active }) => (active ? '#38B2AC' : '#000')};
`;
