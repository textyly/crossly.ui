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

    private handleOpenHome(): void {
        super.ensureAlive();

        this.dialogs.home.show();
    }

    private handleOpenUser(): void {
        super.ensureAlive();

        this.dialogs.user.show();
    }

    private handleOpenThreadPicker(): void {
        super.ensureAlive();

        this.dialogs.threadPicker.show();
    }

    private handleFeedback(): void {
        super.ensureAlive();

        this.dialogs.feedback.show();
    }

    private subscribeDialog(): void {

    }

    private subscribeMenu(): void {

        const openHomeUn = this.menu.home.onOpenHome(this.handleOpenHome.bind(this));
        super.registerUn(openHomeUn);

        const openUserUn = this.menu.user.onOpenUser(this.handleOpenUser.bind(this));
        super.registerUn(openUserUn);

        const openThreadPickerUn = this.menu.threadPalette.onOpenThreadPicker(this.handleOpenThreadPicker.bind(this));
        super.registerUn(openThreadPickerUn);

        const feedbackUn = this.menu.feedback.onFeedback(this.handleFeedback.bind(this));
        super.registerUn(feedbackUn);
    }
}