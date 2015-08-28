var app = app || {};

app.NavItem = Backbone.Model.extend({
    defaults: {
      name: ''
    },
    events: {
        'click': 'route'
    },
    initialize: function(){
    },
    route: {
        Backbone.pubSub.trigger('filter')
    }
});
