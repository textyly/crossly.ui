import { ICloseMenu } from "./types.js";
import { OneActionMenu } from "./oneAction.js";
import { VoidListener, VoidUnsubscribe } from "../../types.js";

export class CloseMenu extends OneActionMenu implements ICloseMenu {
    
    constructor(container: Element) {
        super(CloseMenu.name, container, "close-back");
    }

    public onClose(listener: VoidListener): VoidUnsubscribe {
        return super.onAction(listener);
    }
}