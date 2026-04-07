import { ValtheraClass } from "@wxn0brp/db-core";
import { DbStorageLength, Opts } from "./action";

export function createLengthValthera(opts: Opts) {
    return new ValtheraClass({
        dbAction: new DbStorageLength(opts)
    });
}
