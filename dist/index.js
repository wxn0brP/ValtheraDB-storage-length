import { ValtheraClass } from "@wxn0brp/db-core";
import { DbStorageLength } from "./adapter.js";
export function createLengthValthera(opts) {
    return new ValtheraClass({
        adapter: new DbStorageLength(opts),
    });
}
export const DYNAMIC = {
    def: (opts) => new DbStorageLength(opts),
};
