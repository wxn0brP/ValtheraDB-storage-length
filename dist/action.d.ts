import { CustomActionsBase } from "@wxn0brp/db-core/base/custom";
export type FieldType = "string" | "uint8" | "int8" | "uint16le" | "uint16be" | "int16le" | "int16be" | "uint32le" | "uint32be" | "int32le" | "int32be" | "float32le" | "float32be" | "float64le" | "float64be";
export type FieldDefinition = FieldType | number;
export type Schema = [
    string,
    FieldDefinition
];
export interface Opts {
    file?: string;
    dir?: string;
    schemas: Record<string, Schema[]>;
    ext?: string;
}
export declare class DbStorageLength extends CustomActionsBase {
    opts: Opts;
    constructor(opts: Opts);
    _getPath(collection: string): string;
    read(collection: string): Promise<Record<string, string | number>[]>;
    write(collection: string, data: any): Promise<void>;
    ensureCollection(collection: string): Promise<boolean>;
    issetCollection(collection: string): Promise<boolean>;
    getCollections(): Promise<string[]>;
    removeCollection(collection: string): Promise<boolean>;
}
