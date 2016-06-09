/**
 * Created by Sören on 05.06.2016.
 */

/**
 *
 * @param d3.svg svg
 * @param data
 * @param margin
 * @param width
 * @param height
 */
function boxPlot(svg, data, minMax, margin, width, height) {
    var t = this;
    this.labels = true; // show the text labels beside individual boxplots?

    this.margin = margin || {top: 30, right: 50, bottom: 70, left: 50};
    this.width = (width || 800) - this.margin.left - this.margin.right;
    this.height = (height || 400) - this.margin.top - this.margin.bottom;

    this.chart = d3.box()
        .whiskers(iqr(1.5))
        .height(height)
        .domain([minMax.min, minMax.max])
        .showLabels(this.labels);

    svg.attr("width", this.width + this.margin.left + this.margin.right)
        .attr("height", this.height + this.margin.top + this.margin.bottom)
        .attr("class", "box")
        .append("g")
        .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");

    // the x-axis
    this.x = d3.scale.ordinal()
        .domain(data.map(function (d) {
            return d[0];
        })).rangeRoundBands([0, this.width], 0.7, 0.3);

    this.xAxis = d3.svg.axis()
        .scale(this.x)
        .orient("bottom");

    // the y-axis
    this.y = d3.scale.linear()
        .domain([minMax.min, minMax.max])
        .range([this.height + this.margin.top, 0 + this.margin.top]);

    this.yAxis = d3.svg.axis()
        .scale(this.y)
        .orient("left");

    // draw the boxplots
    this.box = svg.selectAll(".box")
        .data(data)
        .enter().append("g")
        .attr("transform", function (d) {
            return "translate(" + t.x(d[0]) + "," + t.margin.top + ")";
        })
        .call(this.chart.width(this.x.rangeBand()));
    /*
     // add a title
     svg.append("text")
     .attr("x", (this.width / 2))
     .attr("y", 0 + (this.margin.top / 2))
     .attr("text-anchor", "middle")
     .style("font-size", "18px")
     //.style("text-decoration", "underline")
     .text("Revenue 2012");
     */
// draw y axis
    this.svgyAxis = svg.append("g")
        .attr("class", "y axis")
        .call(this.yAxis);
    /*
     .append("text") // and text1
     .attr("transform", "rotate(-90)")
     .attr("y", 6)
     .attr("dy", ".71em")
     .style("text-anchor", "end")
     .style("font-size", "16px")
     .text("Revenue in €");*/

// draw x axis
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + (this.height + this.margin.top + 10) + ")")
        .call(this.xAxis);
    /*
     .append("text")             // text label for the x axis
     .attr("x", (this.width / 2))
     .attr("y", 10)
     .attr("dy", ".71em")
     .style("text-anchor", "middle")
     .style("font-size", "16px")
     .text("Quarter");*/

    this.setData = function (d, mm) { console.log(d,mm);
        this.chart.domain([mm.min, mm.max]);
        this.y.domain([mm.min, mm.max]).range([this.height + this.margin.top, this.margin.top]);
        this.box.data(d);
        this.svgyAxis.call(this.yAxis);
        this.box.call(this.chart.duration(10));
    };

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