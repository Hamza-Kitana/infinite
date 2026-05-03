import React, {
  Children,
  Fragment,
  useLayoutEffect,
  useRef,
  useState,
  type ComponentProps,
  type ReactElement,
  type ReactNode,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import "./Stepper.css";

export type StepperProps = Omit<ComponentProps<"div">, "children"> & {
  children: ReactNode;
  initialStep?: number;
  onStepChange?: (step: number) => void;
  onFinalStepCompleted?: () => void;
  /** إرجاع false يمنع الانتقال (تحقق من الحقول الحالية) */
  validateStep?: (currentStep: number) => boolean;
  stepCircleContainerClassName?: string;
  stepContainerClassName?: string;
  contentClassName?: string;
  footerClassName?: string;
  backButtonProps?: ComponentProps<"button">;
  nextButtonProps?: ComponentProps<"button">;
  backButtonText?: string;
  nextButtonText?: string;
  finalButtonText?: string;
  disableStepIndicators?: boolean;
  renderStepIndicator?: (ctx: {
    step: number;
    currentStep: number;
    onStepClick: (clicked: number) => void;
  }) => ReactNode;
  /** إن كان true: زر الخطوة الأخيرة يستدعي `onFinalStepCompleted` دون إنهاء السلايدر (مثلاً لعرض شاشة نجاح خارجية) */
  stayOnLastStepAfterSubmit?: boolean;
};

export default function Stepper({
  children,
  initialStep = 1,
  onStepChange = () => {},
  onFinalStepCompleted = () => {},
  validateStep,
  stepCircleContainerClassName = "",
  stepContainerClassName = "",
  contentClassName = "",
  footerClassName = "",
  backButtonProps = {},
  nextButtonProps = {},
  backButtonText = "السابق",
  nextButtonText = "التالي",
  finalButtonText = "إتمام",
  disableStepIndicators = false,
  renderStepIndicator,
  stayOnLastStepAfterSubmit = false,
  className,
  ...rest
}: StepperProps) {
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [direction, setDirection] = useState(0);
  const stepsArray = Children.toArray(children) as ReactElement[];
  const totalSteps = stepsArray.length;
  const isCompleted = currentStep > totalSteps;
  const isLastStep = currentStep === totalSteps;

  const updateStep = (newStep: number) => {
    setCurrentStep(newStep);
    if (newStep > totalSteps) {
      onFinalStepCompleted();
    } else {
      onStepChange(newStep);
    }
  };

  /** الانتقال لخطوة معيّنة: للأمام يُتحقق من كل خطوة بين الحالية والهدف؛ للخلف بدون تحقق */
  const goToStep = (clicked: number) => {
    if (clicked === currentStep) return;
    if (clicked < 1 || clicked > totalSteps) return;

    if (clicked < currentStep) {
      setDirection(-1);
      updateStep(clicked);
      return;
    }

    if (validateStep) {
      for (let s = currentStep; s < clicked; s += 1) {
        if (!validateStep(s)) return;
      }
    }
    setDirection(1);
    updateStep(clicked);
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setDirection(-1);
      updateStep(currentStep - 1);
    }
  };

  const handleNext = () => {
    if (validateStep && !validateStep(currentStep)) return;
    if (!isLastStep) {
      setDirection(1);
      updateStep(currentStep + 1);
    }
  };

  const handleComplete = () => {
    if (validateStep && !validateStep(currentStep)) return;
    setDirection(1);
    if (stayOnLastStepAfterSubmit) {
      onFinalStepCompleted();
      return;
    }
    updateStep(totalSteps + 1);
  };

  return (
    <div className={cn("stepper-outer", className)} {...rest}>
      <div className={cn("step-circle-container", stepCircleContainerClassName)}>
        <div className={cn("step-indicator-row", stepContainerClassName)}>
          {stepsArray.map((_, index) => {
            const stepNumber = index + 1;
            const isNotLastStep = index < totalSteps - 1;
            return (
              <Fragment key={stepNumber}>
                {renderStepIndicator ? (
                  renderStepIndicator({
                    step: stepNumber,
                    currentStep,
                    onStepClick: goToStep,
                  })
                ) : (
                  <StepIndicator
                    step={stepNumber}
                    disableStepIndicators={disableStepIndicators}
                    currentStep={currentStep}
                    onClickStep={goToStep}
                  />
                )}
                {isNotLastStep && <StepConnector isComplete={currentStep > stepNumber} />}
              </Fragment>
            );
          })}
        </div>

        <StepContentWrapper
          isCompleted={isCompleted}
          currentStep={currentStep}
          direction={direction}
          className={cn("step-content-default", contentClassName)}
        >
          {stepsArray[currentStep - 1]}
        </StepContentWrapper>

        {!isCompleted && (
          <div className={cn("footer-container", footerClassName)} dir="ltr">
            <div
              className={cn("footer-nav", currentStep !== 1 ? "spread" : "end")}
            >
              {currentStep !== 1 && (
                <button
                  type="button"
                  onClick={handleBack}
                  className={cn("stepper-back-button", currentStep === 1 ? "inactive" : "")}
                  {...backButtonProps}
                >
                  {backButtonText}
                </button>
              )}
              <button
                type="button"
                onClick={isLastStep ? handleComplete : handleNext}
                className="stepper-next-button"
                {...nextButtonProps}
              >
                {isLastStep ? finalButtonText : nextButtonText}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

type StepContentWrapperProps = {
  isCompleted: boolean;
  currentStep: number;
  direction: number;
  children: ReactNode;
  className?: string;
};

function StepContentWrapper({
  isCompleted,
  currentStep,
  direction,
  children,
  className,
}: StepContentWrapperProps) {
  const [parentHeight, setParentHeight] = useState(0);

  return (
    <motion.div
      className={className}
      style={{ position: "relative", overflow: "hidden" }}
      animate={{ height: isCompleted ? 0 : parentHeight }}
      transition={{ type: "spring", duration: 0.45 }}
    >
      <AnimatePresence initial={false} mode="sync" custom={direction}>
        {!isCompleted && (
          <SlideTransition key={currentStep} direction={direction} onHeightReady={setParentHeight}>
            {children}
          </SlideTransition>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

type SlideTransitionProps = {
  children: ReactNode;
  direction: number;
  onHeightReady: (h: number) => void;
};

function SlideTransition({ children, direction, onHeightReady }: SlideTransitionProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (containerRef.current) {
      onHeightReady(containerRef.current.offsetHeight);
    }
  }, [children, onHeightReady]);

  return (
    <motion.div
      ref={containerRef}
      custom={direction}
      variants={stepVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
      style={{ position: "absolute", left: 0, right: 0, top: 0 }}
    >
      {children}
    </motion.div>
  );
}

const stepVariants = {
  enter: (dir: number) => ({
    x: dir >= 0 ? "100%" : "-100%",
    opacity: 0,
  }),
  center: {
    x: "0%",
    opacity: 1,
  },
  exit: (dir: number) => ({
    x: dir >= 0 ? "-45%" : "45%",
    opacity: 0,
  }),
};

export function Step({ children }: { children: ReactNode }) {
  return <div className="step-default">{children}</div>;
}

type StepIndicatorProps = {
  step: number;
  currentStep: number;
  onClickStep: (step: number) => void;
  disableStepIndicators?: boolean;
};

function StepIndicator({ step, currentStep, onClickStep, disableStepIndicators }: StepIndicatorProps) {
  const status = currentStep === step ? "active" : currentStep < step ? "inactive" : "complete";

  const handleClick = () => {
    if (step !== currentStep && !disableStepIndicators) {
      onClickStep(step);
    }
  };

  return (
    <motion.button
      type="button"
      onClick={handleClick}
      className={cn(
        "step-indicator rounded-full border border-transparent p-0 transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
        disableStepIndicators && "pointer-events-none opacity-50",
      )}
      whileHover={disableStepIndicators ? undefined : { scale: 1.05 }}
      whileTap={disableStepIndicators ? undefined : { scale: 0.98 }}
    >
      <div
        className={cn(
          "step-indicator-inner border transition-colors duration-300",
          status === "inactive" && "border-border/80 bg-muted text-muted-foreground",
          status === "active" &&
            "scale-105 border-primary bg-gradient-neon text-primary-foreground shadow-[0_0_20px_hsl(var(--primary)/0.45)]",
          status === "complete" && "border-primary/60 bg-primary text-primary-foreground shadow-[0_0_16px_hsl(var(--primary)/0.35)]",
        )}
      >
        {status === "complete" ? (
          <CheckIcon className="check-icon" />
        ) : status === "active" ? (
          <span className="active-dot" />
        ) : (
          <span className="step-number">{step}</span>
        )}
      </div>
    </motion.button>
  );
}

function StepConnector({ isComplete }: { isComplete: boolean }) {
  return (
    <div className="step-connector">
      <motion.div
        className="absolute left-0 top-0 h-full rounded-sm bg-gradient-to-l from-primary to-secondary"
        initial={false}
        animate={{ width: isComplete ? "100%" : "0%" }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      />
    </div>
  );
}

function CheckIcon(props: ComponentProps<"svg">) {
  return (
    <svg {...props} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden>
      <motion.path
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ delay: 0.06, type: "tween", ease: "easeOut", duration: 0.35 }}
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5 13l4 4L19 7"
      />
    </svg>
  );
}
