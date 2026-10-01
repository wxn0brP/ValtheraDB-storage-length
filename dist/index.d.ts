import { ValtheraClass } from "@wxn0brp/db-core";
import { DbStorageLength, Opts } from "./action.js";
export declare function createLengthValthera(opts: Opts): ValtheraClass;
export declare const DYNAMIC: {
    length: (opts: Opts) => DbStorageLength;
};
