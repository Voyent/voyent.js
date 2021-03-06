function ScopeService(v, utils) {
    function validateRequiredProperty(params, reject){
        utils.validateParameter('property', 'The property parameter is required', params, reject);
    }

    function validateRequiredData(params, reject){
        utils.validateParameter('data', 'The data parameter is required', params, reject);
    }


    return {
        /**
         * Create or update data stored within a realm scope.
         *
         * @memberOf voyent.scope
         * @alias createRealmData
         * @param {Object} params params
         * @param {Object} params.data The object containing one or more properties to be inserted into the realm scope.
         * @param {String} params.account Voyent Services account name. If not provided, the last known Voyent Account
         * will be used.
         * @param {String} params.realm The Voyent Services realm. If not provided, the last known Voyent Realm name
         * will be used.
         * @param {String} params.accessToken The Voyent authentication token. If not provided, the stored token from
         * voyent.auth.connect() will be used.
         * @param {String} params.host The Voyent Services host url. If not provided, the last used Voyent host, or the
         * default will be used.
         * @returns {String} The resource URI.
         */
        createRealmData: function(params) {
            return new Promise(
                function (resolve, reject) {
                    params = params ? params : {};

                    //validate
                    var account = utils.validateAndReturnRequiredAccount(params, reject);
                    var realm = utils.validateAndReturnRequiredRealm(params, reject);
                    var token = utils.validateAndReturnRequiredAccessToken(params, reject);
                    validateRequiredData(params, reject);

                    var url = utils.getRealmResourceURL(v.scopeURL, account, realm,
                        'scopes/realm', token);

                    v.$.post(url, params.data).then(function (response) {
                        v.auth.updateLastActiveTimestamp();
                        resolve(response.uri);
                    })['catch'](function (error) {
                        reject(error);
                    });
                }
            );
        },

        /**
         * Retrieve a single property stored in realm scope or the entire realm scope if no property is provided.
         *
         * @memberOf voyent.scope
         * @alias getRealmData
         * @param {Object} params params
         * @param {String} params.property The name of the data property to retrieve from realm scope. If not provided,
         * all data for the scope will be retrieved.
         * @param {String} params.account Voyent Services account name. If not provided, the last known Voyent Account
         * will be used.
         * @param {String} params.realm The Voyent Services realm. If not provided, the last known Voyent Realm name
         * will be used.
         * @param {String} params.accessToken The Voyent authentication token. If not provided, the stored token from
         * voyent.auth.connect() will be used.
         * @param {String} params.host The Voyent Services host url. If not provided, the last used Voyent host, or the
         * default will be used.
         * @returns {Object} The scoped data.
         */
        getRealmData: function(params) {
            return new Promise(
                function (resolve, reject) {
                    params = params ? params : {};

                    // Set 'nostore' to ensure the following checks don't update our lastKnown calls
                    params.nostore = true;
                    
                    var account = utils.validateAndReturnRequiredAccount(params, reject);
                    var realm = utils.validateAndReturnRequiredRealm(params, reject);
                    var token = utils.validateAndReturnRequiredAccessToken(params, reject);

                    var queryParams = {};
                    if (params.property) {
                        queryParams[params.property] = '';
                    }

                    var url = utils.getRealmResourceURL(v.scopeURL, account, realm,
                        'scopes/realm', token, queryParams);

                    v.$.getJSON(url).then(function (data) {
                        v.auth.updateLastActiveTimestamp();
                        resolve(data);
                    })['catch'](function (error) {
                        reject(error);
                    });
                }
            );
        },

        /**
         * Delete a single property stored in realm scope.
         *
         * @memberOf voyent.scope
         * @alias deleteRealmData
         * @param {Object} params params
         * @param {String} params.property The name of the data property to delete from realm scope. Required.
         * @param {String} params.account Voyent Services account name. If not provided, the last known Voyent Account
         * will be used.
         * @param {String} params.realm The Voyent Services realm. If not provided, the last known Voyent Realm name
         * will be used.
         * @param {String} params.accessToken The Voyent authentication token. If not provided, the stored token from
         * voyent.auth.connect() will be used.
         * @param {String} params.host The Voyent Services host url. If not provided, the last used Voyent host, or the
         * default will be used.
         */
        deleteRealmData: function(params) {
            return new Promise(
                function (resolve, reject) {
                    params = params ? params : {};

                    //validate
                    var account = utils.validateAndReturnRequiredAccount(params, reject);
                    var realm = utils.validateAndReturnRequiredRealm(params, reject);
                    var token = utils.validateAndReturnRequiredAccessToken(params, reject);
                    validateRequiredProperty(params, reject);

                    var queryParams = {};
                    queryParams[params.property] = '';

                    var url = utils.getRealmResourceURL(v.scopeURL, account, realm,
                        'scopes/realm', token, queryParams);

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
         * Delete an entire realm scope and all of it's data. Use with care, this action cannot be undone.
         *
         * @memberOf voyent.scope
         * @alias deleteRealmScope
         * @param {Object} params params
         * @param {String} params.account Voyent Services account name. If not provided, the last known Voyent Account
         * will be used.
         * @param {String} params.realm The Voyent Services realm. If not provided, the last known Voyent Realm name
         * will be used.
         * @param {String} params.accessToken The Voyent authentication token. If not provided, the stored token from
         * voyent.auth.connect() will be used.
         * @param {String} params.host The Voyent Services host url. If not provided, the last used Voyent host, or the
         * default will be used.
         */
        deleteRealmScope: function(params) {
            return new Promise(
                function (resolve, reject) {
                    params = params ? params : {};

                    //validate
                    var account = utils.validateAndReturnRequiredAccount(params, reject);
                    var realm = utils.validateAndReturnRequiredRealm(params, reject);
                    var token = utils.validateAndReturnRequiredAccessToken(params, reject);

                    var queryParams = {"_invalidate":''};

                    var url = utils.getRealmResourceURL(v.scopeURL, account, realm,
                        'scopes/realm', token, queryParams);

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
         * Create or update data stored within an account scope.
         *
         * @memberOf voyent.scope
         * @alias createAccountData
         * @param {Object} params params
         * @param {Object} params.data The object containing one or more properties to be inserted into the account scope.
         * @param {String} params.account Voyent Services account name. If not provided, the last known Voyent Account
         * will be used.
         * @param {String} params.realm The Voyent Services realm. If not provided, the last known Voyent Realm name
         * will be used.
         * @param {String} params.accessToken The Voyent authentication token. If not provided, the stored token from
         * voyent.auth.connect() will be used.
         * @param {String} params.host The Voyent Services host url. If not provided, the last used Voyent host, or the
         * default will be used.
         * @returns {String} The resource URI.
         */
        createAccountData: function(params) {
            return new Promise(
                function (resolve, reject) {
                    params = params ? params : {};

                    //validate
                    var account = utils.validateAndReturnRequiredAccount(params, reject);
                    var realm = utils.validateAndReturnRequiredRealm(params, reject);
                    var token = utils.validateAndReturnRequiredAccessToken(params, reject);
                    validateRequiredData(params, reject);

                    var url = utils.getRealmResourceURL(v.scopeURL, account, realm,
                        'scopes/account', token);

                    v.$.post(url, params.data).then(function (response) {
                        v.auth.updateLastActiveTimestamp();
                        resolve(response.uri);
                    })['catch'](function (error) {
                        reject(error);
                    });
                }
            );
        },

        /**
         * Retrieve a single property stored in account scope or the entire account scope if no property is provided.
         *
         * @memberOf voyent.scope
         * @alias getAccountData
         * @param {Object} params params
         * @param {String} params.property The name of the data property to retrieve from account scope. If not provided,
         * all data for the scope will be retrieved.
         * @param {String} params.account Voyent Services account name. If not provided, the last known Voyent Account
         * will be used.
         * @param {String} params.realm The Voyent Services realm. If not provided, the last known Voyent Realm name
         * will be used.
         * @param {String} params.accessToken The Voyent authentication token. If not provided, the stored token from
         * voyent.auth.connect() will be used.
         * @param {String} params.host The Voyent Services host url. If not provided, the last used Voyent host, or the
         * default will be used.
         * @returns {Object} The scoped data.
         */
        getAccountData: function(params) {
            return new Promise(
                function (resolve, reject) {
                    params = params ? params : {};

                    // Set 'nostore' to ensure the following checks don't update our lastKnown calls
                    params.nostore = true;
                    
                    var account = utils.validateAndReturnRequiredAccount(params, reject);
                    var realm = utils.validateAndReturnRequiredRealm(params, reject);
                    var token = utils.validateAndReturnRequiredAccessToken(params, reject);

                    var queryParams = {};
                    if (params.property) {
                        queryParams[params.property] = '';
                    }

                    var url = utils.getRealmResourceURL(v.scopeURL, account, realm,
                        'scopes/account', token, queryParams);

                    v.$.getJSON(url).then(function (data) {
                        v.auth.updateLastActiveTimestamp();
                        resolve(data);
                    })['catch'](function (error) {
                        reject(error);
                    });
                }
            );
        },

        /**
         * Delete a single property stored in account scope.
         *
         * @memberOf voyent.scope
         * @alias deleteAccountData
         * @param {Object} params params
         * @param {String} params.property The name of the data property to delete from account scope. Required.
         * @param {String} params.account Voyent Services account name. If not provided, the last known Voyent Account
         * will be used.
         * @param {String} params.realm The Voyent Services realm. If not provided, the last known Voyent Realm name
         * will be used.
         * @param {String} params.accessToken The Voyent authentication token. If not provided, the stored token from
         * voyent.auth.connect() will be used.
         * @param {String} params.host The Voyent Services host url. If not provided, the last used Voyent host, or the
         * default will be used.
         */
        deleteAccountData: function(params) {
            return new Promise(
                function (resolve, reject) {
                    params = params ? params : {};

                    //validate
                    var account = utils.validateAndReturnRequiredAccount(params, reject);
                    var realm = utils.validateAndReturnRequiredRealm(params, reject);
                    var token = utils.validateAndReturnRequiredAccessToken(params, reject);
                    validateRequiredProperty(params, reject);

                    var queryParams = {};
                    queryParams[params.property] = '';

                    var url = utils.getRealmResourceURL(v.scopeURL, account, realm,
                        'scopes/account', token, queryParams);

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
         * Create or update data stored within a user scope.
         *
         * @memberOf voyent.scope
         * @alias createUserData
         * @param {Object} params params
         * @param {Object} params.id The user id, the user scope to create data in.
         * @param {Object} params.data The object containing one or more properties to be inserted into the user scope.
         * @param {String} params.account Voyent Services account name. If not provided, the last known Voyent Account
         * will be used.
         * @param {String} params.realm The Voyent Services realm. If not provided, the last known Voyent Realm name
         * will be used.
         * @param {String} params.accessToken The Voyent authentication token. If not provided, the stored token from
         * voyent.auth.connect() will be used.
         * @param {String} params.host The Voyent Services host url. If not provided, the last used Voyent host, or the
         * default will be used.
         * @returns {String} The resource URI.
         */
        createUserData: function(params) {
            return new Promise(
                function (resolve, reject) {
                    params = params ? params : {};

                    //validate
                    var account = utils.validateAndReturnRequiredAccount(params, reject);
                    var realm = utils.validateAndReturnRequiredRealm(params, reject);
                    var token = utils.validateAndReturnRequiredAccessToken(params, reject);
                    utils.validateRequiredId(params, reject);
                    validateRequiredData(params, reject);

                    var url = utils.getRealmResourceURL(v.scopeURL, account, realm,
                        'scopes/user/' + params.id, token);

                    v.$.post(url, params.data).then(function (response) {
                        v.auth.updateLastActiveTimestamp();
                        resolve(response.uri);
                    })['catch'](function (error) {
                        reject(error);
                    });
                }
            );
        },

        /**
         * Retrieve a single property stored in user scope or the entire user scope if no property is provided.
         *
         * @memberOf voyent.scope
         * @alias getUserData
         * @param {Object} params params
         * @param {Object} params.id The user id, the user scope to get data from.
         * @param {String} params.property The name of the data property to retrieve from user scope. If not provided,
         * all data for the scope will be retrieved.
         * @param {String} params.account Voyent Services account name. If not provided, the last known Voyent Account
         * will be used.
         * @param {String} params.realm The Voyent Services realm. If not provided, the last known Voyent Realm name
         * will be used.
         * @param {String} params.accessToken The Voyent authentication token. If not provided, the stored token from
         * voyent.auth.connect() will be used.
         * @param {String} params.host The Voyent Services host url. If not provided, the last used Voyent host, or the
         * default will be used.
         * @returns {Object} The scoped data.
         */
        getUserData: function(params) {
            return new Promise(
                function (resolve, reject) {
                    params = params ? params : {};

                    //validate
                    var account = utils.validateAndReturnRequiredAccount(params, reject);
                    var realm = utils.validateAndReturnRequiredRealm(params, reject);
                    var token = utils.validateAndReturnRequiredAccessToken(params, reject);
                    utils.validateRequiredId(params, reject);

                    var queryParams = {};
                    if (params.property) {
                        queryParams[params.property] = '';
                    }

                    var url = utils.getRealmResourceURL(v.scopeURL, account, realm,
                        'scopes/user/' + params.id, token, queryParams);

                    v.$.getJSON(url).then(function (data) {
                        v.auth.updateLastActiveTimestamp();
                        resolve(data);
                    })['catch'](function (error) {
                        reject(error);
                    });
                }
            );
        },

        /**
         * Delete a single property stored in user scope.
         *
         * @memberOf voyent.scope
         * @alias deleteUserData
         * @param {Object} params params
         * @param {Object} params.id The user id, the user scope to delete data from.
         * @param {String} params.property The name of the data property to delete from user scope. Required.
         * @param {String} params.account Voyent Services account name. If not provided, the last known Voyent Account
         * will be used.
         * @param {String} params.realm The Voyent Services realm. If not provided, the last known Voyent Realm name
         * will be used.
         * @param {String} params.accessToken The Voyent authentication token. If not provided, the stored token from
         * voyent.auth.connect() will be used.
         * @param {String} params.host The Voyent Services host url. If not provided, the last used Voyent host, or the
         * default will be used.
         */
        deleteUserData: function(params) {
            return new Promise(
                function (resolve, reject) {
                    params = params ? params : {};

                    //validate
                    var account = utils.validateAndReturnRequiredAccount(params, reject);
                    var realm = utils.validateAndReturnRequiredRealm(params, reject);
                    var token = utils.validateAndReturnRequiredAccessToken(params, reject);
                    utils.validateRequiredId(params, reject);
                    validateRequiredProperty(params, reject);

                    var queryParams = {};
                    queryParams[params.property] = '';

                    var url = utils.getRealmResourceURL(v.scopeURL, account, realm,
                        'scopes/user/' + params.id, token, queryParams);

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
         * Delete an entire user scope and all of it's data. Use with care, this action cannot be undone.
         *
         * @memberOf voyent.scope
         * @alias deleteUserScope
         * @param {Object} params params
         * @param {Object} params.id The user id, the user scope to delete.
         * @param {String} params.account Voyent Services account name. If not provided, the last known Voyent Account
         * will be used.
         * @param {String} params.realm The Voyent Services realm. If not provided, the last known Voyent Realm name
         * will be used.
         * @param {String} params.accessToken The Voyent authentication token. If not provided, the stored token from
         * voyent.auth.connect() will be used.
         * @param {String} params.host The Voyent Services host url. If not provided, the last used Voyent host, or the
         * default will be used.
         */
        deleteUserScope: function(params) {
            return new Promise(
                function (resolve, reject) {
                    params = params ? params : {};

                    //validate
                    var account = utils.validateAndReturnRequiredAccount(params, reject);
                    var realm = utils.validateAndReturnRequiredRealm(params, reject);
                    var token = utils.validateAndReturnRequiredAccessToken(params, reject);
                    utils.validateRequiredId(params, reject);

                    var queryParams = {"_invalidate":''};

                    var url = utils.getRealmResourceURL(v.scopeURL, account, realm,
                        'scopes/user/' + params.id, token, queryParams);

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
         * Create or update data stored within a process scope.
         *
         * @memberOf voyent.scope
         * @alias createProcessData
         * @param {Object} params params
         * @param {Object} params.id The process id, the process scope to create data in.
         * @param {Object} params.data The object containing one or more properties to be inserted into the process
         * scope.
         * @param {String} params.account Voyent Services account name. If not provided, the last known Voyent Account
         * will be used.
         * @param {String} params.realm The Voyent Services realm. If not provided, the last known Voyent Realm name
         * will be used.
         * @param {String} params.accessToken The Voyent authentication token. If not provided, the stored token from
         * voyent.auth.connect() will be used.
         * @param {String} params.host The Voyent Services host url. If not provided, the last used Voyent host, or the
         * default will be used.
         * @returns {String} The resource URI.
         */
        createProcessData: function(params) {
            return new Promise(
                function (resolve, reject) {
                    params = params ? params : {};

                    //validate
                    var account = utils.validateAndReturnRequiredAccount(params, reject);
                    var realm = utils.validateAndReturnRequiredRealm(params, reject);
                    var token = utils.validateAndReturnRequiredAccessToken(params, reject);
                    utils.validateRequiredId(params, reject);
                    validateRequiredData(params, reject);

                    var url = utils.getRealmResourceURL(v.scopeURL, account, realm,
                        'scopes/process/' + params.id, token);

                    v.$.post(url, params.data).then(function (response) {
                        v.auth.updateLastActiveTimestamp();
                        resolve(response.uri);
                    })['catch'](function (error) {
                        reject(error);
                    });
                }
            );
        },

        /**
         * Retrieve a single property stored in process scope or the entire process scope if no property is provided.
         *
         * @memberOf voyent.scope
         * @alias getProcessData
         * @param {Object} params params
         * @param {Object} params.id The process id, the process scope to get data from.
         * @param {String} params.property The name of the data property to retrieve from process scope. If not
         * provided, all data for the scope will be retrieved.
         * @param {String} params.account Voyent Services account name. If not provided, the last known Voyent Account
         * will be used.
         * @param {String} params.realm The Voyent Services realm. If not provided, the last known Voyent Realm name
         * will be used.
         * @param {String} params.accessToken The Voyent authentication token. If not provided, the stored token from
         * voyent.auth.connect() will be used.
         * @param {String} params.host The Voyent Services host url. If not provided, the last used Voyent host, or the
         * default will be used.
         * @returns {Object} The scoped data.
         */
        getProcessData: function(params) {
            return new Promise(
                function (resolve, reject) {
                    params = params ? params : {};

                    //validate
                    var account = utils.validateAndReturnRequiredAccount(params, reject);
                    var realm = utils.validateAndReturnRequiredRealm(params, reject);
                    var token = utils.validateAndReturnRequiredAccessToken(params, reject);
                    utils.validateRequiredId(params, reject);

                    var queryParams = {};
                    if (params.property) {
                        queryParams[params.property] = '';
                    }

                    var url = utils.getRealmResourceURL(v.scopeURL, account, realm,
                        'scopes/process/' + params.id, token, queryParams);

                    v.$.getJSON(url).then(function (data) {
                        v.auth.updateLastActiveTimestamp();
                        resolve(data);
                    })['catch'](function (error) {
                        reject(error);
                    });
                }
            );
        },

        /**
         * Delete a single property stored in process scope.
         *
         * @memberOf voyent.scope
         * @alias deleteProcessData
         * @param {Object} params params
         * @param {Object} params.id The process id, the process scope to delete data from.
         * @param {String} params.property The name of the data property to delete from process scope. Required.
         * @param {String} params.account Voyent Services account name. If not provided, the last known Voyent Account
         * will be used.
         * @param {String} params.realm The Voyent Services realm. If not provided, the last known Voyent Realm name
         * will be used.
         * @param {String} params.accessToken The Voyent authentication token. If not provided, the stored token from
         * voyent.auth.connect() will be used.
         * @param {String} params.host The Voyent Services host url. If not provided, the last used Voyent host, or the
         * default will be used.
         */
        deleteProcessData: function(params) {
            return new Promise(
                function (resolve, reject) {
                    params = params ? params : {};

                    //validate
                    var account = utils.validateAndReturnRequiredAccount(params, reject);
                    var realm = utils.validateAndReturnRequiredRealm(params, reject);
                    var token = utils.validateAndReturnRequiredAccessToken(params, reject);
                    utils.validateRequiredId(params, reject);
                    validateRequiredProperty(params, reject);

                    var queryParams = {};
                    queryParams[params.property] = '';

                    var url = utils.getRealmResourceURL(v.scopeURL, account, realm,
                        'scopes/process/' + params.id, token, queryParams);

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
         * Delete an entire process scope and all of it's data. Use with care, this action cannot be undone.
         *
         * @memberOf voyent.scope
         * @alias deleteProcessScope
         * @param {Object} params params
         * @param {Object} params.id The process id, the process scope to delete.
         * @param {String} params.account Voyent Services account name. If not provided, the last known Voyent Account
         * will be used.
         * @param {String} params.realm The Voyent Services realm. If not provided, the last known Voyent Realm name
         * will be used.
         * @param {String} params.accessToken The Voyent authentication token. If not provided, the stored token from
         * voyent.auth.connect() will be used.
         * @param {String} params.host The Voyent Services host url. If not provided, the last used Voyent host, or the
         * default will be used.
         */
        deleteProcessScope: function(params) {
            return new Promise(
                function (resolve, reject) {
                    params = params ? params : {};

                    //validate
                    var account = utils.validateAndReturnRequiredAccount(params, reject);
                    var realm = utils.validateAndReturnRequiredRealm(params, reject);
                    var token = utils.validateAndReturnRequiredAccessToken(params, reject);
                    utils.validateRequiredId(params, reject);

                    var queryParams = {"_invalidate":''};

                    var url = utils.getRealmResourceURL(v.scopeURL, account, realm,
                        'scopes/process/' + params.id, token, queryParams);

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
         * Create or update data stored within a transaction scope.
         *
         * @memberOf voyent.scope
         * @alias createTransactionData
         * @param {Object} params params
         * @param {Object} params.id The transaction id, the transaction scope to create data in.
         * @param {Object} params.data The object containing one or more properties to be inserted into the transaction
         * scope.
         * @param {String} params.account Voyent Services account name. If not provided, the last known Voyent Account
         * will be used.
         * @param {String} params.realm The Voyent Services realm. If not provided, the last known Voyent Realm name
         * will be used.
         * @param {String} params.accessToken The Voyent authentication token. If not provided, the stored token from
         * voyent.auth.connect() will be used.
         * @param {String} params.host The Voyent Services host url. If not provided, the last used Voyent host, or the
         * default will be used.
         * @returns {String} The resource URI.
         */
        createTransactionData: function(params) {
            return new Promise(
                function (resolve, reject) {
                    params = params ? params : {};

                    //validate
                    var account = utils.validateAndReturnRequiredAccount(params, reject);
                    var realm = utils.validateAndReturnRequiredRealm(params, reject);
                    var token = utils.validateAndReturnRequiredAccessToken(params, reject);
                    utils.validateRequiredId(params, reject);
                    validateRequiredData(params, reject);

                    var url = utils.getRealmResourceURL(v.scopeURL, account, realm,
                        'scopes/transaction/' + params.id, token);

                    v.$.post(url, params.data).then(function (response) {
                        v.auth.updateLastActiveTimestamp();
                        resolve(response.uri);
                    })['catch'](function (error) {
                        reject(error);
                    });
                }
            );
        },

        /**
         * Retrieve a single property stored in transaction scope or the entire transaction scope if no property is
         * provided.
         *
         * @memberOf voyent.scope
         * @alias getTransactionData
         * @param {Object} params params
         * @param {Object} params.id The transaction id, the transaction scope to get data from.
         * @param {String} params.property The name of the data property to retrieve from transaction scope. If not
         * provided, all data for the scope will be retrieved.
         * @param {String} params.account Voyent Services account name. If not provided, the last known Voyent Account
         * will be used.
         * @param {String} params.realm The Voyent Services realm. If not provided, the last known Voyent Realm name
         * will be used.
         * @param {String} params.accessToken The Voyent authentication token. If not provided, the stored token from
         * voyent.auth.connect() will be used.
         * @param {String} params.host The Voyent Services host url. If not provided, the last used Voyent host, or the
         * default will be used.
         * @returns {Object} The scoped data.
         */
        getTransactionData: function(params) {
            return new Promise(
                function (resolve, reject) {
                    params = params ? params : {};

                    //validate
                    var account = utils.validateAndReturnRequiredAccount(params, reject);
                    var realm = utils.validateAndReturnRequiredRealm(params, reject);
                    var token = utils.validateAndReturnRequiredAccessToken(params, reject);
                    utils.validateRequiredId(params, reject);

                    var queryParams = {};
                    if (params.property) {
                        queryParams[params.property] = '';
                    }

                    var url = utils.getRealmResourceURL(v.scopeURL, account, realm,
                        'scopes/transaction/' + params.id, token, queryParams);

                    v.$.getJSON(url).then(function (data) {
                        v.auth.updateLastActiveTimestamp();
                        resolve(data);
                    })['catch'](function (error) {
                        reject(error);
                    });
                }
            );
        },

        /**
         * Delete a single property stored in transaction scope.
         *
         * @memberOf voyent.scope
         * @alias deleteTransactionData
         * @param {Object} params params
         * @param {Object} params.id The transaction id, the transaction scope to delete data from.
         * @param {String} params.property The name of the data property to delete from transaction scope. Required.
         * @param {String} params.account Voyent Services account name. If not provided, the last known Voyent Account
         * will be used.
         * @param {String} params.realm The Voyent Services realm. If not provided, the last known Voyent Realm name
         * will be used.
         * @param {String} params.accessToken The Voyent authentication token. If not provided, the stored token from
         * voyent.auth.connect() will be used.
         * @param {String} params.host The Voyent Services host url. If not provided, the last used Voyent host, or the
         * default will be used.
         */
        deleteTransactionData: function(params) {
            return new Promise(
                function (resolve, reject) {
                    params = params ? params : {};

                    //validate
                    var account = utils.validateAndReturnRequiredAccount(params, reject);
                    var realm = utils.validateAndReturnRequiredRealm(params, reject);
                    var token = utils.validateAndReturnRequiredAccessToken(params, reject);
                    utils.validateRequiredId(params, reject);
                    validateRequiredProperty(params, reject);

                    var queryParams = {};
                    queryParams[params.property] = '';

                    var url = utils.getRealmResourceURL(v.scopeURL, account, realm,
                        'scopes/transaction/' + params.id, token, queryParams);

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
         * Delete an entire transaction scope and all of it's data. Use with care, this action cannot be undone.
         *
         * @memberOf voyent.scope
         * @alias deleteTransactionScope
         * @param {Object} params params
         * @param {Object} params.id The transaction id, the transaction scope to delete.
         * @param {String} params.account Voyent Services account name. If not provided, the last known Voyent Account
         * will be used.
         * @param {String} params.realm The Voyent Services realm. If not provided, the last known Voyent Realm name
         * will be used.
         * @param {String} params.accessToken The Voyent authentication token. If not provided, the stored token from
         * voyent.auth.connect() will be used.
         * @param {String} params.host The Voyent Services host url. If not provided, the last used Voyent host, or the
         * default will be used.
         */
        deleteTransactionScope: function(params) {
            return new Promise(
                function (resolve, reject) {
                    params = params ? params : {};

                    //validate
                    var account = utils.validateAndReturnRequiredAccount(params, reject);
                    var realm = utils.validateAndReturnRequiredRealm(params, reject);
                    var token = utils.validateAndReturnRequiredAccessToken(params, reject);
                    utils.validateRequiredId(params, reject);

                    var queryParams = {"_invalidate":''};

                    var url = utils.getRealmResourceURL(v.scopeURL, account, realm,
                        'scopes/transaction/' + params.id, token, queryParams);

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
         * Touch a transaction scope. Touching a scope updates the last accessed time without changing anything else.
         *
         * @memberOf voyent.scope
         * @alias touchTransactionScope
         * @param {Object} params params
         * @param {String} params.id The transaction id, the transaction scope to touch.
         * @param {String} params.account Voyent Services account name. If not provided, the last known Voyent Account
         * will be used.
         * @param {String} params.realm The Voyent Services realm. If not provided, the last known Voyent Realm name
         * will be used.
         * @param {String} params.accessToken The Voyent authentication token. If not provided, the stored token from
         * voyent.auth.connect() will be used.
         * @param {String} params.host The Voyent Services host url. If not provided, the last used Voyent host, or the
         * default will be used.
         */
        touchTransactionScope: function(params) {
            return new Promise(
                function (resolve, reject) {
                    params = params ? params : {};

                    //validate
                    var account = utils.validateAndReturnRequiredAccount(params, reject);
                    var realm = utils.validateAndReturnRequiredRealm(params, reject);
                    var token = utils.validateAndReturnRequiredAccessToken(params, reject);
                    utils.validateRequiredId(params, reject);

                    var url = utils.getRealmResourceURL(v.scopeURL, account, realm,
                        'scopes/transaction/' + params.id, token);

                    v.$.put(url).then(function(){
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