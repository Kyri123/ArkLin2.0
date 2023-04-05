import { Schema } from "mongoose";

export function Plugin_MongoDB_findOne(schema: Schema) {
  schema.post("findOne", function (res, next) {
    return next();
  });
}
