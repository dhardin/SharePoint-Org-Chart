var app = app || {};

app.User = Backbone.Model.extend({
    defaults: {
        name: '',
        email: '',
        id: '',
        parent: '',
        phone: '',
        department: ''
    }
});
