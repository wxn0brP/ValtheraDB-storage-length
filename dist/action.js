import { CustomFileCpu } from "@wxn0brp/db-core";
import { CustomActionsBase } from "@wxn0brp/db-core/base/custom";
import { access, mkdir, readdir, readFile, rm, writeFile } from "fs/promises";
const typeSizes = {
    string: 0,
    uint8: 1,
    int8: 1,
    uint16le: 2,
    uint16be: 2,
    int16le: 2,
    int16be: 2,
    uint32le: 4,
    uint32be: 4,
    int32le: 4,
    int32be: 4,
    float32le: 4,
    float32be: 4,
    float64le: 8,
    float64be: 8,
};
function resolveFieldDefinition(def) {
    if (typeof def === "number") {
        const isRaw = def < 0;
        return [
            Math.abs(def),
            "string",
            isRaw,
        ];
    }
    return [
        typeSizes[def],
        def,
        false,
    ];
}
function readField(buf, offset, len, type, isRaw = false) {
    switch (type) {
        case "uint8":
            return buf.readUInt8(offset);
        case "int8":
            return buf.readInt8(offset);
        case "uint16le":
            return buf.readUInt16LE(offset);
        case "uint16be":
            return buf.readUInt16BE(offset);
        case "int16le":
            return buf.readInt16LE(offset);
        case "int16be":
            return buf.readInt16BE(offset);
        case "uint32le":
            return buf.readUInt32LE(offset);
        case "uint32be":
            return buf.readUInt32BE(offset);
        case "int32le":
            return buf.readInt32LE(offset);
        case "int32be":
            return buf.readInt32BE(offset);
        case "float32le":
            return buf.readFloatLE(offset);
        case "float32be":
            return buf.readFloatBE(offset);
        case "float64le":
            return buf.readDoubleLE(offset);
        case "float64be":
            return buf.readDoubleBE(offset);
        default: {
            const str = buf.subarray(offset, offset + len).toString("utf-8");
            return isRaw ? str : str.trim();
        }
    }
}
function writeField(value, len, type, isRaw = false) {
    const buf = Buffer.alloc(len, 0x20); // 0x20 = space
    switch (type) {
        case "uint8":
            buf.writeUInt8(Number(value ?? 0), 0);
            break;
        case "int8":
            buf.writeInt8(Number(value ?? 0), 0);
            break;
        case "uint16le":
            buf.writeUInt16LE(Number(value ?? 0), 0);
            break;
        case "uint16be":
            buf.writeUInt16BE(Number(value ?? 0), 0);
            break;
        case "int16le":
            buf.writeInt16LE(Number(value ?? 0), 0);
            break;
        case "int16be":
            buf.writeInt16BE(Number(value ?? 0), 0);
            break;
        case "uint32le":
            buf.writeUInt32LE(Number(value ?? 0), 0);
            break;
        case "uint32be":
            buf.writeUInt32BE(Number(value ?? 0), 0);
            break;
        case "int32le":
            buf.writeInt32LE(Number(value ?? 0), 0);
            break;
        case "int32be":
            buf.writeInt32BE(Number(value ?? 0), 0);
            break;
        case "float32le":
            buf.writeFloatLE(Number(value ?? 0), 0);
            break;
        case "float32be":
            buf.writeFloatBE(Number(value ?? 0), 0);
            break;
        case "float64le":
            buf.writeDoubleLE(Number(value ?? 0), 0);
            break;
        case "float64be":
            buf.writeDoubleBE(Number(value ?? 0), 0);
            break;
        default: {
            const str = (value ?? "").toString();
            if (isRaw) {
                const encoded = Buffer.from(str, "utf-8");
                encoded.copy(buf, 0, 0, Math.min(encoded.length, len));
            }
            else {
                const encoded = Buffer.from(str.length > len ? str.substring(0, len) : str.padEnd(len, " "), "utf-8");
                encoded.copy(buf, 0, 0, Math.min(encoded.length, len));
            }
            break;
        }
    }
    return buf;
}
export class DbStorageLength extends CustomActionsBase {
    opts;
    constructor(opts) {
        super();
        this.opts = opts;
        this.fileCpu = new CustomFileCpu(this.read.bind(this), this.write.bind(this));
    }
    _getPath(collection) {
        if (this.opts.file)
            return this.opts.file;
        else if (this.opts.dir)
            return this.opts.dir + "/" + collection + "." + (this.opts.ext || "dat");
    }
    async read(collection) {
        const path = this._getPath(collection);
        if (!path)
            return null;
        let rawBuf;
        try {
            rawBuf = (await readFile(path));
        }
        catch {
            return [];
        }
        const schema = this.opts.schemas[collection];
        if (!schema)
            return [];
        const rowLength = schema.reduce((acc, [_, fieldDef]) => {
            const [len] = resolveFieldDefinition(fieldDef);
            return acc + len;
        }, 0);
        const result = [];
        for (let i = 0; i + rowLength <= rawBuf.length; i += rowLength) {
            const item = {};
            let offset = 0;
            for (const [key, fieldDef] of schema) {
                const [len, type, isRaw] = resolveFieldDefinition(fieldDef);
                item[key] = readField(rawBuf, i + offset, len, type, isRaw);
                offset += len;
            }
            result.push(item);
        }
        return result;
    }
    async write(collection, data) {
        const path = this._getPath(collection);
        if (!path)
            return;
        const schema = this.opts.schemas[collection];
        if (!schema || !Array.isArray(data))
            return;
        const rowLength = schema.reduce((acc, [_, fieldDef]) => {
            const [len] = resolveFieldDefinition(fieldDef);
            return acc + len;
        }, 0);
        const out = Buffer.alloc(rowLength * data.length);
        let rowOffset = 0;
        for (const item of data) {
            let fieldOffset = 0;
            for (const [key, fieldDef] of schema) {
                const [len, type, isRaw] = resolveFieldDefinition(fieldDef);
                const fieldBuf = writeField(item[key], len, type, isRaw);
                fieldBuf.copy(out, rowOffset + fieldOffset);
                fieldOffset += len;
            }
            rowOffset += rowLength;
        }
        await writeFile(path, out);
    }
    async ensureCollection(collection) {
        const path = this._getPath(collection);
        if (this.opts.file) {
            try {
                await access(path);
            }
            catch {
                await writeFile(path, "");
            }
        }
        else if (this.opts.dir) {
            try {
                await access(path);
            }
            catch {
                await mkdir(path.split("/").slice(0, -1).join("/"), {
                    recursive: true,
                });
                await writeFile(path, "");
            }
        }
        return true;
    }
    async issetCollection(collection) {
        const path = this._getPath(collection);
        try {
            await access(path);
            return true;
        }
        catch {
            return false;
        }
    }
    async getCollections() {
        if (this.opts.file) {
            return [
                this.opts.file,
            ];
        }
        else if (this.opts.dir) {
            return await readdir(this.opts.dir, {
                recursive: true,
            });
        }
        else {
            return [];
        }
    }
    async removeCollection(collection) {
        await rm(this._getPath(collection));
        return true;
    }
}
