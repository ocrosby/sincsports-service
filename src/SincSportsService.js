const bluebird = require('bluebird');
const cheerio = require('cheerio');
const request = require('request');
const querystring = require('querystring');

const MatchWrapper = require('./MatchWrapper.js');

global.Promise = bluebird.Promise;

const CheerioOptions = {
    withDomLvl1: true,
    normalizeWhitespace: false,
    xmlMode: false,
    decodeEntities: true
};

const BoysSelector = 'tr:nth-child(19) a , #ctl00_ContentPlaceHolder1_MTable tr+ tr td';
const GirlsSelector = '#ctl00_ContentPlaceHolder1_FTable tr+ tr td';

module.exports = (() => {
    'use strict';

    function SincSportsService(options) {
        this.options = options || {};

        if (!this.options.headers) {
            this.options.headers = {
                'cache-control': 'no-cache',
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X)'
            };
        }
    }

    SincSportsService.BaseURL = 'http://soccer.sincsports.com/TTSchedules.aspx';

    SincSportsService.Create = function (options) {
        return new SincSportsService(options);
    };

    SincSportsService.IsValidSeason = function (season) {
        return season === 'spring' || season === 'fall';
    };

    SincSportsService.GetTid = function (season) {
        return season === 'spring' ? 'NCCSL' : 'NCFL';
    };

    SincSportsService.GetSub = function (season) {
        return season === 'spring' ? '2' : '3';
    };

    SincSportsService.prototype.createDivision = function (item, gender, season, year) {
        let id;
        let url;
        let text;
        let anchor;

        text = item.text().trim();
        anchor = item.children('a');

        id = null;
        if (anchor) {
            url = anchor.attr('href');

            if (url) {
                id = querystring.parse(url).div;
            }
        }

        return {
            name: text,
            id: id,
            gender: gender
        };
    };

    SincSportsService.prototype.getDivisionsHtml = function (season, year) {
        return new Promise((resolve, reject) => {
            let tid;
            let sub;
            let options;

            if (!SincSportsService.IsValidSeason(season)) {
                reject(new Error('Invalid season!'));
            }

            tid = SincSportsService.GetTid(season);
            sub = SincSportsService.GetSub(season);

            options = {
                method: 'GET',
                url: SincSportsService.BaseURL,
                qs: {
                    tid: tid,
                    tab: '3',
                    sub: sub,
                    sTid: tid,
                    sYear: year.toString()
                },
                headers: this.options.headers
            };

            request(options, function (error, response, responseHtml) {
                if (error) {
                    reject(error);
                }

                resolve(responseHtml);
            });
        });
    };

    SincSportsService.prototype.getScheduleHtml = function (season, year, division) {
        return new Promise((resolve, reject) => {
            let tid;
            let sub;
            let options;

            if (!SincSportsService.IsValidSeason(season)) {
                reject(new Error('Invalid season!'));
            }

            tid = SincSportsService.GetTid(season);

            options = {
                method: 'GET',
                url: SincSportsService.BaseURL,
                qs: {
                    tid: tid,
                    year: year.toString(),
                    stid: tid,
                    syear: year.toString(),
                    div: division
                },
                headers: this.options.headers
            };

            request(options, function (error, response, responseHtml) {
                if (error) {
                    reject(error);
                }

                resolve(responseHtml);
            });
        });
    };

    SincSportsService.prototype.getTeams = function (season, year, division) {
        const me = this;

        return new Promise((resolve, reject) => {
            me.getScheduleHtml(season, year, division)
                .then((html) => {
                    let $;
                    let promises;

                    try {
                        $ = cheerio.load(html, CheerioOptions);
                    } catch (error) {
                        reject(error);
                    }

                    promises = $('.awayteam > a, .homelink > a').map(function () {
                        let id;
                        let teamName;
                        let href;

                        teamName = $(this).text().trim().toUpperCase();
                        href = $(this).attr('href');
                        id = querystring.parse(href).team;

                        return { id: id, name: teamName };
                    }).toArray();

                    Promise.all(promises)
                        .then(function (data) {
                            let i;
                            let j;
                            let item;
                            let teams;
                            let found = false;

                            teams = [];
                            for (i = 0 ; i < data.length ; i++) {
                                item = data[i];

                                found = false;
                                for (j = 0 ; j < teams.length ; j++) {
                                    if (teams[j].name === item.name) {
                                        found = true;
                                        break;
                                    }
                                }

                                if (!found) {
                                    teams.push(item);
                                }
                            }

                            // Sorts the resulting team objects alphabetically by name.
                            teams.sort(function (a, b) {
                                if (a.name < b.name) {
                                    return -1;
                                } else if (a.name > b.name) {
                                    return 1;
                                } else {
                                    return 0;
                                }
                            });

                            resolve(teams);
                        })
                        .fail(function (error) {
                            reject(error);
                        });
                })
                .catch((err) => {
                    reject(err);
                });
        });
    };

    SincSportsService.prototype.getTeamByName = function (season, year, division, teamName) {
        const me = this;

        return new Promise((resolve, reject) => {
            me.getTeams(season, year, division)
                .then((teams) => {
                    let i;
                    let length;
                    let currentTeam;
                    let selectedTeam;

                    for (i = 0, length = teams.length ; i < length ; i++) {
                        currentTeam = teams[i];

                        if (currentTeam.name === teamName) {
                            selectedTeam = currentTeam;
                            break;
                        }
                    } // end for

                    if (selectedTeam) {
                        resolve(selectedTeam);
                    } else {
                        reject(new Error(`The specified team "${teamName}" was not found!`));
                    }
                })
                .catch((err) => {
                    reject(err);
                });
        });
    };

    SincSportsService.prototype.getScheduleForTeam = function (season, year, team) {

    };

    SincSportsService.prototype.getScheduleForDivision = function (season, year, division) {
        const me = this;

        return new Promise((resolve, reject) => {
            me.getScheduleHtml(season, year, division)
                .then((html) => {
                    let $;
                    let theGameList;
                    let promises;

                    try {
                        $ = cheerio.load(html, CheerioOptions);
                    } catch (error) {
                        reject(error);
                    }

                    theGameList = $('#theGameList');
                    promises = theGameList.children().map(function () {
                        return MatchWrapper.Create($(this), console).getMatch();
                    }).toArray();

                    Promise.all(promises)
                        .then(function (data) {
                            let i;
                            let matches = [];
                            let currentMatch;

                            for (i = 0 ; i < data.length ; i++) {
                                currentMatch = data[i];

                                if (currentMatch.awayTeam !== '' &&
                                    currentMatch.homeTeam !== '') {
                                    matches.push(currentMatch);
                                }
                            }

                            resolve(matches);
                        })
                        .catch(function (error) {
                            reject(error);
                        });
                })
                .catch((err) => {
                    reject(err);
                });
        });
    };

    SincSportsService.prototype.getDivisions = function (season, year) {
        const me = this;

        return new Promise((resolve, reject) => {
            me.getDivisionsHtml(season, year)
                .then((html) => {
                    let i;
                    let $;
                    let promises;
                    let boysPromises;
                    let girlsPromises;

                    console.log('Retrieved the html.');

                    try {
                        $ = cheerio.load(html, CheerioOptions);
                    } catch (error) {
                        reject(error);
                    }

                    promises = [];

                    // Add the Boys Divisions
                    boysPromises = $(BoysSelector).map(function () {
                        return me.createDivision($(this), 'male', season, year);
                    }).toArray();

                    girlsPromises = $(GirlsSelector).map(function () {
                        return me.createDivision($(this), 'female', season, year);
                    }).toArray();

                    for (i = 0; i < boysPromises.length; i++) {
                        promises.push(boysPromises[i]);
                    }

                    for (i = 0; i < girlsPromises.length; i++) {
                        promises.push(girlsPromises[i]);
                    }

                    Promise.all(promises)
                        .then(function (data) {
                            resolve(data);
                        })
                        .catch(function (error) {
                            reject(error);
                        });
                })
                .catch((err) => {
                    reject(err);
                });
        });
    };

    return SincSportsService;
})();
