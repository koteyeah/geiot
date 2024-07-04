'use client'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import {
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  Input,
  VStack,
} from '../../common/design'

// フォームで使用する変数の型を定義
type formInputs = {
  username: string
  gender: string
  laboratory: string
  studentNumber: string
  phoneNumber: string
}

/** プロフィール登録画面
 * @screenname ProfileScreen
 * @description ユーザのプロフィール情報を登録する画面
 */
export default function ProfileScreen() {
  const {
    handleSubmit,
    register,
    formState: { errors, isSubmitting },
  } = useForm<formInputs>()

  const onSubmit = handleSubmit(async (data) => {
    console.log('Profile data submitted:', data)
    // プロフィール情報の保存処理を追加
  })

  return (
    <Flex height='100vh' justifyContent='center' alignItems='center'>
      <VStack spacing='5'>
        <Heading>プロフィール登録</Heading>
        <form onSubmit={onSubmit}>
          <VStack alignItems='left'>
            <FormControl isInvalid={Boolean(errors.username)}>
              <FormLabel htmlFor='username' textAlign='start'>
                ユーザーネーム
              </FormLabel>
              <Input
                id='username'
                autoComplete='username'
                {...register('username', {
                  required: '必須項目です',
                })}
              />
              <FormErrorMessage>
                {errors.username && errors.username.message}
              </FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={Boolean(errors.gender)}>
              <FormLabel htmlFor='gender' textAlign='start'>
                性別
              </FormLabel>
              <Input
                id='gender'
                autoComplete='gender'
                {...register('gender', {
                  required: '必須項目です',
                })}
              />
              <FormErrorMessage>
                {errors.gender && errors.gender.message}
              </FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={Boolean(errors.laboratory)}>
              <FormLabel htmlFor='laboratory' textAlign='start'>
                研究室
              </FormLabel>
              <Input
                id='laboratory'
                autoComplete='organization'
                {...register('laboratory', {
                  required: '必須項目です',
                })}
              />
              <FormErrorMessage>
                {errors.laboratory && errors.laboratory.message}
              </FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={Boolean(errors.studentNumber)}>
              <FormLabel htmlFor='studentNumber' textAlign='start'>
                学籍番号
              </FormLabel>
              <Input
                id='studentNumber'
                autoComplete='student-number'
                {...register('studentNumber', {
                  required: '必須項目です',
                })}
              />
              <FormErrorMessage>
                {errors.studentNumber && errors.studentNumber.message}
              </FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={Boolean(errors.phoneNumber)}>
              <FormLabel htmlFor='phoneNumber' textAlign='start'>
                電話番号
              </FormLabel>
              <Input
                id='phoneNumber'
                autoComplete='tel'
                {...register('phoneNumber', {
                  required: '必須項目です',
                })}
              />
              <FormErrorMessage>
                {errors.phoneNumber && errors.phoneNumber.message}
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
