var app = app || {};

app.Item = Backbone.Model.extend({
    defaults: {
        name: '',
        firstName: '',
        lastName: '',
        email: '',
        id: '',
        parent: '',
        phone: '',
        department: ''
    },
    initialize: function(){
        if(this.get('name').length == 0 && this.get('firstName').length > 0){
            this.set('name') = this.get('firstName') + ' ' + this.get('lastName');
        }


    }
});
