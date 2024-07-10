'use client'
import { useEffect, useState } from 'react';
import { db, auth } from '../../lib/firebase/config'; // Firebase configファイルをインポート
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import {
  Box,
  Heading,
  Text,
  VStack,
  Spinner,
  Alert,
  AlertIcon,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Select,
  Stack,
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
  driverProfile?: string; // ドライバープロフィール
};

const ProfilePage = () => {
  const [userUid, setUserUid] = useState<string | null>(null);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);

  useEffect(() => {
    const fetchUser = () => {
      onAuthStateChanged(auth, (user) => {
        if (user) {
          setUserUid(user.uid);
        } else {
          setError('ユーザーが認証されていません。');
          setLoading(false);
        }
      });
    };

    fetchUser();
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!userUid) return;

      try {
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

  const handleSave = async () => {
    if (!userUid || !profile) return;

    try {
      const docRef = doc(db, 'Users', userUid, 'Profile', 'Info');
      await setDoc(docRef, profile, { merge: true });
      setIsEditing(false);
    } catch (err) {
      console.error("Error saving profile data: ", err);
      setError('プロフィール情報の保存中にエラーが発生しました。');
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
    <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
      <VStack spacing="5" alignItems="left" width="80%">
        <Flex width="100%" justifyContent="space-between" alignItems="center">
          <Heading>プロフィール情報</Heading>
          <Button onClick={() => setIsEditing(!isEditing)}>
            {isEditing ? 'キャンセル' : '編集'}
          </Button>
        </Flex>
        {profile ? (
          isEditing ? (
            <VStack spacing="4" alignItems="left" as="form">
              <FormControl>
                <FormLabel>ユーザーネーム</FormLabel>
                <Input
                  value={profile.username}
                  onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                />
              </FormControl>
              <FormControl>
                <FormLabel>性別</FormLabel>
                <Select
                  value={profile.gender}
                  onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
                >
                  <option value="male">男性</option>
                  <option value="female">女性</option>
                  <option value="other">その他</option>
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel>領域</FormLabel>
                <Input
                  value={profile.region}
                  onChange={(e) => setProfile({ ...profile, region: e.target.value })}
                />
              </FormControl>
              <FormControl>
                <FormLabel>研究室</FormLabel>
                <Input
                  value={profile.laboratory}
                  onChange={(e) => setProfile({ ...profile, laboratory: e.target.value })}
                />
              </FormControl>
              <FormControl>
                <FormLabel>学籍番号</FormLabel>
                <Input
                  value={profile.studentNumber}
                  onChange={(e) => setProfile({ ...profile, studentNumber: e.target.value })}
                />
              </FormControl>
              <FormControl>
                <FormLabel>電話番号</FormLabel>
                <Input
                  value={profile.phoneNumber}
                  onChange={(e) => setProfile({ ...profile, phoneNumber: e.target.value })}
                />
              </FormControl>
              <FormControl>
                <FormLabel>学年</FormLabel>
                <Input
                  value={profile.year}
                  onChange={(e) => setProfile({ ...profile, year: e.target.value })}
                />
              </FormControl>
              <FormControl>
                <FormLabel>喫煙</FormLabel>
                <Select
                  value={profile.smoking}
                  onChange={(e) => setProfile({ ...profile, smoking: e.target.value })}
                >
                  <option value="yes">可</option>
                  <option value="no">否</option>
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel>日本語</FormLabel>
                <Select
                  value={profile.japaneseProficiency}
                  onChange={(e) => setProfile({ ...profile, japaneseProficiency: e.target.value })}
                >
                  <option value="yes">可</option>
                  <option value="no">否</option>
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel>ドライバープロフィール</FormLabel>
                <Input
                  value={profile.driverProfile || ''}
                  onChange={(e) => setProfile({ ...profile, driverProfile: e.target.value })}
                />
              </FormControl>
              <Button onClick={handleSave} colorScheme="teal">
                保存
              </Button>
            </VStack>
          ) : (
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
              <Text><strong>ドライバープロフィール:</strong> {profile.driverProfile || '未登録'}</Text>
            </>
          )
        ) : (
          <Text>プロフィール情報が読み込めませんでした。</Text>
        )}
      </VStack>
    </Box>
  );
};

export default ProfilePage;
