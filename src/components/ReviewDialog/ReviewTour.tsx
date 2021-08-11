import React from 'react';
import Tour, { ReactourStep } from 'reactour';
import { Typography, useTheme } from '@material-ui/core';
import AuditOptIn from './AuditOptIn';

export interface ReviewTourProps {
  open?: boolean;
  onClose?: () => void;
}

const ReviewTour = ({ open, onClose }: ReviewTourProps) => {
  const steps: ReactourStep[] = [
    {
      content: (
        <>
          <Typography paragraph={true}>
            The review process is the core of Readily, so it’s worth spending a
            minute to make sure you understand it.
          </Typography>
          <Typography paragraph={true}>It’ll be quick, I promise.</Typography>
        </>
      ),
    },
    {
      selector: '[data-tour="card"]',
      content: (
        <Typography>
          During the review, you’ll be presented with your saved items one by
          one.
        </Typography>
      ),
    },
    {
      selector: '[data-tour="later"]',
      content: (
        <>
          <Typography paragraph={true}>
            If you still find the item interesting but you’re not ready to read
            it just yet, mark it for <i>later</i>.
          </Typography>
          <Typography>
            The algorithm will remind you about it again after some time.
          </Typography>
        </>
      ),
    },
    {
      selector: '[data-tour="delete"]',
      content: (
        <Typography>
          If the item is no longer interesting, just <i>delete</i> it.
        </Typography>
      ),
    },
    {
      selector: '[data-tour="archive"]',
      content: (
        <Typography>
          If you’re done with the item, <i>archive</i> it.
        </Typography>
      ),
    },
    {
      selector: '[data-tour="pin"]',
      content: (
        <>
          <Typography paragraph={true}>
            If you want to read the item today, <i>pin</i> it.
          </Typography>
          <Typography>
            Pinned items are shown on your home page as a reminder. And they are
            also excluded from reviews.
          </Typography>
        </>
      ),
    },
    {
      selector: '[data-tour="close"]',
      content: (
        <Typography>
          If review is taking too long or you have already selected a couple of
          items to read, you can always end the review prematurely by clicking
          the <i>close</i> button.
        </Typography>
      ),
    },
    {
      content: <AuditOptIn onClose={onClose} />,
    },
  ];

  const theme = useTheme();

  const [currentStep, setCurrentStep] = React.useState(0);

  return (
    <Tour
      isOpen={open ?? false}
      steps={steps}
      badgeContent={(current, total) => `${current}/${total}`}
      // Not really close, but we need to catch the mask clicks
      closeWithMask={true}
      // the highlighted component is not clickable
      disableInteraction={true}
      // Not sure what this is, but this produces warnings in the console.
      disableFocusLock={true}
      showCloseButton={false}
      rounded={4}
      accentColor={theme.palette.secondary.main}
      // The following two are used to control the current step on mask click / esc press.
      getCurrentStep={setCurrentStep}
      goToStep={currentStep}
      onRequestClose={() => {
        // This is either a mask click or an escape press. In either
        // case, we just advance the step.
        setCurrentStep((s) => s + 1);
      }}
      lastStepNextButton={<div />}
    />
  );
};

export default ReviewTour;
