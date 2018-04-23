const sinon = require('sinon');
const chai = require('chai');
const cheerio = require('cheerio');

global.expect = chai.expect;

const MatchWrapper = require('../src/MatchWrapper');

const CheerioOptions = {
    withDomLvl1: true,
    normalizeWhitespace: false,
    xmlMode: false,
    decodeEntities: true
};

// Example: http://www.ncysaclassic.com/schedule.aspx?tid=NCCSL&year=2018&stid=NCCSL&syear=2018&div=U13F02

const html = `<div class="usarow game-row">
        <div class="col-md-3 dt-col" style="border-right:5px solid transparent">
            <div class="col-xs-6" style="padding:0">
                <span class="">Saturday</span>
                <span class="">2/3/2018</span>
            </div>
            <div class="col-xs-6">
                <span class="">4:00 PM</span>
                <span class="">Game: 37580<br></span>
            </div>
            <div class="clear"></div>
        </div>
        <div class="col-md-5">
            <div class="col-xs-10" style="padding:0">
                <div class="hometeam">
                    <a href="/team/team.aspx?tid=NCCSL&amp;year=2018&amp;teamid=NCF0591B">
                        <div class="hora">H: </div>
                    </a>
                    <a href="schedule.aspx?tid=NCCSL&amp;year=2018&amp;team=NCF0591B&amp;stid=NCCSL&amp;syear=2018&amp;div=U13F02">PGSA STARS GREEN G</a>
                </div>
                <div class="awayteam">
                    <a href="/team/team.aspx?tid=NCCSL&amp;year=2018&amp;teamid=NCF05AF3">
                        <div class="hora">A: </div>
                    </a>
                    <a href="schedule.aspx?tid=NCCSL&amp;year=2018&amp;team=NCF05AF3&amp;stid=NCCSL&amp;syear=2018&amp;div=U13F02">TUSA GOLD G</a>
                </div>
            </div>
            <div class="col-xs-2" style="padding:0;text-align:right;">
                <div style="color:#A63351;margin-top:5px;">1</div>
                <div class="clear"></div>
                <div style="color:#A63351;margin-top:9px;">0</div>
            </div>
            <div class="clear"></div>
        </div>
        <div class="col-md-4">
            <div class="col-xs-11" style="padding:0">
                <span class="">13U G Elite East</span>
                <span class=""><a href="TTMap.aspx?tid=NCCSL&amp;site=199&amp;gameid=3299339">PGSA 06</a></span>
            </div>
            <div class="col-xs-1" style="padding:0"></div>
        </div>
        <div class="clear"></div>
    </div>
`;

const fakeLogger = {
    log: () => {
    }, error: () => {
    }
};

function wrap(html) {
    return MatchWrapper.Create(cheerio.load(html, CheerioOptions), fakeLogger);
}

describe('MatchWrapper', () => {
    let wrapper;

    before(() => {
        wrapper = wrap(html);
    });

    after(() => {
        wrapper = null;
    });

    describe('getDate', () => {
        it('returns 2/3/2018', () => {
            expect(wrapper.getDate()).to.equal('2/3/2018');
        });
    });

    describe('getTime', () => {
        it('returns 4:00 PM', () => {
            expect(wrapper.getTime()).to.equal('4:00 PM');
        });
    });

    describe('getDateTime', () => {
        it('returns a number greater than 0', () => {
            const result = wrapper.getDateTime();

            expect(typeof result).to.equal('number');
            expect(result > 0).to.equal(true);
        });
    });

    describe('getHomeTeamName', () => {
        it('returns "PGSA STARS GREEN G"', () => {
            expect(wrapper.getHomeTeamName()).to.equal('PGSA STARS GREEN G');
        });
    });

    describe('getAwayTeamName', () => {
        it('returns "TUSA GOLD G"', () => {
            expect(wrapper.getAwayTeamName()).to.equal('TUSA GOLD G');
        });
    });

    describe('getHomeTeamScore', () => {
        it('returns "1"', () => {
            expect(wrapper.getHomeTeamScore()).to.equal('1');
        });
    });

    describe('getAwayTeamScore', () => {
        it('returns "0"', () => {
            expect(wrapper.getAwayTeamScore()).to.equal('0');
        });
    });

    describe('getLocation', () => {
        it('returns "PGSA 06"', () => {
            expect(wrapper.getLocation()).to.equal('PGSA 06');
        });
    });

    describe('isVerified', () => {
        it('returns true when the match is verified', () => {
            expect(wrapper.isVerified()).to.equal(true);
        });

        it('returns false when the match is not verified', () => {
            let local = wrap(`<div class="col-md-3 dt-col" style="border-right:5px solid transparent"><div class="col-xs-6" style="padding:0"><span style="padding:0px;">Sunday</span><span style="padding:0px;">4/22/2018</span><span style="padding:0px;"><font color="red"><b class="">UNVERIFIED</b></font>&nbsp;</span></div><div class="col-xs-6"><span>3:00 PM</span><span>Game: 37603<br></span></div><div class="clear"></div></div>`);

            expect(local.isVerified()).to.equal(false);
        });
    });

    describe('getMatch', () => {
        it('returns the expected object', () => {
            let match = wrapper.getMatch();

            expect(match.date).to.equal('2/3/2018');
            expect(match.time).to.equal('4:00 PM');
            // expect(match.datetime).to.equal(1517691600000);
            expect(match.location).to.equal('PGSA 06');
            expect(match.homeTeam).to.equal('PGSA STARS GREEN G');
            expect(match.homeTeamScore).to.equal('1');
            expect(match.awayTeam).to.equal('TUSA GOLD G');
            expect(match.awayTeamScore).to.equal('0');
            expect(match.verified).to.equal(true);
        });
    });
});
