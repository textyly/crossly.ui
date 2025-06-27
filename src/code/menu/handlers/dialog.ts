import { IMenus } from "../menus/types.js";
import { Base } from "../../general/base.js";
import { IDialogs } from "../../dialog/types.js";
import { IMenuDialogHandler } from "../types.js";

export class MenuDialogHandler extends Base implements IMenuDialogHandler {
    private readonly menu: IMenus;
    private readonly dialogs: IDialogs;

    constructor(menu: IMenus, dialogs: IDialogs) {
        super(MenuDialogHandler.name);

        this.menu = menu;
        this.dialogs = dialogs;

        this.subscribe();
    }

    private subscribe(): void {
        this.subscribeDialog();
        this.subscribeMenu();
    }

    private handleOpenThreadPicker(): void {
        super.ensureAlive();

        this.dialogs.threadPicker.show();
    }

    private handleOpenHome(): void {
        super.ensureAlive();

        this.dialogs.home.show();
    }

    private subscribeDialog(): void {

    }

    private subscribeMenu(): void {
        const openThreadPickerUn = this.menu.palette.onOpenThreadPicker(this.handleOpenThreadPicker.bind(this));
        super.registerUn(openThreadPickerUn);

        const openHomeUn = this.menu.home.onOpenHome(this.handleOpenHome.bind(this));
        super.registerUn(openHomeUn);
    }
}