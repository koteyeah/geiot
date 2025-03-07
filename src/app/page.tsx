'use client';  // クライアントコンポーネントとして指定

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

const Home: React.FC = () => {
  const router = useRouter();
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    const img = new window.Image();
    img.src = '/Group.svg';
    img.onload = () => setImageLoaded(true);
  }, []);

  return (
    <Container>
      {imageLoaded ? (
        <>
          <Header>
            <ImageWrapper>
              <StyledImage src="/Group.svg" alt="icon" width={200} height={200} priority />
            </ImageWrapper>
            <Title>ainori</Title>
          </Header>
          <ButtonContainer>
            <Button onClick={() => router.push('/signup')}>Sign Up</Button>
            <Button onClick={() => router.push('/signin')}>Sign In</Button>
          </ButtonContainer>
        </>
      ) : (
        <Placeholder>Loading...</Placeholder>
      )}
    </Container>
  );
};

export default Home;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  padding: 20px;
  background-color: #fff;
`;

const Header = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 20px;
`;

const Title = styled.h1`
  font-size: 24px;
  font-weight: bold;
  color: #000;
  margin: 0;
`;

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  width: 100%;
  max-width: 300px;
`;

const Button = styled.button`
  background-color: #38B2AC;
  color: #fff;
  padding: 15px 30px;
  border: none;
  border-radius: 5px;
  font-size: 18px;
  cursor: pointer;
  width: 100%;
  text-align: center;
  box-sizing: border-box;

  &:last-of-type {
    background-color: transparent;
    border: 1px solid #38B2AC;
    color: #38B2AC;
  }
`;

const ImageWrapper = styled.div`
  width: 200px;
  height: 200px;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 20px;
`;

const StyledImage = styled(Image)`
  object-fit: contain;
  width: 100%;
  height: 100%;
`;

const Placeholder = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f0f0f0;
  color: #999;
  font-size: 24px;
  height: 100vh;
  width: 100vw;
`;
