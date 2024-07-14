'use client';
import React, { useEffect, useState } from 'react';
import { Box, Text, VStack, HStack, Spacer, Image } from '@chakra-ui/react';
import { Timestamp, DocumentData } from 'firebase/firestore';
import { format } from 'date-fns';

type ProfileCardProps = {
  ainoriData: DocumentData;
  ainoriKey: string;
  otherUserInfo: DocumentData;
  otherUserDriverInfo?: DocumentData;
};

const formatDate = (timestamp: any) => {
  let date: Date;
  if (timestamp.toDate) {
    date = timestamp.toDate();
  } else if (timestamp.seconds) {
    date = new Date(timestamp.seconds * 1000);
  } else {
    date = new Date(timestamp);
  }
  return format(date, 'yyyy年MM月dd日 HH:mm発');
};

const ProfileCard: React.FC<ProfileCardProps> = ({ ainoriData, ainoriKey, otherUserInfo, otherUserDriverInfo }) => {
  const [windowWidth, setWindowWidth] = useState<number>(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <Box p="5" shadow="md" borderWidth="1px" width="100%" maxWidth="600px" margin="auto" bg="gray.100">
      <VStack height="100%">
        <Box width="100%" borderBottom="1px solid #ccc" pb="2" mb="2">
          <HStack>
            <Text sx={{ textAlign: 'center', fontSize: windowWidth <= 600 ? 'xs' : '2xl', fontWeight: 'bold' }}>
              {ainoriData.goal_spot}まで
            </Text>
            <Spacer />
            <Text sx={{ textAlign: 'center', fontSize: windowWidth <= 600 ? 'xs' : 'xl', fontWeight: 'bold' }}>
              {formatDate(ainoriData.start_time)}
            </Text>
          </HStack>
        </Box>
        <Box flex="3" width="100%">
          <HStack height="100%">
            <Box flex="1" textAlign="center" display="flex" flexDirection="column" alignItems="center" justifyContent="center">
              <Image src="/icons/profile_icon.svg" alt="Profile Icon" width={100} height={100} />
              <Spacer />
              <Text sx={{ textAlign: 'center', fontSize: windowWidth <= 600 ? 'xs' : 'xl', fontWeight: 'bold', wordBreak: 'break-all' }}>
                {otherUserInfo.username}
              </Text>
            </Box>
            <Box flex="3" width="100%">
              <VStack height="100%">
                <Box flex="3" width="100%">
                  <HStack height="100%" alignItems="flex-start">
                    <Box flex="1">
                      <Text sx={{ fontSize: windowWidth <= 600 ? 'xs' : 'xl', fontWeight: 'bold' }}>
                        性別：
                        {otherUserInfo.gender === 'male' && '男性'}
                        {otherUserInfo.gender === 'female' && '女性'}
                        {otherUserInfo.gender === 'other' && 'その他'}
                      </Text>
                      <Text sx={{ fontSize: windowWidth <= 600 ? 'xs' : 'xl', fontWeight: 'bold' }}>学年：<strong>{otherUserInfo.year}</strong></Text>
                      <Text sx={{ fontSize: windowWidth <= 600 ? 'xs' : 'xl', fontWeight: 'bold' }}>
                        研究室：
                        <Box as="span" fontSize={windowWidth <= 600 ? '10px' : 'sm'}>
                          {otherUserInfo.laboratory}
                        </Box>
                      </Text>
                    </Box>
                    <Box flex="1">
                      {otherUserDriverInfo && (
                        <>
                          <Text sx={{ fontSize: windowWidth <= 600 ? 'xs' : 'xl', fontWeight: 'bold' }}>
                            車種: {otherUserDriverInfo.carType}
                          </Text>
                          <Text sx={{ fontSize: windowWidth <= 600 ? 'xs' : 'xl', fontWeight: 'bold' }}>
                            集合場所: {ainoriData.start_spot}
                          </Text>
                          <Text sx={{ fontSize: windowWidth <= 600 ? 'xs' : 'xl', fontWeight: 'bold' }}>
                            備考: {ainoriData.remarks}
                          </Text>
                        </>
                      )}
                    </Box>
                  </HStack>
                </Box>
                <Box flex="1" width="100%">
                  <HStack>
                    {windowWidth > 600 && <Spacer />}
                    <Image
                      src={otherUserInfo.smoking ? "/icons/yes_smoke.png" : "/icons/no_smoke.png"}
                      alt="Smoking Icon"
                      width={windowWidth <= 600 ? 30 : 50}
                      height={windowWidth <= 600 ? 30 : 50}
                    />
                    {windowWidth > 600 && <Spacer />}
                    {otherUserDriverInfo && (
                      <>
                        <Image
                          src={otherUserDriverInfo.foodAndDrink ? "/icons/yes_food.png" : "/icons/no_food.png"}
                          alt="Food Icon"
                          width={windowWidth <= 600 ? 30 : 50}
                          height={windowWidth <= 600 ? 30 : 50}
                        />
                        {windowWidth > 600 && <Spacer />}
                        <Image
                          src={otherUserDriverInfo.hasPets ? "/icons/yes_pet.png" : "/icons/no_pet.png"}
                          alt="Pet Icon"
                          width={windowWidth <= 600 ? 30 : 50}
                          height={windowWidth <= 600 ? 30 : 50}
                        />
                        {windowWidth > 600 && <Spacer />}
                      </>
                    )}
                    <Image
                      src={otherUserInfo.japaneseProficiency ? "/icons/yes_japanese.png" : "/icons/no_japanese.png"}
                      alt="Japanese Icon"
                      width={windowWidth <= 600 ? 30 : 50}
                      height={windowWidth <= 600 ? 30 : 50}
                    />
                    {windowWidth > 600 && <Spacer />}
                    {windowWidth > 600 && <Spacer />}
                  </HStack>
                </Box>
              </VStack>
            </Box>
          </HStack>
        </Box>
      </VStack>
    </Box>
  );
};

export default ProfileCard;
