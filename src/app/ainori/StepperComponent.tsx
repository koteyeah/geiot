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

export const defaultSteps = ["成立", "相乗り中", "到着"];

interface StepperComponentProps {
  steps?: string[];
  activeStep: string;
}

const StepperComponent: React.FC<StepperComponentProps> = ({
  steps = defaultSteps,
  activeStep,
}) => {
  let statusIndex = 0;
  switch (activeStep) {
    case "成立":
      statusIndex = 0;
      break;
    case "相乗り中":
      statusIndex = 1;
      break;
    case "到着":
      statusIndex = 2;
      break;
  }

  return (
    <Stepper index={statusIndex + 1}>
      {steps.map((step) => (
        <Step key={step}>
          <StepIndicator>
            {step === "成立" && (
              <Image src="/icons/seiritsu.svg" alt="Seiritsu" boxSize="30px" />
            )}
            {step === "相乗り中" && (
              <Image src="/icons/car.svg" alt="Car" boxSize="30px" />
            )}
            {step === "到着" && (
              <Image src="/icons/arrive.svg" alt="Arrive" boxSize="30px" />
            )}
          </StepIndicator>
          <Box flexShrink="0" textAlign="center">
            <StepTitle>
              <Text fontSize={"sm"}>{step}</Text>
            </StepTitle>
          </Box>
          {statusIndex < steps.length - 1 && <StepSeparator />}
        </Step>
      ))}
    </Stepper>
  );
};

export default StepperComponent;
