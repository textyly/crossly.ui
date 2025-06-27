import assert from "../asserts/assert.js";
import { Base } from "../general/base.js";
import { UndoMenu } from "./menus/undo.js";
import { ZoomMenu } from "./menus/zoom.js";
import { HomeMenu } from "./menus/home.js";
import { CloseMenu } from "./menus/close.js";
import { PaletteMenu } from "./menus/palette.js";
import { SplitViewMenu } from "./menus/split.js";
import { IMenus, IUndoMenu, IZoomMenu, ICloseMenu, IPaletteMenu, ISplitViewMenu, IHomeMenu } from "./menus/types.js";

export class Menus extends Base implements IMenus {
    private homeMenu: IHomeMenu;
    private undoMenu: IUndoMenu;
    private zoomMenu: IZoomMenu;
    private paletteMenu: IPaletteMenu;
    private splitViewMenu: ISplitViewMenu;
    private closeMenu: ICloseMenu;

    constructor(document: Document) {
        super(Menus.name);

        const topLeftMenu = this.getTopLeftMenu(document);
        this.homeMenu = new HomeMenu(topLeftMenu);

        const leftCenterMenu = this.getLeftCenterMenu(document);
        this.paletteMenu = new PaletteMenu(leftCenterMenu);

        const topRightMenu = this.getTopRightMenu(document);
        this.undoMenu = new UndoMenu(topRightMenu);
        this.splitViewMenu = new SplitViewMenu(topRightMenu);

        const bottomMenu = this.getBottomRightMenu(document);
        this.zoomMenu = new ZoomMenu(bottomMenu);

        const backSideTopRightMenu = this.getBackSideTopRightMenu(document);
        this.closeMenu = new CloseMenu(backSideTopRightMenu);
    }

    public get home(): IHomeMenu {
        return this.homeMenu;
    }

    public get undo(): IUndoMenu {
        return this.undoMenu;
    }

    public get zoom(): IZoomMenu {
        return this.zoomMenu;
    }

    public get palette(): IPaletteMenu {
        return this.paletteMenu;
    }

    public get splitView(): ISplitViewMenu {
        return this.splitViewMenu;
    }

    public get close(): ICloseMenu {
        return this.closeMenu;
    }

    public override dispose(): void {
        this.undo.dispose();
        this.zoom.dispose();
        this.palette.dispose();
        this.splitView.dispose();
        this.close.dispose();

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