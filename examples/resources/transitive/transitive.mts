export function renderTransitive(label: string): string {
    return `
        <div>
            <span>Hello from the ${label} transitive component!</span>
            <img src="/images/transitive.png" />
        </div>
    `;
}
