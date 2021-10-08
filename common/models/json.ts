export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonObject | JsonArray;
export type JsonObject = {[key: string]: JsonValue};
export type JsonArray = JsonValue[];
