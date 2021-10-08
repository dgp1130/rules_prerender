import { JsonObject } from 'rules_prerender/common/models/json';

export type SsrFactory<
    PrerenderedData extends JsonObject | undefined = JsonObject | undefined,
    SsrParams extends unknown[] = [],
> = (data: PrerenderedData) => SsrComponent<SsrParams>;

export interface SsrComponent<Parameters extends unknown[] = []> {
    // TODO: Request input?
    render(...params: Parameters):
        | string
        | Promise<string>
        | Generator<string, void, void>
        | AsyncGenerator<string, void, void>;
}
