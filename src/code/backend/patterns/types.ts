import type { CrosslyDataModel, Link } from "@textyly/crossly-private-persistence-contracts";

/** Gzip (de)compression of the pattern data model for the wire (matches the service). */
export interface ICompressor {
    compress(dataModel: CrosslyDataModel): Promise<Uint8Array>;
    decompress(stream: ReadableStream<Uint8Array>): Promise<CrosslyDataModel>;
}

/**
 * Client for crossly.private.persistence.service. Speaks the published pattern
 * contract (`CrosslyDataModel` + HATEOAS `Link`s) and handles the gzip transport.
 * The link paths returned by {@link getAll}/{@link create} are passed back into
 * {@link getById}/{@link replace}/{@link rename}/{@link delete}.
 */
export interface IPatternsClient {
    /** Links for every stored pattern. */
    getAll(): Promise<Link[]>;

    /** Fetch and decompress a pattern by its `getById` link path. */
    getById(getByIdPath: string): Promise<CrosslyDataModel>;

    /** Store a new pattern; returns its link. */
    create(dataModel: CrosslyDataModel): Promise<Link>;

    /** Replace a pattern by its `replace` link path; `false` if not found. */
    replace(replacePath: string, dataModel: CrosslyDataModel): Promise<boolean>;

    /** Rename a pattern by its `rename` link path; `false` if not found. */
    rename(renamePath: string, newName: string): Promise<boolean>;

    /** Delete a pattern by its `delete` link path; `false` if not found. */
    delete(deletePath: string): Promise<boolean>;
}
