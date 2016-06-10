/**
 * Created by Sören on 01.06.2016.
 */

var svg_overview, links_max, links_min;

function overview() {
    svg_overview = d3.select("body").append("svg").attr("width", 300).attr("height", 32).attr("id", "map");
    links_max = svg_overview.append("text").text(linksMaxText).attr("x", ".31em").attr("y", 10);
    links_min = svg_overview.append("text").text(linksMinText).attr("x", ".31em").attr("y", 20);
    links_average = svg_overview.append("text").text(linksAverageText).attr("x", ".31em").attr("y", 30);
}


function linksMaxText() {
    var text = "Links max: ";
    if (data) {
        return text += data.linkscount.max;
    }
    return text += 0;
}

function linksMinText() {
    var text = "Links min: ";
    if (data) {
        return text += data.linkscount.min;
    }
    return text += 0;
}

function linksAverageText() {
    var text = "Links average: ";
    if (data) {
        var count = 0, links = 0;
        $.each(data.nodes, function (i, n) {
            if (n.linkscount) {
                links += n.linkscount;
                count++;
            }
        });
        return text += (links / count).toFixed(2);
    }
    return text += 0;
}