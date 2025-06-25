import assert from "../asserts/assert.js";
import { Base } from "../general/base.js";
import { MenuUndoComponent } from "./components/undo.js";
import { MenuZoomComponent } from "./components/zoom.js";
import { MenuCloseComponent } from "./components/close.js";
import { MenuPaletteComponent } from "./components/palette.js";
import { MenuSplitViewComponent } from "./components/split.js";
import {
    IMenuComponents,
    IMenuUndoComponent,
    IMenuZoomComponent,
    IMenuCloseComponent,
    IMenuPaletteComponent,
    IMenuSplitViewComponent,
} from "./components/types.js";

export class MenuComponents extends Base implements IMenuComponents {
    private document: Document;

    private undoComponent: IMenuUndoComponent;
    private zoomComponent: IMenuZoomComponent;
    private paletteComponent: IMenuPaletteComponent;
    private splitViewComponent: IMenuSplitViewComponent;
    private closeComponent: IMenuCloseComponent;

    constructor(document: Document) {
        super(MenuComponents.name);

        this.document = document;

        const paletteMenu = this.getPaletteMenu();
        this.paletteComponent = new MenuPaletteComponent(paletteMenu);

        const topRightMenu = this.getTopRightMenu();
        this.undoComponent = new MenuUndoComponent(topRightMenu);
        this.splitViewComponent = new MenuSplitViewComponent(topRightMenu);

        const bottomMenu = this.getBottomRightMenu();
        this.zoomComponent = new MenuZoomComponent(bottomMenu);

        const backSideTopRightMenu = this.getBackSideTopRightMenu();
        this.closeComponent = new MenuCloseComponent(backSideTopRightMenu);
    }

    private getPaletteMenu(): Element {
        const leftCenterMenu = this.document.querySelector('.left-floating-menu.center');
        assert.defined(leftCenterMenu, "leftCenterMenu");

        const paletteMenu = leftCenterMenu.querySelector('.color-button-group');
        assert.defined(paletteMenu, "paletteMenu");

        return paletteMenu;
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

    public get undo(): IMenuUndoComponent {
        return this.undoComponent;
    }

    public get zoom(): IMenuZoomComponent {
        return this.zoomComponent;
    }

    public get palette(): IMenuPaletteComponent {
        return this.paletteComponent;
    }

    public get splitView(): IMenuSplitViewComponent {
        return this.splitViewComponent;
    }

    public get close(): IMenuCloseComponent {
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
}