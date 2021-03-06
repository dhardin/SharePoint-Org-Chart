var app = app || {};

var Router = Backbone.Router.extend({
    routes: {
        '': 'orgchart',
        'D3': 'orgchartD3',
        'edit=:edit': 'orgchart',
        'department/:department': 'orgchart',
        'department/:department/edit=:edit': 'orgchart',
        'fetch': 'fetch',
        '*404': 'error'
    },

    initialize: function(options) {
        this.AppView = options.AppView;
        this.on('route', this.onRouteChange);
        Backbone.pubSub.on('breadcrumbs', this.onRouteChange, this);
    },
    error: function() {
        var errorView = new app.ErrorView();
        app.router.AppView.showView(errorView);
    },
    fetch: function() {
        var fetchingDataView;

        if (!app.state_map.fetchingData) {
            app.router.navigate('', true);
            return;
        }

        fetchingDataView = new app.FetchingDataView();

        this.AppView.showView(fetchingDataView);
    },

    orgchart: function(department) {
        var fetchingDataView, libraryView,
        department = department ? decodeURIComponent(department) : false;
        if (!app.state_map.fetched.items) {
            app.itemFetchData();
        }

        if (app.state_map.fetchingData) {
            app.router.navigate('fetch', true);
            app.state_map.dataLoadCallback = function() {
                app.router.navigate('', true);
            };
            return;
        } else {
            library = new app.Library();
        }

        libraryView = new app.LibraryView({
            department: department
        });



        this.AppView.showView(libraryView);
    },

    orgchartD3: function() {
        var fetchingDataView, libraryView;
        if (!app.state_map.fetched.items) {
            app.itemFetchData();
        }

        if (app.state_map.fetchingData) {
            app.router.navigate('fetch', true);
            app.state_map.dataLoadCallback = function() {
                app.router.navigate('D3', true);
            };
            return;
        } else {
            library = new app.Library();
        }

        libraryView = new app.LibraryViewD3();
        this.AppView.showView(libraryView);
    },
    // and the function that parses the query string can be something like : 
    parseQueryString: function(queryString) {
        var params = {};
        if (queryString) {
            _.each(
                _.map(decodeURI(queryString).split(/&/g), function(el, i) {
                    var aux = el.split('='),
                        o = {};
                    if (aux.length >= 1) {
                        var val = undefined;
                        if (aux.length == 2)
                            val = aux[1];
                        o[aux[0]] = val;
                    }
                    return o;
                }),
                function(o) {
                    _.extend(params, o);
                }
            );
        }
        return params;
    }
});

var appView = new app.AppView();
app.router = new Router({
    AppView: appView
});

Backbone.history.start();
