function AuthService(v, utils) {
    function validateRequiredPassword(params, reject){
        utils.validateParameter('password', 'The password parameter is required', params, reject);
    }
    function validateRequiredPermissions(params, reject){
        utils.validateParameter('permissions', 'The permissions parameter is required', params, reject);
    }
    function fireEvent(el, eventName, detail){
        var event;
        if( 'CustomEvent' in window ){
            event = new CustomEvent(eventName, { 'detail': detail });
        }
        else if(document.createEvent){//IE 10 & other older browsers
            event = document.createEvent('HTMLEvents');
            event.initEvent(eventName, true, true);
        }
        else if(document.createEventObject){// IE < 9
            event = document.createEventObject();
            event.eventType = eventName;
        }
        event.eventName = eventName;
        if(el.dispatchEvent){
            el.dispatchEvent(event);
        }else if(el.fireEvent && htmlEvents['on'+eventName]){// IE < 9
            el.fireEvent('on'+event.eventType, event);// can trigger only real event (e.g. 'click')
        }else if(el[eventName]){
            el[eventName]();
        }else if(el['on'+eventName]){
            el['on'+eventName]();
        }
    }
    var REALM_KEY = 'bridgeitRealm';
    var ACCOUNT_KEY = 'bridgeitAccount';
    var USERNAME_KEY = 'bridgeitUsername';
    var PASSWORD_KEY = 'bridgeitPassword';
    var USER_STORE_KEY = "bridgeitUserStore";
    var USER_STORE_SETTING_KEY = "bridgeitUserStoreSetting";
    var CONNECT_SETTINGS_KEY = 'bridgeitConnectSettings';
    var RELOGIN_CB_KEY = 'bridgeitReloginCallback';
    var LAST_ACTIVE_TS_KEY = 'bridgeitLastActiveTimestamp';
    var TOKEN_KEY = 'bridgeitToken';
    var TOKEN_EXPIRES_KEY = 'bridgeitTokenExpires';
    var TOKEN_SET_KEY = 'bridgeitTokenSet';
    var LAST_UPDATED = "last_updated";
    return {
        /**
         * Retrieve a new access token from the BridgeIt auth service.
         *
         * The function returns a Promise that, when successful, returns an object with the following structure:
         *    {
		 *       "access_token": "d9f7463d-d100-42b6-aecd-ae21e38e5d02",
		 *       "expires_in": 1420574793844
		 *    }
         *
         * Which contains the access token and the time, in milliseconds that the session will expire in.
         *
         * Unlike the login, and connect functions, this function does not store the access token after it
         * is retrieved.
         *
         * @alias getNewAccessToken
         * @param {Object} params params
         * @param {String} params.account BridgeIt Services account name (required)
         * @param {String} params.realm BridgeIt Services realm (required only for non-admin logins)
         * @param {String} params.username User name (required)
         * @param {String} params.password User password (required)
         * @param {String} params.host The BridgeIt Services host url. If not supplied, the last used BridgeIT host, or the default will be used. (optional)
         * @param {Boolean} params.ssl (default false) Whether to use SSL for network traffic.
         * @returns Promise with the following argument:
         *      {
		 *          access_token: 'xxx',
		 *          expires_in: 99999
		 *      }
         *
         */
        getNewAccessToken: function(params){
            return new Promise(
                function(resolve, reject) {
                    params = params ? params : {};
                    v.checkHost(params);
                    if( !params.realm ){
                        params.realm = 'admin';
                    }
                    //validation
                    if( !params.account ){
                        reject(Error('BridgeIt account required for new access token'));
                        return;
                    }
                    if( !params.password ){
                        reject(Error('password required for new access token'));
                        return;
                    }
                    if( !params.username ){
                        reject(Error('username required for new access token'));
                        return;
                    }
                    var protocol = params.ssl ? 'https://' : 'http://';
                    var url = protocol + v.authURL + '/' + encodeURI(params.account) +
                        '/realms/' + encodeURI(params.realm) + '/token/?' + utils.getTransactionURLParam();
                    v.$.post(url, {
                        strategy: 'query',
                        username: params.username,
                        password: params.password
                    }).then(function(authResponse){
                        resolve(authResponse);
                    })['catch'](function(error){
                        reject(error);
                    });
                }
            );
        },
        /**
         * Login into bridgeit services.
         *
         * This function will login into the BridgeIt auth service and return a user token and expiry timestamp upon
         * successful authentication. This function does not need to be called if bridgeit.connect has already been
         * called, as that function will automatically extend the user session, unless the timeout has passed.
         *
         * The function returns a Promise that, when successful, returns an object with the following structure:
         *    {
		 *       "access_token": "d9f7463d-d100-42b6-aecd-ae21e38e5d02",
		 *       "expires_in": 1420574793844
		 *    }
         *
         * Which contains the access token and the time, in milliseconds that the session will expire in.
         *
         * @alias login
         * @param {Object} params params
         * @param {String} params.account BridgeIt Services account name (required)
         * @param {String} params.realm BridgeIt Services realm (required only for non-admin logins)
         * @param {String} params.username User name (required)
         * @param {String} params.password User password (required)
         * @param {String} params.host The BridgeIt Services host url. If not supplied, the last used BridgeIT host, or the default will be used. (optional)
         * @param {Boolean} params.ssl (default false) Whether to use SSL for network traffic.
         * @returns Promise with the following argument:
         *      {
		 *          access_token: 'xxx',
		 *          expires_in: 99999
		 *      }
         *
         */
        login: function(params) {
            return new Promise(
                function(resolve, reject) {
                    params = params ? params : {};
                    v.checkHost(params);
                    if( !params.realm ){
                        params.realm = 'admin';
                    }
                    //validation
                    if( !params.account ){
                        reject(Error('BridgeIt account required for login'));
                        return;
                    }
                    if( !params.password ){
                        reject(Error('password required for login'));
                        return;
                    }
                    if( !params.username ){
                        reject(Error('username required for login'));
                        return;
                    }
                    var protocol = params.ssl ? 'https://' : 'http://';
                    var txParam = utils.getTransactionURLParam();
                    var url = protocol + v.authURL + '/' + encodeURI(params.account) +
                        '/realms/' + encodeURI(params.realm) + '/token/' + ( txParam ? ('?' + txParam) : '');
                    var loggedInAt = new Date().getTime();
                    v.$.post(url, {
                        strategy: 'query',
                        username: params.username,
                        password: params.password
                    }).then(function(authResponse){
                        if( !params.suppressUpdateTimestamp ){
                            v.auth.updateLastActiveTimestamp();
                        }
                        utils.setSessionStorageItem(btoa(TOKEN_KEY), authResponse.access_token);
                        utils.setSessionStorageItem(btoa(TOKEN_EXPIRES_KEY), authResponse.expires_in);
                        utils.setSessionStorageItem(btoa(TOKEN_SET_KEY), loggedInAt);
                        utils.setSessionStorageItem(btoa(ACCOUNT_KEY), btoa(params.account));
                        utils.setSessionStorageItem(btoa(REALM_KEY), btoa(params.realm));
                        utils.setSessionStorageItem(btoa(USERNAME_KEY), btoa(params.username));
                        resolve(authResponse);
                    })['catch'](function(error){
                        reject(error);
                    });
                }
            );
        },
        /**
         * Connect to bridgeit services.
         *
         * This function will connect to the BridgeIt services, and maintain the connection for the specified
         * timeout period (default 20 minutes). By default, the BridgeIt push service is also activated, so the client
         * may send and receive push notifications after connecting.
         *
         * After connecting to BridgeIt Services, any BridgeIt service API may be used without needing to re-authenticate.
         * After successfully connection an authentication will be stored in session storage and available through
         * sessionStorage.bridgeitToken. This authentication information will automatically be used by other BridgeIt API
         * calls, so the token does not be included in subsequent calls, but is available if desired.
         *
         * A simple example of connecting to the BridgeIt Services and then making a service call is the following:
         *
         * bridgeit.connect({
		 *           account: 'my_account',
		 *           realm: 'realmA',
		 *           user: 'user',
		 *           password: 'secret'})
         *   .then( function(){
		 *      console.log("successfully connnected to BridgeIt Services");
		 *      //now we can fetch some docs
		 *      return bridgeit.docService.get('documents');
		 *   })
         *   .then( function(docs){
		 *      for( var d in docs ){ ... };
		 *   })
         *   .catch( function(error){
		 *      console.log("error connecting to BridgeIt Services: " + error);
		 *   });
         *
         * @alias connect
         * @param {Object} params params
         * @param {String} params.account BridgeIt Services account name
         * @param {String} params.realm BridgeIt Services realm
         * @param {String} params.username User name
         * @param {String} params.password User password
         * @param {String} params.host The BridgeIt Services host url, defaults to api.bridgeit.io
         * @param {Boolean} params.usePushService Open and connect to the BridgeIt push service, default true
         * @param {Boolean} params.connectionTimeout The timeout duration, in minutes, that the BridgeIt login will last during inactivity. Default 20 minutes.
         * @param {Boolean} params.ssl (default false) Whether to use SSL for network traffic.
         * @param {Boolean} params.storeCredentials (default true) Whether to store encrypted credentials in session storage. If set to false, bridgeit will not attempt to relogin before the session expires.
         * @param {Function} params.onSessionExpiry Function callback to be called on session expiry. If you wish to ensure that disconnect is not called until after your onSessionExpiry callback has completed, please return a Promise from your function.
         * @returns Promise with service definitions
         *
         */
        connect: function(params){
            return new Promise(function(resolve, reject) {
                function initConnectCallback(){
                    function connectCallback(){
                        console.log(new Date().toISOString() + ' bridgeit connect: callback running')
                        var connectSettings = v.auth.getConnectSettings();
                        if( !connectSettings ){
                            console.log(new Date().toISOString() + ' bridgeit connect: error, could not retrieve settings');
                            return;
                        }
                        var timeoutMillis = connectSettings.connectionTimeout * 60 * 1000;
                        //first check if connectionTimeout has expired
                        var now = new Date().getTime();
                        console.log('bridgeit.getLastActiveTimestamp: ' + v.auth.getLastActiveTimestamp());
                        console.log('bridgeit timeout ms: ' + timeoutMillis);
                        console.log('bridgeit now ms: ' + now);
                        if( ( now - v.auth.getLastActiveTimestamp()) < timeoutMillis ){
                            console.log(new Date().toISOString() + ' bridgeit connect: timeout has not been exceeded, ' + v.auth.getTimeRemainingBeforeExpiry()/1000/60 + ' mins remaining');
                            if( (connectSettings.connectionTimeout * 1000 * 60 ) > v.auth.getTimeRemainingBeforeExpiry()){
                                var loginParams = v.auth.getConnectSettings();
                                loginParams.account = atob(utils.getSessionStorageItem(btoa(ACCOUNT_KEY)));
                                loginParams.realm = atob(utils.getSessionStorageItem(btoa(REALM_KEY)));
                                loginParams.username = atob(utils.getSessionStorageItem(btoa(USERNAME_KEY)));
                                loginParams.password = atob(utils.getSessionStorageItem(btoa(PASSWORD_KEY)));
                                loginParams.suppressUpdateTimestamp = true;
                                v.auth.login(loginParams).then(function(authResponse){
                                    fireEvent(window, 'bridgeit-access-token-refreshed', v.auth.getLastAccessToken());
                                    if( loginParams.usePushService ){
                                        v.push.startPushService(loginParams);
                                    }
                                    setTimeout(connectCallback, v.auth.getTimeRemainingBeforeExpiry() - timeoutPadding);
                                })['catch'](function(response){
                                    var msg = new Date().toISOString() + ' bridgeit connect: error relogging in: ' + response.responseText;
                                    console.error(msg);
                                    reject(response);
                                    throw new Error(msg);
                                });
                            }
                            else{
                                console.log( new Date().toISOString() + ' bridgeit connect: setting callback for ' + connectSettings.connectionTimeout + ' minutes');
                                setTimeout(connectCallback, connectSettings.connectionTimeout * 60 * 1000);
                            }
                        }
                        else{
                            console.log( new Date().toISOString() + ' bridgeit connect: timeout has expired, disconnecting..');
                            //look for the onSessionExpiry callback on the params first,
                            //as functions could be passed by reference
                            //secondly by settings, which would only be passed by name
                            var expiredCallback = params.onSessionExpiry;
                            if( !expiredCallback ){
                                expiredCallback = connectSettings.onSessionExpiry;
                            }
                            //if there's no onSessionExpiry, call disconnect immediately
                            //otherwise search for onSessionExpiry function, if not found
                            //call disconnect() immediately, otherwise call onSessionExpiry
                            //if callback if a promise, wait until the promise completes
                            //before disconnecting, otherwise, wait 500ms then disconnect
                            if( expiredCallback ){
                                var expiredCallbackFunction;
                                if( typeof expiredCallback === 'function'){
                                    expiredCallbackFunction = expiredCallback;
                                }
                                else if( typeof expiredCallback === 'string'){
                                    expiredCallbackFunction = utils.findFunctionInGlobalScope(expiredCallback);
                                }
                                if( expiredCallbackFunction ){
                                    var expiredCallbackPromise = expiredCallbackFunction();
                                    if( expiredCallbackPromise && expiredCallbackPromise.then ){
                                        expiredCallbackPromise.then(v.auth.disconnect)
                                            ['catch'](v.auth.disconnect);
                                    }
                                    else{
                                        setTimeout(v.auth.disconnect, 500);
                                    }
                                }
                                else{
                                    console.log( new Date().toISOString() + ' bridgeit connect: error calling onSessionExpiry callback, ' +
                                        'could not find function: ' + expiredCallback);
                                    v.auth.disconnect();
                                }
                            }
                            else{
                                v.auth.disconnect();
                            }
                        }
                    }
                    var callbackTimeout;
                    //if the desired connection timeout is greater the token expiry
                    //set the callback check for just before the token expires
                    if( connectionTimeoutMillis > v.auth.getExpiresIn()){
                        callbackTimeout = v.auth.getTimeRemainingBeforeExpiry() - timeoutPadding;
                    }
                    //otherwise the disired timeout is less then the token expiry
                    //so set the callback to happen just at specified timeout
                    else{
                        callbackTimeout = connectionTimeoutMillis;
                    }
                    console.log( new Date().toISOString() + ' bridgeit connect: setting timeout to ' + callbackTimeout / 1000 / 60 + ' mins, expiresIn: ' + v.auth.getExpiresIn() + ', remaining: '  + v.auth.getTimeRemainingBeforeExpiry());
                    var cbId = setTimeout(connectCallback, callbackTimeout);
                    utils.setSessionStorageItem(btoa(RELOGIN_CB_KEY), cbId);
                }
                var timeoutPadding = 500;
                params = params ? params : {};
                v.checkHost(params);
                if( !params.storeCredentials){
                    params.storeCredentials = true;
                }
                //store connect settings
                var settings = {
                    host: v.baseURL,
                    usePushService: params.usePushService,
                    connectionTimeout: params.connectionTimeout || 20,
                    ssl: params.ssl,
                    storeCredentials: params.storeCredentials || true,
                    onSessionExpiry: params.onSessionExpiry
                };
                utils.setSessionStorageItem(btoa(CONNECT_SETTINGS_KEY), btoa(JSON.stringify(settings)));
                if( params.onSessionExpiry ){
                    if( typeof params.onSessionExpiry === 'function'){
                        var name = utils.getFunctionName(params.onSessionExpiry);
                        if( name ){
                            settings.onSessionExpiry = name;
                        }
                    }
                }
                var connectionTimeoutMillis =  settings.connectionTimeout * 60 * 1000;
                if( v.auth.isLoggedIn()){
                    initConnectCallback();
                    if( settings.usePushService ){
                        v.push.startPushService(settings);
                    }
                    resolve();
                }
                else{
                    v.auth.login(params).then(function(authResponse){
                        console.log('bridgeit.io.auth.connect: ' + new Date().toISOString() + ' received auth response');
                        utils.setSessionStorageItem(btoa(ACCOUNT_KEY), btoa(bridgeit.io.auth.getLastKnownAccount()));
                        utils.setSessionStorageItem(btoa(REALM_KEY), btoa(bridgeit.io.auth.getLastKnownRealm()));
                        utils.setSessionStorageItem(btoa(USERNAME_KEY), btoa(params.username));
                        utils.setSessionStorageItem(btoa(PASSWORD_KEY), btoa(params.password));
                        initConnectCallback();
                        if( settings.usePushService ){
                            v.push.startPushService(settings);
                        }
                        resolve();
                    })['catch'](function(error){
                        reject(error);
                    });
                }
            });
        },
        refreshAccessToken: function(){
            return new Promise(function(resolve, reject) {
                if( !v.auth.isLoggedIn()){
                    reject('bridgeit.io.auth.refreshAccessToken() not logged in, cant refresh token');
                }
                else{
                    var loginParams = v.auth.getConnectSettings();
                    if( !loginParams ){
                        reject('bridgeit.io.auth.refreshAccessToken() no connect settings, cant refresh token');
                    }
                    else{
                        loginParams.account = atob(utils.getSessionStorageItem(btoa(ACCOUNT_KEY)));
                        loginParams.realm = atob(utils.getSessionStorageItem(btoa(REALM_KEY)));
                        loginParams.username = atob(utils.getSessionStorageItem(btoa(USERNAME_KEY)));
                        loginParams.password = atob(utils.getSessionStorageItem(btoa(PASSWORD_KEY)));
                        loginParams.suppressUpdateTimestamp = true;
                        v.auth.login(loginParams).then(function(authResponse){
                            fireEvent(window, 'bridgeit-access-token-refreshed', v.auth.getLastAccessToken());
                            if( loginParams.usePushService ){
                                v.push.startPushService(loginParams);
                            }
                            resolve(authResponse);
                        })['catch'](function(response){
                            reject(response);
                        });
                    }
                }
            });
        },
        /**
         * Disconnect from BridgeIt Services.
         *
         * This function will logout from BridgeIt Services and remove all session information from the client.
         *
         * TODO
         *
         * @alias disconnect
         * @param {Object} params params
         * @param {String} params.account BridgeIt Services account name. If not provided, the last known BridgeIt Account will be used.
         * @param {String} params.realm The BridgeIt Services realm. If not provided, the last known BridgeIt Realm name will be used.
         * @param {String} params.username User name (required)
         * @param {String} params.password User password (required)
         * @param {String} params.host The BridgeIt Services host url. If not supplied, the last used BridgeIT host, or the default will be used. (optional)
         * @param {Boolean} params.ssl (default false) Whether to use SSL for network traffic.
         * @returns Promise with the following argument:
         *      {
		 *          access_token: 'xxx',
		 *          expires_in: 99999
		 *      }
         *
         */
        disconnect: function(){
            utils.removeSessionStorageItem(btoa(TOKEN_KEY));
            utils.removeSessionStorageItem(btoa(TOKEN_EXPIRES_KEY));
            utils.removeSessionStorageItem(btoa(CONNECT_SETTINGS_KEY));
            utils.removeSessionStorageItem(btoa(TOKEN_SET_KEY));
            utils.removeSessionStorageItem(btoa(ACCOUNT_KEY));
            utils.removeSessionStorageItem(btoa(REALM_KEY));
            utils.removeSessionStorageItem(btoa(USERNAME_KEY));
            utils.removeSessionStorageItem(btoa(PASSWORD_KEY));
            utils.removeSessionStorageItem(btoa(LAST_ACTIVE_TS_KEY));
            var cbId = utils.getSessionStorageItem(btoa(RELOGIN_CB_KEY));
            if( cbId ){
                clearTimeout(cbId);
            }
            utils.removeSessionStorageItem(btoa(RELOGIN_CB_KEY));
            console.log(new Date().toISOString() + ' bridgeit has disconnected')
        },
        getLastAccessToken: function(){
            return utils.getSessionStorageItem(btoa(TOKEN_KEY));
        },
        getExpiresIn: function(){
            var expiresInStr = utils.getSessionStorageItem(btoa(TOKEN_EXPIRES_KEY));
            if( expiresInStr ){
                return parseInt(expiresInStr,10);
            }
        },
        getTokenSetAtTime: function(){
            var tokenSetAtStr = utils.getSessionStorageItem(btoa(TOKEN_SET_KEY));
            if( tokenSetAtStr ){
                return parseInt(tokenSetAtStr,10);
            }
        },
        getTimeRemainingBeforeExpiry: function(){
            var expiresIn = v.auth.getExpiresIn();
            var token = v.auth.getExpiresIn();
            if( expiresIn && token ){
                var now = new Date().getTime();
                return (v.auth.getTokenSetAtTime() + expiresIn) - now;
            }
        },
        getConnectSettings: function(){
            var settingsStr = utils.getSessionStorageItem(btoa(CONNECT_SETTINGS_KEY));
            if( settingsStr ){
                return JSON.parse(atob(settingsStr));
            }
        },
        isLoggedIn: function(){
            var token = utils.getSessionStorageItem(btoa(TOKEN_KEY)),
                tokenExpiresInStr = utils.getSessionStorageItem(btoa(TOKEN_EXPIRES_KEY)),
                tokenExpiresIn = tokenExpiresInStr ? parseInt(tokenExpiresInStr,10) : null,
                tokenSetAtStr = utils.getSessionStorageItem(btoa(TOKEN_SET_KEY)),
                tokenSetAt = tokenSetAtStr ? parseInt(tokenSetAtStr,10) : null,
                result = token && tokenExpiresIn && tokenSetAt && (new Date().getTime() < (tokenExpiresIn + tokenSetAt) );
            return !!result;
        },
        getLastKnownAccount: function(){
            var accountCipher = utils.getSessionStorageItem(btoa(ACCOUNT_KEY));
            if( accountCipher ){
                return atob(accountCipher);
            }
        },
        getLastKnownRealm: function(){
            var realmCipher = utils.getSessionStorageItem(btoa(REALM_KEY));
            if( realmCipher ){
                return atob(realmCipher);
            }
        },
        getLastKnownUsername: function () {
            var usernameCipher = utils.getSessionStorageItem(btoa(USERNAME_KEY));
            if (usernameCipher) {
                return atob(usernameCipher);
            }
        },
        /**
         * Register a new user for a realm that supports open user registrations.
         *
         * @alias registerAsNewUser
         * @param {Object} params params
         * @param {String} params.account BridgeIt Services account name. If not provided, the last known BridgeIt Account will be used.
         * @param {String} params.realm The BridgeIt Services realm. If not provided, the last known BridgeIt Realm name will be used.
         * @param {String} params.username User name (required)
         * @param {String} params.password User password (required)
         * @param {String} params.host The BridgeIt Services host url. If not supplied, the last used BridgeIT host, or the default will be used. (optional)
         * @param {Boolean} params.ssl (default false) Whether to use SSL for network traffic.
         * @param {String} params.firstname The user's first name (optional)
         * @param {String} params.lastname The user's last name (optional)
         * @param {String} params.email The user's email (optional)
         * @param {Object} params.custom Custom user information
         * @returns Promise
         */
        registerAsNewUser: function(params){
            return new Promise(
                function(resolve, reject) {
                    params = params ? params : {};
                    v.checkHost(params);
                    var account = utils.validateAndReturnRequiredAccount(params, reject);
                    var realm = utils.validateAndReturnRequiredRealm(params, reject);
                    var token = utils.validateAndReturnRequiredAccessToken(params, reject);
                    utils.validateRequiredUsername(params, reject);
                    validateRequiredPassword(params, reject);
                    var user = {
                        username: params.username,
                        password: params.password
                    };
                    if( 'firstname' in params ){
                        user.firstname = params.firstname;
                    }
                    if( 'lastname' in params ){
                        user.lastname = params.lastname;
                    }
                    if( 'email' in params ){
                        user.email = params.email;
                    }
                    if( 'custom' in params ){
                        user.custom = params.custom;
                    }
                    var url = utils.getRealmResourceURL(v.authAdminURL, account, realm,
                        'quickuser', v.auth.getLastAccessToken(), params.ssl);
                    v.$.post(url, {user: user}).then(function(response){
                        v.auth.updateLastActiveTimestamp();
                        resolve(response);
                    })['catch'](function(error){
                        reject(error);
                    });
                }
            );
        },
        /**
         * Check if the current user has a set of permissions.
         *
         * @alias checkUserPermissions
         * @param {Object} params params
         * @param {String} params.account BridgeIt Services account name. If not provided, the last known BridgeIt Account will be used.
         * @param {String} params.realm The BridgeIt Services realm. If not provided, the last known BridgeIt Realm name will be used.
         * @param {String} params.host The BridgeIt Services host url. If not supplied, the last used BridgeIT host, or the default will be used. (optional)
         * @param {Boolean} params.ssl (default false) Whether to use SSL for network traffic.
         * @param {String} params.permissions A space-delimited list of permissions
         * @returns Promise
         */
        checkUserPermissions: function(params){
            return new Promise(
                function(resolve, reject) {
                    params = params ? params : {};
                    v.checkHost(params);
                    validateRequiredPermissions(params, reject);
                    var account = utils.validateAndReturnRequiredAccount(params, reject);
                    var realm = utils.validateAndReturnRequiredRealm(params, reject);
                    var token = utils.validateAndReturnRequiredAccessToken(params, reject);
                    var url = utils.getRealmResourceURL(v.authURL, account, realm,
                        'permission', token, params.ssl);
                    v.$.post(url, {permissions: params.permissions}).then(function(response){
                        v.auth.updateLastActiveTimestamp();
                        resolve(true);
                    })['catch'](function(response){
                        if( response.status == 403){
                            v.auth.updateLastActiveTimestamp();
                            resolve(false);
                        }
                        else{
                            reject(error);
                        }
                    });
                }
            );
        },
        /**
         * Check if the current user has a set of roles.
         *
         * @alias checkUserRoles
         * @param {Object} params params
         * @param {String} params.account BridgeIt Services account name. If not provided, the last known BridgeIt Account will be used.
         * @param {String} params.realm The BridgeIt Services realm. If not provided, the last known BridgeIt Realm name will be used.
         * @param {String} params.host The BridgeIt Services host url. If not supplied, the last used BridgeIT host, or the default will be used. (optional)
         * @param {Boolean} params.ssl (default false) Whether to use SSL for network traffic.
         * @param {String} params.roles A space-delimited list of permissions
         * @param {String} params.op 'and' (default) or 'or' or 'single'
         * @returns Promise
         checkUserRoles: function(params){
			return new Promise(
				function(resolve, reject) {
					params = params ? params : {};
					services.checkHost(params);
					validateRequiredPermissions(params, reject);
					var account = validateAndReturnRequiredAccount(params, reject);
					var realm = validateAndReturnRequiredRealm(params, reject);
					var token = validateAndReturnRequiredAccessToken(params, reject);
					 /authadmin/:accountname/realms/:realmname/roles/:username/rolecheck
					var url = getRealmResourceURL(services.authAdminURL, account, realm,
						'roles/' + , token, params.ssl);
					b.$.post(url, {permissions: params.permissions}).then(function(response){
						services.auth.updateLastActiveTimestamp();
						resolve(true);
					})['catch'](function(response){
						if( response.status == 403){
							services.auth.updateLastActiveTimestamp();
							resolve(false);
						}
						else{
							reject(error);
						}
					});
				}
			);
		},
         */
        /**
         * Update the last active timestamp for BridgeIt auth. This value is used
         * when checking for clients-side session timeouts.
         * @alias updateLastActiveTimestamp
         */
        updateLastActiveTimestamp: function(){
            utils.setSessionStorageItem(btoa(LAST_ACTIVE_TS_KEY), new Date().getTime());
        },
        /**
         * Return the timestamp of the last bridgeit op or when bridgeit.io.auth.updateLastActiveTimestamp()
         * was called.
         * @alias getLastActiveTimestamp
         */
        getLastActiveTimestamp: function(){
            return utils.getSessionStorageItem(btoa(LAST_ACTIVE_TS_KEY));
        },
        /**
         * User the browser local storage to cache the user store. This will allow access to the user store
         * when the user is offline or when the server is not accessible.
         *
         * @alias enableUserStoreCache
         *
         */
        enableUserStoreCache: function(){
            if( !v.auth.isLoggedIn() ){
                console.log('not logged in, cannot access user store');
                return;
            }
            var userStoreSettings;
            var username = v.auth.getLastKnownUsername();
            if( !username ){
                console.log('username not available, cannot access user store');
                return;
            }
            var userStoreSettingsStr = utils.getLocalStorageItem(btoa(USER_STORE_SETTING_KEY));
            if( !userStoreSettingsStr ){
                userStoreSettings = {};
            }
            else{
                userStoreSettings = JSON.parse(atob(userStoreSettingsStr));
            }
            userStoreSettings[username] = new Date().getTime();
            utils.setLocalStorageItem(btoa(USER_STORE_SETTING_KEY), btoa(JSON.stringify(userStoreSettings)));
        },
        /**
         * Disaled the browser local storage to cache the user store.
         *
         * @alias disableUserStoreCache
         *
         */
        disableUserStoreCache: function(){
            if( !v.auth.isLoggedIn() ){
                console.log('not logged in, cannot access user store');
                return;
            }
            var userStoreSettings;
            var username = v.auth.getLastKnownUsername();
            if( !username ){
                console.log('username not available, cannot access user store');
                return;
            }
            var userStoreSettingsStr = utils.getLocalStorageItem(btoa(USER_STORE_SETTING_KEY));
            if( !userStoreSettingsStr ){
                userStoreSettings = {};
            }
            else{
                userStoreSettings = JSON.parse(atob(userStoreSettingsStr));
            }
            userStoreSettings[username] = null;
            utils.setLocalStorageItem(btoa(USER_STORE_SETTING_KEY), btoa(JSON.stringify(userStoreSettings)));
        },
        /**
         * Returns true if enableUserStoreCache() has previously been called and the user store
         * cache is active.
         * @alias isUserStoreCacheActive
         */
        isUserStoreCacheActive: function(){
            if( !v.auth.isLoggedIn() ){
                console.log('not logged in, cannot access user store');
                return;
            }
            var userStoreSettings;
            var username = v.auth.getLastKnownUsername();
            if( !username ){
                console.log('username not available, cannot access user store');
                return;
            }
            var userStoreSettingsStr = utils.getLocalStorageItem(btoa(USER_STORE_SETTING_KEY));
            if( !userStoreSettingsStr ){
                return false;
            }
            else{
                userStoreSettings = JSON.parse(atob(userStoreSettingsStr));
                return !!userStoreSettings[username];
            }
        },
        /**
         * Set an item by key and value in the user store. The user store is updated
         * on the server side user record 'custom' property.
         *
         * If the user store cache is active, the cache will also be updated.
         *
         * The userStore.last_updated property will be updated with the current time.
         * When the server side store is updated, this 'last_updated' timestamp will
         * be verified. If the server side timestamp is later than the previous 'last_updated'
         * timestamp, the operation will be rejected, and the returned promise will reject
         * with the current server side userStore value.
         *
         * The key and value must be parsable as JSON strings.
         *
         * @alias setItemInUserStore
         * @param {string} key the key
         * @param {string} value the value
         * @returns a Promise with no argument, if successful, or with the server side userStore if a conflict occurs
         */
        setItemInUserStore: function(key, value){
            return new Promise(function(resolve, reject) {
                function updateServerUserStore(userStore, previousLastUpdated){
                    return v.admin.getRealmUser().then(function(user){
                        var customProp = user.custom;
                        if( !customProp ){
                            user.custom = userStore;
                        }
                        else{
                            //compare timestamps
                            var customObj;
                            try{
                                customObj = JSON.parse(customProp);
                                var thatTS = customObj[LAST_UPDATED];
                                if( !thatTS || !previousLastUpdated){
                                    user.custom = userStore;
                                }
                                else{
                                    if( thatTS > previousLastUpdated ){
                                        console.log('ERROR: userStore update conflict' );
                                        reject(userStore);
                                        return;
                                    }
                                    else{
                                        user.custom = userStore;
                                    }
                                }
                            }
                            catch(e){
                                user.custom = userStore;
                            }
                        }
                        return v.admin.updateRealmUser({user: user}).then(function(){
                            resolve();
                        })['catch'](function(error){
                            console.log('could not update server side user object: ' + error);
                            reject('could not update server side user object: ' + error);
                        });
                    })
                }
                if( !key ){
                    reject('The key is required');
                    return;
                }
                return v.auth.getUserStore().then(function(userStore){
                    userStore[key] = value;
                    var prevTS = userStore[LAST_UPDATED];
                    userStore[LAST_UPDATED] = new Date().getTime();
                    if( v.auth.isUserStoreCacheActive() ){
                        return v.auth.saveUserStoreToCache().then(function(){
                            return updateServerUserStore(userStore, prevTS);
                        });
                    }
                    else{
                        return updateServerUserStore(userStore);
                    }
                })['catch'](function(error){
                    reject(error);
                })
            });
        },
        /**
         * Get an item by key from the user store. The user store is checked
         * on the server side user record 'custom' property.
         *
         * @alias getItemInUserStore
         * @param {string} key the key
         */
        getItemInUserStore: function(key){
            return new Promise(function(resolve, reject) {
                return v.auth.getUserStore().then(function(userStore){
                    resolve(userStore[key]);
                })['catch'](function(error){
                    reject(error);
                })
            });
        },
        /**
         * Get the user store for the current user. The user must be logged in to
         * access the store. The user store is persisted on the 'custom' property
         * of the user record, and can be used to store any relevant information for
         * user.
         *
         * @alias getUserStore
         * @returns A promise with the userStore object if successful.
         */
        getUserStore: function(){
            return new Promise(function(resolve, reject) {
                if( !v.auth.isLoggedIn() ){
                    console.log('not logged in, cannot access user store');
                    return null;
                }
                if( !(USER_STORE_KEY in window) ){
                    var userStoreCache;
                    if( v.auth.isUserStoreCacheActive()){
                        userStoreCache = v.auth.getUserStoreCache();
                    }
                    if( navigator.onLine ){
                        return v.admin.getRealmUser().then( function(user){
                            console.log('getUserStore() retrieved realm user');
                            var userStore = user.custom;
                            if( !userStore ){
                                userStore = {};
                            }
                            else if( typeof userStore === 'string'){
                                try{
                                    userStore = JSON.parse(userStore);
                                }
                                catch(e){
                                    userStore = {};
                                }
                            }
                            else if( typeof userStore !== 'object' ){
                                console.log('getUserStore() could not process user record store object: ' + userStore);
                                reject();
                                return;
                            }
                            window[USER_STORE_KEY] = userStore;
                            if( v.auth.isUserStoreCacheActive()){
                                return v.auth.saveUserStoreToCache().then(function(){
                                    return resolve(userStore);
                                });
                            }
                            else{
                                resolve(userStore);
                            }
                        })['catch'](function(error){
                            console.log('getUserStore() could not retrieve user from server: ' + error);
                            if( userStoreCache ){
                                resolve(userStoreCache);
                            }
                            else{
                                reject(error);
                            }
                        });
                    }
                    else if( userStoreCache ){
                        resolve(userStoreCache);
                    }
                    else{
                        reject('could not retrieve uncached user store while offline');
                    }
                }
                else{
                    resolve(window[USER_STORE_KEY]);
                }
            });
        },
        saveUserStoreToCache: function(){
            return new Promise(function(resolve, reject) {
                if( !v.auth.isLoggedIn() ){
                    console.log('not logged in, cannot access user store');
                    reject('not logged in, cannot access user store');
                    return;
                }
                if( !v.auth.isUserStoreCacheActive() ){
                    console.log('user store cache is not active, cannot save locally');
                    reject('user store cache is not active, cannot save locally')
                    return;
                }
                var username = v.auth.getLastKnownUsername();
                if( !username ){
                    console.log('username not available, cannot access user store');
                    reject('username not available, cannot access user store')
                    return;
                }
                else{
                    return v.auth.getUserStore().then(function(userStore){
                        var storeKeyCipher = btoa(USER_STORE_KEY);
                        var userStoreCacheStr = utils.getLocalStorageItem(storeKeyCipher);
                        var userStoreCache;
                        if( userStoreCacheStr ){
                            userStoreCache = JSON.parse(atob(userStoreCacheStr));
                        }
                        else{
                            userStoreCache = {};
                        }
                        userStoreCache[username] = userStore;
                        utils.setLocalStorageItem(storeKeyCipher, btoa(JSON.stringify(userStoreCache)));
                        resolve();
                        return;
                    })['catch'](function(error){
                        reject(error);
                        return;
                    })
                }
            });
        },
        getUserStoreCache: function(){
            if( !v.auth.isLoggedIn() ){
                console.log('not logged in, cannot access user store');
                reject('not logged in, cannot access user store');
                return;
            }
            if( !v.auth.isUserStoreCacheActive() ){
                console.log('user store cache is not active, cannot save locally');
                reject('user store cache is not active, cannot save locally')
                return;
            }
            var username = v.auth.getLastKnownUsername();
            if( !username ){
                console.log('username not available, cannot access user store');
                reject('username not available, cannot access user store')
                return;
            }
            var storeKeyCipher = btoa(USER_STORE_KEY);
            var userStoreCacheStr = utils.getLocalStorageItem(storeKeyCipher);
            var userStoreCache;
            if( userStoreCacheStr ){
                userStoreCache = JSON.parse(atob(userStoreCacheStr));
            }
            else{
                userStoreCache = {};
            }
            var userStoreCacheObject = userStoreCache[username];
            if( !userStoreCacheObject ){
                userStoreCacheObject = {};
            }
            return userStoreCacheObject;
        }
    };
}
function AdminService(v, utils) {
    function validateRequiredUser(params, reject){
        utils.validateParameter('user', 'The user parameter is required', params, reject);
    }
    function validateRequiredRole(params, reject){
        utils.validateParameter('role', 'The role parameter is required', params, reject);
    }
    return {
        /**
         * Get the BridgeIt Service definitions.
         *
         * @alias getServiceDefinitions
         * @param {Object} params params
         * @param {String} params.host The BridgeIt Services host url. If not supplied, the last used BridgeIT host, or the default will be used. (optional)
         * @param {Boolean} params.ssl (default false) Whether to use SSL for network traffic.
         * @returns Promise with a json object of the service definitions
         *
         */
        getServiceDefinitions: function(params){
            return new Promise(
                function(resolve, reject) {
                    params = params ? params : {};
                    v.checkHost(params);
                    //validate
                    var token = utils.validateAndReturnRequiredAccessToken(params, reject);
                    var protocol = params.ssl ? 'https://' : 'http://';
                    var txParam = utils.getTransactionURLParam();
                    var url = protocol + v.authAdminURL + '/system/v/?access_token=' + token +
                        (txParam ? '&' + txParam : '');
                    v.$.getJSON(url).then(function(json){
                        v.auth.updateLastActiveTimestamp();
                        resolve(json);
                    })['catch'](function(error){
                        reject(error);
                    });
                }
            );
        },
        getAccount: function(params){
            return new Promise(function(resolve, reject) {
                params = params ? params : {};
                v.checkHost(params);
                //validate
                var account = utils.validateAndReturnRequiredAccount(params, reject);
                var token = utils.validateAndReturnRequiredAccessToken(params, reject);
                var protocol = params.ssl ? 'https://' : 'http://';
                var txParam = utils.getTransactionURLParam();
                var url = protocol + v.authAdminURL + '/' + account + '?access_token=' + token +
                    (txParam ? '&' + txParam : '');
                v.$.getJSON(url).then(function(json){
                    v.auth.updateLastActiveTimestamp();
                    resolve(json.account);
                })['catch'](function(error){
                    reject(error);
                });
            });
        },
        /* Realm admin */
        getRealms: function(params){
            return new Promise(function(resolve, reject) {
                params = params ? params : {};
                v.checkHost(params);
                //validate
                var account = utils.validateAndReturnRequiredAccount(params, reject);
                var token = utils.validateAndReturnRequiredAccessToken(params, reject);
                var protocol = params.ssl ? 'https://' : 'http://';
                var url = protocol + v.authAdminURL + '/' + account + '/realms/'
                    + '?access_token=' + token + utils.getTransactionURLParam();
                v.$.getJSON(url).then(function(json){
                    v.auth.updateLastActiveTimestamp();
                    resolve(json.realms);
                })['catch'](function(error){
                    reject(error);
                });
            });
        },
        getRealm: function(params){
            return new Promise(function(resolve, reject) {
                params = params ? params : {};
                v.checkHost(params);
                var account = utils.validateAndReturnRequiredAccount(params, reject);
                var token = utils.validateAndReturnRequiredAccessToken(params, reject);
                var realm = validateAndReturnRequiredRealmName(params, reject);
                var url = utils.getRealmResourceURL(v.authAdminURL, account, realm,
                    '', token, params.ssl);
                v.$.getJSON(url).then(function(json){
                    v.auth.updateLastActiveTimestamp();
                    resolve(json.realm);
                })['catch'](function(error){
                    reject(error);
                });
            });
        },
        updateRealm: function(params){
            return new Promise(function(resolve, reject) {
                params = params ? params : {};
                v.checkHost(params);
                var account = utils.validateAndReturnRequiredAccount(params, reject);
                var token = utils.validateAndReturnRequiredAccessToken(params, reject);
                validateRequiredRealm(params, reject);
                var url = utils.getRealmResourceURL(v.authAdminURL, account, params.realm.name,
                    '', token, params.ssl);
                v.$.put(url, {realm: params.realm}).then(function(){
                    v.auth.updateLastActiveTimestamp();
                    resolve();
                })['catch'](function(error){
                    reject(error);
                });
            });
        },
        createRealm: function(params){
            return new Promise(function(resolve, reject) {
                params = params ? params : {};
                v.checkHost(params);
                var account = utils.validateAndReturnRequiredAccount(params, reject);
                var token = utils.validateAndReturnRequiredAccessToken(params, reject);
                var realmName = validateAndReturnRequiredRealmName(params, reject);
                validateRequiredRealm(params, reject);
                var protocol = params.ssl ? 'https://' : 'http://';
                var txParam = utils.getTransactionURLParam();
                var url = protocol + v.authAdminURL + '/' + account + '/realms?access_token=' + token +
                    (txParam ? '&' + txParam : '');
                v.$.post(url, {realm: params.realm}).then(function(json){
                    v.auth.updateLastActiveTimestamp();
                    resolve(json.resourceLocation);
                })['catch'](function(error){
                    reject(error);
                });
            });
        },
        deleteRealm: function(params){
            return new Promise(function(resolve, reject) {
                params = params ? params : {};
                v.checkHost(params);
                var account = utils.validateAndReturnRequiredAccount(params, reject);
                var token = utils.validateAndReturnRequiredAccessToken(params, reject);
                var realmName = validateAndReturnRequiredRealmName(params, reject);
                var url = utils.getRealmResourceURL(v.authAdminURL, account, realmName,
                    '', token, params.ssl);
                v.$.doDelete(url).then(function(){
                    v.auth.updateLastActiveTimestamp();
                    resolve();
                })['catch'](function(error){
                    reject(error);
                });
            });
        },
        /* Realm Users */
        getRealmUsers: function(params){
            return new Promise(
                function(resolve, reject) {
                    params = params ? params : {};
                    v.checkHost(params);
                    //validate
                    var account = utils.validateAndReturnRequiredAccount(params, reject);
                    var realm = validateAndReturnRequiredRealmName(params, reject);
                    var token = utils.validateAndReturnRequiredAccessToken(params, reject);
                    var url = utils.getRealmResourceURL(v.authAdminURL, account, realm,
                        'users', token, params.ssl);
                    v.$.getJSON(url).then(function(json){
                        v.auth.updateLastActiveTimestamp();
                        resolve(json.users);
                    })['catch'](function(error){
                        reject(error);
                    });
                }
            );
        },
        createRealmUser: function(params){
            return new Promise(
                function(resolve, reject) {
                    params = params ? params : {};
                    v.checkHost(params);
                    var account = utils.validateAndReturnRequiredAccount(params, reject);
                    var realm = validateAndReturnRequiredRealmName(params, reject);
                    var token = utils.validateAndReturnRequiredAccessToken(params, reject);
                    validateRequiredUser(params, reject);
                    var url = utils.getRealmResourceURL(v.authAdminURL, account, realm,
                        'users', v.auth.getLastAccessToken(), params.ssl);
                    v.$.post(url, {user: params.user}).then(function(response){
                        v.auth.updateLastActiveTimestamp();
                        resolve(response.resourceLocation);
                    })['catch'](function(error){
                        reject(error);
                    });
                }
            );
        },
        getRealmUser: function(params){
            return new Promise(
                function(resolve, reject) {
                    params = params ? params : {};
                    v.checkHost(params);
                    //validate
                    var account = utils.validateAndReturnRequiredAccount(params, reject);
                    var realm = validateAndReturnRequiredRealmName(params, reject);
                    var token = utils.validateAndReturnRequiredAccessToken(params, reject);
                    var username = utils.validateAndReturnRequiredUsername(params, reject);
                    var url = utils.getRealmResourceURL(v.authAdminURL, account, realm,
                        'users/' + username, token, params.ssl);
                    v.$.getJSON(url).then(function(json){
                        v.auth.updateLastActiveTimestamp();
                        resolve(json.user);
                    })['catch'](function(error){
                        reject(error);
                    });
                }
            );
        },
        updateRealmUser: function(params){
            return new Promise(
                function(resolve, reject) {
                    params = params ? params : {};
                    v.checkHost(params);
                    var account = utils.validateAndReturnRequiredAccount(params, reject);
                    var realm = validateAndReturnRequiredRealmName(params, reject);
                    var token = utils.validateAndReturnRequiredAccessToken(params, reject);
                    validateRequiredUser(params, reject);
                    var url = utils.getRealmResourceURL(v.authAdminURL, account, realm,
                        'users/' + params.user.username, v.auth.getLastAccessToken(), params.ssl);
                    v.$.put(url, {user: params.user}).then(function(response){
                        v.auth.updateLastActiveTimestamp();
                        resolve();
                    })['catch'](function(error){
                        reject(error);
                    });
                }
            );
        },
        deleteRealmUser: function(params){
            return new Promise(
                function(resolve, reject) {
                    params = params ? params : {};
                    v.checkHost(params);
                    var account = utils.validateAndReturnRequiredAccount(params, reject);
                    var realm = validateAndReturnRequiredRealmName(params, reject);
                    var token = utils.validateAndReturnRequiredAccessToken(params, reject);
                    utils.validateRequiredUsername(params, reject);
                    var url = utils.getRealmResourceURL(v.authAdminURL, account, realm,
                        'users/' + params.username, v.auth.getLastAccessToken(), params.ssl);
                    v.$.doDelete(url).then(function(){
                        v.auth.updateLastActiveTimestamp();
                        resolve();
                    })['catch'](function(error){
                        reject(error);
                    });
                }
            );
        },
        /* Realm Roles */
        getRealmRoles: function(params){
            return new Promise(
                function(resolve, reject) {
                    params = params ? params : {};
                    v.checkHost(params);
                    //validate
                    var account = utils.validateAndReturnRequiredAccount(params, reject);
                    var realm = validateAndReturnRequiredRealmName(params, reject);
                    var token = utils.validateAndReturnRequiredAccessToken(params, reject);
                    var url = utils.getRealmResourceURL(v.authAdminURL, account, realm,
                        'roles', token, params.ssl);
                    v.$.getJSON(url).then(function(json){
                        v.auth.updateLastActiveTimestamp();
                        resolve(json.roles);
                    })['catch'](function(error){
                        reject(error);
                    });
                }
            );
        },
        createRealmRole: function(params){
            return new Promise(
                function(resolve, reject) {
                    params = params ? params : {};
                    v.checkHost(params);
                    validateRequiredRole(params, reject);
                    //validate
                    var account = utils.validateAndReturnRequiredAccount(params, reject);
                    var realm = validateAndReturnRequiredRealmName(params, reject);
                    var token = utils.validateAndReturnRequiredAccessToken(params, reject);
                    var url = utils.getRealmResourceURL(v.authAdminURL, account, realm,
                        'roles', token, params.ssl);
                    v.$.post(url, {role: params.role}).then(function(response){
                        v.auth.updateLastActiveTimestamp();
                        resolve(response.resourceLocation);
                    })['catch'](function(error){
                        reject(error);
                    });
                }
            );
        },
        updateRealmRole: function(params){
            return new Promise(
                function(resolve, reject) {
                    params = params ? params : {};
                    v.checkHost(params);
                    validateRequiredRole(params, reject);
                    //validate
                    var account = utils.validateAndReturnRequiredAccount(params, reject);
                    var realm = validateAndReturnRequiredRealmName(params, reject);
                    var token = utils.validateAndReturnRequiredAccessToken(params, reject);
                    var url = utils.getRealmResourceURL(v.authAdminURL, account, realm,
                        'roles/' + params.role.name, token, params.ssl);
                    v.$.put(url, {role: params.role}).then(function(response){
                        v.auth.updateLastActiveTimestamp();
                        resolve();
                    })['catch'](function(error){
                        reject(error);
                    });
                }
            );
        },
        deleteRealmRole: function(params){
            return new Promise(
                function(resolve, reject) {
                    params = params ? params : {};
                    v.checkHost(params);
                    utils.validateRequiredId(params, reject);
                    var account = utils.validateAndReturnRequiredAccount(params, reject);
                    var realm = validateAndReturnRequiredRealmName(params, reject);
                    var token = utils.validateAndReturnRequiredAccessToken(params, reject);
                    var url = utils.getRealmResourceURL(v.authAdminURL, account, realm,
                        'roles/' + params.id, token, params.ssl);
                    v.$.doDelete(url).then(function(response){
                        v.auth.updateLastActiveTimestamp();
                        resolve();
                    })['catch'](function(error){
                        reject(error);
                    });
                }
            );
        },
        getLogs: function(params) {
            return new Promise(function(resolve, reject) {
                params = params ? params : {};
                v.checkHost(params);
                var protocol = params.ssl ? 'https://' : 'http://';
                var account = utils.validateAndReturnRequiredAccount(params, reject);
                var token = utils.validateAndReturnRequiredAccessToken(params, reject);
                var query = params.query ? encodeURIComponent(JSON.stringify(params.query)) : '{}';
                var fields = params.fields ? encodeURIComponent(JSON.stringify(params.fields)) : '{}';
                var options = params.options ? encodeURIComponent(JSON.stringify(params.options)) : '{}';
                var url = protocol + v.authAdminURL + '/' + account + '/logging/?access_token=' +
                    token + '&query=' + query + '&fields=' + fields + '&options=' + options;
                v.$.getJSON(url).then(function(logs){
                    v.auth.updateLastActiveTimestamp();
                    resolve(logs);
                })['catch'](function(error){
                    reject(error);
                });
            });
        },
        getDebugLogs: function(params) {
            return new Promise(function(resolve, reject) {
                params = params ? params : {};
                v.checkHost(params);
                var protocol = params.ssl ? 'https://' : 'http://';
                var account = utils.validateAndReturnRequiredAccount(params, reject);
                var realm = utils.validateAndReturnRequiredRealm(params, reject);
                var token = utils.validateAndReturnRequiredAccessToken(params, reject);
                var query = params.query ? encodeURIComponent(JSON.stringify(params.query)) : '{}';
                var fields = params.fields ? encodeURIComponent(JSON.stringify(params.fields)) : '{}';
                var options = params.options ? encodeURIComponent(JSON.stringify(params.options)) : '{}';
                var url = protocol + v.authAdminURL + '/' + account + '/realms/' + realm +
                    '/debugLogging/?access_token=' + token + '&query=' + query + '&fields=' + fields + '&options=' + options;
                v.$.getJSON(url).then(function(logs){
                    v.auth.updateLastActiveTimestamp();
                    resolve(logs);
                })['catch'](function(error){
                    reject(error);
                });
            });
        }
    };
}
function ActionService(v, utils) {
    function validateRequiredAction(params, reject){
        utils.validateParameter('action', 'The action parameter is required', params, reject);
    }
    return {
        /**
         * Execute an action
         *
         * @alias executeAction
         * @param {Object} params params
         * @param {String} params.id The action id, the action to be executed
         * @param {String} params.account BridgeIt Services account name. If not provided, the last known BridgeIt Account will be used.
         * @param {String} params.realm The BridgeIt Services realm. If not provided, the last known BridgeIt Realm name will be used.
         * @param {String} params.accessToken The BridgeIt authentication token. If not provided, the stored token from bridgeit.io.auth.connect() will be used
         * @param {String} params.host The BridgeIt Services host url. If not supplied, the last used BridgeIt host, or the default will be used. (optional)
         * @param {Boolean} params.ssl (default false) Whether to use SSL for network traffic.
         * @returns {String} The resource URI
         */
        executeAction: function(params){
            return new Promise(
                function(resolve, reject) {
                    params = params ? params : {};
                    v.checkHost(params);
                    //validate
                    var account = utils.validateAndReturnRequiredAccount(params, reject);
                    var realm = utils.validateAndReturnRequiredRealm(params, reject);
                    var token = utils.validateAndReturnRequiredAccessToken(params, reject);
                    utils.validateRequiredId(params, reject);
                    var url = utils.getRealmResourceURL(v.actionURL, account, realm,
                        'actions/' + params.id, token, params.ssl, {'op': 'exec'});
                    v.$.post(url).then(function(response){
                        v.auth.updateLastActiveTimestamp();
                        resolve(response);
                    })['catch'](function(error){
                        reject(error);
                    });
                }
            );
        },
        /**
         * Create a new action
         *
         * @alias createAction
         * @param {Object} params params
         * @param {String} params.id The action id
         * @param {Object} params.action The action to be created
         * @param {String} params.account BridgeIt Services account name. If not provided, the last known BridgeIt Account will be used.
         * @param {String} params.realm The BridgeIt Services realm. If not provided, the last known BridgeIt Realm name will be used.
         * @param {String} params.accessToken The BridgeIt authentication token. If not provided, the stored token from bridgeit.io.auth.connect() will be used
         * @param {String} params.host The BridgeIt Services host url. If not supplied, the last used BridgeIt host, or the default will be used. (optional)
         * @param {Boolean} params.ssl (default false) Whether to use SSL for network traffic.
         * @returns {String} The resource URI
         */
        createAction: function(params){
            return new Promise(
                function(resolve, reject) {
                    params = params ? params : {};
                    v.checkHost(params);
                    //validate
                    var account = utils.validateAndReturnRequiredAccount(params, reject);
                    var realm = utils.validateAndReturnRequiredRealm(params, reject);
                    var token = utils.validateAndReturnRequiredAccessToken(params, reject);
                    utils.validateRequiredId(params, reject);
                    validateRequiredAction(params, reject);
                    var url = utils.getRealmResourceURL(v.actionURL, account, realm,
                        'actions/' + params.id, token, params.ssl);
                    v.$.post(url, params.action).then(function(response){
                        v.auth.updateLastActiveTimestamp();
                        resolve(response.uri);
                    })['catch'](function(error){
                        reject(error);
                    });
                }
            );
        },
        /**
         * Update an action
         *
         * @alias updateAction
         * @param {Object} params params
         * @param {String} params.id The action id, the action to be updated
         * @param {Object} params.action The new action
         * @param {String} params.account BridgeIt Services account name. If not provided, the last known BridgeIt Account will be used.
         * @param {String} params.realm The BridgeIt Services realm. If not provided, the last known BridgeIt Realm name will be used.
         * @param {String} params.accessToken The BridgeIt authentication token. If not provided, the stored token from bridgeit.io.auth.connect() will be used
         * @param {String} params.host The BridgeIt Services host url. If not supplied, the last used BridgeIT host, or the default will be used. (optional)
         * @param {Boolean} params.ssl (default false) Whether to use SSL for network traffic.
         */
        updateAction: function(params){
            return new Promise(
                function(resolve, reject) {
                    params = params ? params : {};
                    v.checkHost(params);
                    //validate
                    var account = utils.validateAndReturnRequiredAccount(params, reject);
                    var realm = utils.validateAndReturnRequiredRealm(params, reject);
                    var token = utils.validateAndReturnRequiredAccessToken(params, reject);
                    utils.validateRequiredId(params, reject);
                    validateRequiredAction(params, reject);
                    var url = utils.getRealmResourceURL(v.actionURL, account, realm,
                        'actions/' + params.id, token, params.ssl);
                    v.$.put(url, params.action).then(function(){
                        v.auth.updateLastActiveTimestamp();
                        resolve();
                    })['catch'](function(error){
                        reject(error);
                    });
                }
            );
        },
        /**
         * Fetch an action
         *
         * @alias getAction
         * @param {Object} params params
         * @param {String} params.id The action id, the action to fetch
         * @param {String} params.account BridgeIt Services account name. If not provided, the last known BridgeIt Account will be used.
         * @param {String} params.realm The BridgeIt Services realm. If not provided, the last known BridgeIt Realm name will be used.
         * @param {String} params.accessToken The BridgeIt authentication token. If not provided, the stored token from bridgeit.io.auth.connect() will be used
         * @param {String} params.host The BridgeIt Services host url. If not supplied, the last used BridgeIT host, or the default will be used. (optional)
         * @param {Boolean} params.ssl (default false) Whether to use SSL for network traffic.
         * @returns {Object} The action
         */
        getAction: function(params){
            return new Promise(
                function(resolve, reject) {
                    params = params ? params : {};
                    v.checkHost(params);
                    //validate
                    var account = utils.validateAndReturnRequiredAccount(params, reject);
                    var realm = utils.validateAndReturnRequiredRealm(params, reject);
                    var token = utils.validateAndReturnRequiredAccessToken(params, reject);
                    utils.validateRequiredId(params, reject);
                    var url = utils.getRealmResourceURL(v.actionURL, account, realm,
                        'actions/' + params.id, token, params.ssl);
                    v.$.getJSON(url).then(function(action){
                        v.auth.updateLastActiveTimestamp();
                        resolve(action);
                    })['catch'](function(error){
                        reject(error);
                    });
                }
            );
        },
        /**
         * Searches for actions in a realm based on a query
         *
         * @alias findActions
         * @param {Object} params params
         * @param {String} params.account BridgeIt Services account name. If not provided, the last known BridgeIt Account will be used.
         * @param {String} params.realm The BridgeIt Services realm. If not provided, the last known BridgeIt Realm name will be used.
         * @param {String} params.accessToken The BridgeIt authentication token. If not provided, the stored token from bridgeit.io.auth.connect() will be used
         * @param {String} params.host The BridgeIt Services host url. If not supplied, the last used BridgeIT host, or the default will be used. (optional)
         * @param {Boolean} params.ssl (default false) Whether to use SSL for network traffic.
         * @param {Object} params.query A mongo query for the actions
         * @param {Object} params.fields Specify the inclusion or exclusion of fields to return in the result set
         * @param {Object} params.options Additional query options such as limit and sort
         * @returns {Object} The results
         */
        findActions: function(params){
            return new Promise(
                function(resolve, reject) {
                    params = params ? params : {};
                    v.checkHost(params);
                    //validate
                    var account = utils.validateAndReturnRequiredAccount(params, reject);
                    var realm = utils.validateAndReturnRequiredRealm(params, reject);
                    var token = utils.validateAndReturnRequiredAccessToken(params, reject);
                    var url = utils.getRealmResourceURL(v.actionURL, account, realm,
                        'actions/', token, params.ssl, {
                            'query': params.query ? encodeURIComponent(JSON.stringify(params.query)) : {},
                            'fields': params.fields ? encodeURIComponent(JSON.stringify(params.fields)) : {},
                            'options': params.options ? encodeURIComponent(JSON.stringify(params.options)) : {}
                        });
                    v.$.getJSON(url).then(function(actions){
                        v.auth.updateLastActiveTimestamp();
                        resolve(actions);
                    })['catch'](function(response){
                        reject(response);
                    });
                }
            );
        },
        /**
         * Delete an action
         *
         * @alias deleteAction
         * @param {Object} params params
         * @param {String} params.id The action id, the action to be deleted
         * @param {String} params.account BridgeIt Services account name. If not provided, the last known BridgeIt Account will be used.
         * @param {String} params.realm The BridgeIt Services realm. If not provided, the last known BridgeIt Realm name will be used.
         * @param {String} params.accessToken The BridgeIt authentication token. If not provided, the stored token from bridgeit.io.auth.connect() will be used
         * @param {String} params.host The BridgeIt Services host url. If not supplied, the last used BridgeIT host, or the default will be used. (optional)
         * @param {Boolean} params.ssl (default false) Whether to use SSL for network traffic.
         */
        deleteAction: function(params){
            return new Promise(
                function(resolve, reject) {
                    params = params ? params : {};
                    v.checkHost(params);
                    //validate
                    var account = utils.validateAndReturnRequiredAccount(params, reject);
                    var realm = utils.validateAndReturnRequiredRealm(params, reject);
                    var token = utils.validateAndReturnRequiredAccessToken(params, reject);
                    utils.validateRequiredId(params, reject);
                    var url = utils.getRealmResourceURL(v.actionURL, account, realm,
                        'actions/' + params.id, token, params.ssl);
                    v.$.doDelete(url).then(function(){
                        v.auth.updateLastActiveTimestamp();
                        resolve();
                    })['catch'](function(error){
                        reject(error);
                    });
                }
            );
        },
        /**
         * Fetch available task groups
         *
         * @alias getTaskGroups
         * @param {Object} params params
         * @param {String} params.account BridgeIt Services account name. If not provided, the last known BridgeIt Account will be used.
         * @param {String} params.realm The BridgeIt Services realm. If not provided, the last known BridgeIt Realm name will be used.
         * @param {String} params.accessToken The BridgeIt authentication token. If not provided, the stored token from bridgeit.io.auth.connect() will be used
         * @param {String} params.host The BridgeIt Services host url. If not supplied, the last used BridgeIT host, or the default will be used. (optional)
         * @param {Boolean} params.ssl (default false) Whether to use SSL for network traffic.
         * @returns {Object} The task group schemas
         */
        getTaskGroups: function(params){
            return new Promise(
                function(resolve, reject) {
                    params = params ? params : {};
                    v.checkHost(params);
                    //validate
                    var account = utils.validateAndReturnRequiredAccount(params, reject);
                    var realm = utils.validateAndReturnRequiredRealm(params, reject);
                    var token = utils.validateAndReturnRequiredAccessToken(params, reject);
                    var url = utils.getRealmResourceURL(v.actionURL, account, realm,
                        'taskGroups/', token, params.ssl);
                    v.$.getJSON(url).then(function(tasksGroups){
                        v.auth.updateLastActiveTimestamp();
                        resolve(tasksGroups);
                    })['catch'](function(error){
                        reject(error);
                    });
                }
            );
        },
        /**
         * Fetch available tasks
         *
         * @alias getTasks
         * @param {Object} params params
         * @param {String} params.account BridgeIt Services account name. If not provided, the last known BridgeIt Account will be used.
         * @param {String} params.realm The BridgeIt Services realm. If not provided, the last known BridgeIt Realm name will be used.
         * @param {String} params.accessToken The BridgeIt authentication token. If not provided, the stored token from bridgeit.io.auth.connect() will be used
         * @param {String} params.host The BridgeIt Services host url. If not supplied, the last used BridgeIT host, or the default will be used. (optional)
         * @param {Boolean} params.ssl (default false) Whether to use SSL for network traffic.
         * @returns {Object} The action
         */
        getTasks: function(params){
            return new Promise(
                function(resolve, reject) {
                    params = params ? params : {};
                    v.checkHost(params);
                    //validate
                    var account = utils.validateAndReturnRequiredAccount(params, reject);
                    var realm = utils.validateAndReturnRequiredRealm(params, reject);
                    var token = utils.validateAndReturnRequiredAccessToken(params, reject);
                    var url = utils.getRealmResourceURL(v.actionURL, account, realm,
                        'tasks/', token, params.ssl);
                    v.$.getJSON(url).then(function(tasks){
                        v.auth.updateLastActiveTimestamp();
                        resolve(tasks);
                    })['catch'](function(error){
                        reject(error);
                    });
                }
            );
        }
    };
}
function CodeService(v, utils) {
    function validateRequiredFlow(params, reject){
        utils.validateParameter('flow', 'The flow parameter is required', params, reject);
    }
    return {
        /**
         * Executes a code flow
         *
         * @alias executeFlow
         * @param {Object} params params
         * @param {String} params.account BridgeIt Services account name. If not provided, the last known BridgeIt Account will be used.
         * @param {String} params.realm The BridgeIt Services realm. If not provided, the last known BridgeIt Realm name will be used.
         * @param {String} params.accessToken The BridgeIt authentication token. If not provided, the stored token from bridgeit.io.auth.connect() will be used
         * @param {String} params.host The BridgeIt Services host url. If not supplied, the last used BridgeIT host, or the default will be used. (optional)
         * @param {Boolean} params.ssl (default false) Whether to use SSL for network traffic.
         * @param {String} params.httpMethod (default 'post') 'get' or 'post'
         * @param {String} params.flow The code flow name
         * @param {Object} params.data The data to send with the flow
         */
        executeFlow: function(params){
            return new Promise(
                function(resolve, reject) {
                    params = params ? params : {};
                    v.checkHost(params);
                    var httpMethod = params.httpMethod || 'post';
                    httpMethod = httpMethod.toLowerCase();
                    //validate
                    var account = utils.validateAndReturnRequiredAccount(params, reject);
                    var realm = utils.validateAndReturnRequiredRealm(params, reject);
                    var token = utils.validateAndReturnRequiredAccessToken(params, reject);
                    validateRequiredFlow(params, reject);
                    var url = utils.getRealmResourceURL(v.codeURL, account, realm,
                        'nodes/' + encodeURI(params.flow), token, params.ssl);
                    if( 'get' === httpMethod ){
                        //TODO encode params.data into URL?
                        v.$.get(url).then(function(response){
                            v.auth.updateLastActiveTimestamp();
                            resolve();
                        })['catch'](function(error){
                            reject(error);
                        });
                    }
                    else if( 'post' === httpMethod ){
                        v.$.post(url, params.data).then(function(response){
                            v.auth.updateLastActiveTimestamp();
                            resolve();
                        })['catch'](function(error){
                            reject(error);
                        });
                    }
                }
            );
        },
        start: function(params){
            return new Promise(
                function(resolve, reject) {
                    params = params ? params : {};
                    v.checkHost(params);
                    //validate
                    var account = utils.validateAndReturnRequiredAccount(params, reject);
                    var realm = utils.validateAndReturnRequiredRealm(params, reject);
                    var token = utils.validateAndReturnRequiredAccessToken(params, reject);
                    var url = utils.getRealmResourceURL(v.codeURL, account, realm,
                        '', token, params.ssl);
                    v.$.post(url).then(function(response){
                        v.auth.updateLastActiveTimestamp();
                        resolve();
                    })['catch'](function(error){
                        reject(error);
                    });
                }
            );
        },
        stop: function(params){
            return new Promise(
                function(resolve, reject) {
                    params = params ? params : {};
                    v.checkHost(params);
                    //validate
                    var account = utils.validateAndReturnRequiredAccount(params, reject);
                    var realm = utils.validateAndReturnRequiredRealm(params, reject);
                    var token = utils.validateAndReturnRequiredAccessToken(params, reject);
                    var url = utils.getRealmResourceURL(v.codeURL, account, realm,
                        '', token, params.ssl);
                    v.$.doDelete(url).then(function(response){
                        v.auth.updateLastActiveTimestamp();
                        resolve();
                    })['catch'](function(error){
                        reject(error);
                    });
                }
            );
        },
        restart: function(params){
            return v.code.stop(params).then(function(){
                return v.code.start(params);
            });
        }
    };
}function ContextService(v, utils) {
    function validateRequiredState(params, reject){
        utils.validateParameter('state', 'The state parameter is required', params, reject);
    }
    function validateRequiredData(params, reject){
        utils.validateParameter('data', 'The data parameter is required', params, reject);
    }
    return {
        getUser: function(params){
            return new Promise(
                function(resolve, reject) {
                    params = params ? params : {};
                    v.checkHost(params);
                    //validate
                    var account = utils.validateAndReturnRequiredAccount(params, reject);
                    var realm = utils.validateAndReturnRequiredRealm(params, reject);
                    var token = utils.validateAndReturnRequiredAccessToken(params, reject);
                    var username = utils.validateAndReturnRequiredUsername(params, reject);
                    var url = utils.getRealmResourceURL(v.contextURL, account, realm,
                        'users/' + username, token, params.ssl);
                    v.$.getJSON(url).then(function(response){
                        v.auth.updateLastActiveTimestamp();
                        resolve(response);
                    })['catch'](function(error){
                        reject(error);
                    });
                }
            );
        },
        getUserState: function(params){
            return new Promise(
                function(resolve, reject) {
                    params = params ? params : {};
                    v.checkHost(params);
                    //validate
                    var account = utils.validateAndReturnRequiredAccount(params, reject);
                    var realm = utils.validateAndReturnRequiredRealm(params, reject);
                    var token = utils.validateAndReturnRequiredAccessToken(params, reject);
                    var username = utils.validateAndReturnRequiredUsername(params, reject);
                    var url = utils.getRealmResourceURL(v.contextURL, account, realm,
                        'users/' + username + '/state', token, params.ssl);
                    v.$.getJSON(url).then(function(response){
                        v.auth.updateLastActiveTimestamp();
                        resolve(response);
                    })['catch'](function(error){
                        reject(error);
                    });
                }
            );
        },
        setUserState: function(params){
            return new Promise(
                function(resolve, reject) {
                    params = params ? params : {};
                    validateRequiredState(params, reject);
                    v.checkHost(params);
                    //validate
                    var account = utils.validateAndReturnRequiredAccount(params, reject);
                    var realm = utils.validateAndReturnRequiredRealm(params, reject);
                    var token = utils.validateAndReturnRequiredAccessToken(params, reject);
                    var username = utils.validateAndReturnRequiredUsername(params, reject);
                    var url = utils.getRealmResourceURL(v.contextURL, account, realm,
                        'users/' + username + '/state', token, params.ssl);
                    v.$.post(url, params.state).then(function(response){
                        v.auth.updateLastActiveTimestamp();
                        resolve(response);
                    })['catch'](function(error){
                        reject(error);
                    });
                }
            );
        },
        getUserInfo: function(params){
            return new Promise(
                function(resolve, reject) {
                    params = params ? params : {};
                    v.checkHost(params);
                    //validate
                    var account = utils.validateAndReturnRequiredAccount(params, reject);
                    var realm = utils.validateAndReturnRequiredRealm(params, reject);
                    var token = utils.validateAndReturnRequiredAccessToken(params, reject);
                    var username = utils.validateAndReturnRequiredUsername(params, reject);
                    var url = utils.getRealmResourceURL(v.contextURL, account, realm,
                        'users/' + username + '/info', token, params.ssl);
                    v.$.getJSON(url).then(function(response){
                        v.auth.updateLastActiveTimestamp();
                        resolve(response);
                    })['catch'](function(error){
                        reject(error);
                    });
                }
            );
        },
        getUpdates: function(params){
            return new Promise(
                function(resolve, reject) {
                    params = params ? params : {};
                    v.checkHost(params);
                    //validate
                    var account = utils.validateAndReturnRequiredAccount(params, reject);
                    var realm = utils.validateAndReturnRequiredRealm(params, reject);
                    var token = utils.validateAndReturnRequiredAccessToken(params, reject);
                    var username = utils.validateAndReturnRequiredUsername(params, reject);
                    var url = utils.getRealmResourceURL(v.contextURL, account, realm,
                        'users/' + username + '/updates', token, params.ssl);
                    v.$.getJSON(url).then(function(response){
                        v.auth.updateLastActiveTimestamp();
                        resolve(response);
                    })['catch'](function(error){
                        reject(error);
                    });
                }
            );
        },
        getUnreadUpdates: function(params){
            return new Promise(
                function(resolve, reject) {
                    params = params ? params : {};
                    v.checkHost(params);
                    //validate
                    var account = utils.validateAndReturnRequiredAccount(params, reject);
                    var realm = utils.validateAndReturnRequiredRealm(params, reject);
                    var token = utils.validateAndReturnRequiredAccessToken(params, reject);
                    var username = utils.validateAndReturnRequiredUsername(params, reject);
                    var url = utils.getRealmResourceURL(v.contextURL, account, realm,
                        'users/' + username + '/updates/unread', token, params.ssl);
                    v.$.getJSON(url).then(function(response){
                        v.auth.updateLastActiveTimestamp();
                        resolve(response);
                    })['catch'](function(error){
                        reject(error);
                    });
                }
            );
        },
        executeContext: function(params){
            return new Promise(
                function(resolve, reject) {
                    params = params ? params : {};
                    validateRequiredData(params, reject);
                    v.checkHost(params);
                    //validate
                    var account = utils.validateAndReturnRequiredAccount(params, reject);
                    var realm = utils.validateAndReturnRequiredRealm(params, reject);
                    var token = utils.validateAndReturnRequiredAccessToken(params, reject);
                    var url = utils.getRealmResourceURL(v.contextURL, account, realm,
                        'contexts/' + params.name, token, params.ssl, {
                            op: 'exec'
                        });
                    v.$.post(url, params.data).then(function(response){
                        v.auth.updateLastActiveTimestamp();
                        resolve(response);
                    })['catch'](function(error){
                        reject(error);
                    });
                }
            );
        }
    };
}
function DeviceService(v, utils) {
    return {
        /**
         * Start live reporting of a device
         *
         * @alias startDevice
         * @param {Object} params params
         * @param {String} params.account BridgeIt Services account name. If not provided, the last known BridgeIt Account will be used.
         * @param {String} params.realm The BridgeIt Services realm. If not provided, the last known BridgeIt Realm name will be used.
         * @param {String} params.macAddress The address of the device to start.
         * @param {String} params.accessToken The BridgeIt authentication token. If not provided, the stored token from bridgeit.io.auth.connect() will be used
         */
        startDevice: function(params){
            return new Promise(function(resolve, reject) {
                params = params ? params : {};
                v.checkHost(params);
                //validate
                var account = utils.validateAndReturnRequiredAccount(params, reject);
                var realm = utils.validateAndReturnRequiredRealm(params, reject);
                var token = utils.validateAndReturnRequiredAccessToken(params, reject);
                utils.validateRequiredId(params, reject);
                var url = utils.getRealmResourceURL(v.deviceURL, account, realm,
                    params.macAddress+'/start', token, params.ssl);
                v.$.put(url, {}).then(function(){
                    v.auth.updateLastActiveTimestamp();
                    resolve();
                })['catch'](function(error){
                    reject(error);
                });
            });
        },
        /**
         * Stop live reporting of a device
         *
         * @alias stopDevice
         * @param {Object} params params
         * @param {String} params.account BridgeIt Services account name. If not provided, the last known BridgeIt Account will be used.
         * @param {String} params.realm The BridgeIt Services realm. If not provided, the last known BridgeIt Realm name will be used.
         * @param {String} params.macAddress The address of the device to stop.
         * @param {String} params.accessToken The BridgeIt authentication token. If not provided, the stored token from bridgeit.io.auth.connect() will be used
         */
        stopDevice: function(params){
            return new Promise(function(resolve, reject) {
                params = params ? params : {};
                v.checkHost(params);
                //validate
                var account = utils.validateAndReturnRequiredAccount(params, reject);
                var realm = utils.validateAndReturnRequiredRealm(params, reject);
                var token = utils.validateAndReturnRequiredAccessToken(params, reject);
                utils.validateRequiredId(params, reject);
                var url = utils.getRealmResourceURL(v.deviceURL, account, realm,
                    params.macAddress+'/stop', token, params.ssl);
                v.$.put(url, {}).then(function(){
                    v.auth.updateLastActiveTimestamp();
                    resolve();
                })['catch'](function(error){
                    reject(error);
                });
            });
        },
        /**
         * Stop all device reporting
         *
         * @alias stopDevices
         * @param {Object} params params
         * @param {String} params.account BridgeIt Services account name. If not provided, the last known BridgeIt Account will be used.
         * @param {String} params.realm The BridgeIt Services realm. If not provided, the last known BridgeIt Realm name will be used.
         * @param {String} params.accessToken The BridgeIt authentication token. If not provided, the stored token from bridgeit.io.auth.connect() will be used
         */
        stopDevices: function(params){
            return new Promise(function(resolve, reject) {
                params = params ? params : {};
                v.checkHost(params);
                //validate
                var account = utils.validateAndReturnRequiredAccount(params, reject);
                var realm = utils.validateAndReturnRequiredRealm(params, reject);
                var token = utils.validateAndReturnRequiredAccessToken(params, reject);
                utils.validateRequiredId(params, reject);
                var url = utils.getRealmResourceURL(v.deviceURL, account, realm,'/stop', token, params.ssl);
                v.$.put(url, {}).then(function(){
                    v.auth.updateLastActiveTimestamp();
                    resolve();
                })['catch'](function(error){
                    reject(error);
                });
            });
        },
        /**
         * Get all devices reporting on realm/account
         *
         * @alias getRunningDevices
         * @param {Object} params params
         * @param {String} params.account BridgeIt Services account name. If not provided, the last known BridgeIt Account will be used.
         * @param {String} params.realm The BridgeIt Services realm. If not provided, the last known BridgeIt Realm name will be used.
         * @param {String} params.accessToken The BridgeIt authentication token. If not provided, the stored token from bridgeit.io.auth.connect() will be used
         */
        getRunningDevices: function(params){
            return new Promise(function(resolve, reject) {
                params = params ? params : {};
                v.checkHost(params);
                //validate
                var account = utils.validateAndReturnRequiredAccount(params, reject);
                var realm = utils.validateAndReturnRequiredRealm(params, reject);
                var token = utils.validateAndReturnRequiredAccessToken(params, reject);
                utils.validateRequiredId(params, reject);
                var url = utils.getRealmResourceURL(v.deviceURL, account, realm,'/running', token, params.ssl);
                v.$.getJSON(url).then(function(devices){
                    v.auth.updateLastActiveTimestamp();
                    resolve(devices);
                })['catch'](function(error){
                    reject(error);
                });
            });
        }
    };
}function DocService(v, utils) {
    function validateCollection(params, reject){
        return params.collection ? params.collection : 'documents';
    }
    return {
        /**
         * Create a new document
         *
         * @alias createDocument
         * @param {Object} params params
         * @param {String} params.collection The name of the document collection.  Defaults to 'documents'.
         * @param {String} params.id The document id. If not provided, the service will return a new id
         * @param {Object} params.document The document to be created
         * @param {String} params.account BridgeIt Services account name. If not provided, the last known BridgeIt Account will be used.
         * @param {String} params.realm The BridgeIt Services realm. If not provided, the last known BridgeIt Realm name will be used.
         * @param {String} params.accessToken The BridgeIt authentication token. If not provided, the stored token from bridgeit.io.auth.connect() will be used
         * @param {String} params.host The BridgeIt Services host url. If not supplied, the last used BridgeIT host, or the default will be used. (optional)
         * @param {Boolean} params.ssl (default false) Whether to use SSL for network traffic.
         * @returns {String} The resource URI
         */
        createDocument: function(params){
            return new Promise(
                function(resolve, reject) {
                    params = params ? params : {};
                    v.checkHost(params);
                    //validate
                    var account = utils.validateAndReturnRequiredAccount(params, reject);
                    var realm = utils.validateAndReturnRequiredRealm(params, reject);
                    var collection = validateCollection(params, reject);
                    var token = utils.validateAndReturnRequiredAccessToken(params, reject);
                    var url = utils.getRealmResourceURL(v.documentsURL, account, realm,
                        collection + '/' + (params.id ? params.id : ''), token, params.ssl);
                    v.$.post(url, params.document).then(function(response){
                        v.auth.updateLastActiveTimestamp();
                        resolve(response.uri);
                    })['catch'](function(error){
                        reject(error);
                    });
                }
            );
        },
        /**
         * Update a document
         *
         * @alias updateDocument
         * @param {Object} params params
         * @param {String} params.collection The name of the document collection.  Defaults to 'documents'.
         * @param {String} params.id The document id.
         * @param {Object} params.document The document to be created
         * @param {String} params.account BridgeIt Services account name. If not provided, the last known BridgeIt Account will be used.
         * @param {String} params.realm The BridgeIt Services realm. If not provided, the last known BridgeIt Realm name will be used.
         * @param {String} params.accessToken The BridgeIt authentication token. If not provided, the stored token from bridgeit.io.auth.connect() will be used
         * @param {String} params.host The BridgeIt Services host url. If not supplied, the last used BridgeIT host, or the default will be used. (optional)
         * @param {Boolean} params.ssl (default false) Whether to use SSL for network traffic.
         * @returns {String} The resource URI
         */
        updateDocument: function(params){
            return new Promise(
                function(resolve, reject) {
                    params = params ? params : {};
                    v.checkHost(params);
                    //validate
                    var account = utils.validateAndReturnRequiredAccount(params, reject);
                    var realm = utils.validateAndReturnRequiredRealm(params, reject);
                    var collection = validateCollection(params, reject);
                    var token = utils.validateAndReturnRequiredAccessToken(params, reject);
                    utils.validateRequiredId(params, reject);
                    var url = utils.getRealmResourceURL(v.documentsURL, account, realm,
                        collection + '/' + params.id, token, params.ssl);
                    v.$.put(url, params.document).then(function(){
                        v.auth.updateLastActiveTimestamp();
                        resolve();
                    })['catch'](function(error){
                        reject(error);
                    });
                }
            );
        },
        /**
         * Fetch a document
         *
         * @alias getDocument
         * @param {Object} params params
         * @param {String} params.collection The name of the document collection.  Defaults to 'documents'.
         * @param {String} params.id The document id. If not provided, the service will return a new id
         * @param {String} params.account BridgeIt Services account name. If not provided, the last known BridgeIt Account will be used.
         * @param {String} params.realm The BridgeIt Services realm. If not provided, the last known BridgeIt Realm name will be used.
         * @param {String} params.accessToken The BridgeIt authentication token. If not provided, the stored token from bridgeit.io.auth.connect() will be used
         * @param {String} params.host The BridgeIt Services host url. If not supplied, the last used BridgeIT host, or the default will be used. (optional)
         * @param {Boolean} params.ssl (default false) Whether to use SSL for network traffic.
         * @returns {Object} The document
         */
        getDocument: function(params){
            return new Promise(
                function(resolve, reject) {
                    params = params ? params : {};
                    v.checkHost(params);
                    //validate
                    var account = utils.validateAndReturnRequiredAccount(params, reject);
                    var realm = utils.validateAndReturnRequiredRealm(params, reject);
                    var collection = validateCollection(params, reject);
                    var token = utils.validateAndReturnRequiredAccessToken(params, reject);
                    utils.validateRequiredId(params, reject);
                    var url = utils.getRealmResourceURL(v.documentsURL, account, realm,
                        collection + '/' + params.id, token, params.ssl);
                    v.$.getJSON(url).then(function(doc){
                        v.auth.updateLastActiveTimestamp();
                        //the document service always returns a list, so
                        //check if we have a list of one, and if so, return the single item
                        if( doc.length && doc.length === 1 ){
                            resolve(doc[0]);
                        }
                        else{
                            resolve(doc);
                        }
                    })['catch'](function(error){
                        reject(error);
                    });
                }
            );
        },
        /**
         * Searches for documents in a realm based on a query
         *
         * @alias findDocuments
         * @param {Object} params params
         * @param {String} params.collection The name of the document collection.  Defaults to 'documents'.
         * @param {String} params.account BridgeIt Services account name. If not provided, the last known BridgeIt Account will be used.
         * @param {String} params.realm The BridgeIt Services realm. If not provided, the last known BridgeIt Realm name will be used.
         * @param {String} params.accessToken The BridgeIt authentication token. If not provided, the stored token from bridgeit.io.auth.connect() will be used
         * @param {String} params.host The BridgeIt Services host url. If not supplied, the last used BridgeIT host, or the default will be used. (optional)
         * @param {Boolean} params.ssl (default false) Whether to use SSL for network traffic.
         * @param {Object} params.query A mongo query for the documents
         * @param {Object} params.fields Specify the inclusion or exclusion of fields to return in the result set
         * @param {Object} params.options Additional query options such as limit and sort
         * @returns {Object} The results
         */
        findDocuments: function(params){
            return new Promise(
                function(resolve, reject) {
                    params = params ? params : {};
                    v.checkHost(params);
                    //validate
                    var account = utils.validateAndReturnRequiredAccount(params, reject);
                    var realm = utils.validateAndReturnRequiredRealm(params, reject);
                    var collection = validateCollection(params, reject);
                    var token = utils.validateAndReturnRequiredAccessToken(params, reject);
                    var url = utils.getRealmResourceURL(v.documentsURL, account, realm,
                        collection, token, params.ssl, {
                            'query': params.query ? encodeURIComponent(JSON.stringify(params.query)) : {},
                            'fields': params.fields ? encodeURIComponent(JSON.stringify(params.fields)) : {},
                            'options': params.options ? encodeURIComponent(JSON.stringify(params.options)) : {}
                        });
                    v.$.getJSON(url).then(function(doc){
                        v.auth.updateLastActiveTimestamp();
                        resolve(doc);
                    })['catch'](function(response){
                        //service currently returns a 404 when no documents are found
                        if( response.status == 404 ){
                            resolve(null);
                        }
                        else{
                            reject(response);
                        }
                    });
                }
            );
        },
        /**
         * Delete a new document
         *
         * @alias deleteDocument
         * @param {Object} params params
         * @param {String} params.collection The name of the document collection.  Defaults to 'documents'.
         * @param {String} params.id The document id. If not provided, the service will return a new id
         * @param {String} params.account BridgeIt Services account name. If not provided, the last known BridgeIt Account will be used.
         * @param {String} params.realm The BridgeIt Services realm. If not provided, the last known BridgeIt Realm name will be used.
         * @param {String} params.accessToken The BridgeIt authentication token. If not provided, the stored token from bridgeit.io.auth.connect() will be used
         * @param {String} params.host The BridgeIt Services host url. If not supplied, the last used BridgeIT host, or the default will be used. (optional)
         * @param {Boolean} params.ssl (default false) Whether to use SSL for network traffic.
         */
        deleteDocument: function(params){
            return new Promise(
                function(resolve, reject) {
                    params = params ? params : {};
                    v.checkHost(params);
                    //validate
                    var account = utils.validateAndReturnRequiredAccount(params, reject);
                    var realm = utils.validateAndReturnRequiredRealm(params, reject);
                    var collection = validateCollection(params, reject);
                    var token = utils.validateAndReturnRequiredAccessToken(params, reject);
                    utils.validateRequiredId(params, reject);
                    var url = utils.getRealmResourceURL(v.documentsURL, account, realm,
                        collection + '/' + params.id, token, params.ssl);
                    v.$.doDelete(url).then(function(response){
                        v.auth.updateLastActiveTimestamp();
                        resolve();
                    })['catch'](function(error){
                        reject(error);
                    });
                }
            );
        }
    };
}function EventHubService (v, utils) {
    function validateRequiredHandler(params, reject){
        utils.validateParameter('handler', 'The handler parameter is required', params, reject);
    }
    function validateRequiredRecognizer(params, reject){
        utils.validateParameter('handler', 'The recognizer parameter is required', params, reject);
    }
    return {
        /**
         * Create a new event handler
         *
         * @alias createHandler
         * @param {Object} params params
         * @param {String} params.id The handler id
         * @param {Object} params.handler The event handler to be created
         * @param {String} params.account BridgeIt Services account name. If not provided, the last known BridgeIt Account will be used.
         * @param {String} params.realm The BridgeIt Services realm. If not provided, the last known BridgeIt Realm name will be used.
         * @param {String} params.accessToken The BridgeIt authentication token. If not provided, the stored token from bridgeit.io.auth.connect() will be used
         * @param {String} params.host The BridgeIt Services host url. If not supplied, the last used BridgeIt host, or the default will be used. (optional)
         * @param {Boolean} params.ssl (default false) Whether to use SSL for network traffic.
         * @returns {String} The resource URI
         */
        createHandler: function(params){
            return new Promise(
                function(resolve, reject) {
                    params = params ? params : {};
                    v.checkHost(params);
                    //validate
                    var account = utils.validateAndReturnRequiredAccount(params, reject);
                    var realm = utils.validateAndReturnRequiredRealm(params, reject);
                    var token = utils.validateAndReturnRequiredAccessToken(params, reject);
                    validateRequiredHandler(params, reject);
                    var url = utils.getRealmResourceURL(v.eventhubURL, account, realm,
                        'handlers/' + (params.id ? params.id : ''), token, params.ssl);
                    v.$.post(url, params.handler).then(function(response){
                        v.auth.updateLastActiveTimestamp();
                        resolve(response.uri);
                    })['catch'](function(error){
                        reject(error);
                    });
                }
            );
        },
        /**
         * Update an event handler
         *
         * @alias updateHandler
         * @param {Object} params params
         * @param {String} params.id The handler id, the event handler to be updated
         * @param {Object} params.handler The new event handler
         * @param {String} params.account BridgeIt Services account name. If not provided, the last known BridgeIt Account will be used.
         * @param {String} params.realm The BridgeIt Services realm. If not provided, the last known BridgeIt Realm name will be used.
         * @param {String} params.accessToken The BridgeIt authentication token. If not provided, the stored token from bridgeit.io.auth.connect() will be used
         * @param {String} params.host The BridgeIt Services host url. If not supplied, the last used BridgeIT host, or the default will be used. (optional)
         * @param {Boolean} params.ssl (default false) Whether to use SSL for network traffic.
         */
        updateHandler: function(params){
            return new Promise(
                function(resolve, reject) {
                    params = params ? params : {};
                    v.checkHost(params);
                    //validate
                    var account = utils.validateAndReturnRequiredAccount(params, reject);
                    var realm = utils.validateAndReturnRequiredRealm(params, reject);
                    var token = utils.validateAndReturnRequiredAccessToken(params, reject);
                    utils.validateRequiredId(params, reject);
                    validateRequiredHandler(params, reject);
                    var url = utils.getRealmResourceURL(v.eventhubURL, account, realm,
                        'handlers/' + params.id, token, params.ssl);
                    v.$.put(url, params.handler).then(function(){
                        v.auth.updateLastActiveTimestamp();
                        resolve();
                    })['catch'](function(error){
                        reject(error);
                    });
                }
            );
        },
        /**
         * Fetch an event handler
         *
         * @alias getHandler
         * @param {Object} params params
         * @param {String} params.id The handler id, the event handler to fetch
         * @param {String} params.account BridgeIt Services account name. If not provided, the last known BridgeIt Account will be used.
         * @param {String} params.realm The BridgeIt Services realm. If not provided, the last known BridgeIt Realm name will be used.
         * @param {String} params.accessToken The BridgeIt authentication token. If not provided, the stored token from bridgeit.io.auth.connect() will be used
         * @param {String} params.host The BridgeIt Services host url. If not supplied, the last used BridgeIT host, or the default will be used. (optional)
         * @param {Boolean} params.ssl (default false) Whether to use SSL for network traffic.
         * @returns {Object} The event handler
         */
        getHandler: function(params){
            return new Promise(
                function(resolve, reject) {
                    params = params ? params : {};
                    v.checkHost(params);
                    //validate
                    var account = utils.validateAndReturnRequiredAccount(params, reject);
                    var realm = utils.validateAndReturnRequiredRealm(params, reject);
                    var token = utils.validateAndReturnRequiredAccessToken(params, reject);
                    utils.validateRequiredId(params, reject);
                    var url = utils.getRealmResourceURL(v.eventhubURL, account, realm,
                        'handlers/' + params.id, token, params.ssl);
                    v.$.getJSON(url).then(function(handler){
                        v.auth.updateLastActiveTimestamp();
                        resolve(handler);
                    })['catch'](function(error){
                        reject(error);
                    });
                }
            );
        },
        /**
         * Searches for event handlers in a realm based on a query
         *
         * @alias findHandlers
         * @param {Object} params params
         * @param {String} params.account BridgeIt Services account name. If not provided, the last known BridgeIt Account will be used.
         * @param {String} params.realm The BridgeIt Services realm. If not provided, the last known BridgeIt Realm name will be used.
         * @param {String} params.accessToken The BridgeIt authentication token. If not provided, the stored token from bridgeit.io.auth.connect() will be used
         * @param {String} params.host The BridgeIt Services host url. If not supplied, the last used BridgeIT host, or the default will be used. (optional)
         * @param {Boolean} params.ssl (default false) Whether to use SSL for network traffic.
         * @param {Object} params.query A mongo query for the event handlers
         * @param {Object} params.fields Specify the inclusion or exclusion of fields to return in the result set
         * @param {Object} params.options Additional query options such as limit and sort
         * @returns {Object} The results
         */
        findHandlers: function(params){
            return new Promise(
                function(resolve, reject) {
                    params = params ? params : {};
                    v.checkHost(params);
                    //validate
                    var account = utils.validateAndReturnRequiredAccount(params, reject);
                    var realm = utils.validateAndReturnRequiredRealm(params, reject);
                    var token = utils.validateAndReturnRequiredAccessToken(params, reject);
                    var url = utils.getRealmResourceURL(v.eventhubURL, account, realm,
                        'handlers/', token, params.ssl, {
                            'query': params.query ? encodeURIComponent(JSON.stringify(params.query)) : {},
                            'fields': params.fields ? encodeURIComponent(JSON.stringify(params.fields)) : {},
                            'options': params.options ? encodeURIComponent(JSON.stringify(params.options)) : {}
                        });
                    v.$.getJSON(url).then(function(handlers){
                        v.auth.updateLastActiveTimestamp();
                        resolve(handlers);
                    })['catch'](function(response){
                        reject(response);
                    });
                }
            );
        },
        /**
         * Delete an event handler
         *
         * @alias deleteHandler
         * @param {Object} params params
         * @param {String} params.id The handler id, the event handler to be deleted
         * @param {String} params.account BridgeIt Services account name. If not provided, the last known BridgeIt Account will be used.
         * @param {String} params.realm The BridgeIt Services realm. If not provided, the last known BridgeIt Realm name will be used.
         * @param {String} params.accessToken The BridgeIt authentication token. If not provided, the stored token from bridgeit.io.auth.connect() will be used
         * @param {String} params.host The BridgeIt Services host url. If not supplied, the last used BridgeIT host, or the default will be used. (optional)
         * @param {Boolean} params.ssl (default false) Whether to use SSL for network traffic.
         */
        deleteHandler: function(params){
            return new Promise(
                function(resolve, reject) {
                    params = params ? params : {};
                    v.checkHost(params);
                    //validate
                    var account = utils.validateAndReturnRequiredAccount(params, reject);
                    var realm = utils.validateAndReturnRequiredRealm(params, reject);
                    var token = utils.validateAndReturnRequiredAccessToken(params, reject);
                    utils.validateRequiredId(params, reject);
                    var url = utils.getRealmResourceURL(v.eventhubURL, account, realm,
                        'handlers/' + params.id, token, params.ssl);
                    v.$.doDelete(url).then(function(){
                        v.auth.updateLastActiveTimestamp();
                        resolve();
                    })['catch'](function(error){
                        reject(error);
                    });
                }
            );
        },
        /**
         * Delete event handlers in a realm based on a query
         *
         * @alias deleteHandlers
         * @param {Object} params params
         * @param {String} params.account BridgeIt Services account name. If not provided, the last known BridgeIt Account will be used.
         * @param {String} params.realm The BridgeIt Services realm. If not provided, the last known BridgeIt Realm name will be used.
         * @param {String} params.accessToken The BridgeIt authentication token. If not provided, the stored token from bridgeit.io.auth.connect() will be used
         * @param {String} params.host The BridgeIt Services host url. If not supplied, the last used BridgeIT host, or the default will be used. (optional)
         * @param {Boolean} params.ssl (default false) Whether to use SSL for network traffic.
         * @param {Object} params.query A mongo query for the event handlers
         * @param {Object} params.fields Specify the inclusion or exclusion of fields to return in the result set
         * @param {Object} params.options Additional query options such as limit and sort
         */
        deleteHandlers: function(params){
            return new Promise(
                function(resolve, reject) {
                    params = params ? params : {};
                    v.checkHost(params);
                    //validate
                    var account = utils.validateAndReturnRequiredAccount(params, reject);
                    var realm = utils.validateAndReturnRequiredRealm(params, reject);
                    var token = utils.validateAndReturnRequiredAccessToken(params, reject);
                    var url = utils.getRealmResourceURL(v.eventhubURL, account, realm,
                        'handlers/', token, params.ssl, {
                            'query': params.query ? encodeURIComponent(JSON.stringify(params.query)) : {},
                            'fields': params.fields ? encodeURIComponent(JSON.stringify(params.fields)) : {},
                            'options': params.options ? encodeURIComponent(JSON.stringify(params.options)) : {}
                        });
                    v.$.doDelete(url).then(function(){
                        v.auth.updateLastActiveTimestamp();
                        resolve();
                    })['catch'](function(error){
                        reject(error);
                    });
                }
            );
        },
        /**
         * Create a new event recognizer
         *
         * @alias createRecognizer
         * @param {Object} params params
         * @param {String} params.id The recognizer id
         * @param {Object} params.recognizer The event recognizer to be created
         * @param {String} params.account BridgeIt Services account name. If not provided, the last known BridgeIt Account will be used.
         * @param {String} params.realm The BridgeIt Services realm. If not provided, the last known BridgeIt Realm name will be used.
         * @param {String} params.accessToken The BridgeIt authentication token. If not provided, the stored token from bridgeit.io.auth.connect() will be used
         * @param {String} params.host The BridgeIt Services host url. If not supplied, the last used BridgeIt host, or the default will be used. (optional)
         * @param {Boolean} params.ssl (default false) Whether to use SSL for network traffic.
         * @returns {String} The resource URI
         */
        createRecognizer: function(params) {
            return new Promise(
                function(resolve, reject) {
                    params = params ? params : {};
                    v.checkHost(params);
                    //validate
                    var account = utils.validateAndReturnRequiredAccount(params, reject);
                    var realm = utils.validateAndReturnRequiredRealm(params, reject);
                    var token = utils.validateAndReturnRequiredAccessToken(params, reject);
                    validateRequiredRecognizer(params, reject);
                    var url = utils.getRealmResourceURL(v.eventhubURL, account, realm,
                        'recognizers/' + (params.id ? params.id : ''), token, params.ssl);
                    v.$.post(url, params.recognizer).then(function(response) {
                        v.auth.updateLastActiveTimestamp();
                        resolve(response.uri);
                    })['catch'](function(error) {
                        reject(error);
                    });
                }
            );
        },
        /**
         * Update an event recognizer
         *
         * @alias updateRecognizer
         * @param {Object} params params
         * @param {String} params.id The recognizer id, the event recognizer to be updated
         * @param {Object} params.recognizer The new event recognizer
         * @param {String} params.account BridgeIt Services account name. If not provided, the last known BridgeIt Account will be used.
         * @param {String} params.realm The BridgeIt Services realm. If not provided, the last known BridgeIt Realm name will be used.
         * @param {String} params.accessToken The BridgeIt authentication token. If not provided, the stored token from bridgeit.io.auth.connect() will be used
         * @param {String} params.host The BridgeIt Services host url. If not supplied, the last used BridgeIT host, or the default will be used. (optional)
         * @param {Boolean} params.ssl (default false) Whether to use SSL for network traffic.
         */
        updateRecognizer: function(params) {
            return new Promise(
                function(resolve, reject) {
                    params = params ? params : {};
                    v.checkHost(params);
                    //validate
                    var account = utils.validateAndReturnRequiredAccount(params, reject);
                    var realm = utils.validateAndReturnRequiredRealm(params, reject);
                    var token = utils.validateAndReturnRequiredAccessToken(params, reject);
                    utils.validateRequiredId(params, reject);
                    validateRequiredRecognizer(params, reject);
                    var url = utils.getRealmResourceURL(v.eventhubURL, account, realm,
                        'recognizers/' + params.id, token, params.ssl);
                    v.$.put(url, params.recognizer).then(function() {
                        v.auth.updateLastActiveTimestamp();
                        resolve();
                    })['catch'](function(error) {
                        reject(error);
                    });
                }
            );
        },
        /**
         * Fetch an event recognizer
         *
         * @alias getRecognizer
         * @param {Object} params params
         * @param {String} params.id The recognizer id, the event recognizer to fetch
         * @param {String} params.account BridgeIt Services account name. If not provided, the last known BridgeIt Account will be used.
         * @param {String} params.realm The BridgeIt Services realm. If not provided, the last known BridgeIt Realm name will be used.
         * @param {String} params.accessToken The BridgeIt authentication token. If not provided, the stored token from bridgeit.io.auth.connect() will be used
         * @param {String} params.host The BridgeIt Services host url. If not supplied, the last used BridgeIT host, or the default will be used. (optional)
         * @param {Boolean} params.ssl (default false) Whether to use SSL for network traffic.
         * @returns {Object} The event recognizer
         */
        getRecognizer: function(params) {
            return new Promise(
                function(resolve, reject) {
                    params = params ? params : {};
                    v.checkHost(params);
                    //validate
                    var account = utils.validateAndReturnRequiredAccount(params, reject);
                    var realm = utils.validateAndReturnRequiredRealm(params, reject);
                    var token = utils.validateAndReturnRequiredAccessToken(params, reject);
                    utils.validateRequiredId(params, reject);
                    var url = utils.getRealmResourceURL(v.eventhubURL, account, realm,
                        'recognizers/' + params.id, token, params.ssl);
                    v.$.getJSON(url).then(function(recognizer) {
                        v.auth.updateLastActiveTimestamp();
                        resolve(recognizer);
                    })['catch'](function(error) {
                        reject(error);
                    });
                }
            );
        },
        /**
         * Searches for event recognizers in a realm based on a query
         *
         * @alias findRecognizers
         * @param {Object} params params
         * @param {String} params.account BridgeIt Services account name. If not provided, the last known BridgeIt Account will be used.
         * @param {String} params.realm The BridgeIt Services realm. If not provided, the last known BridgeIt Realm name will be used.
         * @param {String} params.accessToken The BridgeIt authentication token. If not provided, the stored token from bridgeit.io.auth.connect() will be used
         * @param {String} params.host The BridgeIt Services host url. If not supplied, the last used BridgeIT host, or the default will be used. (optional)
         * @param {Boolean} params.ssl (default false) Whether to use SSL for network traffic.
         * @param {Object} params.query A mongo query for the event recognizers
         * @param {Object} params.fields Specify the inclusion or exclusion of fields to return in the result set
         * @param {Object} params.options Additional query options such as limit and sort
         * @returns {Object} The results
         */
        findRecognizers: function(params) {
            return new Promise(
                function(resolve, reject) {
                    params = params ? params : {};
                    v.checkHost(params);
                    //validate
                    var account = utils.validateAndReturnRequiredAccount(params, reject);
                    var realm = utils.validateAndReturnRequiredRealm(params, reject);
                    var token = utils.validateAndReturnRequiredAccessToken(params, reject);
                    var url = utils.getRealmResourceURL(v.eventhubURL, account, realm,
                        'recognizers/', token, params.ssl, {
                            'query': params.query ? encodeURIComponent(JSON.stringify(params.query)) : {},
                            'fields': params.fields ? encodeURIComponent(JSON.stringify(params.fields)) : {},
                            'options': params.options ? encodeURIComponent(JSON.stringify(params.options)) : {}
                        });
                    v.$.getJSON(url).then(function(recognizers) {
                        v.auth.updateLastActiveTimestamp();
                        resolve(recognizers);
                    })['catch'](function(response) {
                        reject(response);
                    });
                }
            );
        },
        /**
         * Delete an event recognizer
         *
         * @alias deleteRecognizer
         * @param {Object} params params
         * @param {String} params.id The recognizer id, the event recognizer to be deleted
         * @param {String} params.account BridgeIt Services account name. If not provided, the last known BridgeIt Account will be used.
         * @param {String} params.realm The BridgeIt Services realm. If not provided, the last known BridgeIt Realm name will be used.
         * @param {String} params.accessToken The BridgeIt authentication token. If not provided, the stored token from bridgeit.io.auth.connect() will be used
         * @param {String} params.host The BridgeIt Services host url. If not supplied, the last used BridgeIT host, or the default will be used. (optional)
         * @param {Boolean} params.ssl (default false) Whether to use SSL for network traffic.
         */
        deleteRecognizer: function(params) {
            return new Promise(
                function(resolve, reject) {
                    params = params ? params : {};
                    v.checkHost(params);
                    //validate
                    var account = utils.validateAndReturnRequiredAccount(params, reject);
                    var realm = utils.validateAndReturnRequiredRealm(params, reject);
                    var token = utils.validateAndReturnRequiredAccessToken(params, reject);
                    utils.validateRequiredId(params, reject);
                    var url = utils.getRealmResourceURL(v.eventhubURL, account, realm,
                        'recognizers/' + params.id, token, params.ssl);
                    v.$.doDelete(url).then(function() {
                        v.auth.updateLastActiveTimestamp();
                        resolve();
                    })['catch'](function(error) {
                        reject(error);
                    });
                }
            );
        },
        /**
         * Delete event recognizers in a realm based on a query
         *
         * @alias deleteRecognizers
         * @param {Object} params params
         * @param {String} params.account BridgeIt Services account name. If not provided, the last known BridgeIt Account will be used.
         * @param {String} params.realm The BridgeIt Services realm. If not provided, the last known BridgeIt Realm name will be used.
         * @param {String} params.accessToken The BridgeIt authentication token. If not provided, the stored token from bridgeit.io.auth.connect() will be used
         * @param {String} params.host The BridgeIt Services host url. If not supplied, the last used BridgeIT host, or the default will be used. (optional)
         * @param {Boolean} params.ssl (default false) Whether to use SSL for network traffic.
         * @param {Object} params.query A mongo query for the event recognizers
         * @param {Object} params.fields Specify the inclusion or exclusion of fields to return in the result set
         * @param {Object} params.options Additional query options such as limit and sort
         */
        deleteRecognizers: function(params) {
            return new Promise(
                function(resolve, reject) {
                    params = params ? params : {};
                    v.checkHost(params);
                    //validate
                    var account = utils.validateAndReturnRequiredAccount(params, reject);
                    var realm = utils.validateAndReturnRequiredRealm(params, reject);
                    var token = utils.validateAndReturnRequiredAccessToken(params, reject);
                    var url = utils.getRealmResourceURL(v.eventhubURL, account, realm,
                        'recognizers/', token, params.ssl, {
                            'query': params.query ? encodeURIComponent(JSON.stringify(params.query)) : {},
                            'fields': params.fields ? encodeURIComponent(JSON.stringify(params.fields)) : {},
                            'options': params.options ? encodeURIComponent(JSON.stringify(params.options)) : {}
                        });
                    v.$.doDelete(url).then(function() {
                        v.auth.updateLastActiveTimestamp();
                        resolve();
                    })['catch'](function(error) {
                        reject(error);
                    });
                }
            );
        }
    };
}function LocateService(v, utils) {
    function validateRequiredRegion(params, reject){
        utils.validateParameter('region', 'The region parameter is required', params, reject);
    }
    function validateRequiredMonitor(params, reject){
        utils.validateParameter('monitor', 'The monitor parameter is required', params, reject);
    }
    function validateRequiredPOI(params, reject){
        utils.validateParameter('poi', 'The poi parameter is required', params, reject);
    }
    function validateRequiredLocation(params, reject){
        utils.validateParameter('location', 'The location parameter is required', params, reject);
    }
    function validateRequiredLat(params, reject){
        utils.validateParameter('lat', 'The lat parameter is required', params, reject);
    }
    function validateRequiredLon(params, reject){
        utils.validateParameter('lon', 'The lon parameter is required', params, reject);
    }
    return {
        /**
         * Create a new region
         *
         * @alias createRegion
         * @param {Object} params params
         * @param {String} params.id The region id. If not provided, the service will return a new id
         * @param {Object} params.region The region geoJSON document that describes the region to be created
         * @param {String} params.account BridgeIt Services account name. If not provided, the last known BridgeIt Account will be used.
         * @param {String} params.realm The BridgeIt Services realm. If not provided, the last known BridgeIt Realm name will be used.
         * @param {String} params.accessToken The BridgeIt authentication token. If not provided, the stored token from bridgeit.io.auth.connect() will be used
         * @param {String} params.host The BridgeIt Services host url. If not supplied, the last used BridgeIT host, or the default will be used. (optional)
         * @param {Boolean} params.ssl (default false) Whether to use SSL for network traffic.
         * @returns {String} The resource URI
         */
        createRegion: function(params){
            return new Promise(
                function(resolve, reject) {
                    params = params ? params : {};
                    v.checkHost(params);
                    //validate
                    var account = utils.validateAndReturnRequiredAccount(params, reject);
                    var realm = utils.validateAndReturnRequiredRealm(params, reject);
                    var token = utils.validateAndReturnRequiredAccessToken(params, reject);
                    validateRequiredRegion(params, reject);
                    var url = utils.getRealmResourceURL(v.locateURL, account, realm,
                        'regions/' + (params.id ? params.id : ''), token, params.ssl);
                    v.$.post(url, params.region).then(function(response){
                        v.auth.updateLastActiveTimestamp();
                        resolve(response.uri);
                    })['catch'](function(error){
                        reject(error);
                    });
                }
            );
        },
        /**
         * Update a region
         *
         * @alias updateRegion
         * @param {Object} params params
         * @param {String} params.id The region id, the region to be updated
         * @param {Object} params.region The new region
         * @param {String} params.account BridgeIt Services account name. If not provided, the last known BridgeIt Account will be used.
         * @param {String} params.realm The BridgeIt Services realm. If not provided, the last known BridgeIt Realm name will be used.
         * @param {String} params.accessToken The BridgeIt authentication token. If not provided, the stored token from bridgeit.io.auth.connect() will be used
         * @param {String} params.host The BridgeIt Services host url. If not supplied, the last used BridgeIT host, or the default will be used. (optional)
         * @param {Boolean} params.ssl (default false) Whether to use SSL for network traffic.
         */
        updateRegion: function(params){
            return new Promise(
                function(resolve, reject) {
                    params = params ? params : {};
                    v.checkHost(params);
                    //validate
                    var account = utils.validateAndReturnRequiredAccount(params, reject);
                    var realm = utils.validateAndReturnRequiredRealm(params, reject);
                    var token = utils.validateAndReturnRequiredAccessToken(params, reject);
                    utils.validateRequiredId(params, reject);
                    validateRequiredRegion(params, reject);
                    var url = utils.getRealmResourceURL(v.locateURL, account, realm,
                        'regions/' + params.id, token, params.ssl);
                    v.$.put(url, params.region).then(function(){
                        v.auth.updateLastActiveTimestamp();
                        resolve();
                    })['catch'](function(error){
                        reject(error);
                    });
                }
            );
        },
        /**
         * Delete a new region
         *
         * @alias deleteRegion
         * @param {Object} params params
         * @param {String} params.id The region id.
         * @param {String} params.account BridgeIt Services account name. If not provided, the last known BridgeIt Account will be used.
         * @param {String} params.realm The BridgeIt Services realm. If not provided, the last known BridgeIt Realm name will be used.
         * @param {String} params.accessToken The BridgeIt authentication token. If not provided, the stored token from bridgeit.io.auth.connect() will be used
         * @param {String} params.host The BridgeIt Services host url. If not supplied, the last used BridgeIT host, or the default will be used. (optional)
         * @param {Boolean} params.ssl (default false) Whether to use SSL for network traffic.
         */
        deleteRegion: function(params){
            return new Promise(
                function(resolve, reject) {
                    params = params ? params : {};
                    v.checkHost(params);
                    //validate
                    var account = utils.validateAndReturnRequiredAccount(params, reject);
                    var realm = utils.validateAndReturnRequiredRealm(params, reject);
                    var token = utils.validateAndReturnRequiredAccessToken(params, reject);
                    utils.validateRequiredId(params, reject);
                    var url = utils.getRealmResourceURL(v.locateURL, account, realm,
                        'regions/' + params.id, token, params.ssl);
                    v.$.doDelete(url).then(function(response){
                        v.auth.updateLastActiveTimestamp();
                        resolve();
                    })['catch'](function(error){
                        reject(error);
                    });
                }
            );
        },
        /**
         * Fetches all saved regions for the realm
         *
         * @alias getAllRegions
         * @param {Object} params params
         * @param {String} params.account BridgeIt Services account name. If not provided, the last known BridgeIt Account will be used.
         * @param {String} params.realm The BridgeIt Services realm. If not provided, the last known BridgeIt Realm name will be used.
         * @param {String} params.accessToken The BridgeIt authentication token. If not provided, the stored token from bridgeit.io.auth.connect() will be used
         * @param {String} params.host The BridgeIt Services host url. If not supplied, the last used BridgeIT host, or the default will be used. (optional)
         * @param {Boolean} params.ssl (default false) Whether to use SSL for network traffic.
         * @returns {Object} The results
         */
        getAllRegions: function(params){
            return new Promise(
                function(resolve, reject) {
                    params = params ? params : {};
                    v.checkHost(params);
                    //validate
                    var account = utils.validateAndReturnRequiredAccount(params, reject);
                    var realm = utils.validateAndReturnRequiredRealm(params, reject);
                    var token = utils.validateAndReturnRequiredAccessToken(params, reject);
                    var url = utils.getRealmResourceURL(v.locateURL, account, realm,
                        'regions', token, params.ssl);
                    v.$.getJSON(url).then(function(response){
                        v.auth.updateLastActiveTimestamp();
                        resolve(response);
                    })['catch'](function(error){
                        reject(error);
                    });
                }
            );
        },
        /**
         * Searches for regions in a realm based on a query
         *
         * @alias findRegions
         * @param {Object} params params
         * @param {String} params.account BridgeIt Services account name. If not provided, the last known BridgeIt Account will be used.
         * @param {String} params.realm The BridgeIt Services realm. If not provided, the last known BridgeIt Realm name will be used.
         * @param {String} params.accessToken The BridgeIt authentication token. If not provided, the stored token from bridgeit.io.auth.connect() will be used
         * @param {String} params.host The BridgeIt Services host url. If not supplied, the last used BridgeIT host, or the default will be used. (optional)
         * @param {Boolean} params.ssl (default false) Whether to use SSL for network traffic.
         * @param {Object} params.query A mongo query for the regions
         * @param {Object} params.fields Specify the inclusion or exclusion of fields to return in the result set
         * @param {Object} params.options Additional query options such as limit and sort
         * @returns {Object} The results
         */
        findRegions: function(params){
            return new Promise(
                function(resolve, reject) {
                    params = params ? params : {};
                    v.checkHost(params);
                    //validate
                    var account = utils.validateAndReturnRequiredAccount(params, reject);
                    var realm = utils.validateAndReturnRequiredRealm(params, reject);
                    var token = utils.validateAndReturnRequiredAccessToken(params, reject);
                    var url = utils.getRealmResourceURL(v.locateURL, account, realm,
                        'regions', token, params.ssl, {
                            'query': params.query ? encodeURIComponent(JSON.stringify(params.query)) : {},
                            'fields': params.fields ? encodeURIComponent(JSON.stringify(params.fields)) : {},
                            'options': params.options ? encodeURIComponent(JSON.stringify(params.options)) : {}
                        });
                    v.$.getJSON(url).then(function(response){
                        v.auth.updateLastActiveTimestamp();
                        resolve(response);
                    })['catch'](function(error){
                        if( error.status === 404 ){
                            resolve();
                        }
                        else{
                            reject(error);
                        }
                    });
                }
            );
        },
        /**
         * Searches for monitors in a realm based on a query
         *
         * @alias findMonitors
         * @param {Object} params params
         * @param {String} params.account BridgeIt Services account name. If not provided, the last known BridgeIt Account will be used.
         * @param {String} params.realm The BridgeIt Services realm. If not provided, the last known BridgeIt Realm name will be used.
         * @param {String} params.accessToken The BridgeIt authentication token. If not provided, the stored token from bridgeit.io.auth.connect() will be used
         * @param {String} params.host The BridgeIt Services host url. If not supplied, the last used BridgeIT host, or the default will be used. (optional)
         * @param {Boolean} params.ssl (default false) Whether to use SSL for network traffic.
         * @param {Object} params.query A mongo query for the monitors
         * @param {Object} params.fields Specify the inclusion or exclusion of fields to return in the result set
         * @param {Object} params.options Additional query options such as limit and sort
         * @returns {Object} The results
         */
        findMonitors: function(params){
            return new Promise(
                function(resolve, reject) {
                    params = params ? params : {};
                    v.checkHost(params);
                    //validate
                    var account = utils.validateAndReturnRequiredAccount(params, reject);
                    var realm = utils.validateAndReturnRequiredRealm(params, reject);
                    var token = utils.validateAndReturnRequiredAccessToken(params, reject);
                    var url = utils.getRealmResourceURL(v.locateURL, account, realm,
                        'monitors', token, params.ssl, {
                            'query': params.query ? encodeURIComponent(JSON.stringify(params.query)) : {},
                            'fields': params.fields ? encodeURIComponent(JSON.stringify(params.fields)) : {},
                            'options': params.options ? encodeURIComponent(JSON.stringify(params.options)) : {}
                        });
                    v.$.getJSON(url).then(function(response){
                        v.auth.updateLastActiveTimestamp();
                        resolve(response);
                    })['catch'](function(error){
                        if( error.status === 404 ){
                            resolve();
                        }
                        else{
                            reject(error);
                        }
                    });
                }
            );
        },
        /**
         * Create a new location monitor
         *
         * @alias createMonitor
         * @param {Object} params params
         * @param {String} params.id The monitor id. If not provided, the service will return a new id
         * @param {Object} params.monitor The monitor document that describes the monitor to be created
         * @param {String} params.account BridgeIt Services account name. If not provided, the last known BridgeIt Account will be used.
         * @param {String} params.realm The BridgeIt Services realm. If not provided, the last known BridgeIt Realm name will be used.
         * @param {String} params.accessToken The BridgeIt authentication token. If not provided, the stored token from bridgeit.io.auth.connect() will be used
         * @param {String} params.host The BridgeIt Services host url. If not supplied, the last used BridgeIT host, or the default will be used. (optional)
         * @param {Boolean} params.ssl (default false) Whether to use SSL for network traffic.
         * @returns {String} The resource URI
         */
        createMonitor: function(params){
            return new Promise(
                function(resolve, reject) {
                    params = params ? params : {};
                    v.checkHost(params);
                    //validate
                    var account = utils.validateAndReturnRequiredAccount(params, reject);
                    var realm = utils.validateAndReturnRequiredRealm(params, reject);
                    var token = utils.validateAndReturnRequiredAccessToken(params, reject);
                    validateRequiredMonitor(params, reject);
                    var url = utils.getRealmResourceURL(v.locateURL, account, realm,
                        'monitors' + (params.id ? '/' + params.id : ''), token, params.ssl);
                    v.$.post(url, params.monitor).then(function(response){
                        v.auth.updateLastActiveTimestamp();
                        resolve(response.uri);
                    })['catch'](function(error){
                        reject(error);
                    });
                }
            );
        },
        /**
         * Delete a new monitor
         *
         * @alias deleteMonitor
         * @param {Object} params params
         * @param {String} params.id The region id.
         * @param {String} params.account BridgeIt Services account name. If not provided, the last known BridgeIt Account will be used.
         * @param {String} params.realm The BridgeIt Services realm. If not provided, the last known BridgeIt Realm name will be used.
         * @param {String} params.accessToken The BridgeIt authentication token. If not provided, the stored token from bridgeit.io.auth.connect() will be used
         * @param {String} params.host The BridgeIt Services host url. If not supplied, the last used BridgeIT host, or the default will be used. (optional)
         * @param {Boolean} params.ssl (default false) Whether to use SSL for network traffic.
         */
        deleteMonitor: function(params){
            return new Promise(
                function(resolve, reject) {
                    params = params ? params : {};
                    v.checkHost(params);
                    //validate
                    var account = utils.validateAndReturnRequiredAccount(params, reject);
                    var realm = utils.validateAndReturnRequiredRealm(params, reject);
                    var token = utils.validateAndReturnRequiredAccessToken(params, reject);
                    utils.validateRequiredId(params, reject);
                    var url = utils.getRealmResourceURL(v.locateURL, account, realm,
                        'monitors/' + params.id, token, params.ssl);
                    v.$.doDelete(url).then(function(response){
                        v.auth.updateLastActiveTimestamp();
                        resolve();
                    })['catch'](function(error){
                        reject(error);
                    });
                }
            );
        },
        /**
         * Fetches all saved monitors for the realm
         *
         * @alias getAllMonitors
         * @param {Object} params params
         * @param {String} params.account BridgeIt Services account name. If not provided, the last known BridgeIt Account will be used.
         * @param {String} params.realm The BridgeIt Services realm. If not provided, the last known BridgeIt Realm name will be used.
         * @param {String} params.accessToken The BridgeIt authentication token. If not provided, the stored token from bridgeit.io.auth.connect() will be used
         * @param {String} params.host The BridgeIt Services host url. If not supplied, the last used BridgeIT host, or the default will be used. (optional)
         * @param {Boolean} params.ssl (default false) Whether to use SSL for network traffic.
         * @returns {Object} The results
         */
        getAllMonitors: function(params){
            return new Promise(
                function(resolve, reject) {
                    params = params ? params : {};
                    v.checkHost(params);
                    //validate
                    var account = utils.validateAndReturnRequiredAccount(params, reject);
                    var realm = utils.validateAndReturnRequiredRealm(params, reject);
                    var token = utils.validateAndReturnRequiredAccessToken(params, reject);
                    var url = utils.getRealmResourceURL(v.locateURL, account, realm,
                        'monitors', token, params.ssl);
                    v.$.getJSON(url).then(function(response){
                        v.auth.updateLastActiveTimestamp();
                        resolve(response);
                    })['catch'](function(error){
                        reject(error);
                    });
                }
            );
        },
        /**
         * Create a new location point of interest
         *
         * @alias createPOI
         * @param {Object} params params
         * @param {String} params.id The POI id. If not provided, the service will return a new id
         * @param {Object} params.poi The POI document that describes the POI to be created
         * @param {String} params.account BridgeIt Services account name. If not provided, the last known BridgeIt Account will be used.
         * @param {String} params.realm The BridgeIt Services realm. If not provided, the last known BridgeIt Realm name will be used.
         * @param {String} params.accessToken The BridgeIt authentication token. If not provided, the stored token from bridgeit.io.auth.connect() will be used
         * @param {String} params.host The BridgeIt Services host url. If not supplied, the last used BridgeIT host, or the default will be used. (optional)
         * @param {Boolean} params.ssl (default false) Whether to use SSL for network traffic.
         * @returns {String} The resource URI
         */
        createPOI: function(params){
            return new Promise(
                function(resolve, reject) {
                    params = params ? params : {};
                    v.checkHost(params);
                    //validate
                    var account = utils.validateAndReturnRequiredAccount(params, reject);
                    var realm = utils.validateAndReturnRequiredRealm(params, reject);
                    var token = utils.validateAndReturnRequiredAccessToken(params, reject);
                    validateRequiredPOI(params, reject);
                    var url = utils.getRealmResourceURL(v.locateURL, account, realm,
                        'poi' + (params.id ? '/' + params.id : ''), token, params.ssl);
                    v.$.post(url, params.poi).then(function(response){
                        v.auth.updateLastActiveTimestamp();
                        resolve(response.uri);
                    })['catch'](function(error){
                        reject(error);
                    });
                }
            );
        },
        /**
         * Update a poi
         *
         * @alias updatePOI
         * @param {Object} params params
         * @param {String} params.id The poi id, the poi to be updated
         * @param {Object} params.poi The new poi
         * @param {String} params.account BridgeIt Services account name. If not provided, the last known BridgeIt Account will be used.
         * @param {String} params.realm The BridgeIt Services realm. If not provided, the last known BridgeIt Realm name will be used.
         * @param {String} params.accessToken The BridgeIt authentication token. If not provided, the stored token from bridgeit.io.auth.connect() will be used
         * @param {String} params.host The BridgeIt Services host url. If not supplied, the last used BridgeIT host, or the default will be used. (optional)
         * @param {Boolean} params.ssl (default false) Whether to use SSL for network traffic.
         */
        updatePOI: function(params){
            return new Promise(
                function(resolve, reject) {
                    params = params ? params : {};
                    v.checkHost(params);
                    //validate
                    var account = utils.validateAndReturnRequiredAccount(params, reject);
                    var realm = utils.validateAndReturnRequiredRealm(params, reject);
                    var token = utils.validateAndReturnRequiredAccessToken(params, reject);
                    utils.validateRequiredId(params, reject);
                    validateRequiredPOI(params, reject);
                    var url = utils.getRealmResourceURL(v.locateURL, account, realm,
                        'poi/' + params.id, token, params.ssl);
                    v.$.put(url, params.poi).then(function(){
                        v.auth.updateLastActiveTimestamp();
                        resolve();
                    })['catch'](function(error){
                        reject(error);
                    });
                }
            );
        },
        /**
         * Searches for POIs in a realm based on a query
         *
         * @alias findPOIs
         * @param {Object} params params
         * @param {String} params.account BridgeIt Services account name. If not provided, the last known BridgeIt Account will be used.
         * @param {String} params.realm The BridgeIt Services realm. If not provided, the last known BridgeIt Realm name will be used.
         * @param {String} params.accessToken The BridgeIt authentication token. If not provided, the stored token from bridgeit.io.auth.connect() will be used
         * @param {String} params.host The BridgeIt Services host url. If not supplied, the last used BridgeIT host, or the default will be used. (optional)
         * @param {Boolean} params.ssl (default false) Whether to use SSL for network traffic.
         * @param {Object} params.query A mongo query for the points of interest
         * @param {Object} params.fields Specify the inclusion or exclusion of fields to return in the result set
         * @param {Object} params.options Additional query options such as limit and sort
         * @returns {Object} The results
         */
        findPOIs: function(params){
            return new Promise(
                function(resolve, reject) {
                    params = params ? params : {};
                    v.checkHost(params);
                    //validate
                    var account = utils.validateAndReturnRequiredAccount(params, reject);
                    var realm = utils.validateAndReturnRequiredRealm(params, reject);
                    var token = utils.validateAndReturnRequiredAccessToken(params, reject);
                    var url = utils.getRealmResourceURL(v.locateURL, account, realm,
                        'poi', token, params.ssl, {
                            'query': params.query ? encodeURIComponent(JSON.stringify(params.query)) : {},
                            'fields': params.fields ? encodeURIComponent(JSON.stringify(params.fields)) : {},
                            'options': params.options ? encodeURIComponent(JSON.stringify(params.options)) : {}
                        });
                    v.$.getJSON(url).then(function(response){
                        v.auth.updateLastActiveTimestamp();
                        resolve(response);
                    })['catch'](function(error){
                        if( error.status === 404 ){
                            resolve();
                        }
                        else{
                            reject(error);
                        }
                    });
                }
            );
        },
        /**
         * Delete a new POI
         *
         * @alias deletePOI
         * @param {Object} params params
         * @param {String} params.id The POI id.
         * @param {String} params.account BridgeIt Services account name. If not provided, the last known BridgeIt Account will be used.
         * @param {String} params.realm The BridgeIt Services realm. If not provided, the last known BridgeIt Realm name will be used.
         * @param {String} params.accessToken The BridgeIt authentication token. If not provided, the stored token from bridgeit.io.auth.connect() will be used
         * @param {String} params.host The BridgeIt Services host url. If not supplied, the last used BridgeIT host, or the default will be used. (optional)
         * @param {Boolean} params.ssl (default false) Whether to use SSL for network traffic.
         */
        deletePOI: function(params){
            return new Promise(
                function(resolve, reject) {
                    params = params ? params : {};
                    v.checkHost(params);
                    //validate
                    var account = utils.validateAndReturnRequiredAccount(params, reject);
                    var realm = utils.validateAndReturnRequiredRealm(params, reject);
                    var token = utils.validateAndReturnRequiredAccessToken(params, reject);
                    utils.validateRequiredId(params, reject);
                    var url = utils.getRealmResourceURL(v.locateURL, account, realm,
                        'poi/' + params.id, token, params.ssl);
                    v.$.doDelete(url).then(function(response){
                        v.auth.updateLastActiveTimestamp();
                        resolve();
                    })['catch'](function(error){
                        reject(error);
                    });
                }
            );
        },
        /**
         * Fetches all saved POIs for the realm
         *
         * @alias getAllPOIs
         * @param {Object} params params
         * @param {String} params.account BridgeIt Services account name. If not provided, the last known BridgeIt Account will be used.
         * @param {String} params.realm The BridgeIt Services realm. If not provided, the last known BridgeIt Realm name will be used.
         * @param {String} params.accessToken The BridgeIt authentication token. If not provided, the stored token from bridgeit.io.auth.connect() will be used
         * @param {String} params.host The BridgeIt Services host url. If not supplied, the last used BridgeIT host, or the default will be used. (optional)
         * @param {Boolean} params.ssl (default false) Whether to use SSL for network traffic.
         * @returns {Object} The results
         */
        getAllPOIs: function(params){
            return new Promise(
                function(resolve, reject) {
                    params = params ? params : {};
                    v.checkHost(params);
                    //validate
                    var account = utils.validateAndReturnRequiredAccount(params, reject);
                    var realm = utils.validateAndReturnRequiredRealm(params, reject);
                    var token = utils.validateAndReturnRequiredAccessToken(params, reject);
                    var url = utils.getRealmResourceURL(v.locateURL, account, realm,
                        'poi', token, params.ssl);
                    v.$.getJSON(url).then(function(response){
                        v.auth.updateLastActiveTimestamp();
                        resolve(response);
                    })['catch'](function(error){
                        reject(error);
                    });
                }
            );
        },
        /**
         * Searches for locations in a realm based on a query
         *
         * @alias findLocations
         * @param {Object} params params
         * @param {String} params.account BridgeIt Services account name. If not provided, the last known BridgeIt Account will be used.
         * @param {String} params.realm The BridgeIt Services realm. If not provided, the last known BridgeIt Realm name will be used.
         * @param {String} params.accessToken The BridgeIt authentication token. If not provided, the stored token from bridgeit.io.auth.connect() will be used
         * @param {String} params.host The BridgeIt Services host url. If not supplied, the last used BridgeIT host, or the default will be used. (optional)
         * @param {Boolean} params.ssl (default false) Whether to use SSL for network traffic.
         * @param {Object} params.query A mongo query for the locations
         * @param {Object} params.fields Specify the inclusion or exclusion of fields to return in the result set
         * @param {Object} params.options Additional query options such as limit and sort
         * @returns {Object} The results
         */
        findLocations: function(params){
            return new Promise(
                function(resolve, reject) {
                    params = params ? params : {};
                    v.checkHost(params);
                    //validate
                    var account = utils.validateAndReturnRequiredAccount(params, reject);
                    var realm = utils.validateAndReturnRequiredRealm(params, reject);
                    var token = utils.validateAndReturnRequiredAccessToken(params, reject);
                    var url = utils.getRealmResourceURL(v.locateURL, account, realm,
                        'locations', token, params.ssl, {
                            'query': params.query ? encodeURIComponent(JSON.stringify(params.query)) : {},
                            'fields': params.fields ? encodeURIComponent(JSON.stringify(params.fields)) : {},
                            'options': params.options ? encodeURIComponent(JSON.stringify(params.options)) : {}
                        });
                    v.$.getJSON(url).then(function(response){
                        v.auth.updateLastActiveTimestamp();
                        resolve(response);
                    })['catch'](function(error){
                        if( error.status === 404 ){
                            resolve();
                        }
                        else{
                            reject(error);
                        }
                    });
                }
            );
        },
        /**
         * Update the location of the current user.
         *
         * @alias updateLocation
         * @param {Object} params params
         * @param {String} params.account BridgeIt Services account name. If not provided, the last known BridgeIt Account will be used.
         * @param {String} params.realm The BridgeIt Services realm. If not provided, the last known BridgeIt Realm name will be used.
         * @param {String} params.accessToken The BridgeIt authentication token. If not provided, the stored token from bridgeit.io.auth.connect() will be used
         * @param {String} params.host The BridgeIt Services host url. If not supplied, the last used BridgeIT host, or the default will be used. (optional)
         * @param {Boolean} params.ssl (default false) Whether to use SSL for network traffic.
         * @param {Object} params.location The location
         */
        updateLocation: function(params){
            return new Promise(
                function(resolve, reject) {
                    params = params ? params : {};
                    v.checkHost(params);
                    //validate
                    var account = utils.validateAndReturnRequiredAccount(params, reject);
                    var realm = utils.validateAndReturnRequiredRealm(params, reject);
                    var token = utils.validateAndReturnRequiredAccessToken(params, reject);
                    validateRequiredLocation(params, reject);
                    var url = utils.getRealmResourceURL(v.locateURL, account, realm,
                        'locations', token, params.ssl);
                    v.$.post(url, params.location).then(function(response){
                        v.auth.updateLastActiveTimestamp();
                        resolve(response);
                    })['catch'](function(error){
                        reject(error);
                    });
                }
            );
        },
        /**
         * Set the current users location with a latitude and longitude
         *
         * @alias updateLocationCoordinates
         * @param {Object} params params
         * @param {String} params.account BridgeIt Services account name. If not provided, the last known BridgeIt Account will be used.
         * @param {String} params.realm The BridgeIt Services realm. If not provided, the last known BridgeIt Realm name will be used.
         * @param {String} params.accessToken The BridgeIt authentication token. If not provided, the stored token from bridgeit.io.auth.connect() will be used
         * @param {String} params.host The BridgeIt Services host url. If not supplied, the last used BridgeIT host, or the default will be used. (optional)
         * @param {Boolean} params.ssl (default false) Whether to use SSL for network traffic.
         * @param {Number} params.latitude The location latitude
         * @param {Number} params.longitude The location longitude
         * @param {String} params.label An optional label
         */
        updateLocationCoordinates: function(params){
            return new Promise(
                function(resolve, reject) {
                    params = params ? params : {};
                    v.checkHost(params);
                    //validate
                    var account = utils.validateAndReturnRequiredAccount(params, reject);
                    var realm = utils.validateAndReturnRequiredRealm(params, reject);
                    var token = utils.validateAndReturnRequiredAccessToken(params, reject);
                    validateRequiredLat(params, reject);
                    validateRequiredLon(params, reject);
                    var location = {
                        location: {
                            geometry: {
                                type: 'Point',
                                coordinates: [ params.lon, params.lat ]
                            },
                            properties: {
                                timestamp: new Date().toISOString()
                            }
                        }
                    };
                    if( params.label ){
                        location.label = params.label;
                    }
                    var url = utils.getRealmResourceURL(v.locateURL, account, realm,
                        'locations', token, params.ssl);
                    v.$.post(url, location).then(function(response){
                        v.auth.updateLastActiveTimestamp();
                        resolve(response);
                    })['catch'](function(error){
                        reject(error);
                    });
                }
            );
        },
        /**
         * Get the last known user location from the location service.
         *
         * @alias getLastUserLocation
         * @param {Object} params params
         * @param {String} params.account BridgeIt Services account name. If not provided, the last known BridgeIt Account will be used.
         * @param {String} params.realm The BridgeIt Services realm. If not provided, the last known BridgeIt Realm name will be used.
         * @param {String} params.accessToken The BridgeIt authentication token. If not provided, the stored token from bridgeit.io.auth.connect() will be used
         * @param {String} params.host The BridgeIt Services host url. If not supplied, the last used BridgeIT host, or the default will be used. (optional)
         * @param {Boolean} params.ssl (default false) Whether to use SSL for network traffic.
         * @param {String} params.username
         * @returns {Object} The single result, if any, of the user location.
         http://dev.bridgeit.io/locate/bsrtests/realms/test/locations
         ?access_token=4be2fc2f-a53b-4987-9446-88d519faaa77
         &query={%22username%22:%22user%22}
         &options={%22sort%22:[[%22lastUpdated%22,%22desc%22]]}
         &results=one
         var locationURL = apiURL + '/locations' +
         '?access_token=' + encodeURIComponent(bsr.auth.getCurrentToken()) +
         '&query={"username": "' + encodeURIComponent(user) + '"} +' +
         '&options={"sort":[["lastUpdated","desc"]]}' +
         '&results=one';
         */
        getLastUserLocation: function(params){
            return new Promise(
                function(resolve, reject) {
                    params = params ? params : {};
                    v.checkHost(params);
                    //validate
                    var account = utils.validateAndReturnRequiredAccount(params, reject);
                    var realm = utils.validateAndReturnRequiredRealm(params, reject);
                    var token = utils.validateAndReturnRequiredAccessToken(params, reject);
                    var username = utils.validateAndReturnRequiredUsername(params, reject);
                    var url = utils.getRealmResourceURL(v.locateURL, account, realm,
                        'locations/' + username, token, params.ssl, {
                            'results': 'last'
                        });
                    v.$.getJSON(url).then(function(response){
                        v.auth.updateLastActiveTimestamp();
                        resolve(response);
                    })['catch'](function(response){
                        if( response.status === 403 ){
                            resolve(null);
                        }
                        else{
                            reject(response);
                        }
                    });
                }
            );
        }
    };
}
function MailboxService(v, utils) {
    function validateRequiredMailbox(params, reject){
        utils.validateParameter('handler', 'The mailbox parameter is required', params, reject);
    }
    return {
        /**
         * Create a new mailbox
         *
         * @alias createMailbox
         * @param {Object} params params
         * @param {String} params.id The user id
         * @param {Object} params.mailbox The mailbox to be created
         * @param {String} params.account BridgeIt Services account name. If not provided, the last known BridgeIt Account will be used.
         * @param {String} params.realm The BridgeIt Services realm. If not provided, the last known BridgeIt Realm name will be used.
         * @param {String} params.accessToken The BridgeIt authentication token. If not provided, the stored token from bridgeit.io.auth.connect() will be used
         * @param {String} params.host The BridgeIt Services host url. If not supplied, the last used BridgeIt host, or the default will be used. (optional)
         * @param {Boolean} params.ssl (default false) Whether to use SSL for network traffic.
         * @returns {String} The resource URI
         */
        createMailbox: function (params) {
            return new Promise(
                function (resolve, reject) {
                    params = params ? params : {};
                    v.checkHost(params);
                    //validate
                    var account = utils.validateAndReturnRequiredAccount(params, reject);
                    var realm = utils.validateAndReturnRequiredRealm(params, reject);
                    var token = utils.validateAndReturnRequiredAccessToken(params, reject);
                    validateRequiredMailbox(params, reject);
                    var url = utils.getRealmResourceURL(v.mailboxURL, account, realm,
                        'mailboxes/' + (params.id ? params.id : ''), token, params.ssl);
                    v.$.post(url, params.mailbox).then(function (response) {
                        v.auth.updateLastActiveTimestamp();
                        resolve(response.uri);
                    })['catch'](function (error) {
                        reject(error);
                    });
                }
            );
        },
        /**
         * Update a mailbox
         *
         * @alias updateMailbox
         * @param {Object} params params
         * @param {String} params.id The user id, the user's mailbox to be updated
         * @param {Object} params.mailbox The new mailbox
         * @param {String} params.account BridgeIt Services account name. If not provided, the last known BridgeIt Account will be used.
         * @param {String} params.realm The BridgeIt Services realm. If not provided, the last known BridgeIt Realm name will be used.
         * @param {String} params.accessToken The BridgeIt authentication token. If not provided, the stored token from bridgeit.io.auth.connect() will be used
         * @param {String} params.host The BridgeIt Services host url. If not supplied, the last used BridgeIT host, or the default will be used. (optional)
         * @param {Boolean} params.ssl (default false) Whether to use SSL for network traffic.
         */
        updateMailbox: function (params) {
            return new Promise(
                function (resolve, reject) {
                    params = params ? params : {};
                    v.checkHost(params);
                    //validate
                    var account = utils.validateAndReturnRequiredAccount(params, reject);
                    var realm = utils.validateAndReturnRequiredRealm(params, reject);
                    var token = utils.validateAndReturnRequiredAccessToken(params, reject);
                    utils.validateRequiredId(params, reject);
                    validateRequiredMailbox(params, reject);
                    var url = utils.getRealmResourceURL(v.mailboxURL, account, realm,
                        'mailboxes/' + params.id, token, params.ssl);
                    v.$.put(url, params.mailbox).then(function () {
                        v.auth.updateLastActiveTimestamp();
                        resolve();
                    })['catch'](function (error) {
                        reject(error);
                    });
                }
            );
        },
        /**
         * Fetch a mailbox
         *
         * @alias getMailbox
         * @param {Object} params params
         * @param {String} params.id The user id, the user's mailbox to fetch
         * @param {String} params.account BridgeIt Services account name. If not provided, the last known BridgeIt Account will be used.
         * @param {String} params.realm The BridgeIt Services realm. If not provided, the last known BridgeIt Realm name will be used.
         * @param {String} params.accessToken The BridgeIt authentication token. If not provided, the stored token from bridgeit.io.auth.connect() will be used
         * @param {String} params.host The BridgeIt Services host url. If not supplied, the last used BridgeIT host, or the default will be used. (optional)
         * @param {Boolean} params.ssl (default false) Whether to use SSL for network traffic.
         * @returns {Object} The mailbox
         */
        getMailbox: function (params) {
            return new Promise(
                function (resolve, reject) {
                    params = params ? params : {};
                    v.checkHost(params);
                    //validate
                    var account = utils.validateAndReturnRequiredAccount(params, reject);
                    var realm = utils.validateAndReturnRequiredRealm(params, reject);
                    var token = utils.validateAndReturnRequiredAccessToken(params, reject);
                    utils.validateRequiredId(params, reject);
                    var url = utils.getRealmResourceURL(v.mailboxURL, account, realm,
                        'mailboxes/' + params.id, token, params.ssl);
                    v.$.getJSON(url).then(function (mailbox) {
                        v.auth.updateLastActiveTimestamp();
                        resolve(mailbox);
                    })['catch'](function (error) {
                        reject(error);
                    });
                }
            );
        },
        /**
         * Searches for mailboxes in a realm based on a query
         *
         * @alias findMailboxes
         * @param {Object} params params
         * @param {String} params.account BridgeIt Services account name. If not provided, the last known BridgeIt Account will be used.
         * @param {String} params.realm The BridgeIt Services realm. If not provided, the last known BridgeIt Realm name will be used.
         * @param {String} params.accessToken The BridgeIt authentication token. If not provided, the stored token from bridgeit.io.auth.connect() will be used
         * @param {String} params.host The BridgeIt Services host url. If not supplied, the last used BridgeIT host, or the default will be used. (optional)
         * @param {Boolean} params.ssl (default false) Whether to use SSL for network traffic.
         * @param {Object} params.query A mongo query for the mailboxes
         * @param {Object} params.fields Specify the inclusion or exclusion of fields to return in the result set
         * @param {Object} params.options Additional query options such as limit and sort
         * @returns {Object} The results
         */
        findMailboxes: function (params) {
            return new Promise(
                function (resolve, reject) {
                    params = params ? params : {};
                    v.checkHost(params);
                    //validate
                    var account = utils.validateAndReturnRequiredAccount(params, reject);
                    var realm = utils.validateAndReturnRequiredRealm(params, reject);
                    var token = utils.validateAndReturnRequiredAccessToken(params, reject);
                    var url = utils.getRealmResourceURL(v.mailboxURL, account, realm,
                        'mailboxes/', token, params.ssl, {
                            'query': params.query ? encodeURIComponent(JSON.stringify(params.query)) : {},
                            'fields': params.fields ? encodeURIComponent(JSON.stringify(params.fields)) : {},
                            'options': params.options ? encodeURIComponent(JSON.stringify(params.options)) : {}
                        });
                    v.$.getJSON(url).then(function (mailboxes) {
                        v.auth.updateLastActiveTimestamp();
                        resolve(mailboxes);
                    })['catch'](function (response) {
                        reject(response);
                    });
                }
            );
        },
        /**
         * Delete a mailbox
         *
         * @alias deleteMailbox
         * @param {Object} params params
         * @param {String} params.id The user id, the user's mailbox to be deleted
         * @param {String} params.account BridgeIt Services account name. If not provided, the last known BridgeIt Account will be used.
         * @param {String} params.realm The BridgeIt Services realm. If not provided, the last known BridgeIt Realm name will be used.
         * @param {String} params.accessToken The BridgeIt authentication token. If not provided, the stored token from bridgeit.io.auth.connect() will be used
         * @param {String} params.host The BridgeIt Services host url. If not supplied, the last used BridgeIT host, or the default will be used. (optional)
         * @param {Boolean} params.ssl (default false) Whether to use SSL for network traffic.
         */
        deleteMailbox: function (params) {
            return new Promise(
                function (resolve, reject) {
                    params = params ? params : {};
                    v.checkHost(params);
                    //validate
                    var account = utils.validateAndReturnRequiredAccount(params, reject);
                    var realm = utils.validateAndReturnRequiredRealm(params, reject);
                    var token = utils.validateAndReturnRequiredAccessToken(params, reject);
                    utils.validateRequiredId(params, reject);
                    var url = utils.getRealmResourceURL(v.mailboxURL, account, realm,
                        'mailboxes/' + params.id, token, params.ssl);
                    v.$.doDelete(url).then(function () {
                        v.auth.updateLastActiveTimestamp();
                        resolve();
                    })['catch'](function (error) {
                        reject(error);
                    });
                }
            );
        },
        /**
         * Delete mailboxes in a realm based on a query
         *
         * @alias deleteMailboxes
         * @param {Object} params params
         * @param {String} params.account BridgeIt Services account name. If not provided, the last known BridgeIt Account will be used.
         * @param {String} params.realm The BridgeIt Services realm. If not provided, the last known BridgeIt Realm name will be used.
         * @param {String} params.accessToken The BridgeIt authentication token. If not provided, the stored token from bridgeit.io.auth.connect() will be used
         * @param {String} params.host The BridgeIt Services host url. If not supplied, the last used BridgeIT host, or the default will be used. (optional)
         * @param {Boolean} params.ssl (default false) Whether to use SSL for network traffic.
         * @param {Object} params.query A mongo query for the mailboxes
         * @param {Object} params.fields Specify the inclusion or exclusion of fields to return in the result set
         * @param {Object} params.options Additional query options such as limit and sort
         */
        deleteMailboxes: function (params) {
            return new Promise(
                function (resolve, reject) {
                    params = params ? params : {};
                    v.checkHost(params);
                    //validate
                    var account = utils.validateAndReturnRequiredAccount(params, reject);
                    var realm = utils.validateAndReturnRequiredRealm(params, reject);
                    var token = utils.validateAndReturnRequiredAccessToken(params, reject);
                    var url = utils.getRealmResourceURL(v.mailboxURL, account, realm,
                        'mailboxes/', token, params.ssl, {
                            'query': params.query ? encodeURIComponent(JSON.stringify(params.query)) : {},
                            'fields': params.fields ? encodeURIComponent(JSON.stringify(params.fields)) : {},
                            'options': params.options ? encodeURIComponent(JSON.stringify(params.options)) : {}
                        });
                    v.$.doDelete(url).then(function () {
                        v.auth.updateLastActiveTimestamp();
                        resolve();
                    })['catch'](function (error) {
                        reject(error);
                    });
                }
            );
        }
    };
}
function MetricsService(v, utils) {
    function validateRequiredEvent(params, reject){
        utils.validateParameter('event', 'The event parameter is required', params, reject);
    }
    return {
        /**
         * Searches for events in a realm based on a query
         *
         * @alias findEvents
         * @param {Object} params params
         * @param {String} params.account BridgeIt Services account name. If not provided, the last known BridgeIt Account will be used.
         * @param {String} params.realm The BridgeIt Services realm. If not provided, the last known BridgeIt Realm name will be used.
         * @param {String} params.accessToken The BridgeIt authentication token. If not provided, the stored token from bridgeit.io.auth.connect() will be used
         * @param {String} params.host The BridgeIt Services host url. If not supplied, the last used BridgeIT host, or the default will be used. (optional)
         * @param {Boolean} params.ssl (default false) Whether to use SSL for network traffic.
         * @param {Object} params.query A mongo query for the events
         * @param {Object} params.fields Specify the inclusion or exclusion of fields to return in the result set
         * @param {Object} params.options Additional query options such as limit and sort
         * @returns {Object} The results
         */
        findEvents: function(params){
            return new Promise(
                function(resolve, reject) {
                    params = params ? params : {};
                    v.checkHost(params);
                    //validate
                    var account = utils.validateAndReturnRequiredAccount(params, reject);
                    var realm = utils.validateAndReturnRequiredRealm(params, reject);
                    var token = utils.validateAndReturnRequiredAccessToken(params, reject);
                    var url = utils.getRealmResourceURL(v.metricsURL, account, realm,
                        'events', token, params.ssl, {
                            'query': params.query ? encodeURIComponent(JSON.stringify(params.query)) : {},
                            'fields': params.fields ? encodeURIComponent(JSON.stringify(params.fields)) : {},
                            'options': params.options ? encodeURIComponent(JSON.stringify(params.options)) : {}
                        });
                    v.$.getJSON(url).then(function(events){
                        v.auth.updateLastActiveTimestamp();
                        resolve(events);
                    })['catch'](function(error){
                        reject(error);
                    });
                }
            );
        },
        /**
         * Store a custom event in the metrics service.
         *
         * @alias createCustomEvent
         * @param {Object} params params
         * @param {String} params.account BridgeIt Services account name. If not provided, the last known BridgeIt Account will be used.
         * @param {String} params.realm The BridgeIt Services realm. If not provided, the last known BridgeIt Realm name will be used.
         * @param {String} params.accessToken The BridgeIt authentication token. If not provided, the stored token from bridgeit.io.auth.connect() will be used
         * @param {String} params.host The BridgeIt Services host url. If not supplied, the last used BridgeIT host, or the default will be used. (optional)
         * @param {Boolean} params.ssl (default false) Whether to use SSL for network traffic.
         * @param {Object} params.event The custom event that you would like to store, in JSON format.
         * @returns {String} The resource URI
         */
        createCustomEvent: function(params){
            return new Promise(
                function(resolve, reject) {
                    params = params ? params : {};
                    v.checkHost(params);
                    //validate
                    var account = utils.validateAndReturnRequiredAccount(params, reject);
                    var realm = utils.validateAndReturnRequiredRealm(params, reject);
                    var token = utils.validateAndReturnRequiredAccessToken(params, reject);
                    validateRequiredEvent(params, reject);
                    var url = utils.getRealmResourceURL(v.metricsURL, account, realm,
                        'events', token, params.ssl);
                    v.$.post(url, params.event).then(function(response){
                        v.auth.updateLastActiveTimestamp();
                        resolve(response.uri);
                    })['catch'](function(error){
                        reject(error);
                    });
                }
            );
        },
        /**
         * Retrieve the time difference in milliseconds between the provided time and the metrics server time.
         *
         * Useful for displaying accurate live metrics views. The time difference is returned as client time - server time.
         *
         * @alias getClientServerTimeGap
         * @param {Object} params params
         * @param {String} params.account BridgeIt Services account name. If not provided, the last known BridgeIt Account will be used.
         * @param {String} params.realm The BridgeIt Services realm. If not provided, the last known BridgeIt Realm name will be used.
         * @param {String} params.accessToken The BridgeIt authentication token. If not provided, the stored token from bridgeit.io.auth.connect() will be used
         * @param {String} params.host The BridgeIt Services host url. If not supplied, the last used BridgeIT host, or the default will be used. (optional)
         * @param {Boolean} params.ssl (default false) Whether to use SSL for network traffic.
         * @returns {Number} The time difference in milliseconds
         */
        getClientServerTimeGap: function(params){
            return new Promise(
                function(resolve, reject) {
                    params = params ? params : {};
                    v.checkHost(params);
                    //validate
                    var account = utils.validateAndReturnRequiredAccount(params, reject);
                    var realm = utils.validateAndReturnRequiredRealm(params, reject);
                    var token = utils.validateAndReturnRequiredAccessToken(params, reject);
                    var url = utils.getRealmResourceURL(v.metricsURL, account, realm,
                        'time', token, params.ssl, {
                            clientTime: encodeURIComponent(new Date().toISOString())
                        });
                    v.$.getJSON(url).then(function(response){
                        if( response.timeOffset){
                            v.auth.updateLastActiveTimestamp();
                            resolve(response.timeOffset);
                        }
                        else{
                            reject(new Error('getClientServerTimeGap() could not parse response: ' +
                                JSON.stringify(response)));
                        }
                    })['catch'](function(error){
                        reject(error);
                    });
                }
            );
        }
    };
}
function PushService(v, utils) {
    function validateRequiredGroup(params, reject){
        utils.validateParameter('group', 'The group parameter is required', params, reject);
    }
    function validateRequiredCallback(params, reject){
        utils.validateParameter('group', 'The callback parameter is required', params, reject);
    }
    var PUSH_CALLBACKS = 'pushCallbacks';
    var CLOUD_CALLBACKS_KEY = "bridgeit.cloudcallbacks";
    function storePushListener(pushId, group, cb){
        var pushListeners = {};
        var pushListenersStr = utils.getSessionStorageItem(PUSH_CALLBACKS);
        if( pushListenersStr ){
            try{
                pushListeners = JSON.parse(pushListenersStr);
            }
            catch(e){}
        }
        if( !pushListeners[group] ){
            pushListeners[group] = [];
        }
        pushListeners[group].push({pushId: pushId, callback: cb});
        utils.setSessionStorageItem(PUSH_CALLBACKS, JSON.stringify(pushListeners));
    }
    function addCloudPushListener(params){
        var callback = utils.findFunctionInGlobalScope(params.callback);
        if( !callback ){
            reject('BridgeIt Cloud Push callbacks must be in window scope. Please pass either a reference to or a name of a global function.');
        }
        else{
            var callbacks = utils.getLocalStorageItem(CLOUD_CALLBACKS_KEY);
            var callbackName = utils.getFunctionName(callback);
            if (!callbacks)  {
                callbacks = " ";
            }
            if (callbacks.indexOf(" " + callbackName + " ") < 0)  {
                callbacks += callbackName + " ";
            }
            utils.setLocalStorageItem(CLOUD_CALLBACKS_KEY, callbacks);
        }
    }
    function addPushGroupMember(params){
        ice.push.createPushId(function(pushId) {
            ice.push.addGroupMember(params.group, pushId);
            var fn = utils.findFunctionInGlobalScope(params.callback);
            if( !fn ){
                reject('could not find function in global scope: ' + params.callback);
            }
            else{
                ice.push.register([ pushId ], fn);
                storePushListener(pushId, params.group, params.callback);
                if( params.useCloudPush ){
                    addCloudPushListener(params);
                }
            }
        });
    }
    return {
        /**
         * Connect to the BridgeIt Push Service
         *
         * @alias startPushService
         * @param {Object} params params
         * @param {String} params.account BridgeIt Services account name. If not provided, the last known BridgeIt Account will be used.
         * @param {String} params.realm The BridgeIt Services realm. If not provided, the last known BridgeIt Realm name will be used.
         */
        startPushService: function(params){
            return new Promise(
                function(resolve, reject) {
                    params = params ? params : {};
                    v.checkHost(params);
                    //validate
                    var account = utils.validateAndReturnRequiredAccount(params, reject);
                    var realm = utils.validateAndReturnRequiredRealm(params, reject);
                    var token = utils.validateAndReturnRequiredAccessToken(params, reject);
                    var pushURL = (params.ssl ? 'https://' : 'http://') + v.pushURL + '/';
                    //make sure the ICEpush code is evaluated before this
                    window.ice.push = ice.setupPush({
                        'uri': pushURL,
                        'account': account,
                        'realm': realm,
                        'access_token': token
                    });
                    console.log('bridgeit.io.push.connect() connected');
                    resolve();
                }
            );
        },
        /**
         * Add listener for notifications belonging to the specified group.
         * Callbacks must be passed by name to receive cloud push notifications.
         *
         * @alias addPushListener
         * @param {Object} params params
         * @param {String} params.account BridgeIt Services account name. If not provided, the last known BridgeIt Account will be used.
         * @param {String} params.realm The BridgeIt Services realm. If not provided, the last known BridgeIt Realm name will be used.
         * @param {String} params.group The push group name
         * @param {String} params.callback The callback function to be called on the push event
         * @param {Boolean} params.useCloudPush Use BridgeIt Cloud Push to call the callback through native cloud notification channels when necessary (default true)
         */
        addPushListener: function(params){
            return new Promise(function(resolve, reject) {
                params = params ? params : {};
                v.checkHost(params);
                validateRequiredGroup(params, reject);
                validateRequiredCallback(params, reject);
                if( !('useCloudPush' in params )){
                    params.useCloudPush = true;
                }
                if (ice && ice.push) {
                    addPushGroupMember(params);
                    console.log('bridgeit.io.push.addPushListener() added listener ' +
                        params.callback + ' to group ' + params.group);
                    resolve();
                } else {
                    reject('Push service is not active');
                }
            });
        },
        /**
         * Remove listener for notifications belonging to the specified group.
         * Callbacks must be passed by name to receive cloud push notifications.
         *
         * @alias removePushListener
         * @param {Object} params params
         * @param {String} params.account BridgeIt Services account name. If not provided, the last known BridgeIt Account will be used.
         * @param {String} params.realm The BridgeIt Services realm. If not provided, the last known BridgeIt Realm name will be used.
         * @param {String} params.group The push group name
         * @param {String} params.callback The callback function to be called on the push event. This parameter is optional, when missing
         * all callbacks within the group are removed.
         */
        removePushListener: function(params){
            return new Promise(function(resolve, reject) {
                console.log('bridgeit.io.push.removePushListener() group: ' + params.group);
                params = params ? params : {};
                v.checkHost(params);
                validateRequiredGroup(params, reject);
                var pushListenersStr = utils.getSessionStorageItem(PUSH_CALLBACKS);
                if( !pushListenersStr ){
                    console.error('Cannot remove push listener ' + params.group + ', missing push listener storage.');
                }
                else{
                    try {
                        var pushListenerStorage = JSON.parse(pushListenersStr);
                        var listeners = pushListenerStorage[params.group];
                        console.log('found push listeners in storage: ' + ( listeners ? JSON.stringify(listeners) : null ) );
                        if( !listeners ){
                            console.error('could not find listeners for group ' + params.group);
                            return;
                        }
                        if (params.callback) {
                            //remove only the listener/pushId corresponding to the provided callback
                            var remainingListeners = [];
                            for (var i = 0; i < listeners.length; i++) {
                                var listener = listeners[i];
                                if (listener.callback == params.callback) {
                                    var pushId = listener.pushId;
                                    ice.push.removeGroupMember(params.group, pushId);
                                    ice.push.deregister(pushId);
                                    console.log('removed push id ' + pushId);
                                } else {
                                    remainingListeners.push(listener);
                                }
                                if (remainingListeners.length > 0) {
                                    pushListenerStorage[params.group] = remainingListeners;
                                } else {
                                    delete pushListenerStorage[params.group];
                                }
                            }
                        } else {
                            //remove all the listeners for the group
                            for (var i = 0; i < listeners.length; i++) {
                                var pushId = listeners[i].pushId;
                                ice.push.removeGroupMember(params.group, pushId);
                                ice.push.deregister(pushId);
                                console.log('removed push id ' + pushId);
                            }
                            delete pushListenerStorage[params.group];
                        }
                        utils.setSessionStorageItem(PUSH_CALLBACKS, JSON.stringify(pushListenerStorage));
                    } catch(e){
                        console.error(e);
                    }
                }
            });
        },
        /**
         * Push notification to a push group.
         *
         * This will result in an Ajax Push (and associated callback)
         * to any web pages that have added a push listener to the
         * specified group.  If Cloud Push options are provided
         * (params.subject and params.detail) a Cloud Push will
         * be dispatched as a home screen notification to any devices
         * unable to recieve the Ajax Push via the web page.
         *
         * @alias sendPushEvent
         * @param {Object} params params
         * @param {String} params.account BridgeIt Services account name. If not provided, the last known BridgeIt Account will be used.
         * @param {String} params.realm The BridgeIt Services realm. If not provided, the last known BridgeIt Realm name will be used.
         * @param {String} params.group The push group name
         * @param {String} params.subject The subject heading for the notification
         * @param {String} params.detail The message text to be sent in the notification body
         */
        sendPushEvent: function(params) {
            return new Promise(
                function(resolve, reject) {
                    params = params ? params : {};
                    v.checkHost(params);
                    validateRequiredGroup(params, reject);
                    if (ice && ice.push) {
                        var post = {};
                        if( params.subject ){
                            post.subject = params.subject;
                        }
                        if( params.detail ){
                            post.detail = params.detail;
                        }
                        ice.push.notify(params.group, post);
                        resolve();
                    } else {
                        reject('Push service is not active');
                    }
                }
            );
        }
    };
}
function QueryService(v, utils) {
    return {
        /**
         * Create a new query
         *
         * @alias createQuery
         * @param {Object} params params
         * @param {String} params.id The query id. If not provided, the service will return a new id
         * @param {Object} params.query The query to be created
         * @param {String} params.account BridgeIt Services account name. If not provided, the last known BridgeIt Account will be used.
         * @param {String} params.realm The BridgeIt Services realm. If not provided, the last known BridgeIt Realm name will be used.
         * @param {String} params.accessToken The BridgeIt authentication token. If not provided, the stored token from bridgeit.io.auth.connect() will be used
         * @param {String} params.host The BridgeIt Services host url. If not supplied, the last used BridgeIt host, or the default will be used. (optional)
         * @param {Boolean} params.ssl (default false) Whether to use SSL for network traffic.
         * @returns {String} The resource URI
         */
        createQuery: function(params){
            return new Promise(
                function(resolve, reject) {
                    params = params ? params : {};
                    v.checkHost(params);
                    //validate
                    var account = utils.validateAndReturnRequiredAccount(params, reject);
                    var realm = utils.validateAndReturnRequiredRealm(params, reject);
                    var token = utils.validateAndReturnRequiredAccessToken(params, reject);
                    var url = utils.getRealmResourceURL(v.queryURL, account, realm,
                        'queries/' + (params.id ? params.id : ''), token, params.ssl);
                    v.$.post(url, params.query).then(function(response){
                        v.auth.updateLastActiveTimestamp();
                        resolve(response.uri);
                    })['catch'](function(error){
                        reject(error);
                    });
                }
            );
        },
        /**
         * Update a query
         *
         * @alias updateQuery
         * @param {Object} params params
         * @param {String} params.id The query id, the query to be updated
         * @param {Object} params.query The query
         * @param {String} params.account BridgeIt Services account name. If not provided, the last known BridgeIt Account will be used.
         * @param {String} params.realm The BridgeIt Services realm. If not provided, the last known BridgeIt Realm name will be used.
         * @param {String} params.accessToken The BridgeIt authentication token. If not provided, the stored token from bridgeit.io.auth.connect() will be used
         * @param {String} params.host The BridgeIt Services host url. If not supplied, the last used BridgeIT host, or the default will be used. (optional)
         * @param {Boolean} params.ssl (default false) Whether to use SSL for network traffic.
         * @returns {String} The resource URI
         */
        updateQuery: function(params){
            return new Promise(
                function(resolve, reject) {
                    params = params ? params : {};
                    v.checkHost(params);
                    //validate
                    var account = utils.validateAndReturnRequiredAccount(params, reject);
                    var realm = utils.validateAndReturnRequiredRealm(params, reject);
                    var token = utils.validateAndReturnRequiredAccessToken(params, reject);
                    utils.validateRequiredId(params, reject);
                    var url = utils.getRealmResourceURL(v.queryURL, account, realm,
                        'queries/' + params.id, token, params.ssl);
                    v.$.put(url, params.query).then(function(){
                        v.auth.updateLastActiveTimestamp();
                        resolve();
                    })['catch'](function(error){
                        reject(error);
                    });
                }
            );
        },
        /**
         * Fetch a query
         *
         * @alias getQuery
         * @param {Object} params params
         * @param {String} params.id The query id, the query to fetch
         * @param {String} params.account BridgeIt Services account name. If not provided, the last known BridgeIt Account will be used.
         * @param {String} params.realm The BridgeIt Services realm. If not provided, the last known BridgeIt Realm name will be used.
         * @param {String} params.accessToken The BridgeIt authentication token. If not provided, the stored token from bridgeit.io.auth.connect() will be used
         * @param {String} params.host The BridgeIt Services host url. If not supplied, the last used BridgeIT host, or the default will be used. (optional)
         * @param {Boolean} params.ssl (default false) Whether to use SSL for network traffic.
         * @returns {Object} The query
         */
        getQuery: function(params){
            return new Promise(
                function(resolve, reject) {
                    params = params ? params : {};
                    v.checkHost(params);
                    //validate
                    var account = utils.validateAndReturnRequiredAccount(params, reject);
                    var realm = utils.validateAndReturnRequiredRealm(params, reject);
                    var token = utils.validateAndReturnRequiredAccessToken(params, reject);
                    utils.validateRequiredId(params, reject);
                    var url = utils.getRealmResourceURL(v.queryURL, account, realm,
                        'queries/' + params.id, token, params.ssl);
                    v.$.getJSON(url).then(function(query){
                        v.auth.updateLastActiveTimestamp();
                        resolve(query);
                    })['catch'](function(error){
                        reject(error);
                    });
                }
            );
        },
        /**
         * Searches for queries in a realm based on a query
         *
         * @alias findQueries
         * @param {Object} params params
         * @param {String} params.account BridgeIt Services account name. If not provided, the last known BridgeIt Account will be used.
         * @param {String} params.realm The BridgeIt Services realm. If not provided, the last known BridgeIt Realm name will be used.
         * @param {String} params.accessToken The BridgeIt authentication token. If not provided, the stored token from bridgeit.io.auth.connect() will be used
         * @param {String} params.host The BridgeIt Services host url. If not supplied, the last used BridgeIT host, or the default will be used. (optional)
         * @param {Boolean} params.ssl (default false) Whether to use SSL for network traffic.
         * @param {Object} params.query A mongo query for the queries
         * @param {Object} params.fields Specify the inclusion or exclusion of fields to return in the result set
         * @param {Object} params.options Additional query options such as limit and sort
         * @returns {Object} The results
         */
        findQueries: function(params){
            return new Promise(
                function(resolve, reject) {
                    params = params ? params : {};
                    v.checkHost(params);
                    //validate
                    var account = utils.validateAndReturnRequiredAccount(params, reject);
                    var realm = utils.validateAndReturnRequiredRealm(params, reject);
                    var token = utils.validateAndReturnRequiredAccessToken(params, reject);
                    var url = utils.getRealmResourceURL(v.queryURL, account, realm,
                        'queries/', token, params.ssl, {
                            'query': params.query ? encodeURIComponent(JSON.stringify(params.query)) : {},
                            'fields': params.fields ? encodeURIComponent(JSON.stringify(params.fields)) : {},
                            'options': params.options ? encodeURIComponent(JSON.stringify(params.options)) : {}
                        });
                    v.$.getJSON(url).then(function(doc){
                        v.auth.updateLastActiveTimestamp();
                        resolve(doc);
                    })['catch'](function(response){
                        reject(response);
                    });
                }
            );
        },
        /**
         * Delete a query
         *
         * @alias deleteQuery
         * @param {Object} params params
         * @param {String} params.id The query id, the query to be deleted
         * @param {String} params.account BridgeIt Services account name. If not provided, the last known BridgeIt Account will be used.
         * @param {String} params.realm The BridgeIt Services realm. If not provided, the last known BridgeIt Realm name will be used.
         * @param {String} params.accessToken The BridgeIt authentication token. If not provided, the stored token from bridgeit.io.auth.connect() will be used
         * @param {String} params.host The BridgeIt Services host url. If not supplied, the last used BridgeIT host, or the default will be used. (optional)
         * @param {Boolean} params.ssl (default false) Whether to use SSL for network traffic.
         */
        deleteQuery: function(params){
            return new Promise(
                function(resolve, reject) {
                    params = params ? params : {};
                    v.checkHost(params);
                    //validate
                    var account = utils.validateAndReturnRequiredAccount(params, reject);
                    var realm = utils.validateAndReturnRequiredRealm(params, reject);
                    var token = utils.validateAndReturnRequiredAccessToken(params, reject);
                    utils.validateRequiredId(params, reject);
                    var url = utils.getRealmResourceURL(v.queryURL, account, realm,
                        'queries/' + params.id, token, params.ssl);
                    v.$.doDelete(url).then(function(response){
                        v.auth.updateLastActiveTimestamp();
                        resolve();
                    })['catch'](function(error){
                        reject(error);
                    });
                }
            );
        }
    };
}
function StorageService(v, utils) {
    function validateRequiredBlob(params, reject){
        utils.validateParameter('blob', 'The blob parameter is required', params, reject);
    }
    function validateRequiredFile(params, reject){
        utils.validateParameter('file', 'The file parameter is required', params, reject);
    }
    return {
        /**
         * Retrieve the storage meta info for the realm
         *
         * @alias getMetaInfo
         * @param {Object} params params
         * @param {String} params.account BridgeIt Services account name. If not provided, the last known BridgeIt Account will be used.
         * @param {String} params.realm The BridgeIt Services realm. If not provided, the last known BridgeIt Realm name will be used.
         * @param {String} params.accessToken The BridgeIt authentication token. If not provided, the stored token from bridgeit.io.auth.connect() will be used
         * @param {String} params.host The BridgeIt Services host url. If not supplied, the last used BridgeIT host, or the default will be used. (optional)
         * @param {Boolean} params.ssl (default false) Whether to use SSL for network traffic.
         * @param {String} params.scope (default 'self') 'all' or 'self', return meta information for blobs belonging to all users, or only those belonging to the current user
         * @returns {Object} The results
         */
        getMetaInfo: function(params){
            return new Promise(function(resolve, reject) {
                params = params ? params : {};
                v.checkHost(params);
                //validate
                var account = utils.validateAndReturnRequiredAccount(params, reject);
                var realm = utils.validateAndReturnRequiredRealm(params, reject);
                var token = utils.validateAndReturnRequiredAccessToken(params, reject);
                var url = utils.getRealmResourceURL(v.storageURL, account, realm,
                    'meta', token, params.ssl, params.scope ? {scope: params.scope} : null);
                v.$.getJSON(url).then(function(response){
                    v.auth.updateLastActiveTimestamp();
                    resolve(response.directory);
                })['catch'](function(error){
                    reject(error);
                });
            });
        },
        /**
         * Stores a blob
         *
         * @alias uploadBlob
         * @param {Object} params params
         * @param {String} params.account BridgeIt Services account name. If not provided, the last known BridgeIt Account will be used.
         * @param {String} params.realm The BridgeIt Services realm. If not provided, the last known BridgeIt Realm name will be used.
         * @param {String} params.id The blob id. If not provided, the service will return a new id
         * @param {String} params.accessToken The BridgeIt authentication token. If not provided, the stored token from bridgeit.io.auth.connect() will be used
         * @param {String} params.host The BridgeIt Services host url. If not supplied, the last used BridgeIT host, or the default will be used. (optional)
         * @param {Object} params.blob The Blob to store
         * @param {Boolean} params.ssl (default false) Whether to use SSL for network traffic.
         * @param {Function} params.progressCallback The callback function to call on progress events. eg. function progressCallback(percentComplete, xhr){..}
         * @returns {Object} The results
         */
        uploadBlob: function(params){
            return new Promise(function(resolve, reject) {
                params = params ? params : {};
                v.checkHost(params);
                //validate
                var account = utils.validateAndReturnRequiredAccount(params, reject);
                var realm = utils.validateAndReturnRequiredRealm(params, reject);
                var token = utils.validateAndReturnRequiredAccessToken(params, reject);
                validateRequiredBlob(params, reject);
                var formData = new FormData();
                formData.append('file', params.blob);
                var url = utils.getRealmResourceURL(v.storageURL, account, realm,
                    'blobs' + (params.id ? '/' + params.id : ''), token, params.ssl);
                v.$.post(url, formData, null, true, null, params.progressCallback).then(function(response){
                    v.auth.updateLastActiveTimestamp();
                    resolve(response.location || response.uri);
                })['catch'](function(error){
                    reject(error);
                });
            });
        },
        /**
         * Stores a file
         *
         * @alias uploadBlob
         * @param {Object} params params
         * @param {String} params.account BridgeIt Services account name. If not provided, the last known BridgeIt Account will be used.
         * @param {String} params.realm The BridgeIt Services realm. If not provided, the last known BridgeIt Realm name will be used.
         * @param {String} params.id The blob id. If not provided, the service will return a new id
         * @param {String} params.accessToken The BridgeIt authentication token. If not provided, the stored token from bridgeit.io.auth.connect() will be used
         * @param {String} params.host The BridgeIt Services host url. If not supplied, the last used BridgeIT host, or the default will be used. (optional)
         * @param {Object} params.file The Blob to store
         * @param {Boolean} params.ssl (default false) Whether to use SSL for network traffic.
         * @param {Function} params.progressCallback The callback function to call on progress events. eg. function progressCallback(percentComplete, xhr){..}
         * @param {Function} params.onabort The callback for the XMLHttpRequest onabort event
         * @param {Function} params.onerror The callback for the XMLHttpRequest onerror event
         * @returns {Object} The results
         */
        uploadFile: function(params){
            return new Promise(function(resolve, reject) {
                params = params ? params : {};
                v.checkHost(params);
                //validate
                var account = utils.validateAndReturnRequiredAccount(params, reject);
                var realm = utils.validateAndReturnRequiredRealm(params, reject);
                var token = utils.validateAndReturnRequiredAccessToken(params, reject);
                validateRequiredFile(params, reject);
                var url = utils.getRealmResourceURL(v.storageURL, account, realm,
                    'blobs' + (params.id ? '/' + params.id : ''), token, params.ssl);
                var formData = new FormData();
                formData.append('file', params.file);
                v.$.post(url, formData, null, true, null, params.progressCallback, params.onabort, params.onerror).then(function(response){
                    v.auth.updateLastActiveTimestamp();
                    resolve(response.location || response.uri);
                })['catch'](function(error){
                    reject(error);
                });
            });
        },
        /**
         * Retrieves a blob file from the storage service
         *
         * @alias getBlob
         * @param {Object} params params
         * @param {String} params.account BridgeIt Services account name. If not provided, the last known BridgeIt Account will be used.
         * @param {String} params.realm The BridgeIt Services realm. If not provided, the last known BridgeIt Realm name will be used.
         * @param {String} params.id The blob id.
         * @param {String} params.accessToken The BridgeIt authentication token. If not provided, the stored token from bridgeit.io.auth.connect() will be used
         * @param {String} params.host The BridgeIt Services host url. If not supplied, the last used BridgeIT host, or the default will be used. (optional)
         * @param {Boolean} params.ssl (default false) Whether to use SSL for network traffic.
         * @returns {Object} The blob arraybuffer
         */
        getBlob: function(params){
            return new Promise(function(resolve, reject) {
                params = params ? params : {};
                v.checkHost(params);
                //validate
                var account = utils.validateAndReturnRequiredAccount(params, reject);
                var realm = utils.validateAndReturnRequiredRealm(params, reject);
                var token = utils.validateAndReturnRequiredAccessToken(params, reject);
                utils.validateRequiredId(params, reject);
                var url = utils.getRealmResourceURL(v.storageURL, account, realm,
                    'blobs/' + params.id, token, params.ssl);
                v.$.getBlob(url).then(function(response){
                    v.auth.updateLastActiveTimestamp();
                    resolve(response);
                })['catch'](function(error){
                    reject(error);
                });
            });
        },
        /**
         * Deletes a blob file from the storage service
         *
         * @alias deleteBlob
         * @param {Object} params params
         * @param {String} params.account BridgeIt Services account name. If not provided, the last known BridgeIt Account will be used.
         * @param {String} params.realm The BridgeIt Services realm. If not provided, the last known BridgeIt Realm name will be used.
         * @param {String} params.id The blob id.
         * @param {String} params.accessToken The BridgeIt authentication token. If not provided, the stored token from bridgeit.io.auth.connect() will be used
         * @param {String} params.host The BridgeIt Services host url. If not supplied, the last used BridgeIT host, or the default will be used. (optional)
         * @param {Boolean} params.ssl (default false) Whether to use SSL for network traffic.
         */
        deleteBlob: function(params){
            return new Promise(function(resolve, reject) {
                params = params ? params : {};
                v.checkHost(params);
                //validate
                var account = utils.validateAndReturnRequiredAccount(params, reject);
                var realm = utils.validateAndReturnRequiredRealm(params, reject);
                var token = utils.validateAndReturnRequiredAccessToken(params, reject);
                utils.validateRequiredId(params, reject);
                var url = utils.getRealmResourceURL(v.storageURL, account, realm,
                    'blobs/' + params.id, token, params.ssl);
                v.$.doDelete(url).then(function(response){
                    v.auth.updateLastActiveTimestamp();
                    resolve();
                })['catch'](function(error){
                    reject(error);
                });
            });
        }
    };
}
function PrivateUtils(services) {
    //acquire the constants from global context
    var ACCOUNT_KEY = 'bridgeitAccount';
    var REALM_KEY = 'bridgeitRealm';
    function validateRequiredRealm(params, reject){
        validateParameter('realm', 'The BridgeIt realm is required', params, reject);
    }
    function validateAndReturnRequiredAccessToken(params, reject){
        var token = params.accessToken || services.auth.getLastAccessToken();
        if( token ){
            return token;
        }
        else{
            return reject(Error('A BridgeIt access token is required'));
        }
    }
    function validateAndReturnRequiredRealmName(params, reject){
        var realm = params.realmName;
        if( realm ){
            realm = encodeURI(realm);
        }
        else{
            realm = services.auth.getLastKnownRealm();
        }
        if( realm ){
            setSessionStorageItem(btoa(REALM_KEY), btoa(realm));
            return realm;
        }
        else{
            return reject(Error('The BridgeIt realm is required'));
        }
    }
    function validateAndReturnRequiredRealm(params, reject){
        var realm = params.realm;
        if( realm ){
            realm = encodeURI(realm);
        }
        else{
            realm = services.auth.getLastKnownRealm();
        }
        if( realm ){
            setSessionStorageItem(btoa(REALM_KEY), btoa(realm));
            return realm;
        }
        else{
            return reject(Error('The BridgeIt realm is required'));
        }
    }
    function validateAndReturnRequiredAccount(params, reject){
        var account = params.account;
        if( account ){
            account = encodeURI(account);
        }
        else{
            account = services.auth.getLastKnownAccount();
        }
        if( account ){
            setSessionStorageItem(btoa(ACCOUNT_KEY), btoa(account));
            return account;
        }
        else{
            return reject(Error('The BridgeIt account is required'));
        }
    }
    function validateAndReturnRequiredUsername(params, reject){
        var username = params.username;
        if( !username ){
            username = services.auth.getLastKnownUsername();
        }
        if( username ){
            setSessionStorageItem(btoa(USERNAME_KEY), btoa(username));
            return username;
        }
        else{
            return reject(Error('The BridgeIt username is required'));
        }
    }
    function validateRequiredUsername(params, reject){
        validateParameter('username', 'The username parameter is required', params, reject);
    }
    function validateRequiredId(params, reject){
        validateParameter('id', 'The id is required', params, reject);
    }
    function validateParameter(name, msg, params, reject){
        if( !params[name] ){
            reject(Error(msg));
        }
    }
    function useLocalStorage() {
        if (!('bridgeit_useLocalStorage' in window )) {
            if ('localStorage' in window) {
                try {
                    var testdate = new Date().toString();
                    localStorage.setItem('testdate', testdate);
                    if (localStorage.getItem('testdate') === testdate) {
                        window.bridgeit_useLocalStorage = true;
                    }
                    else {
                        window.bridgeit_useLocalStorage = false;
                    }
                    localStorage.removeItem('testdate');
                }
                catch (e) {
                    window.bridgeit_useLocalStorage = false;
                }
            }
            else {
                window.bridgeit_useLocalStorage = false;
            }
        }
        return window.bridgeit_useLocalStorage;
    }
    function getCookie(cname) {
        var name = cname + "=";
        var ca = document.cookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == ' ') c = c.substring(1);
            if (c.indexOf(name) == 0) return c.substring(name.length, c.length);
        }
        return "";
    }
    function setCookie(cname, cvalue, days) {
        var d = new Date();
        d.setTime(d.getTime() + ((days || 1) * 24 * 60 * 60 * 1000));
        var expires = "expires=" + d.toUTCString();
        document.cookie = cname + "=" + cvalue + "; " + expires;
    }
    function getLocalStorageItem(key) {
        return useLocalStorage() ? localStorage.getItem(key) : getCookie(key);
    }
    function getSessionStorageItem(key) {
        return useLocalStorage() ? sessionStorage.getItem(key) : getCookie(key);
    }
    function setLocalStorageItem(key, value) {
        return useLocalStorage() ? localStorage.setItem(key, value) : setCookie(key, value);
    }
    function removeSessionStorageItem(key) {
        if (useLocalStorage()) {
            sessionStorage.removeItem(key);
        } else {
            setCookie(key, null);
        }
    }
    function removeLocalStorageItem(key) {
        if (useLocalStorage()) {
            localStorage.removeItem(key);
        } else {
            setCookie(key, null);
        }
    }
    function setSessionStorageItem(key, value) {
        return useLocalStorage() ? sessionStorage.setItem(key, value) : setCookie(key, value, 1);
    }
    function getTransactionURLParam(){
        var txId = services.getLastTransactionId();
        if( txId ){
            return 'tx=' + txId;
        }
        else{
            return 'tx=null';
        }
    }
    function getRealmResourceURL(servicePath, account, realm, resourcePath, token, ssl, params){
        var protocol = ssl ? 'https://' : 'http://';
        var txParam = getTransactionURLParam();
        var url = protocol + servicePath +
            '/' + account + '/realms/' + realm + '/' + resourcePath + '?' +
            (token ? 'access_token=' + token : '') +
            (txParam ? '&' + txParam : '');
        if( params ){
            for( var key in params ){
                var param = params[key];
                if( typeof param === 'object'){
                    try{
                        param = JSON.stringify(param);
                    }
                    catch(e){
                        param = params[key];
                    }
                }
                url += ('&' + key + '=' + param);
            }
        }
        return url;
    }
    function extractResponseValues(xhr){
        return {
            status: xhr.status,
            statusText: xhr.statusText,
            response: xhr.response,
            responseText: xhr.responseText,
            responseType: xhr.responseType,
            responseXML: xhr.responseXML
        }
    }
    function getFunctionName(fn) {
        var ret = fn.toString();
        ret = ret.substr('function '.length);
        ret = ret.substr(0, ret.indexOf('('));
        return ret;
    }
    function findFunctionInGlobalScope(fn){
        if (!fn)  {
            return null;
        }
        var functionName;
        if( typeof fn === "string" ){
            functionName = fn;
            var parts = functionName.split(".");
            var theObject = window;
            for (var i = 0; i < parts.length; i++) {
                theObject = theObject[parts[i]];
                if (!theObject) {
                    return null;
                }
            }
            if (window == theObject)  {
                return null;
            }
            return theObject;
        }
        else if( typeof fn === "function" ){
            return fn;
        }
    }
    return {
        'getLocalStorageItem': getLocalStorageItem,
        'setLocalStorageItem': setLocalStorageItem,
        'removeLocalStorageItem': removeLocalStorageItem,
        'getSessionStorageItem': getSessionStorageItem,
        'setSessionStorageItem': setSessionStorageItem,
        'removeSessionStorageItem': removeSessionStorageItem,
        'getTransactionURLParam': getTransactionURLParam,
        'getRealmResourceURL': getRealmResourceURL,
        'extractResponseValues': extractResponseValues,
        'getFunctionName': getFunctionName,
        'findFunctionInGlobalScope': findFunctionInGlobalScope,
        'validateParameter': validateParameter,
        'validateRequiredUsername': validateRequiredUsername,
        'validateAndReturnRequiredUsername': validateAndReturnRequiredUsername,
        'validateRequiredRealm': validateRequiredRealm,
        'validateAndReturnRequiredRealm': validateAndReturnRequiredRealm,
        'validateAndReturnRequiredRealmName': validateAndReturnRequiredRealmName,
        'validateAndReturnRequiredAccount': validateAndReturnRequiredAccount,
        'validateAndReturnRequiredAccessToken': validateAndReturnRequiredAccessToken,
        'validateRequiredId': validateRequiredId
    }
}function PublicUtils(utils) {
    return {
        serializePostData: function(data){
            //TODO
        },
        get: function(url, headers){
            return new Promise(function(resolve, reject) {
                var request = new XMLHttpRequest();
                request.open('GET', url, true);
                if( headers ){
                    for( var header in headers ){
                        request.setRequestHeader(header, headers[header]);
                    }
                }
                request.onreadystatechange = function() {
                    if (this.readyState === 4) {
                        if (this.status >= 200 && this.status < 400) {
                            resolve(this.responseText);
                        } else {
                            reject(utils.extractResponseValues(this));
                        }
                    }
                };
                request.onabort = function(evt){
                    reject(evt);
                };
                request.onerror = function(err){
                    reject(err);
                };
                request.send();
                request = null;
            });
        },
        getJSON: function(url, headers){
            return new Promise(function(resolve, reject) {
                var request = new XMLHttpRequest();
                request.open('GET', url, true);
                if( headers ){
                    for( var header in headers ){
                        request.setRequestHeader(header, headers[header]);
                    }
                }
                request.onreadystatechange = function() {
                    if (this.readyState === 4) {
                        if (this.status >= 200 && this.status < 400) {
                            resolve(JSON.parse(this.responseText));
                        } else {
                            reject(utils.extractResponseValues(this));
                        }
                    }
                };
                request.onabort = function(evt){
                    reject(evt);
                };
                request.onerror = function(err){
                    reject(err);
                };
                request.send();
                request = null;
            });
        },
        getBlob: function(url, headers){
            return new Promise(function(resolve, reject){
                var request = new XMLHttpRequest();
                if( headers ){
                    for( var header in headers ){
                        request.setRequestHeader(header, headers[header]);
                    }
                }
                request.onreadystatechange = function(){
                    if (this.readyState === 4){
                        if( this.status === 200){
                            resolve(new Uint8Array(this.response));
                        }
                        else{
                            reject(this);
                        }
                    }
                };
                request.onabort = function(evt){
                    reject(evt);
                };
                request.onerror = function(err){
                    reject(err);
                };
                request.open('GET', url);
                request.responseType = 'arraybuffer';
                request.send();
                request = null;
            });
        },
        post: function(url, data, headers, isFormData, contentType, progressCallback, onabort, onerror){
            return new Promise(function(resolve, reject) {
                console.log('sending post to ' + url);
                contentType = contentType || "application/json";
                var request = new XMLHttpRequest();
                request.open('POST', url, true);
                request.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
                if( !isFormData ){
                    request.setRequestHeader("Content-type", contentType);
                }
                if( headers ){
                    for( var header in headers ){
                        request.setRequestHeader(header, headers[header]);
                    }
                }
                if( progressCallback ){
                    request.upload.addEventListener("progress", function(evt){
                        services.auth.updateLastActiveTimestamp();
                        if (evt.lengthComputable){
                            var percentComplete = evt.loaded / evt.total;
                            progressCallback(percentComplete, request);
                        }
                    }, false);
                }
                request.onabort = function(evt){
                    if( onabort ){
                        onabort();
                    }
                    reject(evt);
                };
                request.onerror = function(err){
                    if( onerror ){
                        request.onerror = onerror;
                    }
                    reject(err);
                };
                request.onreadystatechange = function() {
                    if (this.readyState === 4) {
                        if (this.status >= 200 && this.status < 400) {
                            if( this.responseText ){
                                var json = null;
                                try{
                                    json = JSON.parse(this.responseText);
                                    resolve(json);
                                }
                                catch(e){
                                    resolve(utils.extractResponseValues(this));
                                }
                            }
                            else{
                                resolve();
                            }
                        } else {
                            reject(utils.extractResponseValues(this));
                        }
                    }
                };
                if( data ){
                    request.send(isFormData ? data : JSON.stringify(data));
                }
                else{
                    request.send();
                }
            });
        },
        put: function(url, data, headers, isFormData, contentType){
            return new Promise(function(resolve, reject) {
                console.log('sending put to ' + url);
                contentType = contentType || "application/json";
                var request = new XMLHttpRequest();
                request.open('PUT', url, true);
                request.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
                if( !isFormData ){
                    request.setRequestHeader("Content-type", contentType);
                }
                if( headers ){
                    for( var header in headers ){
                        request.setRequestHeader(header, headers[header]);
                    }
                }
                //request.setRequestHeader("Connection", "close");
                request.onreadystatechange = function() {
                    if (this.readyState === 4) {
                        if (this.status >= 200 && this.status < 400) {
                            if( this.responseText ){
                                var json = null;
                                try{
                                    json = JSON.parse(this.responseText);
                                    resolve(json);
                                }
                                catch(e){
                                    resolve(utils.extractResponseValues(this));
                                }
                            }
                            else{
                                resolve();
                            }
                        } else {
                            reject(utils.extractResponseValues(this));
                        }
                    }
                };
                request.onabort = function(evt){
                    reject(evt);
                };
                request.onerror = function(err){
                    reject(err);
                };
                if( data ){
                    request.send(isFormData ? data : JSON.stringify(data));
                }
                else{
                    request.send();
                }
                request = null;
            });
        },
        doDelete: function(url, headers){
            return new Promise(function(resolve, reject) {
                console.log('sending delete to ' + url);
                var request = new XMLHttpRequest();
                request.open('DELETE', url, true);
                if( headers ){
                    for( var header in headers ){
                        request.setRequestHeader(header, headers[header]);
                    }
                }
                request.onreadystatechange = function() {
                    if (this.readyState === 4) {
                        if (this.status >= 200 && this.status < 400) {
                            services.auth.updateLastActiveTimestamp();
                            resolve();
                        } else {
                            reject(utils.extractResponseValues(this));
                        }
                    }
                };
                request.onabort = function(evt){
                    reject(evt);
                };
                request.onerror = function(err){
                    reject(err);
                };
                request.send();
                request = null;
            });
        },
        newUUID: function()  {
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
                return v.toString(16);
            });
        }
    };
}if (!window.voyent) {
    window.voyent = {};
}
(function (v) {
    var privateUtils = PrivateUtils(v);
    v.$ = PublicUtils(privateUtils);
    var TRANSACTION_KEY = 'bridgeitTransaction';
    v.configureHosts = function (url) {
        var isLocal = ['localhost', '127.0.0.1'].indexOf(url) > -1;
        if (!url) {
            v.baseURL = 'latest.voyent.cloud';
        }
        else {
            v.baseURL = url;
        }
        var baseURL = v.baseURL;
        v.authURL = baseURL + (isLocal ? ':55010' : '') + '/auth';
        v.authAdminURL = baseURL + (isLocal ? ':55010' : '') + '/authadmin';
        v.locateURL = baseURL + (isLocal ? ':55020' : '') + '/locate';
        v.documentsURL = baseURL + (isLocal ? ':55080' : '') + '/docs';
        v.storageURL = baseURL + (isLocal ? ':55030' : '') + '/storage';
        v.metricsURL = baseURL + (isLocal ? ':55040' : '') + '/metrics';
        v.contextURL = baseURL + (isLocal ? ':55060' : '') + '/context';
        v.codeURL = baseURL + (isLocal ? ':55090' : '') + '/code';
        v.pushURL = baseURL + (isLocal ? ':8080' : '') + '/notify';
        v.pushRESTURL = v.pushURL + '/rest';
        v.queryURL = baseURL + (isLocal ? ':55110' : '') + '/query';
        v.actionURL = baseURL + (isLocal ? ':55130' : '') + '/action';
        v.eventhubURL = baseURL + (isLocal ? ':55200' : '') + '/eventhub';
        v.mailboxURL = baseURL + (isLocal ? ':55120' : '') + '/mailbox';
        v.deviceURL = baseURL + (isLocal ? ':55160' : '') + '/device';
    };
    v.checkHost = function (params) {
        //TODO use last configured host if available
        if (params.host) {
            v.configureHosts(params.host);
        }
    };
    v.startTransaction = function () {
        privateUtils.setSessionStorageItem(btoa(TRANSACTION_KEY), v.$.newUUID());
        console.log('bridgeit: started transaction ' + v.getLastTransactionId());
    };
    v.endTransaction = function () {
        privateUtils.removeSessionStorageItem(btoa(TRANSACTION_KEY));
        console.log('bridgeit: ended transaction ' + v.getLastTransactionId());
    };
    v.getLastTransactionId = function () {
        return privateUtils.getSessionStorageItem(btoa(TRANSACTION_KEY));
    };
    v.action = ActionService(v, privateUtils);
    v.admin = AdminService(v, privateUtils);
    v.auth = AuthService(v, privateUtils);
    v.documents = DocService(v, privateUtils);
    v.eventhub = EventHubService(v, privateUtils);
    v.location = LocateService(v, privateUtils);
    v.mailbox = MailboxService(v, privateUtils);
    v.metrics = MetricsService(v, privateUtils);
    v.push = PushService(v, privateUtils);
    v.context = ContextService(v, privateUtils);
    v.code = CodeService(v, privateUtils);
    v.storage = StorageService(v, privateUtils);
    v.query = QueryService(v, privateUtils);
    v.device = DeviceService(v, privateUtils);
    /* Initialization */
    v.configureHosts();
    /* check connect settings */
    if (v.auth.isLoggedIn()) {
        var connectSettings = v.auth.getConnectSettings();
        if (connectSettings) {
            //user is logged in and has connect settings, so reconnect
            v.auth.connect(connectSettings);
        }
    }
})(voyent);