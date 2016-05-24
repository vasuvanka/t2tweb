
var ip = "54.179.169.163",port=8085;
var baseUrl = ip+":"+port;
var url = "http://"+baseUrl+"/api/v1/user";

function User(){}

function xhrRequest(url ,headers ,method , data, callback){
	var xhr = window.XMLHttpRequest ? new XMLHttpRequest(): new ActiveXObject("Microsoft.xhr");
    if(xhr){
    	xhr.open(method, url, true);
    	for (var obj in headers) {
    		xhr.setRequestHeader(obj,headers[obj]);
    	}
		xhr.onreadystatechange = function() {
			if (xhr.readyState === 4 && xhr.status === 200){
				var response = JSON.parse(xhr.response);
				callback(response);
			}
		}
		xhr.send(JSON.stringify(data));
    }
}

function validateEmail(email) 
{
    var re = /\S+@\S+\.\S+/;
    return re.test(email);
}
User.prototype.login = function (username,password,callback){
	if( username == undefined || password == undefined){
		return {"status":"error",error:["Please Enter Valid Credentials"],data:[]};
	}else{
		var obj = {
			"password":password
		};
		if (validateEmail(username)) {
			obj['email'] = username;
			obj['use'] = 'email';
		}else{
			obj['phone'] = username;
			obj['use'] = 'phone';
		}
		var header = {"Content-Type":"application/json"};
		xhrRequest( url+'/login',header ,'POST', obj ,function(res){
			if (res.status == 'success') {
				id = res.data._id;
				token = res.data.token;
			}
			callback(res);
		});
	}
}

User.prototype.status = function (callback){
	var header = {"Content-Type":"application/json"};
	xhrRequest( url+'/status',header ,'GET', {} ,function(res){
		callback(res);
	});
}

User.prototype.slots = function (callback){
	var header = {"Content-Type":"application/json"};
	xhrRequest( url+'/slots',header ,'GET', {} ,function(res){
		callback(res);
	});
}
User.prototype.allSlots = function (callback){
	var header = {"Content-Type":"application/json"};
	xhrRequest( url+'/slots/all',header ,'GET', {} ,function(res){
		callback(res);
	});
}


User.prototype.logout = function (id,token,callback){
	var header = {"token":token,'app_user_id':id};
	header['Content-Type'] = "application/json";
	xhrRequest( url+'/logout',header ,'GET', {} ,function(res){
		callback(res);
	});
}

User.prototype.getCities = function (callback){
	var header = {};
	header['Content-Type'] = "application/json";
	xhrRequest( url+'/city',header ,'GET', {} ,function(res){
		callback(res);
	});
}

User.prototype.getLocations = function (city,callback){
	if(city == null || city == undefined){
		return {"status":"error",error:["invalid selection"],data:[]};
	}else{
		var header = {"Content-Type":"application/json"};
		xhrRequest( url+'/location?city='+city,header ,'GET', {} ,function(res){
			callback(res);
		});
	}
}

User.prototype.getCategories = function (area_id,callback){
	if(area_id == null || area_id == undefined){
		return {"status":"error",error:["pic the location"],data:[]};
	}else{
		var header = {"Content-Type":"application/json"};
		xhrRequest( url+'/categories/'+area_id,header ,'GET', {} ,function(res){
			callback(res);
		});
	}
}

User.prototype.getMenu = function (area_id,category,callback){
	if(area_id == null || area_id == undefined || category == undefined || category == null){
		return {"status":"error",error:["pic the category"],data:[]};
	}else{
		var header = {"Content-Type":"application/json"};
		xhrRequest( url+'/menu/'+area_id+'/'+category,header ,'GET', {} ,function(res){
			callback(res);
		});
	}
}

User.prototype.register = function (data,callback){
	if(data.firstname == undefined|| data.lastname == undefined || data.phone == undefined || data.password == undefined || data.email == undefined){
		return {"status":"error",error:["provide valid data"],data:[]};
	}else{
		var header = {"Content-Type":"application/json"};
		xhrRequest( url+'/register',header ,'POST', data ,function(res){
			callback(res);
		});
	}
}
User.prototype.forgetPassword = function(email,callback){
	if (validateEmail(email)) {
		var header = {"Content-Type":"application/json"};
		xhrRequest( url+'/forgetPassword',header ,'POST', {"email":email} ,function(res){
			callback(res);
		});
	}else{
		return {'status':'error','error':["invalid email"],data:[]};
	}
}

User.prototype.getProfile = function(id,token,callback){
	var header = {"token":token,'app_user_id':id,"Content-Type":"application/json"};
	xhrRequest( url+'/',header ,'GET', {}, function(res){
		callback(res);
	});
}

User.prototype.passwordChange = function(id,token,password,callback){
	var header = {"token":token,'app_user_id':id,"Content-Type":"application/json"};
	xhrRequest( url+'/passwordChange',header ,'POST', {"password":password}, function(res){
		callback(res);
	});
}



User.prototype.updateProfile = function(id,token,data,callback){
	var header = {"token":token,'app_user_id':id,"Content-Type":"application/json"};
	var obj = {};
	if (data.firstname) {
		obj['firstname'] = data.firstname;
	}
	if (data.lastname) {
		obj['lastname'] = data.lastname;
	}
	if (data.address) {
		obj['address'] = JSON.stringify(data.address);
	}
	xhrRequest( url+'/profile',header ,'PUT', obj, function(res){
		callback(res);
	});
}

User.prototype.getOrders = function(id,token,callback){
	var header = {"token":token,'app_user_id':id,"Content-Type":"application/json"};
	xhrRequest( url+'/orders',header ,'GET', {}, function(res){
		callback(res);
	});
}

User.prototype.postOrder = function(id,token,data,callback){
	var header = {"token":token,'app_user_id':id,"Content-Type":"application/json"};
	xhrRequest( url+'/orders',header ,'POST', data, function(res){
		callback(res);
	});
}

User.prototype.verifyCoupon = function(id,token,coupon,callback){
	if (coupon != undefined && coupon != null) {
		var header = {"token":token,'app_user_id':id,"Content-Type":"application/json"};
		xhrRequest( url+'/verifyCoupon',header ,'POST', {'coupon':coupon}, function(res){
			callback(res);
		});
	}else{
		return {'status':'error','error':["invalid coupon"],data:[]};
	}
}


User.prototype.updateOrder = function(id,token,order_id,data,callback){
	/*{
		"txn_id":req.body.txn_id,
		"txn_type":req.body.txn_type,
		"status":req.body.status
	}*/
	if (order_id != undefined && order_id != null) {
		var header = {"token":token,'app_user_id':id,"Content-Type":"application/json"};
		xhrRequest( url+'/order/'+order_id,header ,'PUT', data, function(res){
			callback(res);
		});
	}else{
		return {'status':'error','error':["invalid order"],'data':[]};
	}
}

User.prototype.deleteAccount = function(id,token,callback){
	var header = {"token":token,'app_user_id':id,"Content-Type":"application/json"};
	xhrRequest( url+'/delete',header ,'PUT', data, function(res){
		callback(res);
	});
}
