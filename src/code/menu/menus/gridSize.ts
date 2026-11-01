import { IGridSizeMenu } from "./types.js";
import { Base } from "../../general/base.js";
import html from "../../utilities.ts/html.js";

export class GridSizeMenu extends Base implements IGridSizeMenu {
    private readonly gridSizeId = "grid-size";

    private readonly gridSizeLabel: HTMLElement;

    constructor(container: Element) {
        super(GridSizeMenu.name);

        this.gridSizeLabel = html.getById(container, this.gridSizeId);
    }

    public setSize(columns: number, rows: number): void {
        super.ensureAlive();

        this.gridSizeLabel.textContent = `${columns} x ${rows}`;
    }

    public override dispose(): void {
        super.ensureAlive();
        super.dispose();
    }
}
