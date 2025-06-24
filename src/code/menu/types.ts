import { IDisposable } from "../types.js";
import { IPaletteComponent } from "./components/types.js";


export interface IMenuHandler extends IDisposable {
}

export interface IMenuProvider extends IDisposable {
    get paletteComponent(): IPaletteComponent;

    get zoomLevel(): HTMLElement;
    get actionButtons(): Array<HTMLElement>;
    get backSideContainer(): HTMLElement;
}
