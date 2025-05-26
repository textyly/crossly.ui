export interface IAnimation {
    jumpTo(percent: number): void; // Different name than percent

    manualNext(): void;
    manualPrev(): void;

    startAnimate(speed: number): void;
    stopAnimate(): void;
}