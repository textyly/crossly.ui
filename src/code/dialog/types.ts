import { Thread } from "../menu/menus/types.js";
import { IDisposable, Listener, VoidListener, VoidUnsubscribe } from "../types.js";

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
    onPickThread(listener: PickThreadListener): VoidUnsubscribe;
}

export interface IFeedbackContent extends IDialogContent {
}

export type PickThreadEvent = { thread: Thread };
export type PickThreadListener = Listener<PickThreadEvent>;