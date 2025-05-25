export interface IAnimation {
    jumpTo(percent: number): Promise<void>; // Different name than percent

    manualNext(): Promise<void>;
    manualPrev(): Promise<void>;

    startAnimate(speed: number): Promise<void>;
    stopAnimate(speed: number): Promise<void>;
}