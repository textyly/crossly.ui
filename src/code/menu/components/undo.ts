import { IUndo } from "./types.js";
import { Base } from "../../general/base.js";

export class UndoComponent extends Base implements IUndo {
    constructor() {
        super(UndoComponent.name);
    }
}