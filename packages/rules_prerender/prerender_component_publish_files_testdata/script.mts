import { bar } from './script_dep.mjs';

export function foo(): string {
    return bar();
}
