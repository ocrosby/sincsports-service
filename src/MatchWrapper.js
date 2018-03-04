module.exports = (function () {
    'use strict';

    function MatchWrapper(element, logger) {
        this.element = element;
        this.logger = logger;
    }

    MatchWrapper.Create = function (element, logger) {
        return new MatchWrapper(element, logger);
    };

    MatchWrapper.prototype.getClass = function () {
        return this.element.attr('class');
    };

    MatchWrapper.prototype.isLineBreak = function () {
        const value = this.getClass();

        if (!value) {
            return false;
        }

        return value.indexOf('breakLine') >= 0;
    };

    MatchWrapper.prototype.getDate = function () {
        let pos;
        let value;

        //this.logger.log('Retrieving a date...');

        value = this.element.children('.date').text();

        if (value === 'NotScheduled') {
            value = 'Not Scheduled';
        } else {
            value = value.replace('day', 'day ');

            pos = value.indexOf(' ');

            value = value.substr(pos + 1);
            value = value.trim();
        }

        return value;
    };

    MatchWrapper.prototype.getTime = function () {
        //this.logger.log('Retrieving a time...');

        return this.element.children('.time').text();
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

        datetime = date + ' ' + time;
        datetime = Date.parse(datetime);

        return datetime;
    };

    MatchWrapper.prototype.getScore = function (selector) {
        let score;

        //this.logger.log('Retrieving a score...');

        score = this.element.children(selector).text();
        score = score.trim();

        if (score.length === 0) {
            return 0;
        }

        return parseInt(score);
    };

    MatchWrapper.prototype.getLocation = function () {
        return this.element.children('.field').text();
    };

    MatchWrapper.prototype.getHomeTeamName = function () {
        return this.element.children('.homelink').text();
    };

    MatchWrapper.prototype.getHomeTeamScore = function () {
        return this.getScore('.hscore');
    };

    MatchWrapper.prototype.getAwayTeamName = function () {
        return this.element.children('.awayteam').text();
    };

    MatchWrapper.prototype.getAwayTeamScore = function () {
        return this.getScore('.vscore');
    };

    MatchWrapper.prototype.isVerified = function () {
        let value = this.element.children('span.verified');

        if (value.length) {
            value = value.text();
            value = value.trim();
            value = value.toUpperCase();

            if (value !== 'UNVERIFIED') {
                return true;
            }
        }

        return false;
    };

    MatchWrapper.prototype.getMatch = function () {
        let me = this;

        if (me.isLineBreak()) {
            return null;
        }

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
