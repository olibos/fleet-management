import sql from 'mssql';
import { getDbSettings } from '@/configuration'

const sqlConfig = getDbSettings();
const connection = 'connectionString' in sqlConfig 
    ? new sql.ConnectionPool(sqlConfig.connectionString)
    : new sql.ConnectionPool({
        server: sqlConfig.server,
        database: sqlConfig.database,
        authentication: {type: "azure-active-directory-default", options:{}},
    });
export const mssql = connection.connect();
