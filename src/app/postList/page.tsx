'use client'
import React, { useEffect, useState } from 'react';
import { db, auth } from '../../lib/firebase/config'; // Firebase configファイルをインポート
import { collection, getDocs, doc, getDoc, updateDoc, runTransaction, Timestamp } from 'firebase/firestore';
import {
    Box,
    Heading,
    Text,
    VStack,
    Spinner,
    Alert,
    AlertIcon,
    HStack,
    Button,
    Spacer,
    useToast,
} from '@chakra-ui/react';
import { format } from 'date-fns';
import { onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'next/navigation'
import Image from 'next/image';

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

const formatDate = (timestamp: Timestamp | Date | { seconds: number, nanoseconds: number }) => {
    let date: Date;
    if (timestamp instanceof Timestamp) {
        date = timestamp.toDate();
    } else if (timestamp instanceof Date) {
        date = timestamp;
    } else if (typeof timestamp === 'object' && 'seconds' in timestamp && 'nanoseconds' in timestamp) {
        date = new Date(timestamp.seconds * 1000);
    } else {
        throw new Error('Invalid timestamp type');
    }
    return format(date, 'yyyy年MM月dd日 HH:mm発');
};

const PostListPage: React.FC = () => {
    const [posts, setPosts] = useState<(AinoriData & { id: string, driverData?: UserData, driverInfo?: DriverData })[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState<string | null>(null);
    const [userId, setUserId] = useState<string | null>(null);
    const [userStatus, setUserStatus] = useState<string | null>(null);
    const router = useRouter();
    const toast = useToast();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                setUserId(user.uid);
                // ユーザーのstatusを取得
                const userDocRef = doc(db, 'Users', user.uid);
                const userDoc = await getDoc(userDocRef);
                if (userDoc.exists()) {
                    setUserStatus(userDoc.data().status || null);
                }
            } else {
                setUserId(null);
                setUserStatus(null);
            }
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        console.log('posts:', posts)
    }, [posts]);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, 'ainories'));
                const fetchedPosts: (AinoriData & { id: string, driverData?: UserData, driverInfo?: DriverData })[] = [];
                for (const queryDoc of querySnapshot.docs) {
                    const postData = queryDoc.data() as AinoriData;
                    let driverData: UserData | undefined;
                    let driverInfo: DriverData | undefined;

                    if (postData.driver) {
                        const driverDocRef = doc(db, 'Users', postData.driver, 'Profile', 'Info');
                        const driverDoc = await getDoc(driverDocRef);
                        if (driverDoc.exists()) {
                            driverData = driverDoc.data() as UserData;
                            console.log("Driver Data: ", driverData);
                        } else {
                            console.log(`Driver document not found for ID: ${postData.driver}`);
                        }

                        const driverInfoDocRef = doc(db, 'Users', postData.driver, 'Profile', 'DriverInfo');
                        const driverInfoDoc = await getDoc(driverInfoDocRef);
                        if (driverInfoDoc.exists()) {
                            driverInfo = driverInfoDoc.data() as DriverData;
                            console.log("Driver Info: ", driverInfo);
                        } else {
                            console.log(`Driver Info document not found for ID: ${postData.driver}`);
                        }
                    } else {
                        console.log("No driver assigned for post:", postData);
                    }

                    fetchedPosts.push({ ...postData, id: queryDoc.id, driverData, driverInfo });
                }
                setPosts(fetchedPosts);
            } catch (err) {
                console.error("Error fetching posts data: ", err);
                setError('データの取得中にエラーが発生しました。');
            } finally {
                setLoading(false);
            }
        };

        fetchPosts();
    }, []);

    const handleRegisterClick = async (postId: string) => {
        if (!userId) {
            console.error('User is not logged in');
            return;
        }
        try {
            setIsSubmitting(postId); // ボタンの状態をローディングに設定
            const postDocRef = doc(db, 'ainories', postId);
            const userDocRef = doc(db, 'Users', userId);
            let driverUsername = '';
            const postSnapshot = await getDoc(postDocRef);
            if (postSnapshot.exists()) {
                const postData = postSnapshot.data() as AinoriData;
                if (postData.driver === userId) {
                    console.error('Driver and passenger cannot be the same person');
                    toast({
                        title: "マッチが成立しませんでした",
                        description: "自分自身とはマッチングできません。",
                        status: "error",
                        duration: 5000,
                        isClosable: true,
                    });
                    setIsSubmitting(null);
                    return;
                }
                if (postData.driver) {
                    const driverDocRef = doc(db, 'Users', postData.driver, 'Profile', 'Info');
                    const driverDoc = await getDoc(driverDocRef);
                    if (driverDoc.exists()) {
                        const driverData = driverDoc.data() as UserData;
                        driverUsername = driverData.username;
                    }
                }
            }
            await runTransaction(db, async (transaction) => {
                // ainoriesテーブルの更新
                transaction.update(postDocRef, { passenger: userId, status: '成立中' });
                // Usersテーブルの更新
                transaction.update(userDocRef, { status: postId });
                setUserStatus(postId);
            });
            console.log(`Updated passenger for post ID: ${postId}`);
            toast({
                title: "マッチが成立しました！",
                description: `${driverUsername}さんとのマッチが成功しました。`,
                status: "success",
                duration: 5000,
                isClosable: true,
            });
            router.push('/home');
        } catch (err) {
            console.error(`Error updating passenger for post ID ${postId}: `, err);
        } finally {
            setIsSubmitting(null); // ローディング状態を解除
        }
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
                <Spinner size="xl" />
            </Box>
        );
    }

    if (error) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
                <Alert status="error">
                    <AlertIcon />
                    {error}
                </Alert>
            </Box>
        );
    }

    return (
        <Box display="flex" justifyContent="center" alignItems="center" overflow="auto" padding="4">
            <VStack spacing="5" alignItems="left" width="full">
                <Heading>ポスト一覧</Heading>
                {posts.length > 0 ? (
                posts
                    .filter(post => post.status === '募集中') // "募集中" 状態のポストをフィルタリング
                    .length > 0 ? (
                        posts
                            .filter(post => post.status === '募集中') // "募集中" 状態のポストを再度フィルタリング
                            .map((post, index) => (
                                <Box key={index} p="5" shadow="md" borderWidth="1px" width="100%" maxWidth="600px" margin="auto" bg="gray.100">
                                <VStack height="100%">
                                    <Box width="100%" borderBottom="1px solid #ccc" pb="2" mb="2">
                                        <HStack>
                                            <Text sx={{ textAlign: 'center', fontSize: '2xl', fontWeight: 'bold' }}>
                                            {post.goal_spot}まで
                                            </Text>
                                            <Spacer />
                                            <Text sx={{ textAlign: 'center', fontSize: 'xl', fontWeight: 'bold' }}>
                                            {formatDate(post.start_time)}
                                            </Text>
                                        </HStack>
                                    </Box>
                                    <Box flex="3" width="100%">
                                        <HStack height="100%">
                                        <Box flex="1" textAlign="center" display="flex" flexDirection="column" alignItems="center" justifyContent="center">
                                                <Image src="/profile_icon.svg" alt="Profile Icon" width={100} height={100} />
                                                <Spacer />
                                                <Text sx={{ textAlign: 'center', fontSize: 'xl', fontWeight: 'bold' }}>
                                                    {post.driverData?.username}
                                                </Text>
                                            </Box>
                                            <Box flex="3" width="100%">
                                                <VStack height="100%">
                                                    <Box flex="3" width="100%">
                                                    <HStack height="100%" alignItems="flex-start">
                                                    <Box flex="1">
                                                        <Text sx={{fontSize: 'xl', fontWeight: 'bold' }}>
                                                            性別：
                                                            {post.driverData?.gender === 'male' && '男性'}
                                                            {post.driverData?.gender === 'female' && '女性'}
                                                            {post.driverData?.gender === 'other' && 'その他'}
                                                        </Text>
                                                        <Text sx={{fontSize: 'xl', fontWeight: 'bold' }}>学年：<strong>{post.driverData?.year}</strong></Text>
                                                        <Text sx={{fontSize: 'xl', fontWeight: 'bold' }}>
    研究室：
    <Box as="span" fontSize="sm">
        {post.driverData?.laboratory}
    </Box>
</Text>
                                                    </Box>
                                                    <Box flex="1">
                                                        <Text sx={{fontSize: 'xl', fontWeight: 'bold' }}>
                                                            車種: {post.driverInfo?.carType}
                                                        </Text>
                                                        <Text sx={{fontSize: 'xl', fontWeight: 'bold' }}>
                                                            集合場所: {post.start_spot}
                                                        </Text>
                                                        <Text sx={{fontSize: 'xl', fontWeight: 'bold' }}>
                                                            備考:{post.remarks}
                                                        </Text>
                                                    </Box>
                                                </HStack>
                                                    </Box>
                                                    <Box flex="1" width="100%">
                                                        <HStack>
                                                        <Spacer />
                                                        <Image src="/nosmoke.png" alt="Profile Icon" width={50} height={50} />
                                                        <Spacer />
                                                        <Image src="/nosmoke.png" alt="Profile Icon" width={50} height={50} />
                                                        <Spacer />
                                                        <Image src="/yessmoke.png" alt="Profile Icon" width={50} height={50} />
                                                        <Spacer />
                                                        <Image src="/yessmoke.png" alt="Profile Icon" width={50} height={50} />
                                                        <Spacer />
                                                        <Spacer />
                                                            <Button
                                                                color='white'
                                                                bg='teal.400'
                                                                isLoading={isSubmitting === post.id}
                                                                onClick={() => handleRegisterClick(post.id)}
                                                                px={4}
                                                                py={2}
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
                            

                                // <Box key={index} p="5" shadow="md" borderWidth="1px" width="100%" maxWidth="600px" margin="auto" bg="gray.100">
                                //     <VStack>
                                //         <Box flex="1" width="100%" borderBottom="1px solid #ccc" pb="2" mb="2">
                                //             <HStack>
                                //                 <Text sx={{ textAlign: 'center', fontSize: '2xl', fontWeight: 'bold' }}>
                                //                 {post.goal_spot}まで
                                //                 </Text>
                                //                 <Spacer />
                                //                 <Text sx={{ textAlign: 'center', fontSize: 'xl', fontWeight: 'bold' }}>
                                //                 {formatDate(post.start_time)}
                                //                 </Text>
                                //             </HStack>
                                //         </Box>
                                //         <Box flex="3">
                                //         <HStack>
                                //         <Box flex="2">
                                //             <Image src="/profile_icon.svg" alt="Profile Icon" width={50} height={50} />
                                //         </Box>
                                //         <Box flex="3">
                                //         {/* <Text sx={{ textAlign: 'center', fontSize: 'xl', fontWeight: 'bold' }}>
                                //                 {post.driverData?.username}
                                //             </Text> */}
                                //             {/* <HStack justifyContent="space-between">
                                //                 <Box flex="0.75" textAlign="center">
                                //                     <Text><strong>{post.driverData?.gender}</strong></Text>
                                //                 </Box>
                                //                 <Box flex="0.75" textAlign="center">
                                //                     <Text><strong>{post.driverData?.year}</strong></Text>
                                //                 </Box>
                                //             </HStack> */}
                                //         </Box>
                                //         <Box flex="3">

                                //         </Box>
                                        
                                            
                                //             {/* <Text sx={{ textAlign: 'center', fontSize: 'xl', fontWeight: 'bold' }}>
                                //                 {post.driverData?.laboratory}
                                //             </Text>
                                //             <HStack justifyContent="space-between">
                                //                 <Box flex="0.75" textAlign="center">
                                //                     <Text><strong>日本語可否:</strong> {post.driverData?.japaneseProficiency}</Text>
                                //                 </Box>
                                //                 <Box flex="0.75" textAlign="center">
                                //                     <Text><strong>喫煙:</strong> {post.driverData?.smoking}</Text>
                                //                 </Box>
                                //             </HStack>
                                //             <Text sx={{ textAlign: 'center', fontSize: '2xl', fontWeight: 'bold' }}>
                                //                 {post.start_time instanceof Timestamp ? formatDate(post.start_time) : post.start_time.toString()}
                                //             </Text>
                                //             <Text sx={{ textAlign: 'center', fontSize: '2xl', fontWeight: 'bold' }}><strong>{post.start_spot} - {post.goal_spot}</strong></Text>
                                //             <Text sx={{ textAlign: 'center', fontSize: '2xl', fontWeight: 'bold' }}><strong>車: {post.driverInfo?.carType}</strong></Text>
                                //             <Text><strong>備考:</strong> {post.remarks}</Text>
                                //             <Box display="flex" justifyContent="flex-end">
                                //                 <Button
                                //                     marginTop='4'
                                //                     color='white'
                                //                     bg='teal.400'
                                //                     isLoading={isSubmitting === post.id}
                                //                     onClick={() => handleRegisterClick(post.id)}
                                //                     paddingX='auto'
                                //                     _hover={{
                                //                         borderColor: 'transparent',
                                //                         boxShadow: '0 7px 10px rgba(0, 0, 0, 0.3)',
                                //                     }}
                                //                     isDisabled={userStatus !== null}
                                //                     _disabled={{
                                //                         bg: 'gray.400', 
                                //                         cursor: 'not-allowed', 
                                //                     }}
                                //                 >
                                //                     リクエスト
                                //                 </Button>
                                //         </Box> */}
                                //     </HStack>

                                //         </Box>
                                    
                                //     </VStack>
                                // </Box>
                            ))
                    ) : (
                        <Text>ポストが見つかりませんでした。</Text>
                    )
            ) : (
                <Text>ポストが見つかりませんでした。</Text>
            )}
            </VStack>
        </Box>
    );
};

export default PostListPage;
