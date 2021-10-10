import { JsonObject } from 'rules_prerender/common/models/json';

export type SsrFactory<
    PrerenderedData extends JsonObject | undefined = JsonObject | undefined,
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
