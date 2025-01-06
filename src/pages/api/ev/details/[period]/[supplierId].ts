import type { APIRoute } from "astro";
import { mssql } from "@/services/mssql";
import { getSessionList, login, type GetSessionListResult } from '@/services/wallbox';
import PdfPrinter from "pdfmake";
import { twoDigits } from '@/helpers/two-digits';
import type { Content, TableCell } from 'pdfmake/interfaces';
import { formatDuration } from "@/helpers/format-duration";
import Logo from '@/assets/images/logo.svg?raw';

const headerRowFillColor = '#156082';
const oddRowFillColor = '#c0e6f5';
const dateFormatter = new Intl.DateTimeFormat('fr', { day: '2-digit', month: '2-digit', });
const timeFormatter = new Intl.DateTimeFormat('fr', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
const numberFormatter = new Intl.NumberFormat('fr', { maximumFractionDigits: 2, minimumFractionDigits: 2 });
const killoWattHourFormatter = new Intl.NumberFormat('fr', { maximumFractionDigits: 3, minimumFractionDigits: 3 });
const periodFormatter = new Intl.DateTimeFormat('fr', { month: 'long', year: 'numeric' });
const priceFormatter = new Intl.NumberFormat('fr', { style: 'currency', currency: 'EUR' });

const regions = new Map([
    ["Wallonia", "Wallonie"],
    ["Flanders", "Flandre"],
    ["Brussels", "Bruxelles"],
])

export const GET: APIRoute = async (context) => {
    const { period, supplierId } = context.params;
    if (!period || !supplierId) return new Response("bad request", { status: 400 });
    const details = await getEvPeriodDetails(period, supplierId);
    if (!details) return new Response("not found", { status: 404 });

    const start = new Date(+period.substring(0, 4), +period.substring(4, 6) - 1, 1);
    const token = await login();
    const { data } = await getSessionList(token, details.wallboxId, start);

    const pdf = new PdfPrinter({
        Roboto: {
            normal: "Roboto-Regular.ttf",
            bold: "Roboto-Medium.ttf",
            italics: "Roboto-Italic.ttf",
            bolditalics: "Roboto-MediumItalic.ttf",
        },
    })
        .createPdfKitDocument({
            content: [
                getSummaryPage(details, data),
                getDetailsPage(data),
            ],
            styles: {
                header: {
                    fontSize: 18,
                    bold: true,
                    margin: [0, 0, 0, 10],
                },
                th: {
                    fillColor: headerRowFillColor,
                    color: 'white',
                    bold: true
                }
            },
        });
        
    return new Response(await getBuffer(pdf), { headers: { 'Content-Type': 'application/pdf' } });
}

function getBuffer(pdf: PDFKit.PDFDocument) {
    return new Promise<Buffer>((resolve) => {
        const buffs: Uint8Array[] = [];
        pdf.on('data', (d: Uint8Array) => buffs.push(d));
        pdf.on('end', () => resolve(Buffer.concat(buffs)));
        pdf.end();
      });
}

const th = (text: string): TableCell => ({text, style: "th"});

function getSummaryPage(detail: EvPeriodDetails, data: GetSessionListResult["data"]): Content {
    const total = data.reduce((sum, item) => sum + item.attributes.energy, 0);
    return [
        {
            table:{
                widths: ["auto", "*", "auto"],
                body: [
                    [
                        { svg: Logo, width: 200, marginTop: 15, alignment: "center" },  
                        "",
                        [
                            {text:"Wavenet srl", bold:true, fontSize: 14},
                            "Rue de l'Artisanat 16",
                            "7900 Leuze-en-Hainaut",
                            "Tel : 069/67.03.35"
                        ]
                    ],
                ]
            },
            layout:{
                defaultBorder: false
            }
        },
        {
            text: "Remboursement des frais de recharge",
            style: 'header',
            marginTop: 20
        },
        {
            table: {
                widths: ["*", "*"],
                body: [
                    [th("Employé"), { text: detail.name, alignment: 'center', fillColor: oddRowFillColor}],
                    [th("Région"), { text: regions.get(detail.region) || detail.region, alignment: 'right'}],
                    [th("Compteur"), { text: detail.hasDigitalMeter ? "Digital" : "Classique", alignment: 'right', fillColor: oddRowFillColor}],
                    [th("Mois"), { text: periodFormatter.format(detail.period), alignment: 'right'}],
                    [th("Tarif CREG"), { text: numberFormatter.format(detail.tariff) + " c€/kWh", alignment: 'right', fillColor: oddRowFillColor, link: `https://www.creg.be/sites/default/files/assets/Prices/Dashboard/tableaudebord${detail.period.getFullYear()}${twoDigits(detail.period.getMonth() + 1)}.pdf#page=5`}],
                    [th("Consommation"), { text: killoWattHourFormatter.format(total) + " kWh", alignment: 'right', linkToPage: 2 }],
                    [th("Remboursement"), { text: priceFormatter.format(total * detail.tariff / 100.0), alignment: 'right', fillColor: oddRowFillColor}],
                ],
            },
            layout: {
                defaultBorder: false
            },    
        }
    ];
}

function getDetailsPage(data: GetSessionListResult["data"]): Content {
    const total = data.reduce((sum, item) => sum + item.attributes.energy, 0);
    const getFillColor = (i: number) => (i % 2) === 0 ? oddRowFillColor : 'white';
    return [
        {
            text: "Sessions",
            pageBreak: 'before',
            style: 'header',
        },
        {
            table: {
                headerRows: 1,
                widths: ["*", "*", "*", "*"],
                body: [
                    [th("Date"), th("Début"), th("Durée"), th("Consommation")],
                    ...data.map((item, i) => [
                        { text: dateFormatter.format(new Date(item.attributes.start * 1000)), alignment: 'right', fillColor: getFillColor(i) },
                        { text: timeFormatter.format(new Date(item.attributes.start * 1000)), alignment: 'right', fillColor: getFillColor(i) },
                        { text: formatDuration(new Date(item.attributes.start * 1000), new Date(item.attributes.end * 1000)), alignment: 'right', fillColor: getFillColor(i) },
                        { text: killoWattHourFormatter.format(item.attributes.energy) + " kWh", alignment: 'right', fillColor: getFillColor(i) },
                    ]),
                    [{text: killoWattHourFormatter.format(total) + " kWh", colSpan: 4, alignment: 'right', fillColor: getFillColor(data.length), border:[false, true, false, false], borderColor: headerRowFillColor}]
                ],
            },
            layout:{
                defaultBorder: false
            }
        }
    ]
}

async function getEvPeriodDetails(period: string, supplierId: string) {
    const db = await mssql;
    const date = `${period.substring(0, 4)}-${period.substring(4, 6)}-1`;
    const response = await db.query<EvPeriodDetails>`SELECT name = [firstname] + ' ' + [lastname], [wallboxId], [region], [hasDigitalMeter],
    period = c.Month,
    tariff = case u.region
        when 'Brussels' then c.brussels
        when 'Flanders' then c.flanders
        when 'Wallonia' then c.wallonia
        else c.belgium
    end
    from [User] u
    join CregTariffs c on Month=${date} and u.HasDigitalMeter = c.WithDigitalMeter and c.WithElectricVehicle = 1
    where supplierId=${supplierId}`;

    if (response.recordset.length !== 1) return;

    return response.recordset[0];
}

type EvPeriodDetails = {
    period: Date
    name: string
    wallboxId: number
    region: string
    hasDigitalMeter: boolean
    tariff: number
}
