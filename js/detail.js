function revisionsLine(site, callback, language, svg) {
    "use strict";
    language = language || 'en';
    var mwjs = new MediaWikiJS('http://' + language + '.wikipedia.org', null, null);
    mwjs.send({
        action: 'query',
        prop: 'revisions|langlinks',
        rvlimit: '100',
        rvprop: 'size|flags|timestamp',
        llprop: 'langname',
        lllimit: 15,
        titles: site
    }, function (data) {
        var pages = data.query.pages;
        var revisions = pages[Object.keys(pages)[0]].revisions;
        var revisions = revisions.filter(function (d) {
            return typeof d.minor === 'undefined';
        });

        var margin = {top: 40.5, right: 20, bottom: 50.5, left: 100},
            width = 960 - margin.left - margin.right,
            height = 500 - margin.top - margin.bottom;

        var getTime = function (rev) {
            return d3.time.format.iso.parse(rev.timestamp);
        };

        var x = d3.time.scale.utc()
            .domain([d3.min(revisions, getTime), d3.max(revisions, getTime)])
            .range([0, width])
            .nice();

        var getSize = function (rev) {
            return rev.size;
        };

        var y = d3.scale.linear()
            .domain([d3.min(revisions, getSize), d3.max(revisions, getSize)])
            .range([height, 0])
            .nice();

        var xAxis = d3.svg.axis()
            .scale(x)
            .orient("bottom");

        var yAxis = d3.svg.axis()
            .scale(y)
            .orient("left");

        var line = d3.svg.line()
            .interpolate("step-before")
            .x(function (d) {
                return x(getTime(d));
            })
            .y(function (d) {
                return y(d.size);
            });

        if (svg) {
            svg.selectAll('*').remove();
        } else {
            svg = d3.select("body").append("svg");
        }

        svg = svg.attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        svg.append("text")
            .attr("x", width / 2)
            .attr("y", -10)
            .text(site)
            .attr("font-family", "sans-serif")
            .attr("font-size", "20px")
            .attr("fill", "red");

        svg.selectAll("dot")
            .data(revisions)
            .enter().append("circle")
            .attr("r", 3.5)
            .attr("cx", function (d) {
                return x(getTime(d));
            })
            .attr("cy", function (d) {
                return y(getSize(d));
            })
            .append("svg:title")
            .text(function (d) {
                return d.size.toLocaleString() + ' bytes \n' + d3.time.format.iso.parse(d.timestamp).toLocaleString();
            });

        svg.append("text")
            .attr("class", "y label")
            .attr("text-anchor", "end")
            .attr("y", -20)
            .attr("x", 0)
            .text("size in bytes");

        svg.append("g")
            .attr("class", "axis axis--y")
            .attr("transform", "translate(-10,0)")
            .call(yAxis);

        svg.append("text")
            .attr("class", "x label")
            .attr("text-anchor", "end")
            .attr("x", width)
            .attr("y", height + 50)
            .text("date of revision");

        svg.append("g")
            .attr("class", "axis axis--x")
            .attr("transform", "translate(0," + (height + 10) + ")")
            .call(xAxis);

        svg.append("path")
            .datum(revisions)
            .attr("class", "line")
            .attr("d", line);

        if (callback)
            callback(pages[Object.keys(pages)[0]].langlinks);
    });
}

function languagesBars(langlinks) {
    "use strict";
    async.parallel(langlinks.map(function (d) {
            return function (callback) {
                new MediaWikiJS('http://' + d.lang + '.wikipedia.org', null, null).send({
                    action: 'query',
                    prop: 'revisions',
                    rvprop: 'size',
                    titles: d['*']
                }, function (d_) {
                    var pages = d_.query.pages;
                    var revision = pages[Object.keys(pages)[0]].revisions[0];
                    callback(null, {
                        name: d.langname,
                        size: revision.size,
                        lang: d.lang,
                        site: d['*']
                    });
                });
            }
        }),
        function (err, results) {
            var margin = {top: 80, right: 0, bottom: 80, left: 80},
                width = 960 - margin.left - margin.right,
                height = 500 - margin.top - margin.bottom;

            var languges = results;

            var xBar = d3.scale.ordinal()
                .domain(languges.map(function (d) {
                    return d.name;
                }))
                .rangeRoundBands([0, width], .1, .3);

            var yBar = d3.scale.linear()
                .domain([0, d3.max(languges, function (d) {
                    return d.size;
                })])
                .range([height, 0])
                .nice();

            var xAxisBar = d3.svg.axis()
                .scale(xBar)
                .orient("bottom");

            var yAxisBar = d3.svg.axis()
                .scale(yBar)
                .orient("left");

            var svg = d3.select("body").append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

            svg.append("text")
                .attr("class", "x label")
                .attr("text-anchor", "end")
                .attr("x", width)
                .attr("y", height + 35)
                .text("language");

            svg.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + height + ")")
                .call(xAxisBar);

            svg.append("text")
                .attr("class", "y label")
                .attr("text-anchor", "end")
                .attr("y", -20)
                .attr("x", 0)
                .text("size in bytes");

            svg.append("g")
                .attr("class", "y axis")
                .call(yAxisBar);

            svg.selectAll(".bar")
                .data(languges)
                .enter().append("rect")
                .attr("class", "bar")
                .attr("x", function (d) {
                    return xBar(d.name);
                })
                .attr("width", xBar.rangeBand())
                .attr("y", function (d) {
                    return yBar(d.size);
                })
                .attr("height", function (d) {
                    return height - yBar(d.size);
                })
                .on('click', function (d) {
                    revisionsLine(d.site, undefined, d.lang, d3.select('svg'));
                })
                .append("svg:title")
                .text(function (d) {
                    return d.size.toLocaleString() + ' bytes \n' + d.name;
                });
        });
}

function getQueryVariable(variable) {
    var query = window.location.search.substring(1);
    var vars = query.split('&');
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split('=');
        if (decodeURIComponent(pair[0]) == variable) {
            return decodeURIComponent(pair[1]);
        }
    }
    console.log('Query variable %s not found', variable);
}

revisionsLine(getQueryVariable('site') || 'Albert Einstein', function (langlinks) {
    languagesBars(langlinks);
});
