'use client'
import React from 'react';
import styled from 'styled-components';
import { FaVideo, FaTruck, FaUserFriends, FaSearch, FaCog } from 'react-icons/fa';

const Footer: React.FC = () => {
  return (
    <FooterContainer>
      <FooterItem>
        <FaVideo />
        <FooterLabel>広告</FooterLabel>
      </FooterItem>
      <FooterItem>
        <FaTruck />
        <FooterLabel>投稿</FooterLabel>
      </FooterItem>
      <FooterItem>
        <FaUserFriends style={{ color: '#38B2AC' }} />
        <FooterLabel>マッチング</FooterLabel>
      </FooterItem>
      <FooterItem>
        <FaSearch />
        <FooterLabel>探す</FooterLabel>
      </FooterItem>
      <FooterItem>
        <FaCog />
        <FooterLabel>設定</FooterLabel>
      </FooterItem>
    </FooterContainer>
  );
};

export default Footer;

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

const FooterItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 24px;
`;

const FooterLabel = styled.span`
  font-size: 12px;
  margin-top: 4px;
  color: #000;
`;
