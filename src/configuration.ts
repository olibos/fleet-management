import baseConfiguration from 'wavenet:config/server'

type DbSettings = { connectionString: string } | { server: string; database: string; };

export const configuration = baseConfiguration;
export function getDbSettings(): DbSettings {
    const { server, name: database, connectionString } = configuration.db;
    if (connectionString) {
        return {
            connectionString: connectionString
        }
    }

    if (server && database) {
        return {
            server,
            database,
        }
    }

    throw new Error("Missing DB Settings.")
}
