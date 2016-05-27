/**
 * Created by Sören on 20.05.2016.
 */

function WikipediaExplorerAPI(lang) {
    "use strict";
    this.lang = "en";
    this.mediaWikiJS = new MediaWikiJS('http://' + this.lang + '.wikipedia.org', null, null);
    this.random = {
        action: 'query',
        prop: 'links|revisions',
        rvprop: 'size',
        pllimit: '500',
        grnnamespace: '0',
        generator: 'random'
    };

    this.name = {
        action: 'query',
        prop: 'links|revisions',
        rvprop: 'size',
        pllimit: '500',
        titles: ''
    };
}

WikipediaExplorerAPI.prototype.setLang = function (lang) {
    "use strict";
    this.lang = lang;
};

WikipediaExplorerAPI.prototype.convertData = function (data) {
    "use strict";
    var d = {nodes: [], links: []};
    var page = data.query.pages[Object.keys(data.query.pages)[0]];
    var main = {
        index: page.title,
        title: page.title,
        size: page.links.length
    };
    d.nodes.push(main);

    page.links.forEach(function (link) {
        d.nodes.push({
            index: link.title,
            title: link.title
        });
        d.links.push({
            source: main.index,
            target: link.title,
            type: "suit"
        });
    });
    return d;
};

WikipediaExplorerAPI.prototype.getRandom = function (func) {
    "use strict";
    func = func || function () { };
    var wep = this;
    this._load(wep.random, function (data) {
        func(wep.convertData(data));
    });
};


WikipediaExplorerAPI.prototype._load = function (options, func) {
    this.mediaWikiJS.send(options, function (d) {
        console.log("_load",d);
        if (typeof d.warnings !== 'undefined') {
            console.error(d.warnings.main);
            throw d.warnings.main;
        } else {
            func(d);
        }
    });
};


WikipediaExplorerAPI.prototype.getByTitle = function (title, options, func) {
    "use strict";
    func = func || function () { };
    var wep = this;
    var o = wep.name; o.titles = title;
    this._load(o, function (data) {
        func(wep.convertData(data));
    });
};