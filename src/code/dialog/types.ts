import { IDisposable } from "../types.js";

export interface IDialogs {
    picker: IThreadPicker;
}

export interface IDialogContent {
    show(): void;
    hide(): void;
}

export interface IThreadPicker extends IDialogContent, IDisposable {

}