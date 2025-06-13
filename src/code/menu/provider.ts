import assert from "../asserts/assert.js";
import { ColorPalette } from "./components/palette.js";
import { IColorPalette, IMenuProvider } from "./types.js";

export class MenuProvider implements IMenuProvider {
    private document: Document;

    private palette: IColorPalette;

    constructor(document: Document) {
        this.document = document;

        const colorButtons = this.document.querySelectorAll<HTMLElement>('.color-button');
        assert.defined(colorButtons, "actionButtons");

        this.palette = new ColorPalette([...colorButtons]);
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

    public get colorPalette(): IColorPalette {
        return this.palette;
    }

    public get backSideContainer(): HTMLElement {
        const backSideContainer = document.getElementById("back-side-container");
        assert.defined(backSideContainer, "backSideContainer");

        return backSideContainer;
    }
}