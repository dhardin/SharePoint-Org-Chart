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


app.processResults = function(results) {
    var temp_results = app.data.processData(results),
        index = 0, i = 0;

        results = [];

    for (i = 0; i < temp_results.length; i++) {
        if (Object.keys(temp_results[i]).length == 0) {
            continue;
        }

        results.push({});
        index = results.length - 1;

        //make all keys lower case
        for (var key in temp_results[i]) {
            if (app.config.property_map.hasOwnProperty(key.toLowerCase())) {
                value = temp_results[i][key];
                key = app.property_map[key.toLowerCase()];
                results[index][key] = value;
            }
        }
    }
    return results;
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
