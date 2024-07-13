import {
  Box,
  HStack,
  Avatar,
  Text,
  Icon,
  Image,
  VStack,
} from "@chakra-ui/react";
// import { FaHeart, FaStar } from "react-icons/fa";

interface ProfileCardProps {
  name: string;
  date: string;
  time: string;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ name, date, time }) => (
  <Box
    borderWidth="1px"
    borderRadius="lg"
    overflow="hidden"
    p={5}
    bg="gray.100"
    width="100%"
  >
    <VStack align="start" spacing={3} width="100%">
      <HStack justifyContent="space-between" spacing={1} mb={1} width="100%">
        <HStack spacing={1}>
          {[...Array(5)].map((_, index) => (
            // <Icon key={index} as={FaStar} w={4} h={4} color="black" />
          ))}
        </HStack>
        <HStack justifyContent="space-between" mt={3} width="10%">
          <Image src="/icons/no_smoking.svg" alt="No Smoking" boxSize="30px" />
          <Image src="/icons/no_pets.svg" alt="No Pets" boxSize="30px" />
          <Image src="/icons/no_eating.svg" alt="No Eating" boxSize="30px" />
        </HStack>
        {/* <Icon as={FaHeart} w={6} h={6} color="gray.500" /> */}
      </HStack>
      <Text fontWeight="bold" ml={2}>
        学研北生駒まで
      </Text>
      <HStack justifyContent="space-between" width="100%">
        <HStack spacing={3}>
          <Avatar name={name} />
          <Box>
            <Text fontWeight="bold">{name}</Text>
            <Text fontSize="sm">{date}</Text>
            <Text fontSize="sm">{time}発</Text>
            <Text fontSize="sm">相乗り者:1人</Text>
            <Text fontSize="sm">車種： </Text>
          </Box>
        </HStack>
      </HStack>
    </VStack>
  </Box>
);

export default ProfileCard;
