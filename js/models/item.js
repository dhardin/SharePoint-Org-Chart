var app = app || {};

app.Item = Backbone.Model.extend({
    defaults: {
        name: 'N/A',
        firstName: 'N/A',
        lastName: 'N/A',
        email: 'N/A',
        id: 'N/A',
        title: 'N/A',
        parent: '',
        phone: 'N/A',
        department: 'N/A',
        children: []
    },
    initialize: function(){
        if(this.get('name').length == 0 && this.get('firstName').length > 0){
            this.set('name') = this.get('firstName') + ' ' + this.get('lastName');
        }


    }
});
