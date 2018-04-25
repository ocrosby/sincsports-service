const bluebird = require('bluebird');
const cheerio = require('cheerio');
const request = require('request');
const querystring = require('querystring');
const htmlRetriever = require('./HtmlRetriever');
const MatchWrapper = require('./MatchWrapper.js');

global.Promise = bluebird.Promise;

const CheerioOptions = {
    withDomLvl1: true,
    normalizeWhitespace: false,
    xmlMode: false,
    decodeEntities: true
};

const BoysSelector = '.col-md-6:nth-child(1) a';
const GirlsSelector = '.col-md-6+ .col-md-6 a';

module.exports = (() => {
    'use strict';

    function SincSportsService(options) {
        this.options = options || {};
    }

    SincSportsService.Create = function (options) {
        return new SincSportsService(options);
    };

    SincSportsService.IsValidSeason = function (season) {
        return season === 'spring' || season === 'fall';
    };

    SincSportsService.prototype.createDivision = function (item, gender, season, year) {
        let id;
        let url;
        let text;

        text = item.children[0].data;
        text = text.trim();

        id = null;
        url = item.attribs.href;
        if (url) {
            id = querystring.parse(url).div;
        }

        return {
            name: text,
            id: id,
            gender: gender
        };
    };

    SincSportsService.prototype.getTeams = function (season, year, division) {
        const me = this;

        return new Promise((resolve, reject) => {
            htmlRetriever.getDivisionSchedule(season, year, division)
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

    SincSportsService.prototype.getTeamSchedule = function (season, year, division, team) {
        const me = this;

        return new Promise((resolve, reject) => {
            htmlRetriever.getTeamSchedule(season, year, division, team)
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

    SincSportsService.prototype.getDivisionSchedule = function (season, year, division) {
        const me = this;

        return new Promise((resolve, reject) => {
            htmlRetriever.getDivisionSchedule(season, year, division)
                .then((html) => {
                    let $;
                    let theGameList;
                    let promises;

                    try {
                        $ = cheerio.load(html, CheerioOptions);
                    } catch (error) {
                        reject(error);
                    }

                    theGameList = $('div.game-row');
                    promises = theGameList.map(function () {
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

    SincSportsService.prototype.collectDivisions = function ($, selector, gender, season, year, promises) {
        const me = this;

        let i;
        let currentPromise;
        let genderSpecificPromises;

        genderSpecificPromises = $(selector).map(function (i, el) {
            return me.createDivision(el, gender, season, year);
        }).toArray();

        for (i = 0 ; i < genderSpecificPromises.length ; i++) {
            currentPromise = genderSpecificPromises[i];
            promises.push(currentPromise);
        }
    };

    SincSportsService.prototype.getDivisions = function (season, year, gender) {
        const me = this;

        return new Promise((resolve, reject) => {
            htmlRetriever.getDivisions(season, year)
                .then((html) => {
                    let $;
                    let promises = [];

                    console.log('Retrieved the html.');

                    try {
                        $ = cheerio.load(html, CheerioOptions);

                        if (gender) {
                            gender = gender.trim().toLowerCase();

                            if (gender === 'male') {
                                this.collectDivisions($, BoysSelector, 'male', season, year, promises);
                            } else if (gender === 'female') {
                                this.collectDivisions($, GirlsSelector, 'female', season, year, promises);
                            } else {
                                this.collectDivisions($, BoysSelector, 'male', season, year, promises);
                                this.collectDivisions($, GirlsSelector, 'female', season, year, promises);
                            }
                        } else {
                            this.collectDivisions($, BoysSelector, 'male', season, year, promises);
                            this.collectDivisions($, GirlsSelector, 'female', season, year, promises);
                        }

                        Promise.all(promises)
                            .then(function (data) {
                                resolve(data);
                            })
                            .catch(function (error) {
                                reject(error);
                            });
                    } catch (error) {
                        reject(error);
                    }
                })
                .catch((err) => {
                    reject(err);
                });
        });
    };

    return SincSportsService;
})();
