import assert from "../asserts/assert.js";
import { Base } from "../general/base.js";
import { UndoMenu } from "./menus/undo.js";
import { ZoomMenu } from "./menus/zoom.js";
import { CloseMenu } from "./menus/close.js";
import { PaletteMenu } from "./menus/palette.js";
import { SplitViewMenu } from "./menus/split.js";
import {
    IMenu,
    IUndoMenu,
    IZoomMenu,
    ICloseMenu,
    IPaletteMenu,
    ISplitViewMenu,
} from "./menus/types.js";

export class Menu extends Base implements IMenu {
    private document: Document;

    private undoMenu: IUndoMenu;
    private zoomMenu: IZoomMenu;
    private paletteMenu: IPaletteMenu;
    private splitViewMenu: ISplitViewMenu;
    private closeMenu: ICloseMenu;

    constructor(document: Document) {
        super(Menu.name);

        this.document = document;

        const leftCenterMenu = this.getLeftCenterMenu();
        this.paletteMenu = new PaletteMenu(leftCenterMenu);

        const topRightMenu = this.getTopRightMenu();
        this.undoMenu = new UndoMenu(topRightMenu);
        this.splitViewMenu = new SplitViewMenu(topRightMenu);

        const bottomMenu = this.getBottomRightMenu();
        this.zoomMenu = new ZoomMenu(bottomMenu);

        const backSideTopRightMenu = this.getBackSideTopRightMenu();
        this.closeMenu = new CloseMenu(backSideTopRightMenu);
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

    private getLeftCenterMenu(): Element {
        const leftCenterMenu = this.document.querySelector('.left-floating-menu.center');
        assert.defined(leftCenterMenu, "leftCenterMenu");
        return leftCenterMenu;
    }

    private getTopRightMenu(): Element {
        const topRightMenu = this.document.querySelector('.top-floating-menu.right');
        assert.defined(topRightMenu, "topRightMenu");
        return topRightMenu;
    }

    private getBottomRightMenu(): Element {
        const bottomRightMenu = this.document.querySelector('.bottom-floating-menu.right');
        assert.defined(bottomRightMenu, "bottomRightMenu");
        return bottomRightMenu;
    }

    private getBackSideTopRightMenu(): Element {
        const backSideViewContainer = this.document.querySelector('.side-container.back');
        assert.defined(backSideViewContainer, "backSideViewContainer");

        const backSideTopRightMenu = backSideViewContainer.querySelector('.top-floating-menu.right');
        assert.defined(backSideTopRightMenu, "backSideTopRightMenu");

        return backSideTopRightMenu;
    }
}