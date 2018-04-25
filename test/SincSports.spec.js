const chai = require('chai');
const sinon = require('sinon');

const sincsports = require('../src/SincSports');

global.expect = chai.expect;

describe('SincSports', () => {
    describe('getTid', () => {
        it('returns "NCCSL" when given "spring"', () => {
            expect(sincsports.getTid('spring')).to.equal('NCCSL');
        });

        it('returns "NCFL" when given "fall"', () => {
            expect(sincsports.getTid('fall')).to.equal('NCFL');
        });
    });

    describe('isValidSeason', () => {
        it('returns true when given "spring"', () => {
            expect(sincsports.isValidSeason('spring')).to.equal(true);
        });

        it('returns true when given "fall"', () => {
            expect(sincsports.isValidSeason('fall')).to.equal(true);
        });

        it('returns false when given nothing', () => {
            expect(sincsports.isValidSeason()).to.equal(false);
        });

        it('returns false when given an empty string', () => {
            expect(sincsports.isValidSeason('')).to.equal(false);
        });

        it('returns false when given the string "something"', () => {
            expect(sincsports.isValidSeason('something')).to.equal(false);
        });
    });
});
