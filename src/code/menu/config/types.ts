import { Threads } from "../menus/types.js";

export type MenuConfig = {
    palette: ColorPaletteConfig;
};

export type ColorPaletteConfig = {
    threads: Threads;
}