/**
 * Created by Sören on 01.06.2016.
 */

var bdlinkStatistics = [[]];
var ls_chart, ls_x, ls_y, ls_box, ls_min, ls_max, ls_yAxis, svgyAxis;

function linksStatistics() {
    var ls_margin = {top: 30, right: 50, bottom: 70, left: 50};
    var ls_width = 250 - ls_margin.left - ls_margin.right;
    var ls_height = 300 - ls_margin.top - ls_margin.bottom;
    var ls_labels = true;

    ls_min = Infinity;
    ls_max = -Infinity;
    bdlinkStatistics[0][0] = "Links";
    bdlinkStatistics[0][1] = [];

    ls_chart = d3.box()
        .whiskers(iqr(1.5))
        .height(ls_height)
        .domain([ls_min, ls_max])
        .showLabels(ls_labels);

    var svg_box_links = d3.select("body").append("svg")
        .attr("width", ls_width + ls_margin.left + ls_margin.right)
        .attr("height", ls_height + ls_margin.top + ls_margin.bottom)
        .attr("class", "box")
        .attr("id", "linkStatistics")
        .append("g")
        .attr("transform", "translate(" + ls_margin.left + "," + ls_margin.top + ")");

    // the ls_x-axis
    ls_x = d3.scale.ordinal()
        .domain(bdlinkStatistics.map(function (d) {
            return d[0];
        }))
        .rangeRoundBands([0, ls_width], 0.7, 0.3);

    ls_xAxis = d3.svg.axis()
        .scale(ls_x)
        .orient("bottom");

// the y-axis
    ls_y = d3.scale.linear()
        .domain([ls_min, ls_max])
        .range([ls_height + ls_margin.top, 0 + ls_margin.top]);

    ls_yAxis = d3.svg.axis()
        .scale(ls_y)
        .orient("left");

// draw the boxplots
    ls_box = svg_box_links.selectAll(".box")
        .data(bdlinkStatistics)
        .enter().append("g")
        .attr("transform", function (d) {
            return "translate(" + ls_x(d[0]) + "," + ls_margin.top + ")";
        })
        .call(ls_chart.width(ls_x.rangeBand()));

// add a title
    svg_box_links.append("text")
        .attr("x", (ls_width / 2))
        .attr("y", 0 + (ls_margin.top / 2))
        .attr("text-anchor", "middle")
        .style("font-size", "18px")
        .text("Links");

// draw y axis
    svgyAxis = svg_box_links.append("g")
        .attr("class", "y axis")
        .call(ls_yAxis)
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
        .attr("transform", "translate(0," + (ls_height + ls_margin.top + 10) + ")")
        .call(ls_xAxis)
        .append("text")             // text label for the ls_x axis
        .attr("x", (ls_width / 2))
        .attr("y", 10)
        .attr("dy", ".71em")
        .style("text-anchor", "middle")
        .style("font-size", "16px");
}

function linksStatisicCallback() {
    bdlinkStatistics[0][1] = [];

    if (data) {
        $.each(data.nodes, function (i, n) {
            if (n.linkscount) {
                ls_min = Math.min(ls_min, n.linkscount);
                ls_max = Math.max(ls_max, n.linkscount);
                bdlinkStatistics[0][1].push(n.linkscount);
            }
        });
    }

    ls_chart.domain([ls_min, ls_max]);

    ls_x.domain(bdlinkStatistics.map(function (d) {
        return d[0];
    }));

    ls_y.domain([ls_min, ls_max]);

    ls_box.data(bdlinkStatistics);
    ls_box.call(ls_chart.duration(1000));

    svgyAxis.call(ls_yAxis);
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