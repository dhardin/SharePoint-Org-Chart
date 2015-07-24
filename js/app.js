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
        app.DataFetched();
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
