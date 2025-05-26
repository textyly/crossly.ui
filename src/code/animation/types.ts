export interface IAnimation {
    jumpTo(percent: number): void; // Different name than percent

    manualNext(): void;
    manualPrev(): void;

    startForwardAnimate(speed: number): void;
    startBackwardAnimate(speed: number): void;
    stopAnimate(): void;
}