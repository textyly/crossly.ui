import { StitchPattern } from "../types.js";
import { StitchThreadPath } from "./arrays/thread/stitch.js";

/**
 * Build a stitch pattern with a full cross-stitch in every fabric square.
 *
 * The clickable grid is a fine grid (`2*columns-1` by `2*rows-1` dots); the
 * visible corner dots sit at EVEN indices, so the square at (cx, cy) has corners
 * at (2cx, 2cy) .. (2cx+2, 2cy+2). For each square we append its four corners to
 * a single continuous needle path in the order TL, BR, TR, BL.
 *
 * Because the canvas side flips on every dot, the even-indexed segments
 * (TL->BR and TR->BL) land on the FRONT as the two visible diagonals, while the
 * odd-indexed ones (BR->TR, and the BL->next-TL hop between squares) stay on the
 * BACK as hidden connectors — exactly what clicking those dots by hand would draw.
 * Four dots per square keeps the parity aligned across square boundaries, so one
 * thread covers the whole fabric.
 */
export function generateFullCrossStitch(
    columns: number,
    rows: number,
    name: string,
    color: string,
    width: number,
): StitchPattern {
    const thread = new StitchThreadPath(name, color, width);

    for (let cy = 0; cy < rows - 1; cy++) {
        const yTop = 2 * cy;
        const yBottom = yTop + 2;

        for (let cx = 0; cx < columns - 1; cx++) {
            const xLeft = 2 * cx;
            const xRight = xLeft + 2;

            // TL, BR, TR, BL -> two front diagonals + a back connector per square.
            thread.pushDotIndex(xLeft, yTop);
            thread.pushDotIndex(xRight, yBottom);
            thread.pushDotIndex(xRight, yTop);
            thread.pushDotIndex(xLeft, yBottom);
        }
    }

    return [thread];
}
