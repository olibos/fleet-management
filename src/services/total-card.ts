import { type CheerioAPI, load } from "cheerio";
import fetchCookie from "fetch-cookie";
import { CookieJar } from "tough-cookie";

const BASE_URL = 'https://cardsonline.totalenergies.be/'

function objectToUrlEncoded(obj: Record<string, string>): string {
    const params = new URLSearchParams();

    for(const [key, value] of Object.entries(obj)) {
        params.append(key, value);
    }

    return params.toString();
}

export class TotalCardService {

    readonly #cookies = new CookieJar();
    readonly #fetch;
    #$: CheerioAPI = null!;
    #companyName: string = null!;
    #invoiceExcelLink: string | undefined;
    #invoicePdfLink: string | undefined;

    constructor (private accountId: number, fetchMethod = fetch){
        this.#fetch = fetchCookie(fetchMethod, this.#cookies);
    }

    async #loadPage(url: string){
        const r = await this.#fetch(new URL(url, BASE_URL));
        if (!r.ok) throw new Error("Failed to load page");
    
        this.#$ = load(await r.text());
    }

    async #postPage(url: string, obj: Record<string,string>){
        const r = await this.#fetch(
            new URL(url, BASE_URL),
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                body: objectToUrlEncoded(obj)
            });
        if (!r.ok) throw new Error("Failed to post to page");
    
        this.#$ = load(await r.text());
    }

    #getField(fieldName: string): [string, string] {
        return [fieldName, this.#$(`input[name="${fieldName}"]`).val() as string ?? ""];
    }
    
    #getLink(partialUrl: string){
        const script = this.#$(`a[href*="${partialUrl}"]`).attr("href");
        if (!script) return;
    
        const start = script.indexOf('(') + 2,
            end = script.indexOf(')') - 1;
        return script.substring(start, end);
    }
    

    async login(username: string, password: string) {
        await this.#loadPage("/public/transverse/seconnecter/authentification.do");
        await this.#postPage(
            "/j_security_check",
            Object.fromEntries([
                this.#getField("fakeusernameremembered"),
                this.#getField("fakepasswordremembered"),
                ["j_username", username],
                ["j_password", password],
                this.#getField("conv_ID"),
                this.#getField("correctAnswer"),
                this.#getField("idImage"),
                this.#getField("callback_url"),
            ]));

        this.#companyName = this.#$(`option[value=${this.accountId}]`).text().replace(`${this.accountId}-`, "").trim();

        await this.#postPage(
            "/public/transverse/seconnecter/selectioncompte.do",
            Object.fromEntries([
                this.#getField("org.apache.struts.taglib.html.TOKEN"),
                ["method", "terminerSelectionCompte"],
                this.#getField("dirtyModeActivated"),
                ["dirty", "true"],
                this.#getField("dirtyCommand"),
                this.#getField("anchor"),
                this.#getField("csrfToken"),
                ["loginCompteCardpro", this.accountId],
                this.#getField("conv_ID"),
            ]));

        this.#invoicePdfLink = this.#getLink("/secure/clients/factures/recherche.do"),
        this.#invoiceExcelLink = this.#getLink("/secure/clients/rapports/telechargement/informationsgenerales.do");
    }

    async getPeriods() {
        if (!this.#invoiceExcelLink) throw new Error("Not logged in!");
        await this.#loadPage(this.#invoiceExcelLink);
        return this.#$('select[name="criteresTID.dateFacturation"] option').toArray().map(e => e.attribs.value).filter(e => typeof e === 'string');
    }
}