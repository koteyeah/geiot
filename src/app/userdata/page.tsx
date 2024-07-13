'use client';

import React, { useEffect, useState } from 'react';
import { db, auth } from '../../lib/firebase/config';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'next/navigation'; // 修正: useRouterのimportをnext/routerからnext/navigationへ変更
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
  RadioGroup,
  Radio,
  useToast,
} from '../../common/design';

// ユーザーのプロフィールデータの型を定義
type ProfileData = {
  username: string;
  gender: string;
  region: string;
  laboratory: string;
  studentNumber: string;
  phoneNumber: string;
  year: string;
  smoking: boolean;
  japaneseProficiency: boolean;
  driverProfile?: boolean; // ドライバープロフィールは 'T' または 'F' のいずれか
};

// 領域と研究室のデータ
const labData: { [key: string]: string[] } = {
  'バイオサイエンス領域': [
    '植物発生シグナル研究室',
    '植物代謝制御研究室',
    '植物成長制御研究室',
    '花発生分子遺伝学研究室',
    '植物生理学研究室',
    '植物免疫学研究室',
    '植物共生学研究室',
    '植物二次代謝研究室',
    '植物再生学研究室',
    '機能ゲノム医学研究室',
    '分子免疫制御研究室',
    '分子医学細胞生物学研究室',
    'RNA分子医科学研究室',
    '幹細胞工学研究室',
    '発生医科学研究室',
    '器官発生工学研究室',
    '原核生物分子遺伝学研究室',
    '微生物インタラクション研究室',
    '環境微生物学研究室',
    '構造生命科学研究室',
    '遺伝子発現制御研究室',
    '神経システム生物学研究室',
    'バイオエンジニアリング研究室',
    'データ駆動型生物学研究室',
    '公財地球環境産業技術研究機構 (RITE)'
  ],
  '物質創成科学領域': [
    '生体プロセス工学研究室',
    '物性情報物理学研究室',
    '光量子物性研究室',
    '光機能素子科学研究室',
    '情報機能素子科学研究室',
    '量子物理工学研究室',
    '有機エレクトロニクス研究室',
    '光反応分子科学研究室',
    '機能有機科学研究室',
    '機能有機化学研究室',
    '機能超分子化学研究室',
    '分子複合系科学研究室',
    'バイオ・テクノミメティック研究室',
    'ナノ高分子材料研究室',
    'マテリアルズ・インフォマティクス研究室',
    'データ駆動型化学研究室',
    '計測インフォマティクス研究室',
    'メズソコピック物質科学研究室',
    '感覚機能素子科学研究室',
    '機能高分子科学研究室',
    '環境適応物質学研究室',
    '先進機能材料研究室',
    '表面分子材料研究室'
  ],
  '情報科学領域': [
    'コンピューティング・アーキテクチャ研究室',
    'ディペンダブルシステム学研究室',
    'ユビキタスコンピューティングシステム研究室',
    'ソフトウェア工学研究室',
    'ソフトウェア設計学研究室',
    'サイバーレジリエンス構成学研究室',
    '情報セキュリティ工学研究室',
    '(協力)情報基盤システム学研究室',
    '自然言語処理学研究室',
    'ヒューマンAIインタラクション研究室',
    'ソーシャル・コンピューティング研究室',
    'ネットワークシステム学研究室',
    'インタラクティブメディア設計学研究室',
    '光メディアインタフェース研究室',
    'サイバネティクス・リアリティ工学研究室',
    'ヒューマンロボティクス研究室',
    'ロボットラーニング研究室',
    '大規模システム管理研究室',
    '数理情報学研究室',
    '生体医用画像研究室',
    '生体画像知能研究室',
    '計算システムズ生物学研究室',
    '計算行動神経科学研究室',
    'コミュニケーション学研究室',
    '計算神経科学研究室',
    'ヒューマンウェア工学研究室',
    'シンビオティックシステム研究室',
    '多言語ナレッジコンピューティング研究室',
    '光センシング研究室',
    '次世代モバイル通信研究室',
    '生体分子情報学研究室',
    'デジタルヒューマン学研究室',
    '形式認証研究室',
    '超高信頼ソフトウェアシステム検証学研究室',
    '多言語自然言語処理研究室',
    'ロボット対話知能研究室',
    'マルチモーダル環境認識研究室'
  ]
};

