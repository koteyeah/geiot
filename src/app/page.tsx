'use client';  // クライアントコンポーネントとして指定

import React from 'react';
import styled from 'styled-components';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

const Home: React.FC = () => {
  const router = useRouter();

  return (
    <Container>
      <Header>
        <ImageWrapper>
          <Image src="/Group.svg" alt="icon" fill objectFit="contain" />
        </ImageWrapper>
        <Title>ainori</Title>
      </Header>
      <QuestionMarks>???????</QuestionMarks>
      <Button onClick={() => router.push('/signup')}>Sign Up</Button>
      <SignInButton onClick={() => router.push('/signin')}>Sign In</SignInButton>
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
`;

const QuestionMarks = styled.p`
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 30px;
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
`;

const SignInButton = styled.button`
  border: 1px solid #38B2AC;
  color:#38B2AC;
  padding: 15px 30px;
  border-radius: 5px;
  font-size: 18px;
  cursor: pointer;
  width: 80%;
  text-align: center;
`;

const ImageWrapper = styled.div`
  position: relative;
  width: 100px;
  height: 100px;
`;
