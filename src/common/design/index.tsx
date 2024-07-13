'use client'
export * from '@chakra-ui/react'

import React from 'react';
import styled from 'styled-components';
import Image from 'next/image';
import { useRouter } from 'next/router';

const Home: React.FC = () => {
  const router = useRouter();

  return (
    <Container>
      <Header>
        <Image src="/path_to_your_icon.png" alt="icon" width={100} height={100} />
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
  background-color: #f9a825;
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
  border: 1px solid #f9a825;
  color: #f9a825;
  padding: 15px 30px;
  border-radius: 5px;
  font-size: 18px;
  cursor: pointer;
  width: 80%;
  text-align: center;
`;
