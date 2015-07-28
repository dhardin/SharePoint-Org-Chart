var app = app || {};

var Router = Backbone.Router.extend({
    routes: {
        '': 'orgchart',
        ':department': 'orgchart',
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
    fetch: function(){
        var fetchingDataView = new app.FetchingDataView();

        this.AppView.showView(fetchingDataView);
    },

     orgchart: function(department) {
        var fetchingDataView, libraryView;
       if (!app.state_map.fetched.items) {
            app.itemFetchData();
        }

        if (app.state_map.fetchingData) {
            app.router.navigate('fetch', true);
            app.state_map.dataLoadCallback = function() {
            };
            return;
        }  else {
            library = new app.Library();
        }
        libraryView = new app.LibraryView({department: department});

        this.AppView.showView(libraryView);
    }
});


app.router = new Router({
    AppView: app.AppView
});

Backbone.history.start();
