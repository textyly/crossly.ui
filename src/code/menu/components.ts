import assert from "../asserts/assert.js";
import { Base } from "../general/base.js";
import { UndoComponent } from "./components/undo.js";
import { ZoomComponent } from "./components/zoom.js";
import { PaletteComponent } from "./components/palette.js";
import { SplitViewComponent } from "./components/split.js";
import {
    IUndoComponent,
    IZoomComponent,
    IPaletteComponent,
    IComponents,
    ISplitViewComponent,
} from "./components/types.js";

export class Components extends Base implements IComponents {
    private document: Document;

    private undoComponent: IUndoComponent;
    private zoomComponent: IZoomComponent;
    private paletteComponent: IPaletteComponent;
    private splitViewComponent: ISplitViewComponent;

    constructor(document: Document) {
        super(Components.name);

        this.document = document;

        const paletteContainer = document.querySelector('.color-button-group');
        assert.defined(paletteContainer, "paletteContainer");
        this.paletteComponent = new PaletteComponent(paletteContainer);

        const topRightMenu = document.querySelector('.top-floating-menu.right');
        assert.defined(topRightMenu, "topRightMenu");
        this.undoComponent = new UndoComponent(topRightMenu);
        this.splitViewComponent = new SplitViewComponent(topRightMenu);

        const bottomMenu = document.querySelector('.bottom-floating-menu');
        assert.defined(bottomMenu, "bottomMenu");
        this.zoomComponent = new ZoomComponent(bottomMenu);
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

    // public get actionButtons(): Array<HTMLElement> {
    //     const actionButtons = this.document.querySelectorAll<HTMLElement>('.action-button');
    //     assert.defined(actionButtons, "actionButtons");

    //     return [...actionButtons];
    // }

    // public get backSideContainer(): HTMLElement {
    //     const backSideContainer = document.getElementById("back-side-container");
    //     assert.defined(backSideContainer, "backSideContainer");

    //     return backSideContainer;
    // }

    public override dispose(): void {
        this.palette.dispose();
        this.undo.dispose();
        this.zoom.dispose();

        super.dispose();
    }
}