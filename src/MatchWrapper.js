module.exports = (function () {
    'use strict';

    function MatchWrapper(element, logger) {
        this.element = element;
        this.logger = logger;
    }

    MatchWrapper.Create = function (element, logger) {
        return new MatchWrapper(element, logger);
    };

    MatchWrapper.prototype.getDate = function () {
        return this.element('.col-xs-6:nth-child(1) > span:nth-child(2)').text();
    };

    MatchWrapper.prototype.getTime = function () {
        return this.element('.col-xs-6:nth-child(2) > span:nth-child(1)').text();
    };

    MatchWrapper.prototype.getDateTime = function () {
        let date;
        let time;
        let datetime;

        //this.logger.log('Retrieving a date and time...');

        date = this.getDate();

        if (!date) {
            return 0;
        }

        time = this.getTime();

        if ((date === 'Not Scheduled') || (time === 'Pending')) {
            return 0;
        }

        return Date.parse(`${date} ${time}`);
    };

    MatchWrapper.prototype.getLocation = function () {
        return this.element('div.col-md-4 > div.col-xs-11 > span > a').text();
    };

    MatchWrapper.prototype.getHomeTeamName = function () {
        return this.element('div.hometeam > a:nth-child(2)').text();
    };

    MatchWrapper.prototype.getHomeTeamScore = function () {
        return this.element('.col-xs-2 > div:nth-child(1)').text();
    };

    MatchWrapper.prototype.getAwayTeamName = function () {
        return this.element('div.awayteam > a:nth-child(2)').text();
    };

    MatchWrapper.prototype.getAwayTeamScore = function () {
        return this.element('.col-xs-2 > div:nth-child(3)').text();
    };

    MatchWrapper.prototype.isVerified = function () {
        let text = this.element('.col-xs-6:nth-child(1) > span:nth-child(3)').text();

        text = text.trim();
        if (text === 'UNVERIFIED') {
            return false;
        }

        return true;
    };

    MatchWrapper.prototype.getMatch = function () {
        let me = this;

        return {
            date: me.getDate(),
            time: me.getTime(),
            datetime: me.getDateTime(),
            location: me.getLocation(),
            homeTeam: me.getHomeTeamName(),
            homeTeamScore: me.getHomeTeamScore(),
            awayTeam: me.getAwayTeamName(),
            awayTeamScore: me.getAwayTeamScore(),
            verified: me.isVerified()
        };
    };

    return MatchWrapper;
})();
