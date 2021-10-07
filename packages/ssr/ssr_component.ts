export type SsrFactory = (data: unknown) => SsrComponent;
export interface SsrComponent {
    // TODO: Request input?
    render():
        | string
        | Promise<string>
        | Generator<string, void, void>
        | AsyncGenerator<string, void, void>;
}
