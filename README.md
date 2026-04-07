# @wxn0brp/db-storage-length

Storage adapter for ValtheraDB that reads and writes **fixed-length record files** (.dat and similar formats common in legacy/embedded systems).

Every record has a statically-defined schema where each field occupies an exact number of bytes. Binary numeric types (uint8, int32le, float64be, etc) are supported alongside plain UTF-8 text fields.

## Installation

```bash
npm i github:wxn0brP/ValtheraDB-storage-length#dist
```

## Quick start

```typescript
import { createLengthValthera } from "@wxn0brp/db-storage-length";

const db = createLengthValthera({
    dir: "./data",
    schemas: {
        // You can provide either:
        // - FieldType (e.g. "uint32le", "float64le") - size is auto-detected
        // - number (byte length) - treated as string field
        users: [
            ["id",    "uint32le"],      // 4 bytes, little-endian uint32
            ["name",  32],              // 32-byte string (space-padded, trimmed)
            ["age",   "uint16le"],      // 2 bytes, little-endian uint16
            ["score", "float64le"],     // 8 bytes, little-endian float64
        ],
    },
});

// Read all records from data/users.dat
const users = await db.c("users").find();

// Add a record
await db.c("users").add({ id: 1, name: "Alice", age: 30, score: 99.5 });
```

## Options

| Property | Type | Description |
| -- | -- | -- |
| dir | string | Directory where .dat files are stored. File name = <collection>.<ext>. |
| file | string | Path to a single fixed file (overrides dir). |
| schemas | Record<string, Schema[]> | Schema definitions per collection (required). |
| ext | string | File extension when using dir. Defaults to "dat". |

Exactly one of file or dir must be provided.

## Schema

```typescript
type FieldDefinition = FieldType | number;
type Schema = [fieldName: string, fieldDefinition: FieldDefinition];
```

Each tuple defines one field in a row. Rows are fixed-size - the total row length is the sum of all field byte lengths.

You can provide either:

- A **number** - treated as string field with that byte length (space-padded, trimmed on read)
- A **negative number** - raw string mode, direct read/write without padding or trimming (use `Math.abs(number)` as length)
- A **FieldType** - binary type with automatic size detection (e.g. "uint32le", "float64be")

**Examples:**

```typescript
schemas: {
    users: [
        ["name", 32],       // 32-byte string, space-padded, trimmed on read
        ["raw", -32],       // 32-byte raw string, no padding, no trimming
        ["age", "uint8"],   // 1-byte unsigned int
    ],
}
```

### Field types

| Type | Bytes | JS value | Notes |
| -- | -- | -- | -- |
| "string" | any | string | UTF-8 |
| "uint8" | 1 | number | |
| "int8" | 1 | number | |
| "uint16le" | 2 | number | Little-endian |
| "uint16be" | 2 | number | Big-endian |
| "int16le" | 2 | number | |
| "int16be" | 2 | number | |
| "uint32le" | 4 | number | |
| "uint32be" | 4 | number | |
| "int32le" | 4 | number | |
| "int32be" | 4 | number | |
| "float32le" | 4 | number | Single-precision float |
| "float32be" | 4 | number | |
| "float64le" | 8 | number | Double-precision float |
| "float64be" | 8 | number | |

Endianness: le = little-endian, be = big-endian.

## Low-level API

You can use DbStorageLength directly without the ValtheraDB wrapper:

```typescript
import { DbStorageLength } from "@wxn0brp/db-storage-length/action";

const storage = new DbStorageLength({
    dir: "./data",
    schemas: {
        sensors: [
            ["timestamp", "uint32le"],    // 4 bytes
            ["value",     "float32le"],   // 4 bytes
            ["label",     16],            // 16-byte string
        ],
    },
});

const rows = await storage.read("sensors");
// [{ timestamp: 1712345678, value: 23.5 }, ...]
await storage.write("sensors", rows);
```

## License

MIT
