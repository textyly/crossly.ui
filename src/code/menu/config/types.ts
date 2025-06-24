import { Colors } from "../components/types.js";

export type MenuConfig = {
    palette: ColorPaletteConfig;
};

export type ColorPaletteConfig = {
    colors: Colors;
}