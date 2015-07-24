var app = app || {};

app.Item = Backbone.Model.extend({
    defaults: {
        name: '',
        email: '',
        id: '',
        parent: '',
        phone: '',
        department: ''
    }
});
