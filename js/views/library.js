var app = app || {};

app.LibraryView = Backbone.View.extend({
    template: _.template($('#org-chart-template').html()),
    initialize: function(options) {

        // this.collection.on('add reset remove', function() {
        //      this.render(this.collection);
        //   }, this);

        Backbone.pubSub.on('library:search', this.search, this);
        Backbone.pubSub.on('add', this.addItems, this);
        Backbone.pubSub.on('remove', this.removeItems, this);
        Backbone.pubSub.on('view:reset', this.reset, this);
        Backbone.pubSub.on('modify', this.modifyItems, this);

        this.updateParents = function(){

        };
        this.parent_cache = {};
        this.parent_id_cache = {};

        this.collection = app.ItemCollection;
    },

    addModelToParentCache: function(parent, item){
        this.parent_cache[parent] = this.parent_cache[parent] || [];

        this.parent_cache[parent].push(item);
    },

    updateItemParentId: function(parent_id, item){
        item.model.set({parent: parent_id});
    },

    setParents : function(collection){
        var that = this, i;
        collection = collection || this.collection;
        collection.each(function(model){
            var parent = model.get('parent'),
            name = model.get('name'),
            id = model.get('id');
            //check to see if parent id has already been cached
            if(that.parent_id_cache.hasOwnProperty(parent)){
               //set models parent id to that in the cache
               model.set({parent: that.parent_id_cache[parent]}); 

               //add model to parent cache since it could also be a parent
               that.parent_cache[name] = that.parent_cache[name] || [];
               that.parent_id_cache[name] = id;

               //update all nodes in parent cache if needed
               for(i = 0; i < that.parent_cache[parent].length; i++){
                    that.updateItemParentId(that.parent_id_cache[parent], that.parent_cache[parent][i]);
               }
               //empty parent cache array
               that.parent_cache[parent].length = 0;
            } else {
                //add model to parent cache to be updated later
                that.addModelToParentCache(parent, model);
            }
        });
    },

    render: function(collection) {
              this.$el.html(this.template());
        this.$orgchart = this.$('#org-chart');
        collection = collection || this.collection;
        this.$orgchart.orgChart({data: this.collection.map(function(model){return model.attributes;})});
        return this;
    },
    onClose: function() {
        _.each(this.childViews, function(childView) {
            childView.remove();
            childView.unbind();
            if (childView.onClose) {
                childView.onClose();
            }
        });

        Backbone.pubSub.off('library:search');
        Backbone.pubSub.off('add');
        Backbone.pubSub.off('remove');
        Backbone.pubSub.off('view:reset');
        Backbone.pubSub.off('modify');
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
    renderItem: function(item, highlightSearch, regex) {
        var itemView = new this.itemView({
                model: item
            }),
            itemViewEl = itemView.render().el,
            $searchEl = $(itemViewEl).find('.list-item');

        if (highlightSearch && regex) {
            (function(that) {
                $searchEl.each(function() {
                    that.highlightSearchPhrase($(this), that.searchQuery, regex);
                });
            })(this);
        }

        this.$el.append(itemViewEl);
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
            if (!newQuery && _.difference(models,  this.collection.models).length > 0){
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
