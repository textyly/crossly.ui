import { IHomeMenu } from "./types.js";
import { OneActionMenu } from "./oneAction.js";
import { VoidListener, VoidUnsubscribe } from "../../types.js";

export class HomeMenu extends OneActionMenu implements IHomeMenu {

    constructor(container: Element) {
        super(HomeMenu.name, container, "open-home");
    }

    public onOpenHome(listener: VoidListener): VoidUnsubscribe {
        return super.onAction(listener);
    }
}