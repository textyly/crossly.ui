import { Dot } from "../canvas/types.js";

export type Project = {
    name: string;
    fabric: Fabric;
    threads: Threads;
    pattern: Pattern;
};

export type Fabric = {
    name: string;
    columns: number;
    rows: number;
    color: string;
    dots: {
        color: string;
        radius: number;
        space: number;
        hidden: {
            enabled: boolean;
        }
    },
    threads: {
        color: string;
        width: number;
    }
};

export type Threads = Array<Thread>;
export type Thread = {
    name: string;
    color: string;
    width: number;
};

export type Hole = Dot;
export type NeedlePath = Array<Hole>;
export type ThreadIndex = number;

export type ThreadPath = {
    threadIndex: ThreadIndex;
    needlePath: NeedlePath;
}

export type Pattern = Array<ThreadPath>;

// TODO: create type!!!
export interface IProjectSerializer {
    serialize(something: any): Project;
    deserialize(project: Project): any;
}


