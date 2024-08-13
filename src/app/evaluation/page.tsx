'use client';

import { Button } from '@chakra-ui/react';
import { useRouter } from 'next/navigation';

export default function Page() {
  const router = useRouter();

  const handleComplete = () => {
    router.push('/add');
  };

  return (
    <>
      <p>ここに評価ページが来るよ</p>
      <Button colorScheme="teal" mt={4} onClick={handleComplete}>
        評価完了
      </Button>
    </>
  );
}
