import { mssql } from "@/services/mssql";
import type { ListMappingResponse } from './list-mapping-response';

export async function listHandler(): Promise<ListMappingResponse>{
    const connection = await mssql;
    const query = await connection.query<ListMappingResponse>`
        select cardId, company, analyticId from
            (
                select distinct [cardId] = t.CardNumber, [company] = t.Company, [analyticId] = ''
                from TotalCardTransactionV2 t
                where TransactionDate >= dateadd(month, -6, getdate())
                and not exists (select null from [dbo].[TotalCardMapping] where CardId=t.CardNumber and Company=t.Company)
                UNION ALL
                SELECT [cardId]
                    ,[company]
                    ,[analyticId]
                FROM [dbo].[TotalCardMapping]
            ) t
        order by 
            case when analyticId = '' then 0 else 1 end,
            company, cardid`;
    return query.recordset;
}