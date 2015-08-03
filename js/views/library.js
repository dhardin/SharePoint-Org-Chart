var app = app || {};

app.LibraryView = Backbone.View.extend({
    template: _.template($('#org-chart-template').html()),
    initialize: function(options) {
        this.collection = app.ItemCollection;
        this.collection.on('add reset remove', function() {
            this.render(this.collection);
        }, this);
        this.department = options.department;


        this.parent_cache = {};
        this.parent_id_cache = {};
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

    render: function(collection) {
        var modelAttributArr, that = this,
            parent;

        this.childViews = [];

        this.$el.html(this.template());
        this.$orgchart = this.$('#org-chart');
        this.$modal = this.$('.reveal-modal');
        this.$el.addClass('orgChart');
        collection = collection || this.collection;

        if (this.department) {
            collection = new app.Library(collection.filter(function(model) {
                return model.get('department').toLowerCase() == that.department.toLowerCase();
            }));
            parent = this.getRootParent(collection);
        } else {
            parent = this.getRootParent();
        }

        this.setParents();
        this.setParentChildren();

        this.$el.append(this.buildTable(parent, collection));

        Backbone.pubSub.on('showModal', this.showModal, this);
        Backbone.pubSub.on('add', this.addModel, this);
        Backbone.pubSub.on('delete', this.deleteModel, this);
        Backbone.pubSub.on('done', this.render, this);

        return this;
    },

    getRootParent: function(collection) {
        if (collection) {
            return collection.filter(function(model) {
                return (typeof (collection.findWhere({
                    id: model.get('parent')
                }) || collection.findWhere({
                    name: model.get('parent')
                })) == 'undefined' ? true : false);
            })[0];
        } else {
            return this.collection.findWhere({
                parent: ''
            }) || this.collection.findWhere({
                parent: 0
            });
        }
    },

    setParentChildren: function() {
        var that = this;
        this.collection.each(function(model) {
            model.set('children', that.collection.where({
                parent: model.get('id')
            }) || that.collection.where({
                parent: model.get('name')
            }));
        });
    },

    setParents: function(parent, parentArr) {
        var children, i, model;
        parentArr = parentArr || [];
        if (!parent) {
            parent = this.getRootParent();
            parent.set({
                parents: []
            });
        }

        parentArr.push(parent);
        children = this.collection.where({
            parent: parent.get('name')
        });
        for (i = 0; i < children.length; i++) {
            model = children[i];
            model.set({
                parents: parentArr.slice()
            });
            this.setParents(model, parentArr);
        }
    },

    buildTable: function(parent, collection) {
        var children = parent.get('children'),
            mainTable, nodeColSpan, downLineTable, linesCols, i, $tr, $td,
            $table = $('<table cellpadding="0" cellspacing="0" border="0">');

        //   mainTable = "<table cellpadding='0' cellspacing='0' border='0'>";
        nodeColspan = children.length > 0 ? 2 * children.length : 2;
        $tr = $('<tr>');
        $td = $("<td colspan='" + nodeColspan + "'>");
        $tr.append($td);
        $td.append(this.renderItem(parent.get('id')));
        $table.append($tr);

        if (children.length > 0 && collection.length > 1) {
            downLineTable = "<table cellpadding='0' cellspacing='0' border='0'><tr class='lines x'><td class='line left half'></td><td class='line right half'></td></table>";
            $table.append("<tr class='lines'><td colspan='" + children.length * 2 + "'>" + downLineTable + '</td></tr>');

            linesCols = '';
            for (i = 0; i < children.length; i++) {
                if (children.length == 1) {
                    linesCols += "<td class='line left half'></td>"; // keep vertical lines aligned if there's only 1 child
                } else if (i == 0) {
                    linesCols += "<td class='line left'></td>"; // the first cell doesn't have a line in the top
                } else {
                    linesCols += "<td class='line left top'></td>";
                }

                if (children.length == 1) {
                    linesCols += "<td class='line right half'></td>";
                } else if (i == children.length - 1) {
                    linesCols += "<td class='line right'></td>";
                } else {
                    linesCols += "<td class='line right top'></td>";
                }
            }
            $table.append("<tr class='lines v'>" + linesCols + "</tr>");

            $tr = $("<tr>");

            for (i in children) {
                var child = children[i];
                if (collection.indexOf(child) == -1) {
                    continue;
                }
                $td = $('<td colspan="2">');
                $td.append(this.buildTable(parent.get('children')[i], collection));
                $tr.append($td);
            }

            $table.append($tr);
        }
        return $table;
    },
    renderItem: function(id) {
        var model = this.collection.get(id);
        if (!model) {
            return;
        }
        var itemView = new app.ItemView({
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
