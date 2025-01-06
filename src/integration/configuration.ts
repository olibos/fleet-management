import { fileURLToPath } from 'node:url';
import type { AstroConfig, AstroIntegration } from "astro";

export const VIRTUAL_MODULES_IDS = {
    client: 'wavenet:config/client',
    server: 'wavenet:config/server',
};

export const VIRTUAL_MODULES_IDS_VALUES = new Set(Object.values(VIRTUAL_MODULES_IDS));

export const ENV_TYPES_FILE = 'config.d.ts';

function getOptions(schema: Record<string, Record<string, unknown>>, key: string) {
    const { context, access, ...options } = schema[key] ?? {};
    return options;
}

function loadStructure(entries: [string, AstroConfig['env']['schema'][string]][]) {
    const structure: Record<string, any> = {};
    for (const [key] of entries) {
        let current = structure;
        const keys = key.split('__');
        for (let i = 0; i < keys.length - 1; i++) {
            const key = snakeCaseToCamelCase(keys[i]);
            current[key] ??= {};
            current = current[key];
        }

        current[snakeCaseToCamelCase(keys[keys.length - 1])] = key;
    }

    return structure;
}

function resolveVirtualModuleId<T extends string>(id: T): `\0${T}` {
    return `\0${id}`;
}

function snakeCaseToCamelCase(key: string) {
    return key.toLocaleLowerCase().replaceAll(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

function resolveTypes(structure: Record<string, unknown>) {
    return JSON
            .stringify(structure)
            .replaceAll(
                /"\$[^$]+\$"/g, 
                types => {
                    const result = JSON.parse(types) as string;
                    return result.substring(1, result.length - 1);
                });
}
export function configurationWrapper(): AstroIntegration {
    return {
        name: 'wavenet-configuration-wrapper',
        hooks: {
            'astro:config:setup'({ config, updateConfig }) {
                const schema = config.env.schema;
                if (!schema) return;
                const path = config.vite.envDir ?? fileURLToPath(config.root);
                config = updateConfig({
                    vite: {
                        plugins: [
                            {
                                name: 'wavenet-configuration-wrapper',
                                resolveId(source) {
                                    if (VIRTUAL_MODULES_IDS_VALUES.has(source)) return resolveVirtualModuleId(source);
                                },
                                load(id) {
                                    switch (id) {
                                        case resolveVirtualModuleId(VIRTUAL_MODULES_IDS.server): {
                                            const server = loadStructure(Object.entries(schema).filter(([_, value]) => value.context === 'server'));
                                            const buffer = [`import { createInvalidVariablesError, validateEnvVariable } from 'astro/env/runtime';
import { loadEnv } from "vite";
const env = loadEnv(process.env.NODE_ENV, ${JSON.stringify(path)}, "");
const cache = new Map();
function load(key, options){
    if (cache.has(key)) return cache.get(key);

    const value = env[key];
    const result = validateEnvVariable(value, options);
    if (!result.ok) throw createInvalidVariablesError(key, options.type, result);

    cache.set(key, result.value);
    return result.value;
}`, 'export default '];

                                            function buildGetters(structure: Record<string, any>, buffer: string[] = []) {
                                                buffer.push('Object.freeze({');
                                                for (const [key, value] of Object.entries(structure)) {
                                                    if (typeof value === 'string') {
                                                        buffer.push(`get ${key}(){return load(${JSON.stringify(value)}, ${JSON.stringify(getOptions(schema, value))})},`)
                                                    } else {
                                                        buffer.push(`${key}: `);
                                                        buildGetters(value, buffer);
                                                        buffer.push(',');
                                                    }
                                                }

                                                buffer.push('})');
                                                return buffer;
                                            }
                                            return buildGetters(server, buffer).join('');
                                        }

                                        case resolveVirtualModuleId(VIRTUAL_MODULES_IDS.client): {
                                            const client = Object.entries(schema).filter(([_, options]) => options.context === 'client');
                                            const structure = loadStructure(client);
                                            const buffer: string[] = [];

                                            function buildGetters(structure: Record<string, any>, buffer: string[] = []) {
                                                buffer.push('Object.freeze({');
                                                for (const [key, value] of Object.entries(structure)) {
                                                    if (typeof value === 'string') {
                                                        buffer.push(`${key}: ${value},`)
                                                    } else {
                                                        buffer.push(`${key}: `);
                                                        buildGetters(value, buffer);
                                                        buffer.push(',');
                                                    }
                                                }

                                                buffer.push('})');
                                                return buffer;
                                            }

                                            buffer.push(`import {${client.map(([k]) => k).join(',')}} from 'astro:env/client';`, 'export default ');
                                            return buildGetters(structure, buffer).join('');
                                        }
                                    }
                                }
                            }
                        ]
                    }
                });
            },
            'astro:config:done'({ config, injectTypes }) {
                const schema = config.env.schema;
                if (!schema) return;
                const entries = Object.entries(schema);

                const server: Record<string, any> = {};
                const client: Record<string, any> = {};
                for (const [key, options] of entries) {
                    let current = options.context === 'server' ? server : client;
                    const keys = key.split('__');
                    for (let i = 0; i < keys.length - 1; i++) {
                        const key = snakeCaseToCamelCase(keys[i]);
                        current[key] ??= {};
                        current = current[key];
                    }

                    var targetType: string = options.type;
                    if (options.type === 'enum') {
                        targetType = options.values.map(v => JSON.stringify(v)).join('|');
                    }

                    if (options.optional && options.default == null) {
                        targetType += '|undefined';
                    }

                    current[snakeCaseToCamelCase(keys[keys.length - 1])] = `$${targetType}$`;
                }

                injectTypes({
                    filename: ENV_TYPES_FILE,
                    content: `type RecursiveReadonly<T> = T extends Record<string, any> ? { readonly [K in keyof T]: RecursiveReadonly<T[K]> } : T;
declare module 'wavenet:config/client' {
    const schema: RecursiveReadonly<${resolveTypes(client)}>;
    export default schema;
}
declare module 'wavenet:config/server' {
    const schema: RecursiveReadonly<${resolveTypes(server)}>;
    export default schema;
}`
                })
            }
        }
    }
}
