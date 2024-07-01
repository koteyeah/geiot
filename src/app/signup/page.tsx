'use client'
import NextLink from 'next/link'
import { useRouter } from 'next/navigation'
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
  InputGroup,
  InputRightElement,
  useToast,
  VStack,
} from '../../common/design'
import { signUpWithEmail } from '../../lib/firebase/apis/auth'

// フォームで使用する変数の型を定義
type formInputs = {
  email: string
  password: string
  confirm: string
}

/** サインアップ画面
 * @screenname SignUpScreen
 * @description ユーザの新規登録を行う画面
 */
export default function SignUpScreen() {
  const router = useRouter()
  const toast = useToast()
  const {
    handleSubmit,
    register,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<formInputs>()

  const [password, setPassword] = useState(false)
  const [confirm, setConfirm] = useState(false)

  const onSubmit = handleSubmit(async (data) => {
    await signUpWithEmail({
      email: data.email,
      password: data.password,
    }).then((res: boolean) => {
      if (res) {
        console.log('ログイン成功')
      } else {
        console.log('ログイン失敗')
      }
    })
  })

  const passwordClick = () => setPassword(!password)
  const confirmClick = () => setConfirm(!confirm)

  return (
    <Flex height='100vh' justifyContent='center' alignItems='center'>
      <VStack spacing='5'>
        <Heading>新規登録</Heading>
        <form onSubmit={onSubmit}>
          <VStack alignItems='left'>
            <FormControl isInvalid={Boolean(errors.email)}>
              <FormLabel htmlFor='email' textAlign='start'>
                メールアドレス
              </FormLabel>
              <Input
                id='email'
                {...register('email', {
                  required: '必須項目です',
                  maxLength: {
                    value: 50,
                    message: '50文字以内で入力してください',
                  },
                  pattern: {
                    value:
                      /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@naist\.ac\.jp$/,
                    message: 'メールアドレスの形式が違います',
                  },
                })}
              />
	      // エラーが表示される
              <FormErrorMessage>
                {errors.email && errors.email.message}
              </FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={Boolean(errors.password)}>
              <FormLabel htmlFor='password'>パスワード</FormLabel>
              <InputGroup size='md'>
                <Input
                  pr='4.5rem'
                  type={password ? 'text' : 'password'}
                  {...register('password', {
                    required: '必須項目です',
                    minLength: {
                      value: 8,
                      message: '8文字以上で入力してください',
                    },
                    maxLength: {
                      value: 50,
                      message: '50文字以内で入力してください',
                    },
                    pattern: {
                      value: /^(?=.*[A-Z])[0-9a-zA-Z]*$/,
                      message:
                        '半角英数字かつ少なくとも1つの大文字を含めてください',
                    },
                  })}
                />
                <InputRightElement width='4.5rem'>
                  <Button h='1.75rem' size='sm' onClick={passwordClick}>
                    {password ? 'Hide' : 'Show'}
                  </Button>
                </InputRightElement>
              </InputGroup>
	      // エラーが表示される
              <FormErrorMessage>
                {errors.password && errors.password.message}
              </FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={Boolean(errors.confirm)}>
              <FormLabel htmlFor='confirm'>パスワード確認</FormLabel>
              <InputGroup size='md'>
                <Input
                  pr='4.5rem'
                  type={confirm ? 'text' : 'password'}
                  {...register('confirm', {
                    required: '必須項目です',
                    minLength: {
                      value: 8,
                      message: '8文字以上で入力してください',
                    },
                    maxLength: {
                      value: 50,
                      message: '50文字以内で入力してください',
                    },
                    pattern: {
                      value: /^(?=.*[A-Z])[0-9a-zA-Z]*$/,
                      message:
                        '半角英数字かつ少なくとも1つの大文字を含めてください',
                    },
                    validate: (value) =>
                      value === getValues('password') ||
                      'パスワードが一致しません',
                  })}
                />
                <InputRightElement width='4.5rem'>
                  <Button h='1.75rem' size='sm' onClick={confirmClick}>
                    {confirm ? 'Hide' : 'Show'}
                  </Button>
                </InputRightElement>
              </InputGroup>
	      // エラーが表示される
              <FormErrorMessage>
                {errors.confirm && errors.confirm.message}
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
              新規登録
            </Button>
          </VStack>
        </form>
        <Button
          as={NextLink}
          href='/signin'
          bg='white'
          width='100%'
          _hover={{
            borderColor: 'transparent',
            boxShadow: '0 7px 10px rgba(0, 0, 0, 0.3)',
          }}
        >
          ログインはこちらから
        </Button>
      </VStack>
    </Flex>
  )
}