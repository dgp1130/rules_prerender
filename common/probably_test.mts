import { definitely, Definitely, Probably } from './probably.mjs';

interface User {
    name: string;
}

describe('probably', () => {
    describe('Probably<T>', () => {
        it('does not expose any useful properties', () => {
            const prob = {} as Probably<User>;

            // @ts-expect-error User properties should be removed.
            prob.name;

            expect().nothing(); // Compile-time only test.
        });

        it('allows indexed property access', () => {
            const prob = { } as Probably<User>;

            prob['name'];
            prob['id']; // Does not exist, but still allowed.

            expect().nothing(); // Compile-time only test.
        });
    });

    describe('Definitely<T>', () => {
        it('converts a `Probably<T>` back into its original type', () => {
            const prob = { name: 'devel' } as Probably<User>;

            let user = prob as unknown as Definitely<typeof prob>;

            // @ts-expect-error Property `name` is missing from type `User`.
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            user = {};

            expect().nothing(); // Compile-time only test.
        });

        it('returns `never` when given anything other than a `Probably<T>`', () => {
            const prob = { name: 'devel' } as User;

            // @ts-expect-error `typeof prob` is `User`, not `Probably<User>`.
            prob as Definitely<typeof prob>;

            expect().nothing(); // Compile-time only test.
        });
    });

    describe('definitely()', () => {
        it('asserts the input is definitely the right type', () => {
            const prob = { name: 'devel' } as Probably<User>;

            let user = definitely(prob);

            // `definitely()` is a no-op.
            expect(user).toBe(prob as unknown as User);

            // @ts-expect-error Property `name` is missing from type `User`.
            user = {};
        });
    });
});
