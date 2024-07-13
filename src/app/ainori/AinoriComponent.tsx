import { useRouter } from "next/navigation";
import { Text, Button, Flex, Heading, VStack, Box, Avatar } from "../../common/design";
import { DocumentData } from "firebase/firestore";
import {
    Step,
    StepDescription,
    StepIndicator,
    StepNumber,
    StepSeparator,
    StepTitle,
    Stepper,
    Image,
    Icon,
    HStack,
} from "@chakra-ui/react";
import { FaCarSide, FaCheckCircle, FaMapMarkerAlt, FaHeart } from "react-icons/fa";

const steps = [
    { title: "成立", description: "相乗りが成立しました" },
    { title: "運転中", description: "目的地に向かっています" },
    { title: "到着", description: "目的地に到着しました" },
];

const ProfileCard = ({ name, date, time }: { name: string; date: string; time: string }) => (
    <Box borderWidth="1px" borderRadius="lg" overflow="hidden" p={5} bg="gray.100">
        <HStack justifyContent={"space-between"}>
            <HStack spacing={3}>
                <Avatar name={name} />
                <Box>
                    <Text fontWeight="bold">{name}</Text>
                    <Text fontSize="sm">{date}</Text>
                    <Text fontSize="sm">{time}発</Text>
                </Box>
            </HStack>
            <Icon as={FaHeart} w={6} h={6} color="gray.500" />
        </HStack>
        <HStack justifyContent="space-between" mt={3}>
            <Icon as={FaCheckCircle} w={6} h={6} color="green.500" />
            <Icon as={FaCarSide} w={6} h={6} color="blue.500" />
            <Icon as={FaMapMarkerAlt} w={6} h={6} color="purple.500" />
        </HStack>
    </Box>
);

export default function AinoriComponent({
    status,
    userType,
    otherUserData,
    ainoriData,
    handleRideButton,
    handleGetOffButton,
}: {
    status: string | null;
    userType: string | null;
    otherUserData: DocumentData | null;
    ainoriData: DocumentData | null;
    handleRideButton: () => Promise<void>;
    handleGetOffButton: () => Promise<void>;
}) {
    const router = useRouter();
    const loading = true;  // For testing purposes, set loading to true.

    if (loading) {
        return (
            <Flex align="center" justify="center" height="100vh">
                <VStack spacing={5}>
                    <Heading>Loading...</Heading>
                    <Stepper size="lg" colorScheme='red' index={0} gap="0">
                        {steps.map((step, index) => (
                            <Step key={index}>
                                <StepIndicator>
                                    {index === 0 && <Icon as={FaCheckCircle} w={8} h={8} color="green.500" />}
                                    {index === 1 && <Icon as={FaCarSide} w={8} h={8} color="blue.500" />}
                                    {index === 2 && <Icon as={FaMapMarkerAlt} w={8} h={8} color="purple.500" />}
                                </StepIndicator>
                                <Flex flexDirection="column" alignItems="center">
                                    <StepTitle>{step.title}</StepTitle>
                                    <StepDescription>{step.description}</StepDescription>
                                </Flex>
                                <StepSeparator />
                            </Step>
                        ))}
                    </Stepper>
                    <ProfileCard name="鈴木 松" date="2024年7月17日" time="18:30" />
                </VStack>
            </Flex>
        );
    }

    if (status == null)
        return (
            <Heading>
                相乗り処理は行われていません！<br></br>
                掲示板から相乗りを利用してみよう。
            </Heading>
        );

    let activeStep = 0;
    switch (status) {
        case "成立中":
            activeStep = 0;
            break;
        case "相乗り中":
            activeStep = 1;
            break;
        case "相乗り終了":
            activeStep = 2;
            break;
        default:
            activeStep = 0;
            break;
    }

    return (
        <Flex align="center" justify="center" height="100vh">
            <VStack spacing={5}>
                {status && (
                    <Stepper size="lg" colorScheme='red' index={activeStep} gap="0">
                        {steps.map((step, index) => (
                            <Step key={index}>
                                <StepIndicator>
                                    {index === 0 && <Icon as={FaCheckCircle} w={8} h={8} color="green.500" />}
                                    {index === 1 && <Icon as={FaCarSide} w={8} h={8} color="blue.500" />}
                                    {index === 2 && <Icon as={FaMapMarkerAlt} w={8} h={8} color="purple.500" />}
                                </StepIndicator>
                                <Flex flexDirection="column" alignItems="center">
                                    <StepTitle>{step.title}</StepTitle>
                                    <StepDescription>{step.description}</StepDescription>
                                </Flex>
                                <StepSeparator />
                            </Step>
                        ))}
                    </Stepper>
                )}
                {(status == "成立中" || status == "相乗り中") && (
                    <ProfileCard name="鈴木 松" date="2024年7月17日" time="18:30" />
                )}
                {status == "募集中" && <Text>現在相乗りを募集しています。</Text>}
                {ainoriData && <Text>ここに相乗り情報を表示。</Text>}
                {status == "成立中" && (
                    <>
                        <Heading>
                            相乗りが成立しています。出発時刻に遅れないようにしましょう。
                        </Heading>
                        {userType === "ドライバー" ? (
                            <Button
                                onClick={() => {
                                    router.refresh();
                                }}
                            >
                                更新
                            </Button>
                        ) : (
                            <>
                                <Text>ドライバーと合流したら乗車するを押してください。</Text>
                                <Button onClick={handleRideButton}>乗車する</Button>
                            </>
                        )}
                    </>
                )}
                {status == "相乗り中" && (
                    <>
                        <Heading>
                            相乗り中です。目的地まで安全に相乗りを楽しんで！
                        </Heading>
                        {userType === "ドライバー" ? (
                            <Button
                                onClick={() => {
                                    router.refresh();
                                }}
                            >
                                更新
                            </Button>
                        ) : (
                            <>
                                <Text>目的地に到着したら降車するを押してください</Text>
                                <Button onClick={handleGetOffButton}>降車する</Button>
                            </>
                        )}
                    </>
                )}
                {status == "相乗り終了" && userType == "乗客" && (
                    <>
                        <Heading>
                            相乗りは完了しました！またのご利用お待ちしています！
                        </Heading>
                        <Text fontSize="3xl">別のページに移動してください</Text>
                    </>
                )}
            </VStack>
        </Flex>
    );
}
