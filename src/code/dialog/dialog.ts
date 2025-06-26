import assert from "../asserts/assert.js";
import { Base } from "../general/base.js";
import { UserContent } from "./contents/user.js";
import { ThreadPickerContent } from "./contents/picker.js";
import { IDialogs, IFeedbackContent, IHomeContent, IThreadPickerContent, IUserContent } from "./types.js";
import { HomeContent } from "./contents/home.js";
import { FeedbackContent } from "./contents/feedback.js";

export class Dialogs extends Base implements IDialogs {
    private readonly homeContent: IHomeContent;
    private readonly userContent: IUserContent;
    private readonly threadPickerContent: IThreadPickerContent;
    private readonly feedbackContent: IFeedbackContent;

    constructor(document: Document) {
        super(Dialogs.name);

        const dialogOverlay = this.getDialogOverlay(document);

        this.homeContent = new HomeContent(dialogOverlay);
        this.userContent = new UserContent(dialogOverlay);
        this.threadPickerContent = new ThreadPickerContent(dialogOverlay);
        this.feedbackContent = new FeedbackContent(dialogOverlay);
    }

    public get home(): IHomeContent {
        return this.homeContent;
    }

    public get user(): IUserContent {
        return this.userContent;
    }

    public get threadPicker(): IThreadPickerContent {
        return this.threadPickerContent;
    }

    public get feedback(): IFeedbackContent {
        return this.feedbackContent;
    }

    private getDialogOverlay(document: Document): HTMLElement {
        const dialogOverlayElement = document.querySelector('#modal-overlay') as HTMLElement;
        assert.defined(dialogOverlayElement, "dialogOverlayElement");
        return dialogOverlayElement;
    }
}