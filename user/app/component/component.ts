export function renderComponent(name: string): string {
    return `
        <div comp-component>
            <span>Hello ${name}!</span>
        </div>
    `;
}
