import assert from "../asserts/assert.js";
import { Base } from "../general/base.js";
import { UndoMenu } from "./components/undo.js";
import { ZoomMenu } from "./components/zoom.js";
import { CloseMenu } from "./components/close.js";
import { PaletteMenu } from "./components/palette.js";
import { SplitViewMenu } from "./components/split.js";
import {
    IMenu,
    IUndoMenu,
    IZoomMenu,
    ICloseMenu,
    IPaletteMenu,
    ISplitViewMenu,
} from "./components/types.js";

export class Menu extends Base implements IMenu {
    private document: Document;

    private undoComponent: IUndoMenu;
    private zoomComponent: IZoomMenu;
    private paletteComponent: IPaletteMenu;
    private splitViewComponent: ISplitViewMenu;
    private closeComponent: ICloseMenu;

    constructor(document: Document) {
        super(Menu.name);

        this.document = document;

        const leftCenterMenu = this.getLeftCenterMenu();
        this.paletteComponent = new PaletteMenu(leftCenterMenu);

        const topRightMenu = this.getTopRightMenu();
        this.undoComponent = new UndoMenu(topRightMenu);
        this.splitViewComponent = new SplitViewMenu(topRightMenu);

        const bottomMenu = this.getBottomRightMenu();
        this.zoomComponent = new ZoomMenu(bottomMenu);

        const backSideTopRightMenu = this.getBackSideTopRightMenu();
        this.closeComponent = new CloseMenu(backSideTopRightMenu);
    }

    public get undo(): IUndoMenu {
        return this.undoComponent;
    }

    public get zoom(): IZoomMenu {
        return this.zoomComponent;
    }

    public get palette(): IPaletteMenu {
        return this.paletteComponent;
    }

    public get splitView(): ISplitViewMenu {
        return this.splitViewComponent;
    }

    public get close(): ICloseMenu {
        return this.closeComponent;
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