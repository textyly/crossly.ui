export interface IMenuHandler {
}

export interface IMenuElementProvider {
    get zoomLevel(): Element;
    get actionButtons(): Array<Element>;
    get colorButtons(): Array<Element>;
    get backSideContainer(): HTMLElement;
}