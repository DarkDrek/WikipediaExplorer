/**
 * Created by Sören on 01.06.2016.
 */


var svg_linkStatistics = d3.select("body").append("svg").attr("width", 300).attr("height", 300).attr("id", "linkStatistics").attr("class", "box");

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