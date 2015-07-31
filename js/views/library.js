var app = app || {};

app.LibraryView = Backbone.View.extend({
    template: _.template($('#org-chart-template').html()),
    initialize: function(options) {
        this.collection = app.ItemCollection;
        this.collection.on('add reset remove', function() {
            this.render(this.collection);
        }, this);
        this.department = options.department;

        Backbone.pubSub.on('showModal', this.showModal, this);
        Backbone.pubSub.on('add', this.addModel, this);
        Backbone.pubSub.on('delete', this.deleteModel, this);
         Backbone.pubSub.on('done', this.render, this);
        this.parent_cache = {};
        this.parent_id_cache = {};

     //   this.setParentChildren();
     //   this.setParents();
    },

    addModel: function(parent) {
        var model = {
            name: '',
            parent: parent.get('id'),
            department: parent.get('department'),
            title: ''
        };
        model = this.collection.add(model);
        model.set('id', model.get('id').length > 0 ? model.get('id') : model.cid);
        parent.set({
            children: parent.get('children').concat(model)
        });
        this.showModal(model);


    },

    deleteModel: function(model) {
        var parent = this.collection.get({
            id: model.get('parent')
        });
        parent.set({
            children: _.reject(parent.get('children'), function(child) {
                return child === model;
            })
        });
        this.collection.remove(model);

    },

    addModelToParentCache: function(parent, item) {
        this.parent_cache[parent] = this.parent_cache[parent] || [];

        this.parent_cache[parent].push(item);
    },

    updateItemParentId: function(parent_id, item) {
        item.model.set({
            parent: parent_id
        });
    },

    setParents: function(collection) {
        var that = this,
            i;
        collection = collection || this.collection;
        collection.each(function(model) {
            var parent = model.get('parent'),
                name = model.get('name'),
                id = model.get('id');
            //check to see if parent id has already been cached
            if (that.parent_id_cache.hasOwnProperty(parent)) {
                //set models parent id to that in the cache
                model.set({
                    parent: that.parent_id_cache[parent]
                });

                //add model to parent cache since it could also be a parent
                that.parent_cache[name] = that.parent_cache[name] || [];
                that.parent_id_cache[name] = id;

                //update all nodes in parent cache if needed
                for (i = 0; i < that.parent_cache[parent].length; i++) {
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
        var modelAttributArr, that = this;

        this.$el.html(this.template());
        this.$orgchart = this.$('#org-chart');
        this.$modal = this.$('.reveal-modal');
        this.$el.addClass('orgChart');
        collection = collection || this.collection;

        if (this.department) {
            collection = collection.filter(function(model) {
                return model.get('department').toLowerCase() == that.department.toLowerCase();
            });
        }
        modelAttributArr = collection.map(function(model) {
            return model.attributes;
        });
        this.$orgchart.orgChart({
            data: modelAttributArr,
            render: function(node, opts) {
                that.$el.append(that.buildTable(node, opts));
            }
        });

        this.setParentChildren();
     //   this.setParents();
        return this;
    },

    setParentChildren: function() {
        var that = this;
        this.collection.each(function(model) {
            model.set('children', that.collection.where({
                parent: model.get('id')
            }));
        });
    },

    setParents: function(parent, parentArr) {
        var children, i, model;
        parentArr = parentArr || [];
        if (!parent) {
            parent = this.collection.where({
                parent: 0
            })[0];
            parent.set({parents: []});
        }
        parentArr.push(parent);
        children = this.collection.where({
            parent: parent.get('id')
        });
        for(i = 0; i < children.length; i++){
            model = children[i];
            model.set({
                parents: parentArr.slice()
            });
            this.setParents(model, parentArr);
       }
    },

    buildTable: function(node, opts) {
        var childLength = node.children.length,
            mainTable, nodeColSpan, downLineTable, linesCols, i, $tr, $td,
            $table = $('<table cellpadding="0" cellspacing="0" border="0">');

        //   mainTable = "<table cellpadding='0' cellspacing='0' border='0'>";
        nodeColspan = childLength > 0 ? 2 * childLength : 2;
        $tr = $('<tr>');
        $td = $("<td colspan='" + nodeColspan + "'>");
        $tr.append($td);
        $td.append(this.renderItem(node.data.id));
        $table.append($tr);

        if (childLength > 0) {
            downLineTable = "<table cellpadding='0' cellspacing='0' border='0'><tr class='lines x'><td class='line left half'></td><td class='line right half'></td></table>";
            $table.append("<tr class='lines'><td colspan='" + childLength * 2 + "'>" + downLineTable + '</td></tr>');

            linesCols = '';
            for (i = 0; i < childLength; i++) {
                if (childLength == 1) {
                    linesCols += "<td class='line left half'></td>"; // keep vertical lines aligned if there's only 1 child
                } else if (i == 0) {
                    linesCols += "<td class='line left'></td>"; // the first cell doesn't have a line in the top
                } else {
                    linesCols += "<td class='line left top'></td>";
                }

                if (childLength == 1) {
                    linesCols += "<td class='line right half'></td>";
                } else if (i == childLength - 1) {
                    linesCols += "<td class='line right'></td>";
                } else {
                    linesCols += "<td class='line right top'></td>";
                }
            }
            $table.append("<tr class='lines v'>" + linesCols + "</tr>");

            $tr = $("<tr>");

            for (i in node.children) {
                $td = $('<td colspan="2">');
                $td.append(this.buildTable(node.children[i], opts));
                $tr.append($td);
            }

            $table.append($tr);
        }
        return $table;
    },

    setItemViews: function() {
        this.collection.each(function(model) {
            var itemView = new app.ItemView({
                model: model
            });

            itemView.setElement($('[node-id="' + model.get('id') + '"]'));
        });
    },
    renderItem: function(id) {
        var model = this.collection.get(id);
        if (!model) {
            return;
        }
        var itemView = new app.ItemView({
            model: model
        });


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
        if (!model) {
            return;
        }
        var detailsView = new app.DetailsView({
            model: model
        });

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
