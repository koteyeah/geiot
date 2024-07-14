'use client';

import React from 'react';
import YouTube from 'react-youtube';
import styled from 'styled-components';

const AddPage: React.FC = () => {
  const videoId = 'F6Q_l1zk4a0'; // YouTubeの動画IDをここに設定

  return (
    <Container>
      <Heading>広告ページ</Heading>
      <VideoContainer>
        <YouTube videoId={videoId} opts={{ width: '100%', height: '450px' }} />
      </VideoContainer>
    </Container>
  );
};

export default AddPage;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
`;

const Heading = styled.h1`
  margin-bottom: 20px;
`;

const VideoContainer = styled.div`
  width: 100%;
  max-width: 800px;
  aspect-ratio: 16 / 9;
  iframe {
    width: 100%;
    height: 450px; /* 高さを450pxに設定 */
  }
`;