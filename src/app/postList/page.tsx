'use client'
import React, { useEffect, useState } from 'react';
import { db, auth } from '../../lib/firebase/config'; // Firebase configファイルをインポート
import { collection, getDocs, doc, getDoc, updateDoc, runTransaction, Timestamp } from 'firebase/firestore';
import {
    Box,
    Heading,
    VStack,
    Spinner,
    Alert,
    AlertIcon,
    useToast,
    Text,
} from '@chakra-ui/react';
import { onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'next/navigation'
import PostItem from './postItem'; // PostItemコンポーネントをインポート

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

const PostListPage: React.FC = () => {
    const [posts, setPosts] = useState<(AinoriData & { id: string, driverData?: UserData, driverInfo?: DriverData })[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState<string | null>(null);
    const [userId, setUserId] = useState<string | null>(null);
    const [userStatus, setUserStatus] = useState<string | null>(null);
    const [windowWidth, setWindowWidth] = useState<number>(0);
    const router = useRouter();
    const toast = useToast();

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const handleResize = () => {
                setWindowWidth(window.innerWidth);
            };

            setWindowWidth(window.innerWidth); // 初期値を設定
            console.log('Window width:', window.innerWidth);

            window.addEventListener('resize', handleResize);

            return () => {
                window.removeEventListener('resize', handleResize);
            };
        }
    }, []);

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
                    posts.filter(post => post.status === '募集中').length > 0 ? (
                        posts.filter(post => post.status === '募集中').map((post, index) => (
                            <PostItem 
                                key={index} 
                                post={post} 
                                isSubmitting={isSubmitting} 
                                userStatus={userStatus} 
                                handleRegisterClick={handleRegisterClick} 
                                windowWidth={windowWidth} 
                            />
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