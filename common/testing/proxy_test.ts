import 'jasmine';

import { delegatedProxy } from './proxy';

describe('proxy', () => {
    describe('delegatedProxy()', () => {
        it('delegates `get()` to the dynamically retrieved object', () => {
            let foo = { bar: 'bar' };
            const proxy = delegatedProxy(() => foo);
            expect(proxy.bar).toBe('bar');

            foo = { bar: 'baz' };
            expect(proxy.bar).toBe('baz');
        });

        it('delegates `set()` to the dynamically retrieved object', () => {
            const foo = { bar: 'bar' };
            const proxy = delegatedProxy(() => foo);

            proxy.bar = 'baz';

            expect(foo.bar).toBe('baz');
        });

        it('delegates `has()` to the dynamically retrieved object', () => {
            let foo: object = { bar: 'bar' };
            const proxy = delegatedProxy(() => foo);
            foo = { baz: 'baz' };

            expect('baz' in proxy).toBeTrue();
        });

        it('delegates `ownKeys()` to the dynamically retrieved object', () => {
            let foo: object = { bar: 'bar' };
            const proxy = delegatedProxy(() => foo);
            foo = { baz: 'baz' };

            expect(Object.getOwnPropertyNames(proxy)).toEqual([ 'baz' ]);
        });

        it('delegates `defineProperty()` to the dynamically retrieved object', () => {
            let foo: Record<string, string> = { bar: 'bar' };
            const proxy = delegatedProxy(() => foo);
            foo = { bar: 'baz' };

            Object.defineProperty(proxy, 'test', {
                get: () => 'Hello',
            });

            expect(foo.test).toBe('Hello');
        });

        it('delegates `getOwnPropertyDescriptor()` to the dynamically retrieved object', () => {
            let foo = { bar: 'bar' };
            const proxy = delegatedProxy(() => foo);
            foo = { bar: 'baz' };

            expect(Object.entries(proxy)).toEqual([ [ 'bar', 'baz' ] ]);
        });

        it('delegates `deleteProperty()` to the dynamically retrieved object', () => {
            let foo: Record<string, unknown> = { hello: 'world' };
            const proxy = delegatedProxy(() => foo);
            foo = { bar: 'bar', baz: 'baz' };

            delete proxy.bar;

            expect(foo.bar).toBeUndefined();
        });

        it('delegates `apply()` to the dynamically retrieved object', () => {
            let foo = () => 'bar';
            const proxy = delegatedProxy(() => foo);
            foo = () => 'baz';

            expect(proxy()).toBe('baz');
        });

        it('delegates `getPrototypeOf()` to the dynamically retrieved object', () => {
            let foo = { bar: 'bar' };
            const proxy = delegatedProxy(() => foo);

            const proto = { key: 'value' };
            foo = Object.create(proto);

            expect(Object.getPrototypeOf(proxy)).toBe(proto);
        });

        it('delegates `setPrototypeOf()` to the dynamically retrieved object', () => {
            let foo = { bar: 'bar' };
            const proxy = delegatedProxy(() => foo);

            const proto = { key: 'value' };
            Object.setPrototypeOf(proxy, proto);

            expect(Object.getPrototypeOf(foo)).toBe(proto);
        });
    });
});
