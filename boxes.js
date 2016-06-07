/**
 * Created by Sören on 06.06.2016.
 */


var linksBoxPlotData = [[]];
var linksBoxPlotDataMinMax = {
    min: 0,
    max: 0
};
linksBoxPlotData[0][0] = "Links";
linksBoxPlotData[0][1] = [0];
var linksBoxPlot = new boxPlot(d3.select("body").append("svg").attr("id", "linkBoxPlot"), linksBoxPlotData, linksBoxPlotDataMinMax, undefined, 300, 300);

var revBoxPlotData = [[]];
var revBoxPlotDataMinMax = {
    min: 0,
    max: 0
};
revBoxPlotData[0][0] = "Revisions";
revBoxPlotData[0][1] = [0];
var revBoxPlot = new boxPlot(d3.select("body").append("svg").attr("id", "revBoxPlot"), revBoxPlotData, revBoxPlotDataMinMax, undefined, 300, 300);


function linksStatisicCallback() {
    linksBoxPlotData[0][1] = [];
    if (data) {
        $.each(data.nodes, function (i, n) {
            if (n.linkscount) {
                linksBoxPlotDataMinMax.min = Math.min(linksBoxPlotDataMinMax.min, n.linkscount);
                linksBoxPlotDataMinMax.max = Math.max(linksBoxPlotDataMinMax.max, n.linkscount);
                linksBoxPlotData[0][1].push(n.linkscount);
            }
        });
    }
    linksBoxPlot.setData(linksBoxPlotData, linksBoxPlotDataMinMax);
}
