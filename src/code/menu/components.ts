import assert from "../asserts/assert.js";
import { Base } from "../general/base.js";
import { UndoComponent } from "./components/undo.js";
import { ZoomComponent } from "./components/zoom.js";
import { CloseComponent } from "./components/close.js";
import { PaletteComponent } from "./components/palette.js";
import { SplitViewComponent } from "./components/split.js";
import {
    IComponents,
    IUndoComponent,
    IZoomComponent,
    ICloseComponent,
    IPaletteComponent,
    ISplitViewComponent,
} from "./components/types.js";

export class Components extends Base implements IComponents {
    private document: Document;

    private undoComponent: IUndoComponent;
    private zoomComponent: IZoomComponent;
    private paletteComponent: IPaletteComponent;
    private splitViewComponent: ISplitViewComponent;
    private closeComponent: ICloseComponent;

    constructor(document: Document) {
        super(Components.name);

        this.document = document;

        // TODO: add get methods
        const paletteMenu = document.querySelector('.color-button-group');
        assert.defined(paletteMenu, "paletteMenu");
        this.paletteComponent = new PaletteComponent(paletteMenu);

        const topRightMenu = document.querySelector('.top-floating-menu.right');
        assert.defined(topRightMenu, "topRightMenu");
        this.undoComponent = new UndoComponent(topRightMenu);
        this.splitViewComponent = new SplitViewComponent(topRightMenu);

        const bottomMenu = document.querySelector('.bottom-floating-menu');
        assert.defined(bottomMenu, "bottomMenu");
        this.zoomComponent = new ZoomComponent(bottomMenu);

        const backSideViewContainer = document.querySelector('.side-container.back');
        assert.defined(backSideViewContainer, "backSideViewContainer");

        const backSideTopRightMenu = backSideViewContainer.querySelector('.top-floating-menu.right');
        assert.defined(backSideTopRightMenu, "backSideTopRightMenu");
        this.closeComponent = new CloseComponent(backSideTopRightMenu);
    }

    public get undo(): IUndoComponent {
        return this.undoComponent;
    }

    public get zoom(): IZoomComponent {
        return this.zoomComponent;
    }

    public get palette(): IPaletteComponent {
        return this.paletteComponent;
    }

    public get splitView(): ISplitViewComponent {
        return this.splitViewComponent;
    }

    public get close(): ICloseComponent {
        return this.closeComponent;
    }

    public override dispose(): void {
        this.palette.dispose();
        this.undo.dispose();
        this.zoom.dispose();

        super.dispose();
    }
}