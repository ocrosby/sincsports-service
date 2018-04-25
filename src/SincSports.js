module.exports = {
    isValidSeason: (season) => {
        if (season === 'spring') {
            return true;
        } else if (season === 'fall') {
            return true;
        } else {
            return false;
        }
    },

    getTid: (season) => {
        if (season === 'spring') {
            return 'NCCSL';
        }

        return 'NCFL'
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

        currentDate = this.getCurrentYear();
        fullYear = currentDate.getFullYear();
        fullYear = fullYear.toString();

        return fullYear;
    },

    createOptions: (season, year, headers) => {
        const tid = this.getTid(season);
        const sub = this.getSub(season);

        let options = {};

        if (!year) {
            // The year is not defined so make it the current year.
            year = this.getCurrentYear();
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
        options.url = '';
        options.qs = {
            tid: tid,
            tab: '3',
            sub: sub,
            sTid: tid,
            sYear: year
        };
        options.headers = headers;

        return options;
    }
};
