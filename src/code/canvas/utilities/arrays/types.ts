
// Problem: a dot is described by the following properties: color, radius, coordinates (x, y)
// it is intuitive to put these properties into an object and create an array of it
// using such array of objects will consume enormous memory and GC time
// since the array can contain more than 100 000 objects
import { Dot, DotIndex } from "../../types.js";

// In order to mitigate this problem the below impl has been introduced
// color and radius properties are common for all dots
// x and y are divided in typed arrays
export interface IDotArray {
    get length(): number;

    // common properties for all dots
    get color(): string;
    get radius(): number;

    // a dot is represented by its x and y coordinates
    // to construct а dot get x and y using the same index
    // e.g. const dot = {x: positionsX[index], y: positionsY[index]};
    get positionsX(): Readonly<Int32Array>;
    get positionsY(): Readonly<Int32Array>;
}

export interface IFabricThreadArray {
    get length(): number;

    get color(): string;
    get width(): number;

    // a line is represented by its x1, y1 (from) and x2, y2 (to) coordinates
    // to construct а line get x1, y1, x2 and y2 using the same index
    get positionsX1(): Readonly<Int32Array>;
    get positionsY1(): Readonly<Int32Array>;
    get positionsX2(): Readonly<Int32Array>;
    get positionsY2(): Readonly<Int32Array>;
}

// same motivation as dot array
export interface IThreadPathArray {
    get length(): number;

    get color(): string;
    get width(): number;

    get positionsX(): Readonly<Int32Array>;
    get positionsY(): Readonly<Int32Array>;

    last(): Dot | undefined;
}

// same motivation as dot array
export interface IThreadPath extends IThreadPathArray {
    get name(): string;
    get zoomedWidth(): number;

    get indexesX(): Readonly<Int16Array>;
    get indexesY(): Readonly<Int16Array>;
    get visibilities(): Readonly<Array<boolean>>;

    lastDot(): (Dot & DotIndex) | undefined;
}

// same motivation as dot array
export interface ICueThreadArray {
    get color(): string;
    get width(): number;

    get indexesX(): Readonly<Int16Array>;
    get indexesY(): Readonly<Int16Array>;

    lastDotIndex(): DotIndex | undefined;
}


