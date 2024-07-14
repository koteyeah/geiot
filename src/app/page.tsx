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
          <Button onClick={() => router.push('/signup')}>Sign Up</Button>
          <SignInButton onClick={() => router.push('/signin')}>Sign In</SignInButton>
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
  padding-top: 20px;
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

const Button = styled.button`
  background-color: #38B2AC;
  color: #fff;
  padding: 15px 30px;
  border: none;
  border-radius: 5px;
  font-size: 18px;
  cursor: pointer;
  margin-bottom: 10px;
  width: 80%;
  text-align: center;
  max-width: 300px;
`;

const SignInButton = styled.button`
  border: 1px solid #38B2AC;
  color: #38B2AC;
  padding: 15px 30px;
  border-radius: 5px;
  font-size: 18px;
  cursor: pointer;
  width: 80%;
  text-align: center;
  max-width: 300px;
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
  width: 200px;
  height: 200px;
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
