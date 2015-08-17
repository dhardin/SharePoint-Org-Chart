var app = app || {};

app.LibraryChildren = Backbone.View.extend({
    template: _.template($('#item-list-template').html()),
    className: 'node child-collection',
    initialize: function(options) {
        this.collection = options.collection;
        this.collection.on('add reset remove', function() {
            this.render(this.collection);
        }, this);

        Backbone.pubSub.on('add', this.addModel, this);
        Backbone.pubSub.on('delete', this.deleteModel, this);
        Backbone.pubSub.on('done', this.render, this);
    },

    addModel: function(model) {
        model = this.collection.add(model);
    },

   
            deleteModel: function(model) {
                this.collection.remove(model);
            },

    render: function(collection) {
        var that = this;

        this.childViews = [];

        this.$el.html(this.template());
        collection = collection || this.collection;


        collection.each(function(model) {
            that.$el.append(that.renderItem(model));
        });

        return this;
    },

    renderItem: function(model) {
        if (!model) {
            return;
        }
        var itemView = new app.ListItemView({
            model: model
        });

        this.childViews.push(itemView);

        return itemView.render().el;
    },
    onClose: function() {
        _.each(this.childViews, function(childView) {
            childView.remove();
            childView.unbind();
            if (childView.onClose) {
                childView.onClose();
            }
        });

        Backbone.pubSub.off('showModal');
        Backbone.pubSub.off('add');
        Backbone.pubSub.off('delete');
        Backbone.pubSub.off('done');
    },
    renderItems: function(modelsArr, index, currentSearchNum, highlightSearch, regex) {

        if (this.searchNum != currentSearchNum) {
            return;
        }

        if (index < modelsArr.length) {
            if (highlightSearch && regex) {
                this.renderItem(modelsArr[index], highlightSearch, regex);
            } else {
                this.renderItem(modelsArr[index]);
            }

            (function(that) {
                setTimeout(function() {
                    index++;
                    that.renderItems(modelsArr, index, currentSearchNum, highlightSearch, regex);
                }, 1);
            })(this);
        } else {
            this.onRenderComplete(this.searchQuery);
        }
    },
    renderItemHtml: function(item) {
        var itemView = new this.itemView({
            model: item
        });
        this.el_html.push(itemView.render().el);
    },
    renderFiltered: function(collection) {
        var numActiveItems = 0,
            totalItems = 0,
            numItemsDisplayed = 0,
            active_items_arr,
            regex;

        collection = collection || this.collection;
        //get the total number of active items
        totalItems = this.collection.length;
        numItemsDisplayed = collection.length;
        if (totalItems == numItemsDisplayed) {
            return this;
        }
        this.$el.html('');
        if (numItemsDisplayed < totalItems) {
            this.$el.append('<div>Displaying ' + numItemsDisplayed + ' out of ' + totalItems + '</div>');
        }
        this.searchNum++;
        if (collection.length > 0) {

            regex = new RegExp(this.searchQuery, 'gi');
            this.renderItems(collection.models, 0, this.searchNum, true, regex);
        }
    },
    reset: function(view) {
        if (view !== this) {
            return;
        }

        this.render();
    },
    modifyItems: function(options) {
        add_settings = options.add || {};
        remove_settings = options.remove || {};
        this.addItems(add_settings.models, add_settings.collection);
        this.removeItems(remove_settings.models, remove_settings.collection);
        Backbone.pubSub.trigger('modify-complete');
    },
    addItems: function(models, collection) {
        var index = 0,
            i = 0,
            itemView, model;

        if (collection != this.collection) {
            return;
        }

        for (i = 0; i < models.length; i++) {
            model = models[i];
            this.collection.add(model);
            itemView = new this.itemView({
                model: model
            });
            index = this.collection.indexOf(model);
            this.$el.insertAt(index, itemView.render().el);
        }

    },
    removeItems: function(models, collection) {
        var itemView, model, index = 0,
            i = 0,
            arr_length = models.length;

        index = index || 0;

        if (collection != this.collection) {
            return;
        }

        for (i = 0; i < arr_length; i++) {
            model = models.length < arr_length ? models[0] : models[i];
            index = collection.indexOf(model);
            this.$el.children().eq(index).remove();
            this.collection.remove(model);
        }
    },

    showModal: function(model) {
        model = this.collection.get(model);
        if (!model || this.$modal.is(':visible')) {
            return;
        }
        var detailsView = new app.DetailsView({
            model: model
        });

        this.childViews.push(detailsView);

        this.$modal.find('.content').html(detailsView.render().el);
        this.$modal.foundation('reveal', 'open');
    },

    search: function(options) {
        var collection = (options && options.collection ? options.collection : this.collection),
            results = [],
            key, val, models, newQuery = true;

        this.searchQuery = options.val || '';

        if (!options || options.val == '' || options.key == '') {
            this.render();
        } else {
            key = options.key;
            val = options.val.toLowerCase();

            //check to see if we already searched for this
            this.search_cache[val] = this.search_cache[val] || {};
            newQuery = !this.search_cache[val].models ? true : false;
            this.search_cache[val].models = this.search_cache[val].models || $.extend([], this.collection.models);
            models = this.search_cache[val].models;
            //check to see if current collection is different from cached collection
            if (!newQuery && _.difference(models, this.collection.models).length > 0) {
                this.search_cache[val].models = this.collection.models;
                results = false;
            } else {
                results = this.search_cache[val].results;
            }
            //if key isn't cached, go ahead and build a collection
            if (!results) {
                (function(that) {
                    results = that.collection.filter(function(item) {
                        var attributeVal = item.get(key).toLowerCase();
                        if (attributeVal.indexOf(val) > -1) {
                            return true;
                        }
                    });
                })(this);

                //cache results of search
                this.search_cache[val].results = results;
            }
            this.renderFiltered(new Backbone.Collection(results));
        }
    }
});
