'use client';

import React, { useEffect, useState } from 'react';
import { db, auth } from '../../lib/firebase/config';
import { doc, setDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation'; // 修正: useRouterのimportをnext/routerからnext/navigationへ変更
import {
  Box,
  Heading,
  Text,
  VStack,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Select,
  Radio,
  RadioGroup,
} from '../../common/design';

type ProfileData = {
  carType: string;
  carNumber: string;
  transmission: string;
  maxCapacity: number;
  foodAndDrink: string;
  hasPets: boolean;
};

const ProfilePage = () => {
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileData>({
    carType: '',
    carNumber: '',
    transmission: '',
    maxCapacity: 2,
    foodAndDrink: '',
    hasPets: false,
  });
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [carNumberError, setCarNumberError] = useState<string>('');

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = event.target;
  
    if (name === 'carNumber') {
      // 半角数字のみを受け付ける正規表現
      const regex = /^[0-9]*$/;
      if (!regex.test(value)) {
        setCarNumberError('半角数字で入力してください');
        return;
      } else {
        setCarNumberError('');
      }
    }
  
    if (type === 'checkbox') {
      setProfile({ ...profile, [name]: (event.target as HTMLInputElement).checked });
    } else {
      setProfile({ ...profile, [name]: type === 'number' ? parseInt(value) : value });
    }
  };
  
  
  const handleSave = async () => {
    try {
      if (!auth.currentUser) {
        console.error('ユーザーがログインしていません');
        return;
      }

      const userRef = doc(db, 'Users', auth.currentUser.uid, 'Profile', 'DriverInfo');
      await setDoc(userRef, profile);

      console.log('プロフィールが Users/Profile/DriverInfo に保存されました');
    } catch (error) {
      console.error('プロフィールの保存中にエラーが発生しました:', error);
    }
  };

  const handleNavigateToUserData = () => {
    router.push('/userdata');
  };

  return (
    <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
      <VStack spacing="5" alignItems="left" width="80%">
        <Flex width="100%" justifyContent="space-between" alignItems="center">
          <Heading>ドライバープロフィール情報</Heading>
          {isEditing ? (
            <Button onClick={() => setIsEditing(false)}>戻る</Button>
          ) : (
            <Button onClick={() => setIsEditing(true)}>編集</Button>
          )}
        </Flex>
        {isEditing ? (
          <VStack spacing="4" alignItems="left" as="form">
            <FormControl>
              <FormLabel>車種</FormLabel>
              <input
                type="text"
                name="carType"
                value={profile.carType}
                onChange={handleInputChange}
              />
            </FormControl>
            <FormControl>
              <FormLabel>ナンバー</FormLabel>
              <input
                type="text"
                name="carNumber"
                value={profile.carNumber}
                onChange={handleInputChange}
              />
              {carNumberError && (
                <Text color="red">{carNumberError}</Text>
              )}
            </FormControl>
            <FormControl>
              <FormLabel>トランスミッション</FormLabel>
              <Select
                name="transmission"
                value={profile.transmission}
                onChange={handleInputChange}
              >
                <option value="manual">マニュアル</option>
                <option value="automatic">オートマチック</option>
              </Select>
            </FormControl>
            <FormControl>
              <FormLabel>上限人数</FormLabel>
              <Select
                name="maxCapacity"
                value={profile.maxCapacity.toString()}
                onChange={handleInputChange}
              >
                {[...Array(7)].map((_, index) => (
                  <option key={index} value={(index + 2).toString()}>
                    {index + 2}
                  </option>
                ))}
              </Select>
            </FormControl>
            <FormControl>
              <FormLabel>飲食</FormLabel>
              <RadioGroup
                name="foodAndDrink"
                value={profile.foodAndDrink}
                onChange={(value) => setProfile({ ...profile, foodAndDrink: value })}
              >
                <Radio value="yes">可</Radio>
                <Radio value="no">不可</Radio>
              </RadioGroup>
            </FormControl>
            <FormControl>
              <FormLabel>ペット</FormLabel>
              <Select
                name="hasPets"
                value={profile.hasPets ? 'yes' : 'no'}
                onChange={(e) => setProfile({ ...profile, hasPets: e.target.value === 'yes' })}
              >
                <option value="yes">飼っている</option>
                <option value="no">飼っていない</option>
              </Select>
            </FormControl>
            <Button onClick={handleSave} colorScheme="teal">
              保存
            </Button>
            <Button onClick={handleNavigateToUserData} colorScheme="teal">
              ユーザーデータ画面に遷移
            </Button>
          </VStack>
        ) : (
          <VStack spacing="4" alignItems="left">
            <Text><strong>車種:</strong> {profile.carType}</Text>
            <Text><strong>ナンバー:</strong> {profile.carNumber}</Text>
            <Text><strong>トランスミッション:</strong> {profile.transmission}</Text>
            <Text><strong>上限人数:</strong> {profile.maxCapacity}</Text>
            <Text><strong>飲食:</strong> {profile.foodAndDrink}</Text>
            <Text><strong>ペット:</strong> {profile.hasPets ? '飼っている' : '飼っていない'}</Text>
          </VStack>
        )}
      </VStack>
    </Box>
  );
};

export default ProfilePage;
