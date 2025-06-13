import { Listener, VoidUnsubscribe } from "../types.js";

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
    insert(colors: Colors): void;

    onChangeThread(listener: ChangeThreadListener): VoidUnsubscribe;
}

export type ChangeThreadEvent = { name: string, color: Color, width: number };
export type ChangeThreadListener = Listener<ChangeThreadEvent>; 