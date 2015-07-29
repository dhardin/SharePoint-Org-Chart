var app = app || {};


app.config = {
	url: 'url to your SharePoint site goes here...',
	guid: 'guid to your SharePoint list',
	tryCount: 3,
	testing: true,
	editing: false,
	property_map: {
		item: {
			ows_name: 'name',
	    	ows_department: 'department',
	    	ows_supervisor: 'parent',
	    	ows_phone: 'phone',
	    	ows_email: 'email',
	    	ows_position: 'subtitle'
    	}
	},
	settings_map:{
		default_department: 'some department'
	}
};