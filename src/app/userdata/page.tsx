'use client'
import { useEffect, useState } from 'react';
import { db } from '../../lib/firebase/config'; // Firebase configファイルをインポート
import { doc, getDoc } from 'firebase/firestore';
import {
  Box,
  Heading,
  Text,
  VStack,
  Spinner,
  Alert,
  AlertIcon,
} from '../../common/design';

// ユーザーのプロフィールデータの型を定義
type ProfileData = {
  username: string;
  gender: string;
  region: string;
  laboratory: string;
  studentNumber: string;
  phoneNumber: string;
  year: string; // 学年
  smoking: string; // 喫煙
  japaneseProficiency: string; // 日本語可・否
};

const ProfilePage = ({ userUid }: { userUid: string }) => {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (!userUid) {
          throw new Error('User UID is not provided');
        }

        const docRef = doc(db, 'Users', userUid, 'Profile', 'Info');
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setProfile(docSnap.data() as ProfileData);
        } else {
          setError('プロフィール情報が見つかりません。');
        }
      } catch (err) {
        console.error("Error fetching profile data: ", err);
        setError('プロフィール情報の取得中にエラーが発生しました。');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userUid]);

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
    <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
      <VStack spacing="5" alignItems="left">
        <Heading>プロフィール情報</Heading>
        {profile ? (
          <>
            <Text><strong>ユーザーネーム:</strong> {profile.username}</Text>
            <Text><strong>性別:</strong> {profile.gender}</Text>
            <Text><strong>領域:</strong> {profile.region}</Text>
            <Text><strong>研究室:</strong> {profile.laboratory}</Text>
            <Text><strong>学籍番号:</strong> {profile.studentNumber}</Text>
            <Text><strong>電話番号:</strong> {profile.phoneNumber}</Text>
            <Text><strong>学年:</strong> {profile.year}</Text>
            <Text><strong>喫煙:</strong> {profile.smoking}</Text>
            <Text><strong>日本語:</strong> {profile.japaneseProficiency}</Text>
          </>
        ) : (
          <Text>プロフィール情報が読み込めませんでした。</Text>
        )}
      </VStack>
    </Box>
  );
};

export default ProfilePage;