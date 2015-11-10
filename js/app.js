var app = app || {};

app.state_map = {
    fetchingData: false,
    dataLoadCallback: false,
    filterOptions: false,
    fetched: {
        items: false
    },
    itemViewContext: null
};

app.DataFetched = function(data) {
    app.state_map.fetchingData = false;
    app.state_map.fetched.items = true;
      var departments = _.unique(_.pluck(data, 'department'));

        $('.departments').append(departments.reduce(function(previous, current, index, array) {
            return (index == 1 ? '<li><a href="#department/' + previous + '">' + previous + '</a></li>' : previous) + '<li><a href="#department/' + current + '">' + current + '</a></li>';
        }));
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
        app.DataFetched(data);
    } else {
        app.data.getData([{
            url: app.config.url,
                type: 'list',
                guid: app.config.guid,
                callback: function(results) {
                    app.state_map.fetchingData = false;
                    results = app.processResults(results);
                    //set library to results
                    app.ItemCollection = new app.Library(results);
                    //app.ItemCollection.trigger('change');
                    app.DataFetched(results);
                }
        }],0);
    }
};


app.processResults = function(results, format_func) {
    var temp_results = app.data.processData(results),
        index = 0,
        i = 0;

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
                key = app.config.property_map[key.toLowerCase()];
                results[index][key] = value;
                if(format_func){
                    results[index][key] = format_func(key, value);
                }
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
