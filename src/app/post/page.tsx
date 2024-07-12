'use client'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import {
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  VStack,
  Select,
  Stack,
  Box,
  Textarea,
  Text,
} from '../../common/design'
import { db, auth } from '../../lib/firebase/config'
import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore'

// フォームで使用する変数の型を定義
type formInputs = {
  year: string
  month: string
  day: string
  hour: string
  minute: string
  goal_spot: string
  start_spot: string
  remarks: string
}

/** ドライバー登録画面
 * @screenname DriverRegistrationScreen
 * @description ユーザーがドライバー登録を行う画面
 */
export default function DriverRegistrationScreen() {
  const { handleSubmit, register, formState: { errors, isSubmitting } } = useForm<formInputs>()
  const router = useRouter()
  const [isDriverProfileRegistered, setIsDriverProfileRegistered] = useState(true)
  
  useEffect(() => {
    const checkDriverProfile = async () => {
      const user = auth.currentUser
      if (user) {
        const userUid = user.uid
        const docRef = doc(db, 'Users', userUid, 'Profile', 'Info')
        const docSnap = await getDoc(docRef)
        
        if (docSnap.exists()) {
          const data = docSnap.data()
          if (data.driverProfile === "未登録") {
            setIsDriverProfileRegistered(false)
          }
        } else {
          setIsDriverProfileRegistered(false)
        }
      }
    }
    
    checkDriverProfile()
  }, [])

  const onSubmit = handleSubmit(async (data) => {
    const user = auth.currentUser
    if (user) {
      const userUid = user.uid

      // 出発時刻を統合してFirebaseのTimestampとして保存
      const start_time = Timestamp.fromDate(new Date(
        parseInt(data.year),
        parseInt(data.month) - 1,
        parseInt(data.day),
        parseInt(data.hour),
        parseInt(data.minute)
      ))

      const driverData = {
        driver: userUid,
        goal_spot: data.goal_spot,
        remarks: data.remarks,
        start_spot: data.start_spot,
        start_time: start_time,
        status: "募集中", // 初期ステータスを設定
        actual_goal_time: null,
        actual_start_time: null,
        driver_feedback: null,
        driver_rate: null,
        passenger: null,
        passenger_feedback: null,
        passenger_rate: null,
      }

      const driverRef = doc(db, 'ainories', userUid) // ドライバーUIDをキーとしてドキュメントを作成

      // データが既に存在する場合は更新し、存在しない場合は新規作成
      await setDoc(driverRef, driverData, { merge: true })

      console.log('Driver data submitted and saved:', driverData)
      router.push('/home')  // 登録後に home に遷移する
    } else {
      console.error('User not logged in')
    }
  })

  return (
    <Flex height='100vh' justifyContent='center' alignItems='center'>
      <VStack spacing='1'>
        <Heading>ドライブ登録</Heading>
        <Text fontSize='sm'>Drive Registration</Text>
        <form onSubmit={onSubmit}>
          <VStack alignItems='left'>
            <FormControl isInvalid={Boolean(errors.year)}>
              <FormLabel htmlFor='year' textAlign='start'>
                出発時刻 (departure time)
              </FormLabel>
              <Flex alignItems="center">
                <Box mr='2'>
                  <Select
                    id='year'
                    autoComplete='year'
                    {...register('year', {
                      required: '必須項目です',
                    })}
                    width='90px'
                  >
                    <option value=''>年</option>
                    <option value='2024'>2024</option>
                    <option value='2025'>2025</option>
                  </Select>
                </Box>
                <Box mr='2'>年</Box>
                <Box mr='2'>
                  <Select
                    id='month'
                    autoComplete='month'
                    {...register('month', {
                      required: '必須項目です',
                    })}
                    width='70px'
                  >
                    <option value=''>月</option>
                    {Array.from(Array(12).keys()).map((month) => (
                      <option key={month + 1} value={month + 1}>
                        {month + 1}
                      </option>
                    ))}
                  </Select>
                </Box>
                <Box mr='2'>月</Box>
                <Box mr='2'>
                  <Select
                    id='day'
                    autoComplete='day'
                    {...register('day', {
                      required: '必須項目です',
                    })}
                    width='70px'
                  >
                    <option value=''>日</option>
                    {Array.from(Array(31).keys()).map((day) => (
                      <option key={day + 1} value={day + 1}>
                        {day + 1}
                      </option>
                    ))}
                  </Select>
                </Box>
                <Box mr='2'>日</Box>
                <Box mr='2'>
                  <Select
                    id='hour'
                    autoComplete='hour'
                    {...register('hour', {
                      required: '必須項目です',
                    })}
                    width='70px'
                  >
                    <option value=''>時</option>
                    {Array.from(Array(24).keys()).map((hour) => (
                      <option key={hour} value={hour}>
                        {hour}
                      </option>
                    ))}
                  </Select>
                </Box>
                <Box mr='2'>時</Box>
                <Box mr='2'>
                  <Select
                    id='minute'
                    autoComplete='minute'
                    {...register('minute', {
                      required: '必須項目です',
                    })}
                    width='70px'
                  >
                    <option value=''>分</option>
                    {Array.from(Array(60).keys()).map((minute) => (
                      <option key={minute} value={minute}>
                        {minute}
                      </option>
                    ))}
                  </Select>
                </Box>
                <Box>分</Box>
              </Flex>
              <FormErrorMessage>
                {errors.year && errors.year.message}
              </FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={Boolean(errors.goal_spot)}>
              <FormLabel htmlFor='goal_spot' textAlign='start'>
                行き先 (goal spot)
              </FormLabel>
              <Select
                id='goal_spot'
                autoComplete='goal_spot'
                {...register('goal_spot', {
                  required: '必須項目です',
                })}
              >
                <option value=''>選択してください</option>
                <option value='学研北生駒駅'>学研北生駒駅</option>
                <option value='学研奈良登美ヶ丘駅'>学研奈良登美ヶ丘駅</option>
                <option value='UR中富美'>UR中富美</option>
              </Select>
              <FormErrorMessage>
                {errors.goal_spot && errors.goal_spot.message}
              </FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={Boolean(errors.start_spot)}>
              <FormLabel htmlFor='start_spot' textAlign='start'>
                集合場所 (start spot)
              </FormLabel>
              <Select
                id='start_spot'
                autoComplete='start_spot'
                {...register('start_spot', {
                  required: '必須項目です',
                })}
              >
                <option value=''>選択してください</option>
                <option value='正門前'>正門前</option>
                <option value='サイエンスプラザ駐車場'>サイエンスプラザ駐車場</option>
              </Select>
              <FormErrorMessage>
                {errors.start_spot && errors.start_spot.message}
              </FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={Boolean(errors.remarks)}>
              <FormLabel htmlFor='remarks' textAlign='start'>
                備考 (remarks)
              </FormLabel>
              <Textarea
                id='remarks'
                autoComplete='remarks'
                {...register('remarks')}
                rows={3}
              />
              <FormErrorMessage>
                {errors.remarks && errors.remarks.message}
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
              isDisabled={!isDriverProfileRegistered}
            >
              登録 (Register)
            </Button>
            {!isDriverProfileRegistered && (
              <Text color='red.500'>ドライバー情報が未登録です</Text>
            )}
          </VStack>
        </form>
      </VStack>
    </Flex>
  )
}
