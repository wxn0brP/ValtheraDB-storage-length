import { ValtheraClass } from "@wxn0brp/db-core";
import { DbStorageLength, Opts } from "./adapter.js";
export declare function createLengthValthera(opts: Opts): ValtheraClass;
export declare const DYNAMIC: {
    def: (opts: Opts) => DbStorageLength;
};
