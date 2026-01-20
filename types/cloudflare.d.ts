/// <reference types="@cloudflare/workers-types" />

export {};

declare global {
    type PagesContext<
        Env = unknown,
        Params extends string = any,
        Data extends Record<string, unknown> = Record<string, unknown>,
    > = EventContext<Env, Params, Data>;
}
