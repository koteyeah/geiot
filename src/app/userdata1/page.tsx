'use client';

import React, { useEffect, useState } from 'react';
import { db, auth } from '../../lib/firebase/config';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import {
  Box,
  Heading,
  Text,
  VStack,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Select,
  Radio,
  RadioGroup,
  useToast,
  FormErrorMessage,
} from '../../common/design';

type ProfileData = {
  carType: string;
  carNumber: string;
  transmission: string;
  maxCapacity: number;
  foodAndDrink: boolean;
  hasPets: boolean;
};

const ProfilePage = () => {
  const router = useRouter();
  const toast = useToast();
  const [profile, setProfile] = useState<ProfileData>({
    carType: '',
    carNumber: '',
    transmission: '',
    maxCapacity: 2,
    foodAndDrink: false,
    hasPets: false,
  });
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [carNumberError, setCarNumberError] = useState<string>('');

  useEffect(() => {
    const fetchProfile = async () => {
      if (!auth.currentUser) {
        console.error('ユーザーがログインしていません');
        return;
      }

      try {
        const userRef = doc(db, 'Users', auth.currentUser.uid, 'Profile', 'DriverInfo');
        const docSnap = await getDoc(userRef);

        if (docSnap.exists()) {
          setProfile(docSnap.data() as ProfileData);
        } else {
          console.log('No such document!');
        }
      } catch (error) {
        console.error('プロフィールの取得中にエラーが発生しました:', error);
      }
    };

    fetchProfile();
  }, []);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = event.target;

    if (name === 'carNumber') {
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
    if (!auth.currentUser) {
      console.error('ユーザーがログインしていません');
      return;
    }

    // 必須項目チェック
    if (
      profile.carType === '' ||
      profile.carNumber === '' ||
      profile.transmission === '' ||
      carNumberError !== '' ||
      profile.maxCapacity === null ||
      profile.foodAndDrink === null ||
      profile.hasPets === null
    ) {
      toast({
        title: 'エラー',
        description: 'すべての項目を正しく入力してください。',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    try {
      const userRef = doc(db, 'Users', auth.currentUser.uid, 'Profile', 'DriverInfo');
      await setDoc(userRef, profile);

      toast({
        title: '保存成功',
        description: 'プロフィールが正常に更新されました。',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      setIsEditing(false);
      console.log('プロフィールが Users/Profile/DriverInfo に保存されました');
    } catch (error) {
      console.error('プロフィールの保存中にエラーが発生しました:', error);
    }
  };

  const handleNavigateToUserData = () => {
    router.push('/userdata');
  };

  return (
    <Box display="flex" justifyContent="center" alignItems="center" height="100vh" padding="5">
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
            <FormControl isInvalid={profile.carType === ''}>
              <FormLabel>車種</FormLabel>
              <Input
                type="text"
                name="carType"
                value={profile.carType}
                onChange={handleInputChange}
                borderColor="black"
              />
              {profile.carType === '' && <FormErrorMessage>必須項目です</FormErrorMessage>}
            </FormControl>
            <FormControl isInvalid={profile.carNumber === '' || carNumberError !== ''}>
              <FormLabel>ナンバー</FormLabel>
              <Input
                type="text"
                name="carNumber"
                value={profile.carNumber}
                onChange={handleInputChange}
                borderColor="black"
              />
              {carNumberError && <FormErrorMessage>{carNumberError}</FormErrorMessage>}
              {profile.carNumber === '' && !carNumberError && <FormErrorMessage>必須項目です</FormErrorMessage>}
            </FormControl>
            <FormControl isInvalid={profile.transmission === ''}>
              <FormLabel>トランスミッション</FormLabel>
              <Select
                name="transmission"
                value={profile.transmission}
                onChange={handleInputChange}
                borderColor="black"
              >
                <option value="">選択してください</option>
                <option value="マニュアル">マニュアル</option>
                <option value="オートマチック">オートマチック</option>
              </Select>
              {profile.transmission === '' && <FormErrorMessage>必須項目です</FormErrorMessage>}
            </FormControl>
            <FormControl isInvalid={profile.maxCapacity === null}>
              <FormLabel>上限人数</FormLabel>
              <Select
                name="maxCapacity"
                value={profile.maxCapacity.toString()}
                onChange={handleInputChange}
                borderColor="black"
              >
                {[...Array(7)].map((_, index) => (
                  <option key={index} value={(index + 2).toString()}>
                    {index + 2}
                  </option>
                ))}
              </Select>
              {profile.maxCapacity === null && <FormErrorMessage>必須項目です</FormErrorMessage>}
            </FormControl>
            <FormControl isInvalid={profile.foodAndDrink === null}>
              <FormLabel>飲食</FormLabel>
              <RadioGroup
                name="foodAndDrink"
                value={profile.foodAndDrink ? 'true' : 'false'}
                onChange={(value) => setProfile({ ...profile, foodAndDrink: value === 'true' })}
              >
                <Flex>
                  <Radio value="true" borderColor="black">可</Radio>
                  <Radio value="false" borderColor="black">不可</Radio>
                </Flex>
              </RadioGroup>
              {profile.foodAndDrink === null && <FormErrorMessage>必須項目です</FormErrorMessage>}
            </FormControl>
            <FormControl isInvalid={profile.hasPets === null}>
              <FormLabel>ペット</FormLabel>
              <RadioGroup
                name="hasPets"
                value={profile.hasPets ? 'true' : 'false'}
                onChange={(value) => setProfile({ ...profile, hasPets: value === 'true' })}
              >
                <Flex>
                  <Radio value="true" borderColor="black">飼っている</Radio>
                  <Radio value="false" borderColor="black">飼っていない</Radio>
                </Flex>
              </RadioGroup>
              {profile.hasPets === null && <FormErrorMessage>必須項目です</FormErrorMessage>}
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
            <Text><strong>飲食:</strong> {profile.foodAndDrink ? '可' : '不可'}</Text>
            <Text><strong>ペット:</strong> {profile.hasPets ? '飼っている' : '飼っていない'}</Text>
          </VStack>
        )}
      </VStack>
    </Box>
  );
};

export default ProfilePage;
