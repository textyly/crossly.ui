import { UndoComponent } from "./undo.js";
import assert from "../../asserts/assert.js";
import { Base } from "../../general/base.js";
import { PaletteComponent } from "./palette.js";
import { IComponentsProvider, IPaletteComponent, IUndoComponent } from "./types.js";

export class ComponentsProvider extends Base implements IComponentsProvider {
    private document: Document;

    private palette: IPaletteComponent;
    private undo: IUndoComponent;

    constructor(document: Document) {
        super(ComponentsProvider.name);

        this.document = document;

        const paletteContainer = document.querySelector('.color-button-group');
        assert.defined(paletteContainer, "palette");
        this.palette = new PaletteComponent(paletteContainer);

        const undoContainer = document.querySelector('.top-floating-menu.right');
        assert.defined(undoContainer, "undo");
        this.undo = new UndoComponent(undoContainer);
    }

    public get paletteComponent(): IPaletteComponent {
        return this.palette;
    }

    public get undoComponent(): IUndoComponent {
        return this.undo;
    }

    public get zoomLevel(): HTMLElement {
        const zoomLevel = this.document.getElementById("zoom-level");
        assert.defined(zoomLevel, "zoomLevelElement");

        return zoomLevel;
    }

    public get actionButtons(): Array<HTMLElement> {
        const actionButtons = this.document.querySelectorAll<HTMLElement>('.action-button');
        assert.defined(actionButtons, "actionButtons");

        return [...actionButtons];
    }

    public get backSideContainer(): HTMLElement {
        const backSideContainer = document.getElementById("back-side-container");
        assert.defined(backSideContainer, "backSideContainer");

        return backSideContainer;
    }

    public override dispose(): void {
        this.palette.dispose();

        super.dispose();
    }
}