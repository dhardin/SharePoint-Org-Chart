var app = app || {};

app.state_map = {
    fetchingData: false,
    dataLoadCallback: false,
    filterOptions: false,
    fetched: {
        items: false
    }
};

app.DataFetched = function() {
    app.state_map.fetchingData = false;
    if (app.state_map.dataLoadCallback) {
        app.state_map.dataLoadCallback();
    }

};

app.itemFetchData = function() {
    app.state_map.fetchingData = true;
    if (app.config.testing) {
        app.Items = data;
        //initialize data
        app.ItemCollection = new app.Library(data);
        app.state_map.fetched.items = true;
        //setup navigation items
        var departments = _.unique(_.pluck(data, 'department'));

        $('.departments').append(departments.reduce(function(previous, current, index, array) {
            return (index == 1 ? '<li><a href="#department/'+previous+'">'+previous+'</a></li>' : previous) + '<li><a href="#department/'+current+'">'+current+'</a></li>';
        }));
        app.DataFetched();
    } else {
           app.data.getData([{
            url: app.config.url,
            type: 'list',
            guid: app.config.guid,
            callback: function(results) {
                app.state_map.fetchingData = false;
                results = app.processResults(results);
                //set library to results
                app.ItemCollection.set(results);
                //app.ItemCollection.trigger('change');
                if (app.dataLoadCallback) {
                    for (i = 0; i < app.dataLoadCallback.length; i++) {
                        app.dataLoadCallback[i]();
                    }
                    app.dataLoadCallback = false;
                }
            }
        }], 0, function() {
            app.state_map.fetched = true;
        });
    }
};

$.fn.insertAt = function(index, element) {
    var lastIndex = this.children().size();

    if (index < 0) {
        index = Math.max(0, lastIndex + 1 + index);
    }
    this.append(element);
    if (index < lastIndex) {
        this.children().eq(index).before(this.children().last());
    }
    return this;
}
