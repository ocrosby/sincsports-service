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
        it('returns the expected number of divisions for the fall of 2017', () => {
            return SincSportsService.Create().getDivisions('fall', 2017)
                .then((divisions) => {
                    expect(divisions.length).to.equal(105);
                });
        }).timeout(6000);

        it('returns the expected number of male divisions for the fall of 2017', () => {
            return SincSportsService.Create().getDivisions('fall', 2017, 'male')
                .then((divisions) => {
                    expect(divisions.length).to.equal(44);
                });
        }).timeout(6000);

        it('returns the expected number of female divisions for the fall of 2017', () => {
            return SincSportsService.Create().getDivisions('fall', 2017, 'female')
                .then((divisions) => {
                    expect(divisions.length).to.equal(61);
                });
        }).timeout(6000);

    });

    xdescribe('getDivisionSchedule', () => {
        it('returns the expected schedule for the spring of 2018', (done) => {
            SincSportsService.Create().getDivisionSchedule('spring', 2018, 'U13F02')
                .then((schedule) => {
                    expect(schedule.length).to.equal(36);
                    done();
                });
        }).timeout(6000);
    });

    xdescribe('getTeamSchedule', () => {
        it('returns the expected schedule for a team', (done) => {
            SincSportsService.Create().getTeamSchedule('spring', 2018, 'U13F02', 'NCF0591B')
                .then((schedule) => {
                    expect(schedule.length).to.equal(8);
                    done();
                });
        }).timeout(6000);
    });

    xdescribe('getTeams', () => {
        it('returns the expected teams for the spring of 2018 U13F02', (done) => {
            SincSportsService.Create().getTeams('spring', 2018, 'U13F02')
                .then((teams) => {
                    expect(teams.length).to.equal(9);
                    done();
                });
        }).timeout(6000);
    });

    describe('getTeamByName', () => {
        it('returns specified team by name', (done) => {
            let service = SincSportsService.Create();

            service.getTeamByName('spring', 2018, 'U13F02', 'PGSA STARS GREEN G')
                .then((team) => {
                    expect(team.id).to.equal('NCF0591B');
                    expect(team.name).to.equal('PGSA STARS GREEN G');
                    done();
                });
        }).timeout(6000);
    });

});

