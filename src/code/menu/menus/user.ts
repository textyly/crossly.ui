import { IUserMenu } from "./types.js";
import { OneActionMenu } from "./oneAction.js";
import { VoidListener, VoidUnsubscribe } from "../../types.js";

export class UserMenu extends OneActionMenu implements IUserMenu {

    constructor(container: Element) {
        super(UserMenu.name, container, "open-user");
    }

    public onOpenUser(listener: VoidListener): VoidUnsubscribe {
        return super.onAction(listener);
    }
}