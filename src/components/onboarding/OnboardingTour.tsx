'use client';

import React, { useState } from 'react';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import WelcomeModal from './WelcomeModal';
import SpotlightOverlay from './SpotlightOverlay';
import TourTooltip from './TourTooltip';
import SkipConfirmModal from './SkipConfirmModal';
import CompletionModal from './CompletionModal';

interface TargetRect {
    top: number;
    left: number;
    width: number;
    height: number;
}

export default function OnboardingTour() {
    const {
        isOpen,
        isWelcomeOpen,
        isCompletionOpen,
        isSkipConfirmOpen,
        stepIndex,
        currentStep,
        steps,
        totalSteps,
        startTour,
        nextStep,
        prevStep,
        promptSkip,
        cancelSkip,
        confirmSkip,
        finishTour,
        userRole,
        isLoadingStatus
    } = useOnboarding();

    const isMobile = useMediaQuery('(max-width: 768px)');
    const [targetRect, setTargetRect] = useState<TargetRect | null>(null);

    // If still determining if user needs onboarding, don't flash
    if (isLoadingStatus) return null;

    const targetSelector = currentStep ? `[data-onboarding="${currentStep.target}"]` : '';

    return (
        <>
            {/* 1. Welcome Screen Modal */}
            <WelcomeModal
                isOpen={isWelcomeOpen}
                role={userRole}
                totalSteps={totalSteps}
                onStart={startTour}
                onSkip={promptSkip}
            />

            {/* 2. Interactive Spotlight Tour Overlay (Desktop & Tablet) */}
            {isOpen && !isMobile && currentStep && (
                <SpotlightOverlay
                    targetSelector={targetSelector}
                    onClickBackdrop={promptSkip}
                    onTargetRectUpdate={setTargetRect}
                />
            )}

            {/* 3. Floating Contextual Tour Tooltip / Mobile Bottom Sheet */}
            {isOpen && currentStep && (
                <TourTooltip
                    step={currentStep}
                    stepIndex={stepIndex}
                    totalSteps={totalSteps}
                    targetRect={targetRect}
                    isMobile={isMobile}
                    onNext={nextStep}
                    onPrev={prevStep}
                    onSkip={promptSkip}
                />
            )}

            {/* 4. Skip Confirmation Modal */}
            <SkipConfirmModal
                isOpen={isSkipConfirmOpen}
                onContinue={cancelSkip}
                onConfirmSkip={confirmSkip}
            />

            {/* 5. Completion Screen Modal */}
            <CompletionModal
                isOpen={isCompletionOpen}
                steps={steps}
                onFinish={finishTour}
            />
        </>
    );
}
