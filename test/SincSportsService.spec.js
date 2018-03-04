const index = require('../src/index');
const sinon = require('sinon');
const chai = require('chai');

global.expect = chai.expect;

const SincSportsService = require('../src/SincSportsService');

describe('SincSportsService', () => {
    describe('IsValidSeason', () => {
        it('returns false when given nothing', () => {
            expect(SincSportsService.IsValidSeason()).to.equal(false);
        });

        it('returns false when given undefined', () => {
            expect(SincSportsService.IsValidSeason(undefined)).to.equal(false);
        });

        it('returns false when given null', () => {
            expect(SincSportsService.IsValidSeason(null)).to.equal(false);
        });

        it('returns false when given a string containing only spaces', () => {
            expect(SincSportsService.IsValidSeason('   ')).to.equal(false);
        });

        it('returns false when given "something"', () => {
            expect(SincSportsService.IsValidSeason('something')).to.equal(false);
        });

        it('returns true when given "fall"', () => {
            expect(SincSportsService.IsValidSeason('fall')).to.equal(true);
        });

        it('returns true when given "spring"', () => {
            expect(SincSportsService.IsValidSeason('fall')).to.equal(true);
        });
    });

    describe('GetTid', () => {
        it('returns "NCFL" when given "fall"', () => {
            expect(SincSportsService.GetTid('fall')).to.equal('NCFL');
        });

        it('returns "NCCSL" when given "spring"', () => {
            expect(SincSportsService.GetTid('spring')).to.equal('NCCSL');
        });

        it('returns "NCFL" when given nothing', () => {
            expect(SincSportsService.GetTid()).to.equal('NCFL');
        });

        it('returns "NCFL" when given null', () => {
            expect(SincSportsService.GetTid(null)).to.equal('NCFL');
        });

        it('returns "NCFL" when given undefined', () => {
            expect(SincSportsService.GetTid(undefined)).to.equal('NCFL');
        });
    });

    describe('GetSub', () => {
        it('returns "3" when given "fall"', () => {
            expect(SincSportsService.GetSub('fall')).to.equal('3');
        });

        it('returns "3" when given nothing', () => {
            expect(SincSportsService.GetSub()).to.equal('3');
        });

        it('returns "2" when given "spring"', () => {
            expect(SincSportsService.GetSub('spring')).to.equal('2');
        });
    });

    describe('getDivisions', () => {
        it('returns the expected number of divisions for the fall of 2017', (done) => {
            SincSportsService.Create().getDivisions('fall', 2017)
                .then((divisions) => {
                    expect(divisions.length).to.equal(108);
                    done();
                });
        }).timeout(6000);
    });
});

