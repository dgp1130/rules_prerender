import { expect } from '@esm-bundle/chai';
import { sum } from './lib';

describe('lib', () => {
    describe('sum()', () => {
        it('adds two numbers', () => {
            expect(sum(1, 2)).to.equal(3);
        });
    });
});
