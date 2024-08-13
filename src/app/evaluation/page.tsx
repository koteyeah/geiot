"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Text,
  Button,
  Flex,
  Heading,
  VStack,
  HStack,
  IconButton,
} from "@chakra-ui/react";
import { StarIcon } from "@chakra-ui/icons";

export default function EvaluationPage() {
  const [rating, setRating] = useState(0);
  const router = useRouter();

  const handleRatingClick = (index: number) => {
    setRating(index);
  };

  const handleSubmit = () => {
    // ここで評価を送信する処理を追加する
    console.log("評価完了:", rating);
    router.push("/add");
  };

  return (
    <Flex align="center" justify="center" height="100vh">
      <VStack spacing={5}>
        <Heading>評価をお願いします</Heading>
        <HStack spacing={2}>
          {[1, 2, 3, 4, 5].map((index) => (
            <IconButton
              key={index}
              icon={<StarIcon />}
              color={index <= rating ? "yellow.400" : "gray.300"}
              onClick={() => handleRatingClick(index)}
              aria-label={`Star ${index}`}
              size="lg"
              variant="ghost"
            />
          ))}
        </HStack>
        <Button colorScheme="teal" onClick={handleSubmit}>
          評価完了
        </Button>
      </VStack>
    </Flex>
  );
}
