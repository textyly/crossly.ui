export interface IAnimation {
    jumpTo(percent: number): void;

    manualNext(): void;
    manualPrev(): void;

    startAnimatingForward(speed: number): void;
    startAnimatingBackward(speed: number): void;
    stopAnimating(): void;
}