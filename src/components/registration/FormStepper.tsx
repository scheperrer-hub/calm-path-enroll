import { Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

interface FormStepperProps {
  currentStep: number;
  totalSteps: number;
}

export function FormStepper({ currentStep, totalSteps }: FormStepperProps) {
  const { t } = useTranslation();

  const steps = [
    { key: 'person', label: t('registration.steps.person') },
    { key: 'address', label: t('registration.steps.address') },
    { key: 'experience', label: t('registration.steps.experience') },
    { key: 'course', label: t('registration.steps.course') },
    { key: 'review', label: t('registration.steps.review') },
  ];

  return (
    <div className="w-full mb-8 md:mb-12">
      {/* Mobile view - simple progress */}
      <div className="md:hidden">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-foreground">
            {t('registration.steps.person')} {currentStep + 1} / {totalSteps}
          </span>
          <span className="text-sm text-muted-foreground">
            {steps[currentStep]?.label}
          </span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary transition-all duration-500 ease-out rounded-full"
            style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {/* Desktop view - full stepper */}
      <div className="hidden md:flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.key} className="flex items-center flex-1">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "step-indicator",
                  index < currentStep && "step-indicator-complete",
                  index === currentStep && "step-indicator-active",
                  index > currentStep && "step-indicator-inactive"
                )}
              >
                {index < currentStep ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>
              <span 
                className={cn(
                  "mt-2 text-xs font-medium transition-colors text-center",
                  index <= currentStep ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div 
                className={cn(
                  "flex-1 h-0.5 mx-4 transition-colors",
                  index < currentStep ? "bg-forest-light" : "bg-muted"
                )}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
