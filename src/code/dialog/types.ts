import { IDisposable } from "../types.js";

export interface IDialogs {
    user: IUserContent;
    threadPicker: IThreadPickerContent;
}

export interface IDialogContent extends IDisposable {
    show(): void;
    hide(): void;
}

export interface IHomeContent extends IDialogContent, IDisposable {
}

export interface IUserContent extends IDialogContent, IDisposable {
}

export interface IThreadPickerContent extends IDialogContent, IDisposable {
}

export interface IFeedbackContent extends IDialogContent {
}