'use client'
import { useRouter } from 'next/navigation'
import { Button, Flex, Heading, VStack } from '../../common/design'

export default function HomeScreen() {
  const router = useRouter()

  return (
    <Flex height='100vh' justifyContent='center' alignItems='center'>
      <VStack spacing='5'>
        <Heading>Home</Heading>
        <Button
          color='white'
          bg='teal.400'
          onClick={() => router.push('/userdata')}
          _hover={{
            borderColor: 'transparent',
            boxShadow: '0 7px 10px rgba(0, 0, 0, 0.3)',
          }}
        >
          ユーザーデータへ
        </Button>
      </VStack>
    </Flex>
  )
}
