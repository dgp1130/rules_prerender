import { JsonObject } from 'rules_prerender/common/models/json';

export type SsrFactory<
    PrerenderedData extends JsonObject | undefined = JsonObject | undefined>
        = (data: PrerenderedData) => SsrComponent;

export interface SsrComponent {
    // TODO: Request input?
    render():
        | string
        | Promise<string>
        | Generator<string, void, void>
        | AsyncGenerator<string, void, void>;
}
