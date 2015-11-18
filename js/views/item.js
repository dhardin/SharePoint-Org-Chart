var app = app || {};

app.ItemView = Backbone.View.extend({
            template: _.template($('#item-template').html()),

            events: {
                'change': 'render',
                'click .node': 'select',
                'click .add': 'add',
                'click .delete': 'delete',
                'click .move': 'move',
                'click .swap': 'swap',
                'click .edit': 'edit',
                'click a': 'route',
                'contextmenu': 'contextmenu'
            },

            initialize: function(options) {
                this.model.on('change', this.render, this);
                Backbone.pubSub.on('context', this.showContext, this);
                Backbone.pubSub.on('select', this.onSelect, this);
                Backbone.pubSub.on('move', this.listen, this);
                Backbone.pubSub.on('done', this.doneMoving, this);
                Backbone.pubSub.on('setParent', this.setParent, this);
                this.delete = false;
                this.action = false;
            },

            route: function(e) {
                if (this.listening) {
                    e.preventDefault();
                }
            },

            contextmenu: function(e) {
                var posX,
                    posY;

                if (!app.config.editing) {
                    return;
                }
                posX = this.$el.offset().left;
                posY = this.$el.offset().top;
                e.preventDefault();
                this.$context.show().css({
                    left: e.offsetX,
                    top: e.offsetY
                });
                Backbone.pubSub.trigger('context', this);
                app.state_map.itemViewContext = this;
            },

            onSelect: function(model) {
                switch (this.action) {
                    case 'move':
                        this.selectParent(model);
                        break;
                    case 'swap':
                        this.swapModels(model);
                        break;
                    default:
                        break;
                }
                this.action = false;
            },

            swapModels: function(model) {
                var tempParent = this.model.get('parent'),
                    tempChildren = $.extend(true, [], this.model.get('children')),
                    saveArr = [];

                //swap model parent and chilren attributes
                this.model.set('parent', model.get('parent'));
                this.model.set('children', $.extend(true, [], model.get('children')));


                        model.set('parent', tempParent != model.get('name') ? tempParent : this.model.get('name')); model.set('children', tempChildren);

                        //update model chilren's parent
                        this.model.updateChildrensParent(); model.updateChildrensParent(); this.model.get('children').forEach(function(model) {
                            saveArr.push(model.toJSON());
                        }); model.get('children').forEach(function(model) {
                            saveArr.push(model.toJSON());
                        }); saveArr.push(this.model.toJSON(), model.toJSON());

                        this.model.save('update', saveArr); Backbone.pubSub.trigger('done');
                    },

                    selectParent: function(model) {
                        if (!this.dragging) {
                            return;
                        }

                        if (this.model.get('parent') != '') {
                            this.model.set('parent', model.get(app.config.parent_id_field));
                            this.model.save('update');
                        }
                        Backbone.pubSub.trigger('done');

                    },
                    setParent: function(parent, newParent) {
                        if (this.model.get('parent') == parent) {
                            this.model.set('parent', newParent);
                        }
                    },
                    select: function(e) {
                        if (this.pendingDelete ||
                            (e && $(e.target).parent('.context').length > 0 || e.target.nodeName == 'A')) {
                            return;
                        }

                        if (!this.listening && !this.dragging) {
                            this.closeContext();
                            Backbone.pubSub.trigger('showModal', this.model);
                        } else if (this.dragging) {
                            Backbone.pubSub.trigger('done');
                        } else {
                            Backbone.pubSub.trigger('select', this.model);
                        }
                    },

                    closeContext: function(e) {
                        this.$context.hide();
                    },
                    edit: function(e) {
                        this.select();
                        this.closeContext();
                    },

                    add: function(e) {
                        Backbone.pubSub.trigger('add', this.model);
                        this.closeContext();
                    },

                    swap: function(e) {
                        this.closeContext();
                        this.setDraggable();
                        this.action = 'swap';
                        Backbone.pubSub.trigger('move', this.model);
                    },



                    delete: function(e) {
                        if (e.target.className.indexOf('disabled') > -1) {
                            return;
                        }
                        this.pendingDelete = true;
                        Backbone.pubSub.trigger('delete', this.model);
                        this.closeContext();
                    },

                    listen: function(model) {
                        if (model != this.model) {
                            this.listening = true;
                            this.$node.addClass('listen');
                        } else {
                            this.$node.addClass('moving');
                        }
                    },

                    onClose: function() {
                        this.model.off('change');
                        Backbone.pubSub.on('context');
                        Backbone.pubSub.off('select');
                        Backbone.pubSub.off('move');
                        Backbone.pubSub.off('swap');
                        Backbone.pubSub.off('done');
                        Backbone.pubSub.off('setParent');
                    },

                    childOf: function(model) {
                        var parents = this.model.get('parents');
                        return parents.indexOf(model) > -1;
                    },

                    move: function(e) {
                        this.closeContext();
                        this.setDraggable();
                        this.action = 'move';
                        Backbone.pubSub.trigger('move', this.model);
                    },

                    doneMoving: function() {
                        this.$node.removeClass('moving listen child');
                        this.listening = false;
                        this.dragging = false;
                        if (this.$draggable) {
                            this.$draggable.remove();
                            this.$draggable = false;
                        }
                        $('body').off('mousemove').css({
                            'cursor': 'auto'
                        });
                        $(document).off('keyup');
                    },

                    setDraggable: function() {
                        var that = this;
                        this.$draggable = $('<div class="draggable">' + this.$el.html() + '</div>');
                        $('body').append(this.$draggable);
                        this.dragging = true;
                        $('body').on('mousemove', function(e) {
                            that.$draggable.css({
                                left: e.pageX + 2,
                                top: e.pageY + 2
                            });
                        }).css({
                            'cursor': '-webkit-grabbing'
                        });
                        $(document).on('keyup', function(e) {
                            if (e.which == 27) {
                                Backbone.pubSub.trigger('done');
                            }
                        });
                    },

                    render: function() {
                        this.$el.html(this.template(this.model.toJSON()));
                        this.$context = this.$('.context');
                        this.$node = this.$('.node');
                        this.$draggable = this.$draggable || false;
                        this.dragging = false;

                        return this;
                    }
            });
