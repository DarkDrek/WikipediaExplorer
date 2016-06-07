/**
 * Created by Sören on 01.06.2016.
 */


var svg_linkStatistics = d3.select("body").append("svg").attr("width", 300).attr("height", 300).attr("id", "linkStatistics").attr("class", "box");

var margin = {top: 30, right: 50, bottom: 70, left: 50};
var width = 300 - margin.left - margin.right;
var height = 300 - margin.top - margin.bottom;
var labels = true;

var min = Infinity, max = -Infinity;
var bdlinkStatistics = [[]];
bdlinkStatistics[0][0] = "Links";
bdlinkStatistics[0][1] = [];

var chart = d3.box()
    .whiskers(iqr(1.5))
    .height(height)
    .domain([min, max])
    .showLabels(labels);

var svg_box_links = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .attr("class", "box")
    .attr("id", "box_links")
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// the x-axis
var x = d3.scale.ordinal()
    .domain(bdlinkStatistics.map(function (d) {
        return d[0]
    }))
    .rangeRoundBands([0, width], 0.7, 0.3);

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");

// the y-axis
var y = d3.scale.linear()
    .domain([min, max])
    .range([height + margin.top, 0 + margin.top]);

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left");

// draw the boxplots
var box = svg_box_links.selectAll(".box")
    .data(bdlinkStatistics)
    .enter().append("g")
    .attr("transform", function (d) {
        return "translate(" + x(d[0]) + "," + margin.top + ")";
    })
    .call(chart.width(x.rangeBand()));

// add a title
svg_box_links.append("text")
    .attr("x", (width / 2))
    .attr("y", 0 + (margin.top / 2))
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

// draw x axis
svg_box_links.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + (height + margin.top + 10) + ")")
    .call(xAxis)
    .append("text")             // text label for the x axis
    .attr("x", (width / 2))
    .attr("y", 10)
    .attr("dy", ".71em")
    .style("text-anchor", "middle")
    .style("font-size", "16px");

function linksStatisicCallback() {
    bdlinkStatistics[0][1] = [];

    if (data) {
        $.each(data.nodes, function (i, n) {
            if (n.linkscount) {
                min = Math.min(min, n.linkscount);
                max = Math.max(max, n.linkscount);
                bdlinkStatistics[0][1].push(n.linkscount);
            }
        });
    }

    chart.domain([min, max]);

    x.domain(bdlinkStatistics.map(function (d) {
        return d[0]
    }));

    y.domain([min, max]);

    box.data(bdlinkStatistics);
    //box.call(chart.width(x.rangeBand()));
    box.call(chart.duration(1000));

    svgyAxis.call(yAxis);
}

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