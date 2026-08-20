import { ValtheraClass } from "@wxn0brp/db-core";
import { DbStorageLength, Opts } from "./action";

export function createLengthValthera(opts: Opts) {
	return new ValtheraClass({
		adapter: new DbStorageLength(opts),
	});
}

export const DYNAMIC = {
	length: (opts: Opts) => new DbStorageLength(opts),
};
