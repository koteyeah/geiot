'use client';
import React from 'react';
import { Box, Text, VStack, HStack, Spacer, Button, useToast } from '@chakra-ui/react';
import {Timestamp } from 'firebase/firestore';
import Image from 'next/image';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';

type AinoriData = {
    actual_goal_time: Timestamp | null;
    actual_start_time: Timestamp | null;
    driver: string | null;
    driver_feedback: string | null;
    driver_rate: string | null;
    goal_spot: string;
    passenger: string | null;
    passenger_feedback: string | null;
    passenger_rate: string | null;
    remarks: string;
    start_spot: string;
    start_time: Timestamp | Date | { seconds: number, nanoseconds: number };
    status: string;
};

type UserData = {
    username: string;
    gender: string;
    region: string;
    laboratory: string;
    studentNumber: string;
    phoneNumber: string;
    year: string;
    smoking: string;
    japaneseProficiency: string;
};

type DriverData = {
    carNumber: string;
    carType: string;
    foodAndDrink: string;
    hasPets: boolean;
    maxCapacity: string;
    transmission: string;
};

type PostItemProps = {
    post: AinoriData & { id: string, driverData?: UserData, driverInfo?: DriverData };
    isSubmitting: string | null;
    userStatus: string | null;
    handleRegisterClick: (postId: string) => void;
    windowWidth: number;
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

const PostItem: React.FC<PostItemProps> = ({ post, isSubmitting, userStatus, handleRegisterClick, windowWidth }) => {
    return (
        <Box p="5" shadow="md" borderWidth="1px" width="100%" maxWidth="600px" margin="auto" bg="gray.100">
            <VStack height="100%">
                <Box width="100%" borderBottom="1px solid #ccc" pb="2" mb="2">
                    <HStack>
                        <Text sx={{ textAlign: 'center', fontSize: windowWidth <= 600 ? 'xs' : '2xl', fontWeight: 'bold' }}>
                            {post.goal_spot}まで
                        </Text>
                        <Spacer />
                        <Text sx={{ textAlign: 'center', fontSize: windowWidth <= 600 ? 'xs' : 'xl', fontWeight: 'bold' }}>
                            {formatDate(post.start_time)}
                        </Text>
                    </HStack>
                </Box>
                <Box flex="3" width="100%">
                    <HStack height="100%">
                        <Box flex="1" textAlign="center" display="flex" flexDirection="column" alignItems="center" justifyContent="center">
                            <Image src="/icons/profile_icon.svg" alt="Profile Icon" width={100} height={100} />
                            <Spacer />
                            <Text sx={{ textAlign: 'center', fontSize: windowWidth <= 600 ? 'xs' : 'xl', fontWeight: 'bold', wordBreak: 'break-all' }}>
                                {post.driverData?.username}
                            </Text>
                        </Box>
                        <Box flex="3" width="100%">
                            <VStack height="100%">
                                <Box flex="3" width="100%">
                                    <HStack height="100%" alignItems="flex-start">
                                        <Box flex="1">
                                            <Text sx={{fontSize: windowWidth <= 600 ? 'xs' : 'xl', fontWeight: 'bold' }}>
                                                性別：
                                                {post.driverData?.gender === 'male' && '男性'}
                                                {post.driverData?.gender === 'female' && '女性'}
                                                {post.driverData?.gender === 'other' && 'その他'}
                                            </Text>
                                            <Text sx={{fontSize: windowWidth <= 600 ? 'xs' : 'xl', fontWeight: 'bold' }}>学年：<strong>{post.driverData?.year}</strong></Text>
                                            <Text sx={{fontSize: windowWidth <= 600 ? 'xs' : 'xl', fontWeight: 'bold' }}>
                                                研究室：
                                                <Box as="span" fontSize={windowWidth <= 600 ? '10px' : 'sm'}>
                                                    {post.driverData?.laboratory}
                                                </Box>
                                            </Text>
                                        </Box>
                                        <Box flex="1">
                                            <Text sx={{fontSize: windowWidth <= 600 ? 'xs' : 'xl', fontWeight: 'bold' }}>
                                                車種: {post.driverInfo?.carType}
                                            </Text>
                                            <Text sx={{fontSize: windowWidth <= 600 ? 'xs' : 'xl', fontWeight: 'bold' }}>
                                                集合場所: {post.start_spot}
                                            </Text>
                                            <Text sx={{fontSize: windowWidth <= 600 ? 'xs' : 'xl', fontWeight: 'bold' }}>
                                                備考:{post.remarks}
                                            </Text>
                                        </Box>
                                    </HStack>
                                </Box>
                                <Box flex="1" width="100%">
                                    <HStack>
                                        {windowWidth > 600 && <Spacer />}
                                        <Image 
                                            src={post.driverData?.smoking ? "/icons/yes_smoke.png" : "/icons/no_smoke.png"} 
                                            alt="Smoking Icon" 
                                            width={windowWidth <= 600 ? 30 : 50} 
                                            height={windowWidth <= 600 ? 30 : 50} 
                                        />
                                        {windowWidth > 600 && <Spacer />}
                                        <Image 
                                            src={post.driverInfo?.foodAndDrink ? "/icons/yes_food.png" : "/icons/no_food.png"} 
                                            alt="Food Icon" 
                                            width={windowWidth <= 600 ? 30 : 50} 
                                            height={windowWidth <= 600 ? 30 : 50} 
                                        />
                                        {windowWidth > 600 && <Spacer />}
                                        <Image 
                                            src={post.driverInfo?.hasPets ? "/icons/yes_pet.png" : "/icons/no_pet.png"} 
                                            alt="Pet Icon" 
                                            width={windowWidth <= 600 ? 30 : 50} 
                                            height={windowWidth <= 600 ? 30 : 50} 
                                        />
                                        {windowWidth > 600 && <Spacer />}
                                        <Image 
                                            src={post.driverData?.japaneseProficiency ? "/icons/yes_japanese.png" : "/icons/no_japanese.png"} 
                                            alt="Japanese Icon" 
                                            width={windowWidth <= 600 ? 30 : 50} 
                                            height={windowWidth <= 600 ? 30 : 50} 
                                        />
                                        {windowWidth > 600 && <Spacer />}
                                        {windowWidth > 600 && <Spacer />}
                                        <Button
                                            color='white'
                                            bg='teal.400'
                                            isLoading={isSubmitting === post.id}
                                            onClick={() => handleRegisterClick(post.id)}
                                            px={4}
                                            py={2}
                                            fontSize={windowWidth <= 600 ? 'xs' : 'xl'}
                                            _hover={{
                                                borderColor: 'transparent',
                                                boxShadow: '0 7px 10px rgba(0, 0, 0, 0.3)',
                                            }}
                                            isDisabled={userStatus !== null}
                                            _disabled={{
                                                bg: 'gray.400', 
                                                cursor: 'not-allowed', 
                                            }}
                                        >
                                            相乗り申請
                                        </Button>
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

export default PostItem;
