export type SsrFactory = (data: unknown) => SsrComponent;
export interface SsrComponent {
    // TODO: Request input?
    render(): string;
}
