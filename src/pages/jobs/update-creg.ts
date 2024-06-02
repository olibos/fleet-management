import type { APIRoute } from "astro";
import {mssql} from '@/services/mssql';
import sql from 'mssql';
import { twoDigits } from "@/helpers/two-digits";
import { getCregTariffs } from "@/services/creg";

function formatDate(d: Date) {
    let month = (d.getMonth() + 1),
        day = d.getDate(),
        year = d.getFullYear();

    return [year, twoDigits(month), twoDigits(day)].join('-');
}

export const GET: APIRoute= async () => {
    const db = await mssql
    const response = await db.query<{date: Date}>`SELECT date=max(Month) FROM [dbo].[CregTariffs]`;
    const [{date}] = response.recordset;
    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setUTCHours(0,0,0,0)

    const insert = new sql.Table('[dbo].[CregTariffs]');
    insert.columns.add('Month', sql.Date, { primary: true, nullable: false });
    insert.columns.add('WithElectricVehicle', sql.Bit, { primary: true, nullable: false });
    insert.columns.add('WithDigitalMeter', sql.Bit, { primary: true, nullable: false });
    insert.columns.add('Belgium', sql.Decimal(4, 2), {nullable:false});
    insert.columns.add('Flanders', sql.Decimal(4, 2), {nullable:false});
    insert.columns.add('Brussels', sql.Decimal(4, 2), {nullable:false});
    insert.columns.add('Wallonia', sql.Decimal(4, 2), {nullable:false});

    for (date.setMonth(date.getMonth() + 1);date < thisMonth;date.setMonth(date.getMonth() + 1)) {
        for await (const {ev, digital, be, vl, br, wl} of getCregTariffs(date)){
            insert.rows.add(formatDate(date), ev, digital, be, vl, br, wl);
        }
    }

    if (insert.rows.length) {
        await db.request().bulk(insert);
    }

    return new Response('OK', { status: 200 });
}