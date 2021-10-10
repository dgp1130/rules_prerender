export type SsrFactory<
    PrerenderedData extends Record<string, unknown> | undefined =
        Record<string, unknown> | undefined,
    Context = unknown,
> = (data: PrerenderedData) => SsrComponent<Context>;

export interface SsrComponent<
    Context = void,
    Params extends unknown[] = unknown[],
> {
    readonly name: string;
    render(ctx: Context, ...params: Params):
        | string
        | Promise<string>
        | Generator<string, void, void>
        | AsyncGenerator<string, void, void>;
}