const ProfilePage = () => {
  const router = useRouter();
  const toast = useToast();
  const [userUid, setUserUid] = useState<string | null>(null);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);

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
          const fetchedProfile = docSnap.data() as ProfileData;
          setProfile(fetchedProfile);
          setSelectedRegion(fetchedProfile.region);
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
      toast({
        title: '登録成功',
        description: 'プロフィールが正常に更新されました。',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (err) {
      console.error("Error saving profile data: ", err);
      setError('プロフィール情報の保存中にエラーが発生しました。');
    }
  };

  const handleNavigateToUserData1 = () => {
    router.push('/userdata1');
  };

  const handleRegionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedRegion = e.target.value;
    setSelectedRegion(selectedRegion);
    setProfile((prevProfile) => {
      if (!prevProfile) return null;
      return { ...prevProfile, region: selectedRegion, laboratory: '' };
    });
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
    <Box display="flex" justifyContent="center" alignItems="center" height="100vh" padding="5" mt="35px">
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
                <Select
                  value={profile.region}
                  onChange={handleRegionChange}
                >
                  <option value="">選択してください</option>
                  {Object.keys(labData).map((region) => (
                    <option key={region} value={region}>{region}</option>
                  ))}
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel>研究室</FormLabel>
                <Select
                  value={profile.laboratory}
                  onChange={(e) => setProfile({ ...profile, laboratory: e.target.value })}
                  isDisabled={!selectedRegion}
                >
                  <option value="">選択してください</option>
                  {selectedRegion && labData[selectedRegion].map((lab) => (
                    <option key={lab} value={lab}>{lab}</option>
                  ))}
                </Select>
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
                <Select
                  value={profile.year}
                  onChange={(e) => setProfile({ ...profile, year: e.target.value })}
                >
                  <option value="M1">M1</option>
                  <option value="M2">M2</option>
                  <option value="D1">D1</option>
                  <option value="D2">D2</option>
                  <option value="D3">D3</option>
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel>喫煙</FormLabel>
                <RadioGroup
                  value={profile.smoking ? 'true' : 'false'}
                  onChange={(value) => setProfile({ ...profile, smoking: value === 'true' })}
                >
                  <Flex>
                    <Radio value="true">可</Radio>
                    <Radio value="false">否</Radio>
                  </Flex>
                </RadioGroup>
              </FormControl>
              <FormControl>
                <FormLabel>日本語</FormLabel>
                <RadioGroup
                  value={profile.japaneseProficiency ? 'true' : 'false'}
                  onChange={(value) => setProfile({ ...profile, japaneseProficiency: value === 'true' })}
                >
                  <Flex>
                    <Radio value="true">可</Radio>
                    <Radio value="false">否</Radio>
                  </Flex>
                </RadioGroup>
              </FormControl>
              <FormControl>
                <FormLabel>ドライバープロフィール</FormLabel>
                <RadioGroup
                  value={profile.driverProfile ? 'true' : 'false'}
                  onChange={(value) => setProfile({ ...profile, driverProfile: value === 'true' })}
                >
                  <Flex>
                    <Radio value="true">登録済</Radio>
                    <Radio value="false">未登録</Radio>
                  </Flex>
                </RadioGroup>
              </FormControl>
              <Button onClick={handleSave} colorScheme="teal">
                保存
              </Button>
              <Button onClick={handleNavigateToUserData1} colorScheme="teal">
                DriverProfileへ
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
              <Text><strong>喫煙:</strong> {profile.smoking ? '可' : '否'}</Text>
              <Text><strong>日本語:</strong> {profile.japaneseProficiency ? '可' : '否'}</Text>
              <Text><strong>ドライバープロフィール:</strong> {profile.driverProfile ? '登録済' : '未登録'}</Text>
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