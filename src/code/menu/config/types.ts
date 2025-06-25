import { Colors } from "../menus/types.js";

export type MenuConfig = {
    palette: ColorPaletteConfig;
};

export type ColorPaletteConfig = {
    colors: Colors;
}