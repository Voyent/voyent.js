describe('bridgeit.js tests', function () {

	var accountId 		= 'demox_corporate';
	var realmId 		= 'nargles.net';
	var adminId 		= 'bobwilliams';
	var adminPassword 	= 'secretest';
	var userId 			= 'johnsmith';
	var userPassword 	= 'secretest';
	var host 			= 'localhost';

	describe('bridgeit.services.auth', function () {

		function validateAuthResponse(response){
			return response.access_token && response.expires_in;
		}

		describe('#login()', function(){
			
			it('should log in an admin', function (done) {

				bridgeit.services.auth.login({
					account: accountId,
					username: adminId,
					password: adminPassword,
					host: host
				}).then(function(response){
					console.log(JSON.stringify(response));
					if( validateAuthResponse(response) )
						done();
				}).catch(function(error){
					console.log('login failed ' + error);
				});

			});

			it('should fail to login in as admin', function (done) {

				bridgeit.services.auth.login({
					account: accountId,
					username: userId,
					password: userPassword,
					host: host
				}).then(function(response){
					console.log(JSON.stringify(response));
				}).catch(function(error){
					console.log('login failed ' + error);
					done();
				});

			});

			it('should log in a realm user', function (done) {

				bridgeit.services.auth.login({
					account: accountId,
					realm: realmId,
					username: userId,
					password: userPassword,
					host: host
				}).then(function(response){
					console.log(JSON.stringify(response));
					if( validateAuthResponse(response) )
						done();
				}).catch(function(error){
					console.log('login failed ' + error);
				});

			});

			it('should fail missing account', function (done) {

				bridgeit.services.auth.login({
					realm: realmId,
					username: userId,
					password: userPassword,
					host: host
				}).then(function(response){
					console.log(JSON.stringify(response));
				}).catch(function(error){
					console.log('login failed ' + error);
					done();
				});

			});

			it('should fail missing username', function (done) {

				bridgeit.services.auth.login({
					realm: realmId,
					account: accountId,
					password: userPassword,
					host: host
				}).then(function(response){
					console.log(JSON.stringify(response));
				}).catch(function(error){
					console.log('login failed ' + error);
					done();
				});

			});

			it('should fail missing password', function (done) {

				bridgeit.services.auth.login({
					realm: realmId,
					account: accountId,
					username: userId,
					host: host
				}).then(function(response){
					console.log(JSON.stringify(response));
				}).catch(function(error){
					console.log('login failed ' + error);
					done();
				});

			});

			it('should log in with SSL', function (done) {

				bridgeit.services.auth.login({
					account: accountId,
					realm: realmId,
					username: userId,
					password: userPassword,
					ssl: true,
					host: host
				}).then(function(response){
					console.log(JSON.stringify(response));
					if( validateAuthResponse(response) )
						done();
				}).catch(function(error){
					console.log('login failed ' + error);
				});

			});
		});

		describe('#connect()', function(){
			it('should connect as an admin', function (done) {
				bridgeit.services.auth.connect({
					account: accountId,
					username: adminId,
					password: adminPassword,
					host: host
				}).then(function(response){
					console.log(JSON.stringify(response));
					if( validateAuthResponse(response) ){
						var access_token = bridgeit.services.auth.getAccessToken();
						var expires_in = bridgeit.services.auth.getExpiresIn();
						console.log('access_token: ' + access_token);
						if( access_token == response.access_token && expires_in == response.expires_in ){
							done();
						}
						else{
							console.log('could not retrieve access_token('+ access_token + ')(' + response.access_token + ') and expires_in(' + expires_in + ')(' + response.expires_in + ')');
						}
					}
					else{
						console.log('connect could not validate auth response');
					}
				}).catch(function(error){
					console.log('login failed ' + error);
				});
			});
		});

		describe('#isLoggedIn()', function(){
			it('should log in as an admin then return true', function (done) {
				bridgeit.services.auth.login({
					account: accountId,
					username: adminId,
					password: adminPassword,
					host: host
				}).then(function(authResponse){
					if( bridgeit.services.auth.isLoggedIn()){
						done();
					}
					else{

					}
				}).catch(function(error){
					console.log('isLoggedIn failed ' + error);
				});
			});
		});

		describe('#disconnect()', function(){
			it('should log in as an admin then disconnect and return false from isLoggedIn()', function (done) {
				bridgeit.services.auth.connect({
					account: accountId,
					username: adminId,
					password: adminPassword,
					host: host
				}).then(function(response){
					bridgeit.services.auth.disconnect();
				}).then(function(response){
					if( !bridgeit.services.auth.isLoggedIn()){
						done();
					}
				}).catch(function(error){
					console.log('disconnect failed ' + error);
				});
			});
		});

		describe('#getAccessToken()', function(){
			it('should log in as an admin then return the access token', function (done) {
				bridgeit.services.auth.login({
					account: accountId,
					username: adminId,
					password: adminPassword,
					host: host
				}).then(function(authResponse){
					if( bridgeit.services.auth.getAccessToken() === authResponse.access_token){
						done();
					}
				}).catch(function(error){
					console.log('getAccessToken failed ' + error);
				});
			});
		});

		describe('#getTokenSetAtTime()', function(){
			it('should log in as an admin then return the time the token was set at', function (done) {
				var justBeforeLogin = new Date().getTime();
				bridgeit.services.auth.login({
					account: accountId,
					username: adminId,
					password: adminPassword,
					host: host
				}).then(function(authResponse){
					var tokenSetAt = bridgeit.services.auth.getTokenSetAtTime();
					if( tokenSetAt >= justBeforeLogin){
						done();
					}
					else{
						console.log('invalid getTokenSetAtTime(): ' + tokenSetAt + ' < ' + justBeforeLogin);
					}
				}).catch(function(error){
					console.log('getTokenSetAtTime failed ' + error);
				});
			});
		});

		describe('#getExpiresIn()', function(){
			it('should log in as an admin then return the expires in period', function (done) {
				bridgeit.services.auth.login({
					account: accountId,
					username: adminId,
					password: adminPassword,
					host: host
				}).then(function(authResponse){
					if( bridgeit.services.auth.getExpiresIn() === authResponse.expires_in){
						done();
					}
				}).catch(function(error){
					console.log('getExpiresIn failed ' + error);
				});
			});
		});

		describe('#getTimeRemainingBeforeExpiry()', function(){
			it('should log in as an admin then return a number less than expires_in', function (done) {
				bridgeit.services.auth.login({
					account: accountId,
					username: adminId,
					password: adminPassword,
					host: host
				}).then(function(authResponse){
					var timeRemaining = bridgeit.services.auth.getTimeRemainingBeforeExpiry();
					if( timeRemaining < authResponse.expires_in){
						done();
					}
					else{
						console.log('getTimeRemainingBeforeExpiry() failed: time remaining=' + timeRemaining + ' expires_in=' + authResponse.expires_in);
					}
				}).catch(function(error){
					console.log('getTimeRemainingBeforeExpiry failed ' + error);
				});
			});
		});

		describe('#getConnectSettings()', function(){
			it('should connect in as an admin then return a JSON object of the connect settings', function (done) {
				bridgeit.services.auth.connect({
					account: accountId,
					username: adminId,
					password: adminPassword,
					host: host
				}).then(function(response){
					if( bridgeit.services.auth.getConnectSettings() ){
						done();
					}
					else{
						try{
							console.log('getConnectSettings() failed: ' + JSON.stringify(response));
						}
						catch(e){
							console.log('getConnectSettings() failed: ' + response);
						}
					}
				}).catch(function(error){
					console.log('getConnectSettings failed ' + error);
				});
			});
		});

		describe('#getLastKnownAccount()', function(){
			it('should login as an admin then return the same account name', function (done) {
				bridgeit.services.auth.login({
					account: accountId,
					username: adminId,
					password: adminPassword,
					host: host
				}).then(function(authResponse){
					if( bridgeit.services.auth.getLastKnownAccount() === accountId){
						done();
					}
				}).catch(function(error){
					console.log('getLastKnownAccount failed ' + error);
				});
			});
		});

		describe('#getLastKnownRealm()', function(){
			it('should login as a realm user then return the same realm name', function (done) {
				bridgeit.services.auth.login({
					account: accountId,
					realm: realmId,
					username: userId,
					password: userPassword,
					host: host
				}).then(function(authResponse){
					if( bridgeit.services.auth.getLastKnownRealm() === realmId){
						done();
					}
				}).catch(function(error){
					console.log('getLastKnownRealm failed ' + error);
				});
			});
		});
		
	});

	describe('bridgeit.services.admin', function(){

		describe('#getServiceDefinitions()', function(done){

			it('should return the BridgeIt service definition JSON', function (done) {

				bridgeit.services.auth.login({
						account: accountId,
						username: adminId,
						password: adminPassword,
						host: host
					}).then(function(authResponse){
						return bridgeit.services.admin.getServiceDefinitions();
					}).then(function(json){
						console.log('service defintions: ' + json);
						done();
					}).catch(function(error){
						console.log('getServiceDefinitions failed ' + error);
					});
			});

		});

		describe('#getRealmUsers()', function(done){

			it('should return a list of realm users', function (done) {

				bridgeit.services.auth.login({
						account: accountId,
						username: adminId,
						password: adminPassword,
						host: host
					}).then(function(authResponse){
						return bridgeit.services.admin.getRealmUsers({
							realm: realmId
						});
					}).then(function(json){
						console.log('getRealmUsers: ' + JSON.stringify(json));
						done();
					}).catch(function(error){
						console.log('getRealmUsers failed ' + error);
					});
			});

		});
	});

	describe('bridgeit.services.documents', function () {

		describe('#createDocument()', function(){
			it('should create a new unnamed document', function (done) {

				var newDoc = {test: true};

				bridgeit.services.auth.login({
					account: accountId,
					username: adminId,
					password: adminPassword,
					host: host
				}).then(function(authResponse){
					return bridgeit.services.documents.createDocument({
						document: newDoc
					});
				}).then(function(docURI){
					console.log('new doc URI: ' + docURI);
					done();
				}).catch(function(error){
					console.log('createDocument failed ' + error);
				});

			});
		});

		describe('#deleteDocument()', function(){
			it('should create a new unnamed document and delete it', function (done) {

				var newDoc = {test: true};
				
				bridgeit.services.auth.login({
					account: accountId,
					username: adminId,
					password: adminPassword,
					host: host
				}).then(function(authResponse){
					return bridgeit.services.documents.createDocument({
						document: newDoc
					});
				}).then(function(docURI){
					newDocURI = docURI;
					var uriParts = docURI.split('/');
					var docId = uriParts[uriParts.length-1];
					return bridgeit.services.documents.deleteDocument({
						account: accountId,
						realm: realmId,
						host: host,
						id: docId
					})
				}).then(function(){
					console.log('deleted doc');
					done();
				}).catch(function(error){
					console.log('deleteDocument failed ' + error);
				});

			});
		});

		describe('#updateDocument()', function(){
			it('should create a new unnamed document and update it', function (done) {

				var newDoc = {test: true};
				
				bridgeit.services.auth.login({
					account: accountId,
					username: adminId,
					password: adminPassword,
					host: host
				}).then(function(authResponse){
					return bridgeit.services.documents.createDocument({
						document: newDoc
					});
				}).then(function(docURI){
					newDocURI = docURI;
					var uriParts = docURI.split('/');
					var docId = uriParts[uriParts.length-1];
					newDoc.test = false;
					return bridgeit.services.documents.updateDocument({
						id: docId,
						document: newDoc
					})
				}).then(function(){
					console.log('updated doc');
					done();
				}).catch(function(error){
					console.log('delete failed ' + error);
				});

			});
		});

		describe('#getDocument()', function(){
			it('should create a new unnamed document and re-fetch it', function (done) {

				var newDoc = {test: true};
				
				bridgeit.services.auth.login({
					account: accountId,
					username: adminId,
					password: adminPassword,
					host: host
				}).then(function(authResponse){
					return bridgeit.services.documents.createDocument({
						document: newDoc
					});
				}).then(function(docURI){
					newDocURI = docURI;
					var uriParts = docURI.split('/');
					var docId = uriParts[uriParts.length-1];
					return bridgeit.services.documents.getDocument({
						id: docId
					})
				}).then(function(doc){
					if( doc.test )
						done();
					else{
						console.log('did not receive expected doc: ' + JSON.stringify(doc));
					}
				}).catch(function(error){
					console.log('getDocument failed ' + error);
				});

			});
		});

		describe('#findDocuments()', function(){
			it('should create a new unnamed document and re-search for it', function (done) {

				var key = new Date().getTime();
				var newDoc = {key: key, value: true};
				
				bridgeit.services.auth.login({
					account: accountId,
					username: adminId,
					password: adminPassword,
					host: host
				}).then(function(authResponse){
					return bridgeit.services.documents.createDocument({
						document: newDoc
					});
				}).then(function(docURI){
					newDocURI = docURI;
					var uriParts = docURI.split('/');
					var docId = uriParts[uriParts.length-1];
					return bridgeit.services.documents.findDocuments({
						query: {key: key}
					})
				}).then(function(results){
					if( results && results.length === 1 && results[0].value )
						done();
					else{
						console.log('did not receive expected doc: ' + JSON.stringify(doc));
					}
				}).catch(function(error){
					console.log('findDocuments failed ' + error);
				});

			});
		});
	});

	describe('bridgeit.services.location', function(){

		var newRegion = { 
					location: {
						properties: {
							country: 'Canada'
						}
					}
				};
		
		var validMonitorWithoutId = {
			label: 'Various Cities Monitor',
			active: true,
			elapsedTimeLimit: 5,
			locationChangeLimit: 100,
			locationNearLimit: 1000,
			regions: {
				ids: ['Victoria', 'Calgary', 'Paris']
			},
			poi: {
				ids: ['statueofliberty'],
				tags: ['monument']
			},
			events: ['bridgeit.locate.locationChanged', 'bridgeit.locate.enteredRegion', 'bridgeit.locate.exitedRegion'],
			destinations: [
				{
					url: 'http://dev.bridgeit.io/code/bridgeit.test/flows/customflowid',
					payload: {}
				},
				{
					url: 'push://bridgeit/studentPushGroup',
					payload: {}
				},
				{
					url: 'ws://joe:seakret@bridgeit/dummyEntry',
					payload: {}
				}
			]
		};

		var validPointOfInterestWithId = {
		    _id: 'statueofliberty',
		    label: 'Statue of Liberty',
		    location: {
		        type: 'Feature',
		        geometry: {
		            type: 'Point',
		            coordinates: [
		                -74.0445004,
		                40.6892494
		            ]
		        },
		        properties: {
		            tags: ['statue', 'USA', 'tourist', 'monument']
		        }
		    }
		};

		describe('#createRegion()', function(){
			it('should create a new unnamed region and search for it', function (done) {
				
				bridgeit.services.auth.login({
					account: accountId,
					username: adminId,
					password: adminPassword,
					host: host
				}).then(function(authResponse){
					return bridgeit.services.location.createRegion({
						account: accountId,
						realm: realmId,
						host: host,
						region: newRegion
					});
				}).then(function(uri){
					console.log('new region URI: ' + uri);
					done();
				}).catch(function(error){
					console.log('createRegion failed ' + error);
				});
			});
		});

		describe('#deleteRegion()', function(){
			it('should create a new unnamed region and then delete it', function (done) {
				bridgeit.services.auth.login({
					account: accountId,
					username: adminId,
					password: adminPassword,
					host: host
				}).then(function(authResponse){
					return bridgeit.services.location.createRegion({
						account: accountId,
						realm: realmId,
						host: host,
						region: newRegion
					});
				}).then(function(uri){
					console.log('new region URI: ' + uri);
					var uriParts = uri.split('/');
					var regionId = uriParts[uriParts.length-1];
					return bridgeit.services.location.deleteRegion({
						account: accountId,
						realm: realmId,
						host: host,
						id: regionId
					})
				}).then(function(){
					console.log('successfully deleted region');
					done();
				}).catch(function(error){
					console.log('deleteRegion failed ' + error);
				});
			});
		});

		describe('#getAllRegions()', function(){
			it('should create a new unnamed region and then re-fetch it with getAllRegions()', function (done) {
				bridgeit.services.auth.login({
					account: accountId,
					username: adminId,
					password: adminPassword,
					host: host
				}).then(function(authResponse){
					return bridgeit.services.location.createRegion({
						account: accountId,
						realm: realmId,
						host: host,
						region: newRegion
					});
				}).then(function(uri){
					console.log('new region URI: ' + uri);
					var uriParts = uri.split('/');
					var regionId = uriParts[uriParts.length-1];
					return bridgeit.services.location.getAllRegions({
						account: accountId,
						realm: realmId,
						host: host
					})
				}).then(function(results){
					console.log('found ' + results.length + ' regions');
					done();
				}).catch(function(error){
					console.log('getAllRegions failed ' + error);
				});
			});
		});

		describe('#findRegions()', function(){
			it('should create a new unnamed region and then search for it with findRegions()', function (done) {
				
				bridgeit.services.auth.login({
					account: accountId,
					username: adminId,
					password: adminPassword,
					host: host
				}).then(function(authResponse){
					return bridgeit.services.location.createRegion({
						account: accountId,
						realm: realmId,
						host: host,
						region: newRegion
					});
				}).then(function(uri){
					console.log('new region URI: ' + uri);
					var uriParts = uri.split('/');
					var regionId = uriParts[uriParts.length-1];
					return bridgeit.services.location.findRegions({
						account: accountId,
						realm: realmId,
						host: host,
						query: newRegion
					})
				}).then(function(results){
					console.log('found ' + results.length + ' regions');
					done();
				}).catch(function(error){
					console.log('findRegions failed ' + error);
				});
			});
		});

		describe('#createMonitor()', function(){
			it('should create a new unnamed monitor and then fetch it with findMonitors()', function (done) {
				
				bridgeit.services.auth.login({
					account: accountId,
					username: adminId,
					password: adminPassword,
					host: host
				}).then(function(authResponse){
					return bridgeit.services.location.createMonitor({
						account: accountId,
						realm: realmId,
						host: host,
						monitor: validMonitorWithoutId
					});
				}).then(function(uri){
					console.log('new monitor URI: ' + uri);
					var uriParts = uri.split('/');
					var regionId = uriParts[uriParts.length-1];
					return bridgeit.services.location.findMonitors({
						account: accountId,
						realm: realmId,
						host: host,
						query: validMonitorWithoutId
					})
				}).then(function(results){
					console.log('found ' + results.length + ' monitors');
					done();
				}).catch(function(error){
					console.log('createMonitor failed ' + error);
				});
			});
		});

		describe('#getAllMonitors()', function(){
			it('should create a new unnamed monitor and then fetch it with getAllMonitors()', function (done) {
				bridgeit.services.auth.login({
					account: accountId,
					username: adminId,
					password: adminPassword,
					host: host
				}).then(function(authResponse){
					return bridgeit.services.location.createMonitor({
						account: accountId,
						realm: realmId,
						host: host,
						monitor: validMonitorWithoutId
					});
				}).then(function(uri){
					console.log('new monitor URI: ' + uri);
					var uriParts = uri.split('/');
					var regionId = uriParts[uriParts.length-1];
					return bridgeit.services.location.getAllMonitors({
						account: accountId,
						realm: realmId,
						host: host
					})
				}).then(function(results){
					console.log('found ' + results.length + ' monitors');
					done();
				}).catch(function(error){
					console.log('getAllMonitors failed ' + error);
				});
			});
		});

		describe('#deleteMonitor()', function(){
			it('should create a new unnamed monitor and then delete it', function (done) {
				bridgeit.services.auth.login({
					account: accountId,
					username: adminId,
					password: adminPassword,
					host: host
				}).then(function(authResponse){
					return bridgeit.services.location.createMonitor({
						account: accountId,
						realm: realmId,
						host: host,
						monitor: validMonitorWithoutId
					});
				}).then(function(uri){
					console.log('new monitor URI: ' + uri);
					var uriParts = uri.split('/');
					var monitorId = uriParts[uriParts.length-1];
					return bridgeit.services.location.deleteMonitor({
						account: accountId,
						realm: realmId,
						host: host,
						id: monitorId
					})
				}).then(function(){
					console.log('successfully deleted monitor');
					done();
				}).catch(function(error){
					console.log('deleteMonitor failed ' + error);
				});
			});
		});

		describe('#createPOI()', function(){
			it('should create a new unnamed POI and then fetch it with findPOIs()', function (done) {
				
				bridgeit.services.auth.login({
					account: accountId,
					username: adminId,
					password: adminPassword,
					host: host
				}).then(function(authResponse){
					return bridgeit.services.location.createPOI({
						account: accountId,
						realm: realmId,
						host: host,
						poi: validPointOfInterestWithId
					});
				}).then(function(uri){
					console.log('new POI URI: ' + uri);
					var uriParts = uri.split('/');
					var regionId = uriParts[uriParts.length-1];
					return bridgeit.services.location.findPOIs({
						account: accountId,
						realm: realmId,
						host: host,
						query: validPointOfInterestWithId
					})
				}).then(function(results){
					console.log('found ' + results.length + ' POIs');
					done();
				}).catch(function(error){
					console.log('createPOI failed ' + error);
				});
			});
		});

		describe('#deletePOI()', function(){
			it('should create a new unnamed POI and then delete it', function (done) {
				bridgeit.services.auth.login({
					account: accountId,
					username: adminId,
					password: adminPassword,
					host: host
				}).then(function(authResponse){
					return bridgeit.services.location.createPOI({
						account: accountId,
						realm: realmId,
						host: host,
						poi: validPointOfInterestWithId
					});
				}).then(function(uri){
					console.log('new POI URI: ' + uri);
					var uriParts = uri.split('/');
					var poiId = uriParts[uriParts.length-1];
					return bridgeit.services.location.deletePOI({
						account: accountId,
						realm: realmId,
						host: host,
						id: poiId
					})
				}).then(function(){
					console.log('successfully deleted POI');
					done();
				}).catch(function(error){
					console.log('deletePOI failed ' + error);
				});
			});
		});

		describe('#getAllPOIs()', function(){

			it('should create a new unnamed POI and then fetch it with getAllPOIs()', function (done) {
				bridgeit.services.auth.login({
					account: accountId,
					username: adminId,
					password: adminPassword,
					host: host
				}).then(function(authResponse){
					return bridgeit.services.location.createPOI({
						account: accountId,
						realm: realmId,
						host: host,
						poi: validPointOfInterestWithId
					});
				}).then(function(uri){
					console.log('new monitor URI: ' + uri);
					var uriParts = uri.split('/');
					var regionId = uriParts[uriParts.length-1];
					return bridgeit.services.location.getAllPOIs({
						account: accountId,
						realm: realmId,
						host: host
					})
				}).then(function(results){
					console.log('found ' + results.length + ' POIs');
					done();
				}).catch(function(error){
					console.log('getAllPOIs failed ' + error);
				});
			});
		});


	});

	describe('bridgeit.services.metrics', function () {

		describe('#findMetrics()', function(){

			it('should return a list of metrics for the realm', function (done) {
				bridgeit.services.auth.login({
					account: accountId,
					username: adminId,
					password: adminPassword,
					host: host
				}).then(function(){
					return bridgeit.services.metrics.findMetrics({
						account: accountId,
						realm: realmId,
						host: host
					})
				}).then(function(results){
					console.log('found ' + results.length + ' metrics');
					done();
				}).catch(function(error){
					console.log('findMetrics failed ' + error);
				});
			});
		});
	});

	describe('bridgeit.services.storage', function () {

		describe('#getMetaInfo()', function(){

			it('should return the meta info for the blobs in the realm', function (done) {
				bridgeit.services.auth.login({
					account: accountId,
					username: adminId,
					password: adminPassword,
					host: host
				}).then(function(){
					return bridgeit.services.storage.getMetaInfo({
						account: accountId,
						realm: realmId,
						host: host
					})
				}).then(function(results){
					console.log('found ' + results.length + ' meta info documents');
					done();
				}).catch(function(error){
					console.log('getMetaInfo failed ' + error);
				});
			});
		});

		describe('#createBlob()', function(){

			it('should create and store a new blob', function (done) {

				var base64CatImage = "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";
				var byteString = atob(base64CatImage);
				var mimeType = "image/jpeg";

				var ia = new Uint8Array(byteString.length);
				for(var i = 0; i < byteString.length ; i++ ){
					ia[i] = byteString.charCodeAt(i);
				}
				//phantomJS may not support Blobs
				var blob = new Blob([ia], {type:mimeType});

				bridgeit.services.auth.login({
					account: accountId,
					username: adminId,
					password: adminPassword,
					host: host
				}).then(function(){
					return bridgeit.services.storage.uploadBlob({
						account: accountId,
						realm: realmId,
						host: host,
						blob: blob
					})
				}).then(function(uri){
					console.log('new blob URI: ' + uri);
					done();
				}).catch(function(error){
					console.log('createBlob failed ' + error);
				});

			});
		});
	});

});