project title
WikipediaExplorer

names of all team members
Sören Grzanna
Eike Wacker

source of data (URL)
Wikipedia API in diversen Sprachen

source of code (URL), if Java/JavaScript libraries, D3 examples, ... are used
Javascript function 'getQueryVariable' http://stackoverflow.com/a/2091331
Libary MediawikiJS.js https://github.com/brettz9/mediawiki-js
Fancy Search box http://www.designrazor.net/free-html-css-search-box-download/ Clean Search Form, CSS3/jQuery + PSD
Async.js https://github.com/caolan/async
D3.js https://d3js.org/
chain.js https://github.com/krasimir/chain
jquery https://jquery.com/
cola.js http://marvl.infotech.monash.edu/webcola/

Boxplot example + boxPlot.js http://bl.ocks.org/jensgrubert/7789216
graph example https://bl.ocks.org/mbostock/1153292
bar chart example https://bl.ocks.org/mbostock/7555321
line chart example http://bl.ocks.org/mbostock/7621155

brief description of usage: file to be opened in browser or console, user interaction
Open index.html in modern browser (only tested in chrome)
Selection of the main node is possible via the search box. Enter a word and press enter or click the search icon. Empty search will result in a random search.
Click on a node will open the 'detail.html' as popup.
Clicking on a language inside the bar-chart will update the other diagram with the information about the article with that language
Hover over a Node will show the name
Hover over a point in the line diagram will show the exact size and date
Hover over a bar will show the exact size and language

brief list of implemented visualization techniques
graph:
- Nodes as pages in wikipedia
- Links as links from a node to another
- Color of a node as amount of links on the page
- Size of a node size of the page
- Thick black border = initially searched page
- Arrow on link means direction of the link

Coloring scala:
- From yellow (few links) to red (many links)

box plots:
- links of all pages
- sizes of all pages

line diagram:
- displays the latest changes to the page size
- uses a time scale

bar chart:
- current size of the page in different languages