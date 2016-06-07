/**
 * Created by Sören on 31.05.2016.
 */

var force, svg, marker, path, circle, text, axisLinksCount, axisLinksCountX;

function graph() {
    initScales();

    var width = window.innerWidth * 0.9, height = window.innerHeight * 0.9;

    var nodes = d3.values(data.nodes);
    nodes.map(function (n) {
        n.finsihed = false;
    });
    var links = data.links;

    force = cola.d3adaptor() /* d3.layout.force()*/
        .nodes(nodes)
        .links(links)
        .size([width, height])
        .avoidOverlaps(true)
        .symmetricDiffLinkLengths(100, 1.7)
        /*
         .linkStrength(0.1)
         .friction(0.9)
         .linkDistance(20)
         .charge(-30)
         .gravity(0.1)
         .theta(0.8)
         .alpha(0.1)*/
        .on("tick", tick)
        .start();

    svg = d3.select("body").append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("id", "graph");

    // Per-type markers, as they don't inherit styles.

    marker = svg.append("defs").selectAll("marker")
        .data(force.links())
        .enter().append("marker")
        .attr("id", function (n) {
            return "marker" + n.source.index + "_" + n.target.index;
        })
        .attr("viewBox", "0 -5 10 10")
        .attr("refX", markerRefX)
        .attr("refY", -1.5)
        .attr("markerWidth", 6)
        .attr("markerHeight", 6)
        .attr("orient", "auto");

    marker.append("path").attr("d", "M0,-5L10,0L0,5");


    path = svg.append("g").selectAll("path")
        .data(force.links())
        .enter().append("path")
        .attr("class", "link")
        .attr("marker-end", function (n) {
            return "url(#marker" + n.source.index + "_" + n.target.index + ")";
        });

    circle = svg.append("g").selectAll("circle")
        .data(force.nodes())
        .enter().append("circle")
        .attr("r", circleRadius)
        .style("stroke", "black")
        .style("fill", circleFill)
        .on('click', function (c) {
            $.prettyPhoto.open('detail.html?site=' + c.name + '&iframe=true&width=70%&height=70%');
        })
        .on('mouseover', function (c) {
            c.selected = true;
            c.showText = true;
            mousemover();
        })
        .on('mouseout', function (c) {
            c.selected = false;
            c.showText = false;
            mousemover();
        });

    text = svg.append("g").selectAll("text")
        .data(force.nodes())
        .enter().append("text")
        .attr("ls_x", textX)
        .attr("y", ".31em");

    svg.select("defs").append("linearGradient")
        .attr("id", "links_axis_color")
        .attr("x1", "0%")
        .attr("x2", "0%")
        .attr("y1", "0%")
        .attr("y2", "100%")
        .selectAll("stop")
        .data([{color: "red", offset: "0%"}, {color: "yellow", offset: "100%"}])
        .enter().append("stop")
        .attr("stop-color", function (n) {
            return n.color;
        })
        .attr("offset", function (n) {
            return n.offset;
        });
    axisLinksCount = svg.append("g").attr("class", "axis").attr("transform", "translate(60,30)");
    axisLinksCountX = d3.scale.linear().range([0, 300]);
    axisLinksCount.call(d3.svg.axis().scale(axisLinksCountX).ticks(15).orient("left"));
    axisLinksCount.append("rect").attr("x", 1).attr("y", 0).attr("width", 10).attr("height", 300).style("fill", "url(#links_axis_color)");

    resumeLoad();

}

function mousemover() {
    text.text(function (d) {
        return d.showText ? d.name : "";
    });
    circle.attr("class", function (d) {
        if (d.selected) {
            return "shadow";
        }
        return "";
    })
}

function linkArc(d) {
    var dx = d.target.x - d.source.x,
        dy = d.target.y - d.source.y,
        dr = Math.sqrt(dx * dx + dy * dy);
    return "M" + d.source.x + "," + d.source.y + "A" + dr + "," + dr + " 0 0,1 " + d.target.x + "," + d.target.y;
}

function transform(d) {
    return "translate(" + d.x + "," + d.y + ")";
}


function textX(c) {
    if (typeof c.size !== 'undefined') {
        return scaleSize(Math.max(1, c.size)) + 2;
    }
    return 8;
}

function circleFill(c) {
    if (c.size > 0) {
        return scaleLinksCount(c.linkscount);
    }
    return "hellgray";
}

function circleRadius(c) {
    if (c.size != undefined && c.size > 0) {
        return scaleSize(c.size);
    }
    return 6;
}

function markerRefX(l) {
    if (l.target.size) {
        return 11 + scaleSize(l.target.size);
    }
    return 15;
}

function resumeLoad() {
    force.nodes().forEach(function (n) {
        api.byName(n.name, function (d) {
            data.size.max = Math.max(data.size.max, d.size.max);
            data.size.min = Math.min(data.size.min, d.size.min);

            data.linkscount.min = Math.min(data.linkscount.min, d.linkscount.min);
            data.linkscount.max = Math.max(data.linkscount.max, d.linkscount.max);

            n.linkscount = d.nodes[n.name].linkscount;
            n.finsihed = d.nodes[n.name].finsihed;
            n.size = d.nodes[n.name].size;
            n.categories = d.nodes[n.name].categories;
            n.available = d.nodes[n.name].available;

            axisLinksCountX.domain([data.linkscount.max, data.linkscount.min]);
            axisLinksCount.call(d3.svg.axis().scale(axisLinksCountX).ticks(15).orient("left"));

            initScales();
            linksScaleAxes();
            tick();
        });
    });
}

function initScales() {
    scaleSize = d3.scale.log().domain([1, data.size.max]).range([6, 24]);
    scaleLinksCount = d3.scale.linear().domain([data.linkscount.min, data.linkscount.max]).range(["yellow", "red"]).interpolate(d3.interpolateRgb);
}

function linksScaleAxes() {


}