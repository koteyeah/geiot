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
} from '../../common/design'
import { db, auth } from '../../lib/firebase/config' // Firebase設定ファイルをインポート
import { doc, setDoc } from 'firebase/firestore'

// フォームで使用する変数の型を定義
type formInputs = {
  username: string
  gender: string
  region: string
  laboratory: string
  studentNumber: string
  phoneNumber: string
}

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

/** プロフィール登録画面
 * @screenname ProfileScreen
 * @description ユーザのプロフィール情報を登録する画面
 */
export default function ProfileScreen() {
  const {
    handleSubmit,
    register,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<formInputs>()
  const router = useRouter();

  const selectedRegion = watch('region');

  const onSubmit = handleSubmit(async (data) => {
    const user = auth.currentUser;
    if (user) {
      const userUid = user.uid;
      const profileRef = doc(db, 'Users', userUid, 'Profile', 'Info');
      await setDoc(profileRef, data);
      console.log('Profile data submitted and saved:', data);
      router.push('/profile2');  // 登録後に profile2 に遷移する
    } else {
      console.error('User not logged in');
    }
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
              <Select
                id='gender'
                autoComplete='gender'
                {...register('gender', {
                  required: '必須項目です',
                })}
              >
                <option value=''>選択してください</option>
                <option value='male'>男性</option>
                <option value='female'>女性</option>
                <option value='other'>その他</option>
              </Select>
              <FormErrorMessage>
                {errors.gender && errors.gender.message}
              </FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={Boolean(errors.region)}>
              <FormLabel htmlFor='region' textAlign='start'>
                領域
              </FormLabel>
              <Select
                id='region'
                autoComplete='region'
                {...register('region', {
                  required: '必須項目です',
                })}
              >
                <option value=''>選択してください</option>
                {Object.keys(labData).map((region) => (
                  <option key={region} value={region}>{region}</option>
                ))}
              </Select>
              <FormErrorMessage>
                {errors.region && errors.region.message}
              </FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={Boolean(errors.laboratory)}>
              <FormLabel htmlFor='laboratory' textAlign='start'>
                研究室
              </FormLabel>
              <Select
                id='laboratory'
                autoComplete='organization'
                {...register('laboratory', {
                  required: '必須項目です',
                })}
                isDisabled={!selectedRegion}
              >
                <option value=''>選択してください</option>
                {selectedRegion && labData[selectedRegion].map((lab: string) => (
                  <option key={lab} value={lab}>{lab}</option>
                ))}
              </Select>
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
                  pattern: {
                    value: /^[0-9]{7}$/,
                    message: '7桁の数字を入力してください',
                  },
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
                  pattern: {
                    value: /^0[789]0-\d{4}-\d{4}$/,
                    message: '正しい日本の携帯電話番号を入力してください（例：090-1234-5678）',
                  },
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
