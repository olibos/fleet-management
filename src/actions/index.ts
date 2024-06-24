import { defineAction, z } from "astro:actions";
import { listHandler } from "./card-mapping/queries/list-mapping/list-mapping-handler";
import { updateMappingRequest } from "./card-mapping/commands/update-mapping/update-mapping-request";
import { updateMappingHandler } from "./card-mapping/commands/update-mapping/update-mapping-handler";

export const server = {
    listCardMapping: defineAction({
        input: z.undefined(),
        handler: listHandler
    }),
    updateCardMapping: defineAction({
        input: updateMappingRequest,
        handler: updateMappingHandler,
    })
}