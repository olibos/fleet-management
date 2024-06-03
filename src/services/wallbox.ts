import { configuration } from "@/configuration";

const wallbox = configuration.wallbox;
const Authorization = `Basic ${Buffer.from(`${wallbox.username}:${wallbox.password}`).toString('base64')}`;
export async function login() {
    const response = await fetch(
        'https://user-api.wall-box.com/users/signin',
        {
            headers: {
                Authorization,
                'Partner': 'wallbox',
                "Accept": "application/json",
                "Content-Type": "application/json;charset=UTF-8",
                "User-Agent": "HomeAssistantWallboxPlugin/1.0.0",
            }
        }
    );

    const loginResponse = await response.json() as LoginResult;
    return loginResponse.data.attributes.token;
}

export async function getSessionList(token: string, chargerId: number, start: Date, end?: Date) {
    start.setHours(0, 0, 0);
    if (!end) {
        end = new Date(start);
        end.setMonth(end.getMonth() + 1);
        end.setDate(1);
    }

    const response = await fetch(
        `https://api.wall-box.com/v4/sessions/stats?charger_id=${chargerId}&start_date=${Math.round(start.getTime() / 1000)}&end_date=${Math.round(end.getTime() / 1000)}`,
        {
            headers: {
                "Authorization": `Bearer ${token}`,
                "Accept": "application/json",
                "Content-Type": "application/json;charset=UTF-8",
                "User-Agent": "HomeAssistantWallboxPlugin/1.0.0",
            }
        });

    return await response.json() as GetSessionListResult;

}

export type LoginResult = {
    data: {
        type: string
        id: string
        attributes: {
            token: string
            ttl: number
            user_id: string
            refresh_token: string
            refresh_token_ttl: number
        }
    }
}

export type GetSessionListResult = {
    meta: {
        count: number
    },
    links: {
        self: string
    },
    data: {
        type: string
        id: string
        attributes: {
            group: number
            charger: number
            user: number
            start: number
            end: number
            energy: number
            discharged_energy: number
            mid_energy: number
            green_energy: number
            time: number
            discharging_time: number
            cost: number
            cost_savings: number
            cost_unit: string
            currency: {
                id: number
                name: string
                symbol: string
                code: string
            }
            range: number
            group_name: string
            base_group_name: string
            charger_name: string
            user_subgroup: string
            user_name: string
            user_email: string
            user_rfid: string | null
            user_plate: string | null
            user_extra_information: string | null
            user_is_rfid: number
            energy_unit: string
            amount: number | null
            service_price: number | null
            service_time: number | null
            tax_rate: number | null
            tax_sales: number | null
        }
    }[]
}