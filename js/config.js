var app = app || {};


app.config = {
    url: 'https://members.lcmp.csd.disa.mil/sites/jltv/portal',
    guid: '882F70A5-8498-489D-B927-E973D8A67DB7',
	parent_id_field: 'name',
	tryCount: 3,
	testing: false,
	editing: false,
	showTitle: true,
	property_map: {
			ows_title: 'lastName',
			ows_firstname: 'firstName',
	    	ows_unit: 'department',
	    	ows_supervisor: 'parent',
	    	ows_workphone: 'phone',
	    	ows_email: 'email',
	    	ows_jobtitle: 'title',
	    	ows_id: 'id'
	},
	static_names: {
		lastName: 'Title',
		firstName: 'FirstName',
		department: 'Unit',
		parent: 'Supervisor',
		phone: 'WorkPhone',
		email: 'Email',
		title: 'JobTitle',
		id: 'ID'
	}
};
