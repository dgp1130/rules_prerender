import { useForAll, useForEach } from './effects';

describe('effects', () => {
    describe('useForEach()', () => {
        const init = jasmine.createSpy('init', () => [
            'foo' /* value */,
            () => { init.calls.reset(); } /* cleanup */,
        ] as const).and.callThrough();
        const used = useForEach(init);

        it('initializes before each test', () => {
            expect(init).toHaveBeenCalledOnceWith();

            expect(used.get()).toEqual('foo');
        });

        const initUndefined = jasmine.createSpy('initUndefined', () => [
            undefined as unknown as Record<string, unknown> /* value */,
            undefined /* cleanup */,
        ] as const).and.callThrough();
        const usedUndefined = useForEach(initUndefined);

        it('fails the test if the value is not initialized', () => {
            spyOn(globalThis, 'fail');

            expect(() => usedUndefined.get()).toThrowError(/not initialized/);

            expect(globalThis.fail).toHaveBeenCalled();
        });

        it('will not compile with a possibly `undefined` value', () => {
            // @ts-expect-error for `undefined` value.
            () => useForEach(() => [
                undefined /* value */,
                undefined /* cleanup */,
            ] as const);

            expect().nothing();
        });

        it('will not compile with a possibly `null` value', () => {
            // @ts-expect-error for `null` value.
            () => useForEach(() => [
                null /* value */,
                undefined /* cleanup */,
            ] as const);

            expect().nothing();
        });
    });

    describe('useForAll()', () => {
        const init = jasmine.createSpy('init', () => [
            'foo' /* value */,
            () => { init.calls.reset(); } /* cleanup */,
        ] as const).and.callThrough();
        const used = useForAll(init);

        it('initializes before all tests', () => {
            expect(init).toHaveBeenCalledOnceWith();

            expect(used.get()).toEqual('foo');
        });

        const initUndefined = jasmine.createSpy('initUndefined', () => [
            undefined as unknown as Record<string, unknown> /* value */,
            undefined /* cleanup */,
        ] as const).and.callThrough();
        const usedUndefined = useForAll(initUndefined);

        it('fails the test if the value is not initialized', () => {
            spyOn(globalThis, 'fail');

            expect(() => usedUndefined.get()).toThrowError(/not initialized/);

            expect(globalThis.fail).toHaveBeenCalled();
        });

        it('will not compile with a possibly `undefined` value', () => {
            // @ts-expect-error for `undefined` value.
            () => useForAll(() => [
                undefined /* value */,
                undefined /* cleanup */,
            ] as const);

            expect().nothing();
        });

        it('will not compile with a possibly `null` value', () => {
            // @ts-expect-error for `null` value.
            () => useForAll(() => [
                null /* value */,
                undefined /* cleanup */,
            ] as const);

            expect().nothing();
        });
    });
});
