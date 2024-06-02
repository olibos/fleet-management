import { twoDigits } from "@/helpers/two-digits";
import { getDocument } from "pdfjs-dist";
import type { TextItem, TextMarkedContent } from "pdfjs-dist/types/src/display/api";

const parsePrice = (value: string) => +value.replace(/,/g, '.');
const expression = /c€\/kWh (?:\d{2},\d{2}\s){0,8}(\d{2},\d{2}) (\d{2},\d{2}) (\d{2},\d{2}) (\d{2},\d{2})composantes de ce prix commercial de l'électricité/g;

const isTextItem = (item: TextItem | TextMarkedContent): item is TextItem => 'str' in item;
const configurationTypes = [{ev:false, digital: false}, {ev:true, digital: false}, {ev:false, digital: true}, {ev:true, digital: true}];

export async function* getCregTariffs(date: Date) {
    const httpResponse = await fetch(`https://www.creg.be/sites/default/files/assets/Prices/Dashboard/tableaudebord${date.getFullYear()}${twoDigits(date.getMonth() + 1)}.pdf`)
    if (!httpResponse.ok) return;

    const pdf = await getDocument(await httpResponse.arrayBuffer()).promise;
    const page = await pdf.getPage(5);
    const textContent = await page.getTextContent();
    const text = textContent.items.filter(isTextItem).map(i => i.str).join('');

    let configurationIndex = 0;
    for(const [_,be,vl,br,wl] of text.matchAll(expression)){
        yield {
            ...configurationTypes[configurationIndex],
            be: parsePrice(be),
            vl: parsePrice(vl),
            br: parsePrice(br),
            wl: parsePrice(wl),
        };
        configurationIndex++;
    }
}