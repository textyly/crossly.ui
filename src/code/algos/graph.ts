// export interface Node {
//     get data(): void;
//     get links(): Array<Link>;

//     add(link: Link): void;
// }

// export interface Link {
//     get data(): LinkData;
//     get next(): Node;
// }

// export interface LinkData {
//     // identity: guid; ??? LinkIdentityGenerator
// }

// export interface Graph {
//     get root(): Node;
// }

// export class Holes implements Graph {
//     constructor(public root: Hole) {
//     }
// }

// export class Hole implements Node {

//     public get data(): void {
//         throw new Error("Method not implemented.");
//     }

//     public get links(): HoleLink[] {
//         throw new Error("Method not implemented.");
//     }

//     public add(link: HoleLink): void {
//         throw new Error("Method not implemented.");
//     }
// }

// export class HoleLink implements Link {

//     get data(): void {
//         throw new Error("Method not implemented.");
//     }
//     get next(): Hole {
//         throw new Error("Method not implemented.");
//     }
// }

//