import * as v from "valibot";

export function paginatedTwitchResponse<
  T extends v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>,
>(schema: T) {
  return v.object({
    data: v.array(schema),
    pagination: v.optional(v.object({ cursor: v.optional(v.string()) })),
    total: v.optional(v.number()),
  });
}
