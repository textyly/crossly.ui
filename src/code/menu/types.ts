export interface IMenuHandler {
}

export interface IMenuElementProvider {
    get zoomLevel(): HTMLElement;
    get actionButtons(): Array<HTMLElement>;
    get colorButtons(): Array<HTMLElement>;
    get backSideContainer(): HTMLElement;
}