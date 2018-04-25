'use strict';

const request = require('request');
const bluebird = require('bluebird');

global.Promise = bluebird.Promise;

const baseUrl = 'http://soccer.sincsports.com/TTSchedules.aspx';

const headers = {
    'cache-control': 'no-cache',
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X)'
};

module.exports = {
    getTid: (season) => {
        if (season === 'spring') {
            return 'NCCSL';
        }

        return 'NCFL';
    },

    getSub: (season) => {
        if (season === 'spring') {
            return '2';
        }

        return '3';
    },

    getCurrentDate: () => {
        return new Date();
    },

    getCurrentYear: () => {
        let currentDate;
        let fullYear;

        currentDate = module.exports.getCurrentYear();
        fullYear = currentDate.getFullYear();
        fullYear = fullYear.toString();

        return fullYear;
    },

    createOptions: (season, year, headers) => {
        const tid = module.exports.getTid(season);
        const sub = module.exports.getSub(season);

        let options = {};

        if (!year) {
            // The year is not defined so make it the current year.
            year = module.exports.getCurrentYear();
        }

        if (typeof year === 'number') {
            year = year.toString();
        }

        if (!headers) {
            headers = {
                'cache-control': 'no-cache',
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X)'
            };
        }

        options.method = 'GET';
        options.url = baseUrl;
        options.qs = {
            tid: tid,
            tab: '3',
            sub: sub,
            sTid: tid,
            sYear: year
        };
        options.headers = headers;

        return options;
    },

    getDivisions: (season, year) => {
        return new Promise((resolve, reject) => {
            const tid = module.exports.getTid(season);
            const sub = module.exports.getSub(season);

            let options;

            year = year || module.exports.getCurrentYear();

            if (typeof year === 'number') {
                year = year.toString();
            }

            options = {
                method: 'GET',
                url: baseUrl,
                qs: {
                    tid: tid,
                    tab: '3',
                    sub: sub,
                    sTid: tid,
                    sYear: year
                },
                headers: headers
            };

            request(options, function (error, response, responseHtml) {
                if (error) {
                    reject(error);
                }

                resolve(responseHtml);
            });
        });
    },

    getDivisionSchedule: function (season, year, division) {
        return new Promise((resolve, reject) => {
            const tid = module.exports.getTid(season);

            let options;

            year = year || module.exports.getCurrentYear();

            if (typeof year === 'number') {
                year = year.toString();
            }

            options = {
                method: 'GET',
                url: baseUrl,
                qs: {
                    tid: tid,
                    year: year,
                    stid: tid,
                    syear: year,
                    div: division
                },
                headers: headers
            };

            request(options, function (error, response, responseHtml) {
                if (error) {
                    reject(error);
                }

                resolve(responseHtml);
            });
        });
    },

    getTeamSchedule: function (season, year, division, team) {
        return new Promise((resolve, reject) => {
            const tid = module.exports.getTid(season);

            let options;

            year = year || module.exports.getCurrentYear();

            if (typeof year === 'number') {
                year = year.toString();
            }

            options = {
                method: 'GET',
                url: baseUrl,
                qs: {
                    tid: tid,
                    year: year,
                    stid: tid,
                    syear: year,
                    div: division,
                    team: team
                },
                headers: headers
            };

            request(options, function (error, response, responseHtml) {
                if (error) {
                    reject(error);
                }

                resolve(responseHtml);
            });
        });
    }
};
