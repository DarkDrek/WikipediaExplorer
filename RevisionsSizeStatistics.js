/**
 * Created by Sören on 01.06.2016.
 */

var bdRevisionsSizeStatistics = [[]], rss_min, rss_max, rss_chart, rss_x, rss_y, rss_box, rss_xAxis;

function revisionsSizeStatistics() {
    var rss_margin = {top: 30, right: 50, bottom: 70, left: 50};
    var rss_width = 250 - rss_margin.left - rss_margin.right;
    var rss_height = 300 - rss_margin.top - rss_margin.bottom;
    var labels = true;

    rss_min = Infinity, rss_max = -Infinity;
    bdRevisionsSizeStatistics[0][0] = "Links";
    bdRevisionsSizeStatistics[0][1] = [];

    rss_chart = d3.box()
        .whiskers(iqr(1.5))
        .height(rss_height)
        .domain([rss_min, rss_max])
        .showLabels(labels);

    var svg_box_links = d3.select("body").append("svg")
        .attr("rss_width", rss_width + rss_margin.left + rss_margin.right)
        .attr("rss_height", rss_height + rss_margin.top + rss_margin.bottom)
        .attr("class", "box")
        .attr("id", "box_links")
        .append("g")
        .attr("transform", "translate(" + rss_margin.left + "," + rss_margin.top + ")");

// the ls_x-axis
    rss_x = d3.scale.ordinal()
        .domain(bdRevisionsSizeStatistics.map(function (d) {
            return d[0];
        }))
        .rangeRoundBands([0, rss_width], 0.7, 0.3);

    rss_xAxis = d3.svg.axis()
        .scale(rss_x)
        .orient("bottom");

// the y-axis
    rss_y = d3.scale.linear()
        .domain([rss_min, rss_max])
        .range([rss_height + rss_margin.top, 0 + rss_margin.top]);

    var yAxis = d3.svg.axis()
        .scale(rss_y)
        .orient("left");

// draw the boxplots
    rss_box = svg_box_links.selectAll(".box")
        .data(bdRevisionsSizeStatistics)
        .enter().append("g")
        .attr("transform", function (d) {
            return "translate(" + rss_x(d[0]) + "," + rss_margin.top + ")";
        })
        .call(rss_chart.width(rss_x.rangeBand()));

// add a title
    svg_box_links.append("text")
        .attr("x", (rss_width / 2))
        .attr("y", 0 + (rss_margin.top / 2))
        .attr("text-anchor", "middle")
        .style("font-size", "18px")
        .text("Links");

// draw y axis
    var svgyAxis = svg_box_links.append("g")
        .attr("class", "y axis")
        .call(yAxis)
        .append("text") // and text1
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".60em")
        .style("text-anchor", "end")
        .style("font-size", "16px")
        .text("Links per Page");

// draw ls_x axis
    svg_box_links.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + (rss_height + rss_margin.top + 10) + ")")
        .call(rss_xAxis)
        .append("text")             // text label for the ls_x axis
        .attr("x", (rss_width / 2))
        .attr("y", 10)
        .attr("dy", ".71em")
        .style("text-anchor", "middle")
        .style("font-size", "16px");

// Returns a function to compute the interquartile range.
    function iqr(k) {
        return function (d, i) {
            var q1 = d.quartiles[0],
                q3 = d.quartiles[2],
                iqr = (q3 - q1) * k,
                i = -1,
                j = d.length;
            while (d[++i] < q1 - iqr);
            while (d[--j] > q3 + iqr);
            return [i, j];
        };
    }
}

function linksStatisicCallback() {
    bdRevisionsSizeStatistics[0][1] = [];

    if (data) {
        $.each(data.nodes, function (i, n) {
            console.log(n);
            if (n.linkscount) {
                rss_min = Math.min(rss_min, n.linkscount);
                rss_max = Math.max(rss_max, n.linkscount);
                bdRevisionsSizeStatistics[0][1].push(n.linkscount);
            }
        });
    }

    rss_chart.domain([rss_min, rss_max]);

    rss_x.domain(bdlinkStatistics.map(function (d) {
        return d[0]
    }));

    rss_y.domain([rss_min, rss_max]);

    rss_box.data(bdRevisionsSizeStatistics);
    rss_box.call(rss_chart.duration(1000));

    svgyAxis.call(rss_xAxis);
}