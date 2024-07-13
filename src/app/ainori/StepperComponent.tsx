import {
  useSteps,
  Box,
  Step,
  StepDescription,
  StepIndicator,
  StepSeparator,
  StepTitle,
  Stepper,
  Image,
  Text,
} from "@chakra-ui/react";

export const defaultSteps = [
  { title: "成立", description: "相乗りが成立しました" },
  { title: "運転中", description: "目的地に向かっています" },
  { title: "到着", description: "目的地に到着しました" },
];

interface StepperComponentProps {
  steps?: { title: string; description: string }[];
  activeStep: number;
  titleFontSize?: string; // タイトルの文字サイズを指定するプロパティ
}

const StepperComponent: React.FC<StepperComponentProps> = ({
  steps = defaultSteps,
  activeStep,
  titleFontSize = "sm",
}) => {
  const { activeStep: index } = useSteps({
    index: activeStep,
    count: steps.length,
  });

  return (
    <Stepper index={index}>
      {steps.map((step, index) => (
        <Step key={index}>
          <StepIndicator>
            {index === 0 && (
              <Image src="/icons/seiritsu.svg" alt="Seiritsu" boxSize="30px" />
            )}
            {index === 1 && (
              <Image src="/icons/car.svg" alt="Car" boxSize="30px" />
            )}
            {index === 2 && (
              <Image src="/icons/arrive.svg" alt="Arrive" boxSize="30px" />
            )}
          </StepIndicator>
          <Box flexShrink="0" textAlign="center">
            <StepTitle>
              <Text fontSize={titleFontSize}>{step.title}</Text>
            </StepTitle>
            <StepDescription>{step.description}</StepDescription>
          </Box>
          {index < steps.length - 1 && <StepSeparator />}
        </Step>
      ))}
    </Stepper>
  );
};

export default StepperComponent;
