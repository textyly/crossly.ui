import assert from "../asserts/assert.js";
import { IMenuElementProvider } from "./types.js";

export class MenuElementProvider implements IMenuElementProvider {
    private document: Document;

    constructor(document: Document) {
        this.document = document;
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

    public get colorButtons(): Array<HTMLElement> {
        const colorButtons = this.document.querySelectorAll<HTMLElement>('.color-button');
        assert.defined(colorButtons, "actionButtons");

        return [...colorButtons];
    }

    public get backSideContainer(): HTMLElement {
        const backSideContainer = document.getElementById("back-side-container");
        assert.defined(backSideContainer, "backSideContainer");

        return backSideContainer;
    }
}