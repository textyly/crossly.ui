import { ISplitViewMenu } from "./types.js";
import { OneActionMenu } from "./oneAction.js";
import { VoidListener, VoidUnsubscribe } from "../../types.js";

export class SplitViewMenu extends OneActionMenu implements ISplitViewMenu {

    constructor(container: Element) {
        super(SplitViewMenu.name, container, "toggle-split-view");

    }

    public onToggleSplitView(listener: VoidListener): VoidUnsubscribe {
        return this.onAction(listener);
    }
}