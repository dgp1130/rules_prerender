export function render(): string {
    return `
        <div class="transitive">
            <span class="content">
                I'm a component which is depended upon transitively!
            </span>
        </div>
    `;
}
