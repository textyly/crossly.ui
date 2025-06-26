import { IDisposable } from "../types.js";

export interface IDialogs {
    home: IHomeContent;
    user: IUserContent;
    threadPicker: IThreadPickerContent;
    feedback: IFeedbackContent;
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