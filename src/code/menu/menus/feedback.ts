import { IFeedbackMenu } from "./types.js";
import { OneActionMenu } from "./oneAction.js";
import { VoidListener, VoidUnsubscribe } from "../../types.js";

export class FeedbackMenu extends OneActionMenu implements IFeedbackMenu {

    constructor(container: Element) {
        super(FeedbackMenu.name, container, "open-feedback");
    }

    public onFeedback(listener: VoidListener): VoidUnsubscribe {
        return super.onAction(listener);
    }
}