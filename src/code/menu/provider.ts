import assert from "../asserts/assert.js";
import { Base } from "../general/base.js";
import { IMenuProvider } from "./types.js";
import { IPaletteComponent } from "./components/types.js";
import { PaletteComponent } from "./components/palette.js";

export class MenuProvider extends Base implements IMenuProvider {
    private document: Document;

    private palette: IPaletteComponent;

    constructor(document: Document) {
        super(MenuProvider.name);

        this.document = document;

        const colorPaletteDiv = document.querySelector('.color-button-group');
        assert.defined(colorPaletteDiv, "colorPaletteDiv");

        this.palette = new PaletteComponent(colorPaletteDiv);
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

    public get paletteComponent(): IPaletteComponent {
        return this.palette;
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