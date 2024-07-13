'use client'
import React, { useEffect, useState } from 'react';
import { db, auth } from '../../lib/firebase/config'; // Firebase configファイルをインポート
import { collection, getDocs, doc, getDoc, updateDoc, runTransaction,Timestamp } from 'firebase/firestore';
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
import { set } from 'firebase/database';
import { useRouter } from 'next/navigation'

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
    return format(date, 'yyyy/MM/dd HH:mm~');
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
                                <Box key={index} p="5" shadow="md" borderWidth="1px" width="100%" maxWidth="1000px" margin="auto">
                                    <HStack>
                                        <Box flex="3.5" borderRight="1px solid #ccc" pr="4">
                                            <Text sx={{ textAlign: 'center', fontSize: 'xl', fontWeight: 'bold' }}>
                                                {post.driverData?.username}
                                            </Text>
                                            <HStack justifyContent="space-between">
                                                <Box flex="0.75" textAlign="center">
                                                    <Text><strong>{post.driverData?.gender}</strong></Text>
                                                </Box>
                                                <Box flex="0.75" textAlign="center">
                                                    <Text><strong>{post.driverData?.year}</strong></Text>
                                                </Box>
                                            </HStack>
                                            <Text sx={{ textAlign: 'center', fontSize: 'xl', fontWeight: 'bold' }}>
                                                {post.driverData?.laboratory}
                                            </Text>
                                            <HStack justifyContent="space-between">
                                                <Box flex="0.75" textAlign="center">
                                                    <Text><strong>日本語可否:</strong> {post.driverData?.japaneseProficiency}</Text>
                                                </Box>
                                                <Box flex="0.75" textAlign="center">
                                                    <Text><strong>喫煙:</strong> {post.driverData?.smoking}</Text>
                                                </Box>
                                            </HStack>
                                        </Box>
                                        <Box flex="6.5" pl="4">
                                            <Text sx={{ textAlign: 'center', fontSize: '2xl', fontWeight: 'bold' }}>
                                                {post.start_time instanceof Timestamp ? formatDate(post.start_time) : post.start_time.toString()}
                                            </Text>
                                            <Text sx={{ textAlign: 'center', fontSize: '2xl', fontWeight: 'bold' }}><strong>{post.start_spot} - {post.goal_spot}</strong></Text>
                                            <Text sx={{ textAlign: 'center', fontSize: '2xl', fontWeight: 'bold' }}><strong>車: {post.driverInfo?.carType}</strong></Text>
                                            <Text><strong>備考:</strong> {post.remarks}</Text>
                                            <Box display="flex" justifyContent="flex-end">
                                                <Button
                                                    marginTop='4'
                                                    color='white'
                                                    bg='teal.400'
                                                    isLoading={isSubmitting === post.id}
                                                    onClick={() => handleRegisterClick(post.id)}
                                                    paddingX='auto'
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
                                                    リクエスト
                                                </Button>
                                            </Box>
                                        </Box>
                                    </HStack>
                                </Box>
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
