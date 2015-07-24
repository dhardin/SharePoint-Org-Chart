var app = app || {};

app.Library = Backbone.Collection.extend({
    model: app.Item,
    comparator: function(property) {
        return selectedStrategy.apply(myModel.get(property));
    },
    strategies: {
        name: function(user) {
            return user.get("name");
        }
    },
    changeSort: function(sortProperty) {
        this.comparator = this.strategies[sortProperty];
        this.trigger('sortList');
    },
    initialize: function() {
        this.changeSort("name");
    },
    //searches through a collection on multiple queries
    search: function(options) {
        var query_key, key, attributes,
            start, end, val, formatAttrFunc,
            queries = options,
            results = this;


        for (query_key in queries) {
            switch (query_key) {
                case 'text':
                    val = queries[query_key].val.toLowerCase();
                    if(val.length == 0){
                        continue;
                    }
                    attribute = queries[query_key].attribute;
                    results = results.filter(function(model) {
                        if (attribute && model.get(attribute) && model.get(attribute).indexOf(val) > -1) {
                            return true;
                        } else {
                            //search through all attributes
                            //if one matches, return true
                            //else, return false
                            attributes = model.attributes;
                            for (key in attributes) {
                                if (attributes[key].toString().toLowerCase().indexOf(val) > -1) {
                                    return true;
                                }
                            }
                            return false;
                        }
                    });
                    break;
                case 'between':
                    if(!queries[query_key]){
                        continue;
                    }
                    start = queries[query_key].start;
                    end = queries[query_key].end;
                    attribute = queries[query_key].attribute;
                    formatAttrFunc = queries[query_key].formatAttrFunc;
                    results = results.filter(function(model) {
                        val = (formatAttrFunc ? formatAttrFunc(model.attributes[attribute]) : model.attributes[attribute]);
                        if (val >= start && val <= end) {
                            return true;
                        }
                    });
                    break;
                default:
                    break;
            }
        }

        return new Backbone.Collection(results.models ? results.models : results);

    }
});
