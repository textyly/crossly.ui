import assert from "../asserts/assert.js";
import { Base } from "../general/base.js";
import { UndoMenu } from "./menus/undo.js";
import { ZoomMenu } from "./menus/zoom.js";
import { HomeMenu } from "./menus/home.js";
import { UserMenu } from "./menus/user.js";
import { CloseMenu } from "./menus/close.js";
import { ThreadPaletteMenu } from "./menus/palette.js";
import { SplitViewMenu } from "./menus/split.js";
import { FeedbackMenu } from "./menus/feedback.js";
import {
    IMenus,
    IUndoMenu,
    IZoomMenu,
    IHomeMenu,
    IUserMenu,
    ICloseMenu,
    IThreadPaletteMenu,
    IFeedbackMenu,
    ISplitViewMenu,
} from "./menus/types.js";

export class Menus extends Base implements IMenus {
    private homeMenu: IHomeMenu;
    private userMenu: IUserMenu;
    private undoMenu: IUndoMenu;
    private zoomMenu: IZoomMenu;
    private threadPaletteMenu: IThreadPaletteMenu;
    private splitViewMenu: ISplitViewMenu;
    private closeMenu: ICloseMenu;
    private feedbackMenu: IFeedbackMenu;

    constructor(document: Document) {
        super(Menus.name);

        const topLeftMenu = this.getTopLeftMenu(document);
        this.homeMenu = new HomeMenu(topLeftMenu);
        this.userMenu = new UserMenu(topLeftMenu);

        const leftCenterMenu = this.getLeftCenterMenu(document);
        this.threadPaletteMenu = new ThreadPaletteMenu(leftCenterMenu);

        const topRightMenu = this.getTopRightMenu(document);
        this.undoMenu = new UndoMenu(topRightMenu);
        this.splitViewMenu = new SplitViewMenu(topRightMenu);

        const bottomRightMenu = this.getBottomRightMenu(document);
        this.zoomMenu = new ZoomMenu(bottomRightMenu);
        this.feedbackMenu = new FeedbackMenu(bottomRightMenu);

        const backSideTopRightMenu = this.getBackSideTopRightMenu(document);
        this.closeMenu = new CloseMenu(backSideTopRightMenu);
    }

    public get home(): IHomeMenu {
        return this.homeMenu;
    }

    public get user(): IUserMenu {
        return this.userMenu;
    }

    public get undo(): IUndoMenu {
        return this.undoMenu;
    }

    public get zoom(): IZoomMenu {
        return this.zoomMenu;
    }

    public get threadPalette(): IThreadPaletteMenu {
        return this.threadPaletteMenu;
    }

    public get splitView(): ISplitViewMenu {
        return this.splitViewMenu;
    }

    public get close(): ICloseMenu {
        return this.closeMenu;
    }

    public get feedback(): IFeedbackMenu {
        return this.feedbackMenu;
    }

    public override dispose(): void {
        this.home.dispose();
        this.user.dispose();
        this.undo.dispose();
        this.zoom.dispose();
        this.threadPalette.dispose();
        this.splitView.dispose();
        this.close.dispose();
        this.feedback.dispose();

        super.dispose();
    }

    private getTopLeftMenu(document: Document): Element {
        return this.getElement(document, "top-floating-menu.left");
    }

    private getLeftCenterMenu(document: Document): Element {
        return this.getElement(document, "left-floating-menu.center");
    }

    private getTopRightMenu(document: Document): Element {
        return this.getElement(document, "top-floating-menu.right");
    }

    private getBottomRightMenu(document: Document): Element {
        return this.getElement(document, "bottom-floating-menu.right");
    }

    private getBackSideTopRightMenu(document: Document): Element {
        const backSideViewContainer = this.getElement(document, "side-container.back");
        const backSideTopRightMenu = this.getElement(backSideViewContainer, "top-floating-menu.right");
        return backSideTopRightMenu;
    }

    private getElement(document: Document | Element, selector: string): Element {
        const element = document.querySelector(`.${selector}`);
        assert.defined(element, "element");
        return element;
    }
}