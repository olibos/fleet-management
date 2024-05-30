import { mssql } from "@/services/mssql";
import type { UpdateMappingRequest } from "./update-mapping-request";

export async function updateMappingHandler(input: UpdateMappingRequest) {
    const connection = await mssql;
    const analyticId = (input.analyticId ?? '').trim();
    await connection.query`
        MERGE [dbo].[TotalCardMapping] AS target
        USING (VALUES (${input.cardId},${input.company})) AS source (cardId,company)
        ON target.cardId = source.cardId AND target.company = source.company
        WHEN MATCHED AND ${analyticId} = '' THEN
            DELETE
        WHEN MATCHED THEN
            UPDATE SET analyticId = ${analyticId}
        WHEN NOT MATCHED AND ${analyticId} <> '' THEN
            INSERT (cardId,company,analyticId) VALUES (source.cardId,source.company,${analyticId});`;
}