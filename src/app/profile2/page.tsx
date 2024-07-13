'use client'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import {
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  Input,
  VStack,
  Select,
  RadioGroup,
  Radio,
  Stack,
} from '../../common/design'
import { db, auth } from '../../lib/firebase/config' // Firebase設定ファイルをインポート
import { doc, updateDoc, setDoc } from 'firebase/firestore'

// フォームで使用する変数の型を定義
type formInputs = {
  year: string
  smoking: string
  japaneseProficiency: string // 日本語可・否を追加
}

/** プロフィール登録画面
 * @screenname Profile2Screen
 * @description ユーザの追加プロフィール情報を登録する画面
 */
export default function Profile2Screen() {
  const {
    handleSubmit,
    register,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<formInputs>()
  const router = useRouter();

  const onSubmit = handleSubmit(async (data) => {
    const user = auth.currentUser;
    if (user) {
      const userUid = user.uid;

      const profileData = {
        year: data.year,
        smoking: data.smoking,
        japaneseProficiency: data.japaneseProficiency,
      };

      const profileRef = doc(db, 'Users', userUid, 'Profile', 'Info');

      // データが既に存在する場合は更新し、存在しない場合は新規作成
      await setDoc(profileRef, profileData, { merge: true });

      console.log('Profile2 data submitted and saved:', profileData);
      router.push('/home');  // 登録後に home に遷移する
    } else {
      console.error('User not logged in');
    }
  })

  return (
    <Flex height='100vh' justifyContent='center' alignItems='center'>
      <VStack spacing='5'>
        <Heading>本登録</Heading>
        <form onSubmit={onSubmit}>
          <VStack alignItems='left'>
            <FormControl isInvalid={Boolean(errors.year)}>
              <FormLabel htmlFor='year' textAlign='start'>
                学年
              </FormLabel>
              <Select
                id='year'
                autoComplete='year'
                {...register('year', {
                  required: '必須項目です',
                })}
              >
                <option value=''>選択してください</option>
                <option value='M1'>M1</option>
                <option value='M2'>M2</option>
                <option value='D1'>D1</option>
                <option value='D2'>D2</option>
                <option value='D3'>D3</option>
                <option value='other'>その他</option>
              </Select>
              <FormErrorMessage>
                {errors.year && errors.year.message}
              </FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={Boolean(errors.smoking)}>
              <FormLabel htmlFor='smoking' textAlign='start'>
                喫煙
              </FormLabel>
              <RadioGroup
                id='smoking'
                onChange={(value) => setValue('smoking', value)}
              >
                <Stack direction='row'>
                  <Radio value='yes'>可</Radio>
                  <Radio value='no'>否</Radio>
                </Stack>
              </RadioGroup>
              <FormErrorMessage>
                {errors.smoking && errors.smoking.message}
              </FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={Boolean(errors.japaneseProficiency)}>
              <FormLabel htmlFor='japaneseProficiency' textAlign='start'>
                日本語
              </FormLabel>
              <RadioGroup
                id='japaneseProficiency'
                onChange={(value) => setValue('japaneseProficiency', value)}
              >
                <Stack direction='row'>
                  <Radio value='yes'>可</Radio>
                  <Radio value='no'>否</Radio>
                </Stack>
              </RadioGroup>
              <FormErrorMessage>
                {errors.japaneseProficiency && errors.japaneseProficiency.message}
              </FormErrorMessage>
            </FormControl>

            <Button
              marginTop='4'
              color='white'
              bg='teal.400'
              isLoading={isSubmitting}
              type='submit'
              paddingX='auto'
              _hover={{
                borderColor: 'transparent',
                boxShadow: '0 7px 10px rgba(0, 0, 0, 0.3)',
              }}
            >
              登録
            </Button>
          </VStack>
        </form>
      </VStack>
    </Flex>
  )
}
