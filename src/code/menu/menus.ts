import { Base } from "../general/base.js";
import { UndoMenu } from "./menus/undo.js";
import { ZoomMenu } from "./menus/zoom.js";
import { HomeMenu } from "./menus/home.js";
import { UserMenu } from "./menus/user.js";
import html from "../utilities.ts/html.js";
import { CloseMenu } from "./menus/close.js";
import { SplitViewMenu } from "./menus/split.js";
import { FeedbackMenu } from "./menus/feedback.js";
import { ThreadPaletteMenu } from "./menus/palette.js";
import {
    IMenus,
    IUndoMenu,
    IZoomMenu,
    IHomeMenu,
    IUserMenu,
    ICloseMenu,
    IFeedbackMenu,
    ISplitViewMenu,
    IThreadPaletteMenu,
} from "./menus/types.js";

export class Menus extends Base implements IMenus {
    private readonly topLeftMenuClassName = "top-floating-menu.left";
    private readonly leftCenterMenuClassName = "left-floating-menu.center";
    private readonly topRightMenuClassName = "top-floating-menu.right";
    private readonly bottomRightMenuClassName = "bottom-floating-menu.right";
    private readonly backSideClassName = "side-container.back";

    private readonly homeMenu: IHomeMenu;
    private readonly userMenu: IUserMenu;
    private readonly undoMenu: IUndoMenu;
    private readonly zoomMenu: IZoomMenu;
    private readonly threadPaletteMenu: IThreadPaletteMenu;
    private readonly splitViewMenu: ISplitViewMenu;
    private readonly closeMenu: ICloseMenu;
    private readonly feedbackMenu: IFeedbackMenu;

    constructor(document: Document) {
        super(Menus.name);

        const topLeftMenu = html.getByClass(document, this.topLeftMenuClassName);
        this.homeMenu = new HomeMenu(topLeftMenu);
        this.userMenu = new UserMenu(topLeftMenu);

        const leftCenterMenu = html.getByClass(document, this.leftCenterMenuClassName);
        this.threadPaletteMenu = new ThreadPaletteMenu(leftCenterMenu);

        const topRightMenu = html.getByClass(document, this.topRightMenuClassName);
        this.undoMenu = new UndoMenu(topRightMenu);
        this.splitViewMenu = new SplitViewMenu(topRightMenu);

        const bottomRightMenu = html.getByClass(document, this.bottomRightMenuClassName);
        this.zoomMenu = new ZoomMenu(bottomRightMenu);
        this.feedbackMenu = new FeedbackMenu(bottomRightMenu);

        const backSide = html.getByClass(document, this.backSideClassName);
        const backSideTopRightMenu = html.getByClass(backSide, this.topRightMenuClassName);
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
        super.ensureAlive();

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
}