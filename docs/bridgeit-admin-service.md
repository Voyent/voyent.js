#BridgeIt Admin Service JavaScript API

## Admin API

* [getServiceDefinitions](#getServiceDefinitions)
* [getRealmUsers](#getRealmUsers)
* [getRealmUser](#getRealmUser)
* [getAccountRealms](#getAccountRealms)
* [getAccountRealm](#getAccountRealm)

### <a name="getServiceDefinitions"></a>executeFlow

```javascript
function bridgeit.services.admin.getServiceDefinitions(params)
```

Get the BridgeIt Service definitions.

#### Parameters

| Name | Description | Type | Default | Required |
| ---- | ----------- | ---- | ------- | -------- |
| account | BridgeIt Services account name. If not provided, the last known BridgeIt Account will be used.| String | | false |
| realm | The BridgeIt Services realm. If not provided, the last known BridgeIt Realm will be used. | String | | false |
| accessToken | The BridgeIt authentication token. If not provided, the stored token from bridgeit.services.auth.connect() will be used | String | | false |
| host | The BridgeIt Services host url. If not supplied, the last used BridgeIt host, or the default will be used. | String | api.bridgeit.io | false |
| ssl | Whether to use SSL for network traffic | Boolean | false | false |

#### Return value

Promise with a JSON object containing a list of BridgeIt services.

#### Example

```javascript
bridgeit.services.code.getServiceDefinitions({
		account: accountId,
		accessToken: "d9f7463d-d100-42b6-aecd-ae21e38e5d02"
	})
}).then(function(services){
	console.log('found the following bridgeit services: ' + JSON.stringify(services));
}).catch(function(error){
	console.log('something went wrong: ' + error);
});
```
### <a name="getRealmUsers"></a>getRealmUsers

```javascript
function bridgeit.services.admin.getRealmUsers(params)
```

Get the users for an account realm.

#### Parameters

| Name | Description | Type | Default | Required |
| ---- | ----------- | ---- | ------- | -------- |
| account | BridgeIt Services account name. If not provided, the last known BridgeIt Account will be used.| String | | false |
| realm | The BridgeIt Services realm. If not provided, the last known BridgeIt Realm will be used. | String | | false |
| accessToken | The BridgeIt authentication token. If not provided, the stored token from bridgeit.services.auth.connect() will be used | String | | false |
| host | The BridgeIt Services host url. If not supplied, the last used BridgeIt host, or the default will be used. | String | api.bridgeit.io | false |
| ssl | Whether to use SSL for network traffic | Boolean | false | false |

#### Return value

Promise with a JSON object containing a list of realm users.

#### Example

```javascript
bridgeit.services.code.getRealmUsers({
		account: accountId,
		realm: 'nargles.net'
		accessToken: "d9f7463d-d100-42b6-aecd-ae21e38e5d02"
	})
}).then(function(users){
	console.log('found the following users: ' + JSON.stringify(users));
}).catch(function(error){
	console.log('something went wrong: ' + error);
});
```
### <a name="getRealmUser"></a>getRealmUser

```javascript
function bridgeit.services.admin.getRealmUser(params)
```

Get a user for an account realm.

#### Parameters

| Name | Description | Type | Default | Required |
| ---- | ----------- | ---- | ------- | -------- |
| account | BridgeIt Services account name. If not provided, the last known BridgeIt Account will be used.| String | | false |
| realm | The BridgeIt Services realm. If not provided, the last known BridgeIt Realm will be used. | String | | false |
| accessToken | The BridgeIt authentication token. If not provided, the stored token from bridgeit.services.auth.connect() will be used | String | | false |
| host | The BridgeIt Services host url. If not supplied, the last used BridgeIt host, or the default will be used. | String | api.bridgeit.io | false |
| ssl | Whether to use SSL for network traffic | Boolean | false | false |
| username | The user id | String | | true |

#### Return value

Promise with a JSON object the user information.

#### Example

```javascript
bridgeit.services.code.getRealmUser({
		account: accountId,
		realm: 'nargles.net'
		accessToken: "d9f7463d-d100-42b6-aecd-ae21e38e5d02",
		username: 'johnsmith'
	})
}).then(function(user){
	console.log('found the following user: ' + JSON.stringify(user));
}).catch(function(error){
	console.log('something went wrong: ' + error);
});
```
### <a name="getAccountRealms"></a>getAccountRealms

```javascript
function bridgeit.services.admin.getAccountRealms(params)
```

Get a list of realms for an account.

#### Parameters

| Name | Description | Type | Default | Required |
| ---- | ----------- | ---- | ------- | -------- |
| account | BridgeIt Services account name. If not provided, the last known BridgeIt Account will be used.| String | | false |
| accessToken | The BridgeIt authentication token. If not provided, the stored token from bridgeit.services.auth.connect() will be used | String | | false |
| host | The BridgeIt Services host url. If not supplied, the last used BridgeIt host, or the default will be used. | String | api.bridgeit.io | false |
| ssl | Whether to use SSL for network traffic | Boolean | false | false |

#### Return value

Promise with a JSON object with a list of realm objects.

#### Example

```javascript
bridgeit.services.code.getAccountRealms({
		account: accountId,
		accessToken: "d9f7463d-d100-42b6-aecd-ae21e38e5d02"
	})
}).then(function(realms){
	console.log('found the following realms: ' + JSON.stringify(realms));
}).catch(function(error){
	console.log('something went wrong: ' + error);
});
```

### <a name="getAccountRealm"></a>getAccountRealm

```javascript
function bridgeit.services.admin.getAccountRealm(params)
```

Get a list of realms for an account.

#### Parameters

| Name | Description | Type | Default | Required |
| ---- | ----------- | ---- | ------- | -------- |
| account | BridgeIt Services account name. If not provided, the last known BridgeIt Account will be used.| String | | false |
| realm | The BridgeIt Services realm. If not provided, the last known BridgeIt Realm will be used. | String | | false |
| accessToken | The BridgeIt authentication token. If not provided, the stored token from bridgeit.services.auth.connect() will be used | String | | false |
| host | The BridgeIt Services host url. If not supplied, the last used BridgeIt host, or the default will be used. | String | api.bridgeit.io | false |
| ssl | Whether to use SSL for network traffic | Boolean | false | false |
| realm | The realm name | String | | true |

#### Return value

Promise with a JSON object the realm information.

#### Example

```javascript
bridgeit.services.code.getAccountRealm({
		account: accountId,
		accessToken: "d9f7463d-d100-42b6-aecd-ae21e38e5d02",
		realm: 'nargles.net'
	})
}).then(function(realm){
	console.log('found the following realm: ' + JSON.stringify(realm));
}).catch(function(error){
	console.log('something went wrong: ' + error);
});
```
