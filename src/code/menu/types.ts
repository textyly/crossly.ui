export interface IMenuHandler {
    onClickColor(color: string): void;
    onClickUndo(): void;
    onClickRedo(): void;
    onClickZoomIn(): void;
    onClickZoomOut(): void;
}