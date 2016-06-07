function revisionsLine(site, callback) {
    "use strict";
    var mwjs = new MediaWikiJS('http://en.wikipedia.org', null, null);
    mwjs.send({
        action: 'query',
        prop: 'revisions|langlinks',
        rvlimit: '100',
        rvprop: 'size|flags|timestamp',
        llprop: 'langname',
        titles: site
    }, function (data) {
        var pages = data.query.pages;
        var revisions = pages[Object.keys(pages)[0]].revisions;
        var revisions = revisions.filter(function (d) {
            return typeof d.minor === 'undefined';
        });

        var marginLine = {top: 40.5, right: 40.5, bottom: 50.5, left: 100},
            widthLine = 960 - marginLine.left - marginLine.right,
            heightLine = 500 - marginLine.top - marginLine.bottom;

        var getRevId = function (rev) {
            return d3.time.format.iso.parse(rev.timestamp);
        };

        var x = d3.time.scale.utc()
            .domain([d3.min(revisions, getRevId), d3.max(revisions, getRevId)])
            .range([0, widthLine])
            .nice(d3.time.month.utc, 3);

        var getSize = function (rev) {
            return rev.size;
        };

        var y = d3.scale.linear()
            .domain([d3.min(revisions, getSize), d3.max(revisions, getSize)])
            .range([heightLine, 0]);

        var xAxis = d3.svg.axis()
            .scale(x)
            .orient("bottom")
            .ticks(d3.time.month.utc, 3);

        var yAxis = d3.svg.axis()
            .scale(y)
            .orient("left");

        var line = d3.svg.line()
        //.interpolate("step-after")
            .x(function (d) {
                return x(getRevId(d));
            })
            .y(function (d) {
                return y(d.size);
            });

        var svg = d3.select("body").insert("svg", "svg")
            .attr("rss_width", widthLine + marginLine.left + marginLine.right)
            .attr("rss_height", heightLine + marginLine.top + marginLine.bottom)
            .append("g")
            .attr("transform", "translate(" + marginLine.left + "," + marginLine.top + ")");

        svg.append("text")
            .attr("x", widthLine / 2)
            .attr("y", 0)
            .text(site)
            .attr("font-family", "sans-serif")
            .attr("font-size", "20px")
            .attr("fill", "red");

        svg.selectAll("dot")
            .data(revisions)
            .enter().append("circle")
            .attr("r", 3.5)
            .attr("cx", function (d) {
                return x(getRevId(d));
            })
            .attr("cy", function (d) {
                return y(d.size);
            });

        svg.append("g")
            .attr("class", "axis axis--y")
            .attr("transform", "translate(-10,0)")
            .call(yAxis);

        svg.append("g")
            .attr("class", "axis axis--ls_x")
            .attr("transform", "translate(0," + (heightLine + 10) + ")")
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
                    callback(null, {name: d.langname, size: revision.size});
                });
            }
        }),
        function (err, results) {
            var margin = {top: 80, right: 180, bottom: 80, left: 80},
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

            var svgBar = d3.select("body").append("svg")
                    .attr("width", width + margin.left + margin.right)
                    .attr("height", height + margin.top + margin.bottom)
                    .append("g")
                    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
                ;

            svgBar.append("g")
                .attr("class", "ls_x axis")
                .attr("transform", "translate(0," + height + ")")
                .call(xAxisBar);

            svgBar.append("g")
                .attr("class", "y axis")
                .call(yAxisBar);

            svgBar.selectAll(".bar")
                .data(languges)
                .enter().append("rect")
                .attr("class", "bar")
                .attr("ls_x", function (d) {
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
                    d3.select('svg').remove();
                    revisionsLine('test');
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

revisionsLine(getQueryVariable('site'), function (langlinks) {
    languagesBars(langlinks);
});
