export type Color = string;
export type Colors = Array<Color>;

export interface IMenuHandler {
}

export interface IMenuProvider {
    get zoomLevel(): HTMLElement;
    get actionButtons(): Array<HTMLElement>;
    get colorPalette(): IColorPalette;
    get backSideContainer(): HTMLElement;
}

export interface IColorPalette {
    get buttons(): Array<HTMLElement>;

    insert(colors: Colors): void;
}