import assert from "../asserts/assert.js";
import { Base } from "../general/base.js";
import { UndoMenu } from "./menus/undo.js";
import { ZoomMenu } from "./menus/zoom.js";
import { CloseMenu } from "./menus/close.js";
import { PaletteMenu } from "./menus/palette.js";
import { SplitViewMenu } from "./menus/split.js";
import { IMenus, IUndoMenu, IZoomMenu, ICloseMenu, IPaletteMenu, ISplitViewMenu } from "./menus/types.js";

export class Menus extends Base implements IMenus {
    private undoMenu: IUndoMenu;
    private zoomMenu: IZoomMenu;
    private paletteMenu: IPaletteMenu;
    private splitViewMenu: ISplitViewMenu;
    private closeMenu: ICloseMenu;

    constructor(document: Document) {
        super(Menus.name);

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

    private getLeftCenterMenu(document: Document): Element {
        const leftCenterMenu = document.querySelector('.left-floating-menu.center');
        assert.defined(leftCenterMenu, "leftCenterMenu");
        return leftCenterMenu;
    }

    private getTopRightMenu(document: Document): Element {
        const topRightMenu = document.querySelector('.top-floating-menu.right');
        assert.defined(topRightMenu, "topRightMenu");
        return topRightMenu;
    }

    private getBottomRightMenu(document: Document): Element {
        const bottomRightMenu = document.querySelector('.bottom-floating-menu.right');
        assert.defined(bottomRightMenu, "bottomRightMenu");
        return bottomRightMenu;
    }

    private getBackSideTopRightMenu(document: Document): Element {
        const backSideViewContainer = document.querySelector('.side-container.back');
        assert.defined(backSideViewContainer, "backSideViewContainer");

        const backSideTopRightMenu = backSideViewContainer.querySelector('.top-floating-menu.right');
        assert.defined(backSideTopRightMenu, "backSideTopRightMenu");

        return backSideTopRightMenu;
    }
}