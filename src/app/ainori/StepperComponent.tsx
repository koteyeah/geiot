import {
  useSteps,
  Box,
  Step,
  StepIndicator,
  StepSeparator,
  StepTitle,
  Stepper,
  Image,
  Text,
  StepStatus,
  StepDescription,
  StepIcon,
  StepNumber,
} from "@chakra-ui/react";

interface StepperComponentProps {
  steps?: { title: string; description: string }[];
  status: string;
}

const defaultSteps = [
  { title: "成立", description: "Start your AINORI" },
  { title: "相乗り中", description: "Enjoy AINORI" },
  { title: "到着", description: "Nice AINORI" },
];

const StepperComponent: React.FC<StepperComponentProps> = ({
  steps = defaultSteps,
  status,
}) => {
  let statusIndex = 0;
  switch (status) {
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
  const { activeStep } = useSteps({
    index: statusIndex + 1,
    count: steps.length,
  });

  return (
    <Stepper index={activeStep}>
      {steps.map((step, index) => (
        <Step key={index}>
          <StepIndicator>
            <StepStatus
              complete={<StepIcon />}
              incomplete={<StepNumber />}
              active={<StepNumber />}
            />
          </StepIndicator>

          <Box flexShrink="0">
            <StepTitle>{step.title}</StepTitle>
            <StepDescription>{step.description}</StepDescription>
          </Box>

          <StepSeparator />
        </Step>
      ))}
    </Stepper>
  );
};

export default StepperComponent;
