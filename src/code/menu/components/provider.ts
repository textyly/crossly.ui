import { UndoComponent } from "./undo.js";
import { ZoomComponent } from "./zoom.js";
import assert from "../../asserts/assert.js";
import { Base } from "../../general/base.js";
import { PaletteComponent } from "./palette.js";
import {
    IUndoComponent,
    IZoomComponent,
    IPaletteComponent,
    IComponents,
} from "./types.js";

export class Components extends Base implements IComponents {
    private document: Document;

    private paletteComponent: IPaletteComponent;
    private undoComponent: IUndoComponent;
    private zoomComponent: IZoomComponent;

    constructor(document: Document) {
        super(Components.name);

        this.document = document;

        const paletteContainer = document.querySelector('.color-button-group');
        assert.defined(paletteContainer, "paletteContainer");
        this.paletteComponent = new PaletteComponent(paletteContainer);

        const undoContainer = document.querySelector('.top-floating-menu.right');
        assert.defined(undoContainer, "undoContainer");
        this.undoComponent = new UndoComponent(undoContainer);

        const zoomContainer = document.querySelector('.bottom-floating-menu');
        assert.defined(zoomContainer, "zoomContainer");
        this.zoomComponent = new ZoomComponent(zoomContainer);
    }

    public get palette(): IPaletteComponent {
        return this.paletteComponent;
    }

    public get undo(): IUndoComponent {
        return this.undoComponent;
    }

    public get zoom(): IZoomComponent {
        return this.zoomComponent;
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