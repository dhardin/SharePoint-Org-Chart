var app = app || {};

var Router = Backbone.Router.extend({
    routes: {
        '': 'selectEdit',
        'view/category/:department': 'orgchart',
        'view/person/:person': 'person',
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
    person: function(loginname) {
        var fetchingDataView, editUserPermissionView, user;

          app.state_map.fetchId = loginname || "";
        if (app.config.isTesting) {
            app.setTestData('user');
        } else if (!app.state_map.fetched.editUser) {
            app.userEditFetchData();
        }

        if (app.state_map.fetchingData) {
            app.router.navigate('fetch', true);
            app.state_map.dataLoadCallback = function() {
                if (app.state_map.fetchId) {
                    app.router.navigate('edit/user/' + app.state_map.fetchId, true);
                } else {
                    app.router.navigate('edit/user/', true);
                }
            };
            return;
        } else if (loginname) {
          
            loginname = loginname.replace('\\', '/');
            user = app.UserCollection.findWhere({
                loginname: loginname
            });
            if (!user) {
                app.router.navigate('edit/user/', true);
                return;
            }
        } else {
            user = new app.User();
        }
        editUserPermissionView = new app.EditUserPermissionsView({
            model: user
        });

        this.AppView.showView(editUserPermissionView);
    },

     person: function(loginname) {
        var fetchingDataView, editUserPermissionView, user;

          app.state_map.fetchId = loginname || "";
        if (app.config.isTesting) {
            app.setTestData('user');
        } else if (!app.state_map.fetched.editUser) {
            app.userEditFetchData();
        }

        if (app.state_map.fetchingData) {
            app.router.navigate('fetch', true);
            app.state_map.dataLoadCallback = function() {
                if (app.state_map.fetchId) {
                    app.router.navigate('edit/user/' + app.state_map.fetchId, true);
                } else {
                    app.router.navigate('edit/user/', true);
                }
            };
            return;
        } else if (loginname) {
          
            loginname = loginname.replace('\\', '/');
            user = app.UserCollection.findWhere({
                loginname: loginname
            });
            if (!user) {
                app.router.navigate('edit/user/', true);
                return;
            }
        } else {
            user = new app.User();
        }
        editUserPermissionView = new app.EditUserPermissionsView({
            model: user
        });

        this.AppView.showView(editUserPermissionView);
    },

    onRouteChange: function(route, params) {
        //parse out hash
        var hashRoute = window.location.hash.substring(1),
            routePathArr = hashRoute.split('/'),
            breadcrumb,
            i, j, href = '#',
            $breadcrumbs = $('.breadcrumbs');

        $breadcrumbs.children().not('.home').remove();

        if (route == 'error') {
            return;
        }

        for (i = 0; i < routePathArr.length; i++) {
            breadcrumb = routePathArr[i];
            if (breadcrumb == '') {
                continue;
            }
            href += breadcrumb + '/';
            $breadcrumbs.append('<li class="' + (i == routePathArr.length - 1 ? 'current' : '') + '"><a href="' + href + '">' + breadcrumb + '</a></li>');
        }
    }
});


app.router = new Router({
    AppView: app.AppView
});

Backbone.history.start();
