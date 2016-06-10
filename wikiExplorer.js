/**
 * Created by Sören on 20.05.2016.
 */

function WikipediaExplorerAPI(lang) {
    "use strict";
    this.lang = "en";
    this.mediaWikiJS = new MediaWikiJS('http://' + this.lang + '.wikipedia.org', null, null);
    this.random = {
        action: 'query',
        prop: 'links|revisions|categories|langlinks',
        rvprop: 'size',
        plnamespace: '0',
        grnnamespace: '0',
        generator: 'random'
    };

    this.name = {
        action: 'query',
        prop: 'links|revisions|categories|langlinks',
        rvprop: 'size',
        plnamespace: '0',
        titles: ''
    };
}

WikipediaExplorerAPI.prototype.setLang = function (lang) {
    "use strict";
    this.lang = lang;
};

WikipediaExplorerAPI.prototype.convertData = function (data, available) {
    "use strict";
    var d = available || {
            nodes: {},
            links: [],
            size: {min: Number.MAX_VALUE, max: Number.MIN_VALUE},
            linkscount: {min: Number.MAX_VALUE, max: Number.MIN_VALUE}
        };
    var page = data.query.pages[Object.keys(data.query.pages)[0]];
    var main = {
        id: page.title,
        name: page.title,
        available: page.missing ? false : true,
        linkscount: (page.links || []).length,
        size: (typeof page.missing !== 'undefined') ? 0 : page.revisions[0].size,
        categories: (page.categories || []).map(function (d) {
            return d.title.replace("Category:", "");
        }),
        finsihed: true
    };

    d.linkscount.min = Math.min(d.linkscount.min, main.linkscount);
    d.linkscount.max = Math.max(d.linkscount.max, main.linkscount);

    d.size.min = Math.min(d.size.min, main.size);
    d.size.max = Math.max(d.size.max, main.size);

    if (typeof d.nodes[main.id] !== 'undefined') {
        d.nodes[main.id].available = main.available;
        d.nodes[main.id].linkscount = main.linkscount;
        d.nodes[main.id].size = main.size;
        d.nodes[main.id].categories = main.categories;
    } else {
        d.nodes[main.id] = main;
    }

    (page.links || []).forEach(function (link) {
        if( link.show !== false ) {
            if (!d.nodes[link.title]) {
                d.nodes[link.title] = {
                    id: link.title,
                    name: link.title
                };
            }
            d.links.push({
                source: d.nodes[main.id],
                target: d.nodes[link.title],
            });
        }
    });
    return d;
};

WikipediaExplorerAPI.prototype.getRandom = function (func, limit, name) {
    "use strict";
    func = func || function () {
        };
    limit = limit || 500;
    var wep = this;

    if (name) {
        var optins = wep.name;
        optins.titles = name;
    } else {
        var optins = wep.random;
    }

    optins.pllimit = limit;
    optins.cllimit = limit;
    optins.lllimit = limit;

    this._load(optins, function (data) {
        var d = wep.convertData(data);

        var title = data.query.pages[Object.keys(data.query.pages)[0]].title;
        d.nodes[title].main = true;


        var chainArray = [function (nodes, next) {
            next(d);
        }];

        $.each(d.nodes, function (key, value) {
            if (!value.finsihed) {
                chainArray.push(function (nodeslinks, next) {
                    var o = wep.name;
                    o.titles = key;
                    o.pllimit = limit;
                    o.cllimit = limit;
                    o.lllimit = limit;
                    wep._load(o, function (response) {
                        next(wep.convertData(response, nodeslinks));
                    });
                });
            }
        });

        chainArray.push(function (nodeslinks, next) {
            func(nodeslinks);
        });
        Chain().apply(null, chainArray);
    });
};


WikipediaExplorerAPI.prototype._load = function (options, func, data) {
    var wea = this;
    this.mediaWikiJS.send(options, function (d) {
        //console.log("_load", d);
        if (typeof d.warnings !== 'undefined') {
            console.error(d.warnings.main);
            throw d.warnings.main;
        } else {
            var np = d.query.pages[Object.keys(d.query.pages)[0]];
            if( !data ){
                data = d;
            } else {
                var p = data.query.pages[Object.keys(data.query.pages)[0]];
                np.links.map(function (l) {
                    l.show = false;
                });
                p.links = p.links.concat(np.links);
            }

            if( "batchcomplete" in d ){
                func(data);
            }
            else{
                var o = {
                    action: 'query',
                    prop: 'links',
                    plnamespace: '0',
                    pllimit: 500,
                    titles: np.title,
                    plcontinue: d.continue.plcontinue
                };
                wea._load(o, func, data);
            }
        }
    });
};

WikipediaExplorerAPI.prototype.byName = function (name, func) {
    func = func || function () {
        };
    var limit = 500;
    var wep = this;
    var o = wep.name;
    o.pllimit = limit;
    o.cllimit = limit;
    o.lllimit = limit;
    o.titles = name;
    this._load(o, function (data) {
        var d = wep.convertData(data);
        func(d);
    });
};