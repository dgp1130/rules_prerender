import { bar } from './script_dep';

export function foo(): string {
    return bar();
}
