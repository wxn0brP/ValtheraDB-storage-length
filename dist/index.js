import { ValtheraClass } from "@wxn0brp/db-core";
import { DbStorageLength } from "./action.js";
export function createLengthValthera(opts) {
    return new ValtheraClass({
        adapter: new DbStorageLength(opts),
    });
}
export const DYNAMIC = {
    length: (opts) => new DbStorageLength(opts),
};
