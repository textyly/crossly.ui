import { IMenu } from "../menus/types.js";
import { Base } from "../../general/base.js";
import { IPages } from "../../pages/types.js";
import { IMenuPagesHandler } from "../types.js";

export class MenuPagesHandler extends Base implements IMenuPagesHandler {
    constructor(menu: IMenu, pages: IPages) {
        super(MenuPagesHandler.name);
    }
}