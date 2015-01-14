#BridgeIt Location Service JavaScript API

## Location API

### createRegion

```javascript
function bridgeit.services.location.createRegion(params)
```

Create a new region in the location service.

#### Parameters

| Name | Description | Type | Default | Required |
| ---- | ----------- | ---- | ------- | -------- |
| account | BridgeIt Services account name | String | | true |
| realm | BridgeIt Services realm (required only for non-admin logins) | String | | false |
| username | User name | String | | true |
| password | User password | String | | true |
| host | The BridgeIt Services host url | String | api.bridgeit.io | false |
| ssl | Whether to use SSL for network traffic | Boolean | false | false |
| id | The region id. If not provided, the service will return a new id. | String |  | false |
| region | The region geoJSON document that describes the region to be created | Object |  | false |

#### Return value

Promise with the resource URI:

```javascript
http://api.bridgeit.io/locate/demox_corporate/realms/nargles.net/regions/88b9a1f3-36f7-4041-b6d2-7d5a21f193c7
```

#### Example

```javascript
var newRegion = { 
  location: {
    properties: {
      country: 'Canada'
    }
  }
};
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
}).catch(function(error){
  console.log('createRegion failed ' + error);
});
```

### deleteRegion

```javascript
function bridgeit.services.location.deleteRegion(params)
```

Delete a region in the location service.

#### Parameters

| Name | Description | Type | Default | Required |
| ---- | ----------- | ---- | ------- | -------- |
| account | BridgeIt Services account name | String | | true |
| realm | BridgeIt Services realm (required only for non-admin logins) | String | | false |
| username | User name | String | | true |
| password | User password | String | | true |
| host | The BridgeIt Services host url | String | api.bridgeit.io | false |
| ssl | Whether to use SSL for network traffic | Boolean | false | false |
| id | The region id. | String |  | true |

#### Return value

Promise with no arguments.

#### Example

```javascript
bridgeit.services.auth.login({
  account: accountId,
  username: adminId,
  password: adminPassword,
  host: host
}).then(function(authResponse){
  return bridgeit.services.location.deleteRegion({
    account: accountId,
    realm: realmId,
    host: host,
    id: '1234'
  })
}).then(function(){
  console.log('successfully deleted region');
}).catch(function(error){
  console.log('deleteRegion failed ' + error);
});
```

### getAllRegions

```javascript
function bridgeit.services.location.getAllRegions(params)
```

Fetches all saved regions for the realm from the location service.

#### Parameters

| Name | Description | Type | Default | Required |
| ---- | ----------- | ---- | ------- | -------- |
| account | BridgeIt Services account name | String | | true |
| realm | BridgeIt Services realm (required only for non-admin logins) | String | | false |
| username | User name | String | | true |
| password | User password | String | | true |
| host | The BridgeIt Services host url | String | api.bridgeit.io | false |
| ssl | Whether to use SSL for network traffic | Boolean | false | false |

#### Return value

Promise with a result list of regions.

#### Example

```javascript
bridgeit.services.auth.login({
  account: accountId,
  username: adminId,
  password: adminPassword,
  host: host
}).then(function(uri){
  return bridgeit.services.location.getAllRegions({
    account: accountId,
    realm: realmId,
    host: host
  })
}).then(function(results){
  console.log('found ' + results.length + ' regions');
}).catch(function(error){
  console.log('getAllRegions failed ' + error);
});
```

### findRegions

```javascript
function bridgeit.services.location.findRegions(params)
```

Searches for regions in a realm based on a Mongo DB query.

#### Parameters

| Name | Description | Type | Default | Required |
| ---- | ----------- | ---- | ------- | -------- |
| account | BridgeIt Services account name | String | | true |
| realm | BridgeIt Services realm (required only for non-admin logins) | String | | false |
| username | User name | String | | true |
| password | User password | String | | true |
| host | The BridgeIt Services host url | String | api.bridgeit.io | false |
| ssl | Whether to use SSL for network traffic | Boolean | false | false |
| query | The Mongo DB query | Object |  | false |

#### Return value

Promise with a result list of regions.

#### Example

```javascript
bridgeit.services.auth.login({
  account: accountId,
  username: adminId,
  password: adminPassword,
  host: host
}).then(function(authResponse){
  console.log('new region URI: ' + uri);
  var uriParts = uri.split('/');
  var regionId = uriParts[uriParts.length-1];
  return bridgeit.services.location.findRegions({
    account: accountId,
    realm: realmId,
    host: host,
    query: { 
          location: {
            properties: {
              country: 'Canada'
            }
          }
        }
  })
}).then(function(results){
  console.log('found ' + results.length + ' regions');
}).catch(function(error){
  console.log('findRegions failed ' + error);
});
```

### findMonitors

```javascript
function bridgeit.services.location.findMonitors(params)
```

Searches for location monitors in a realm based on a Mongo DB query.

#### Parameters

| Name | Description | Type | Default | Required |
| ---- | ----------- | ---- | ------- | -------- |
| account | BridgeIt Services account name | String | | true |
| realm | BridgeIt Services realm (required only for non-admin logins) | String | | false |
| username | User name | String | | true |
| password | User password | String | | true |
| host | The BridgeIt Services host url | String | api.bridgeit.io | false |
| ssl | Whether to use SSL for network traffic | Boolean | false | false |
| query | The Mongo DB query | Object |  | false |

#### Return value

Promise with a result list of monitors.

#### Example

```javascript
bridgeit.services.auth.login({
  account: accountId,
  username: adminId,
  password: adminPassword,
  host: host
}).then(function(authResponse){
  return bridgeit.services.location.findMonitors({
    account: accountId,
    realm: realmId,
    host: host,
    query: { 
          location: {
            properties: {
              country: 'Canada'
            }
          }
        }
  })
}).then(function(results){
  console.log('found ' + results.length + ' monitors');
}).catch(function(error){
  console.log('findMonitors failed ' + error);
});
```

### createMonitor

```javascript
function bridgeit.services.location.createMonitor(params)
```

Create a new monitor in the location service.

#### Parameters

| Name | Description | Type | Default | Required |
| ---- | ----------- | ---- | ------- | -------- |
| account | BridgeIt Services account name | String | | true |
| realm | BridgeIt Services realm (required only for non-admin logins) | String | | false |
| username | User name | String | | true |
| password | User password | String | | true |
| host | The BridgeIt Services host url | String | api.bridgeit.io | false |
| ssl | Whether to use SSL for network traffic | Boolean | false | false |
| id | The region id. If not provided, the service will return a new id. | String |  | false |
| monitor | The monitor JSON document that describes the monitor to be created | Object |  | false |

#### Return value

Promise with the resource URI:

```javascript
http://api.bridgeit.io/locate/demox_corporate/realms/nargles.net/monitors/88b9a1f3-36f7-4041-b6d2-7d5a21f193c7
```

#### Example

```javascript
var newMonitor = {
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
    monitor: newMonitor
  });
}).then(function(uri){
  console.log('new monitor URI: ' + uri);
}).catch(function(error){
  console.log('createMonitor failed ' + error);
});
```

### deleteMonitor

```javascript
function bridgeit.services.location.deleteMonitor(params)
```

Delete a monitor in the location service.

#### Parameters

| Name | Description | Type | Default | Required |
| ---- | ----------- | ---- | ------- | -------- |
| account | BridgeIt Services account name | String | | true |
| realm | BridgeIt Services realm (required only for non-admin logins) | String | | false |
| username | User name | String | | true |
| password | User password | String | | true |
| host | The BridgeIt Services host url | String | api.bridgeit.io | false |
| ssl | Whether to use SSL for network traffic | Boolean | false | false |
| id | The monitor id. | String |  | true |

#### Return value

Promise with no arguments.

#### Example

```javascript
bridgeit.services.auth.login({
  account: accountId,
  username: adminId,
  password: adminPassword,
  host: host
}).then(function(authResponse){
  return bridgeit.services.location.deleteMonitor({
    account: accountId,
    realm: realmId,
    host: host,
    id: '1234'
  })
}).then(function(){
  console.log('successfully deleted monitor');
}).catch(function(error){
  console.log('deleteMonitor failed ' + error);
});
```

### getAllMonitors

```javascript
function bridgeit.services.location.getAllMonitors(params)
```

Fetches all saved monitors for the realm from the location service.

#### Parameters

| Name | Description | Type | Default | Required |
| ---- | ----------- | ---- | ------- | -------- |
| account | BridgeIt Services account name | String | | true |
| realm | BridgeIt Services realm (required only for non-admin logins) | String | | false |
| username | User name | String | | true |
| password | User password | String | | true |
| host | The BridgeIt Services host url | String | api.bridgeit.io | false |
| ssl | Whether to use SSL for network traffic | Boolean | false | false |

#### Return value

Promise with a result list of monitors.

#### Example

```javascript
bridgeit.services.auth.login({
  account: accountId,
  username: adminId,
  password: adminPassword,
  host: host
}).then(function(uri){
  return bridgeit.services.location.getAllMonitors({
    account: accountId,
    realm: realmId,
    host: host
  })
}).then(function(results){
  console.log('found ' + results.length + ' monitors');
}).catch(function(error){
  console.log('getAllMonitors failed ' + error);
});
```

### createPOI

```javascript
function bridgeit.services.location.createPOI(params)
```

Creates a new Point of Interest in the location service.

#### Parameters

| Name | Description | Type | Default | Required |
| ---- | ----------- | ---- | ------- | -------- |
| account | BridgeIt Services account name | String | | true |
| realm | BridgeIt Services realm (required only for non-admin logins) | String | | false |
| username | User name | String | | true |
| password | User password | String | | true |
| host | The BridgeIt Services host url | String | api.bridgeit.io | false |
| ssl | Whether to use SSL for network traffic | Boolean | false | false |
| poi | A JSON Object describing the Point of Interest. | Boolean | false | false |

#### Return value

Promise with new resource URI.

#### Example

```javascript
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
    poi: {
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
    }
  });
}).then(function(uri){
  console.log('new poi URI: ' + uri);
});
```

### findPOIs

```javascript
function bridgeit.services.location.findPOIs(params)
```

Searches for Points of Interest in a realm based on a Mongo DB query.

#### Parameters

| Name | Description | Type | Default | Required |
| ---- | ----------- | ---- | ------- | -------- |
| account | BridgeIt Services account name | String | | true |
| realm | BridgeIt Services realm (required only for non-admin logins) | String | | false |
| username | User name | String | | true |
| password | User password | String | | true |
| host | The BridgeIt Services host url | String | api.bridgeit.io | false |
| ssl | Whether to use SSL for network traffic | Boolean | false | false |
| query | The Mongo DB query | Object |  | false |

#### Return value

Promise with a result list of Points of Interest.

#### Example

```javascript
bridgeit.services.auth.login({
  account: accountId,
  username: adminId,
  password: adminPassword,
  host: host
}).then(function(authResponse){
  return bridgeit.services.location.findPOIs({
    account: accountId,
    realm: realmId,
    host: host,
    query: { 
          location: {
            properties: {
              country: 'Canada'
            }
          }
        }
  })
}).then(function(results){
  console.log('found ' + results.length + ' POIs');
}).catch(function(error){
  console.log('findPOIs failed ' + error);
});
```

### deletePOI

```javascript
function bridgeit.services.location.deletePOI(params)
```

Delete a POI in the location service.

#### Parameters

| Name | Description | Type | Default | Required |
| ---- | ----------- | ---- | ------- | -------- |
| account | BridgeIt Services account name | String | | true |
| realm | BridgeIt Services realm (required only for non-admin logins) | String | | false |
| username | User name | String | | true |
| password | User password | String | | true |
| host | The BridgeIt Services host url | String | api.bridgeit.io | false |
| ssl | Whether to use SSL for network traffic | Boolean | false | false |
| id | The POI id. | String |  | true |

#### Return value

Promise with no arguments.

#### Example

```javascript
bridgeit.services.auth.login({
  account: accountId,
  username: adminId,
  password: adminPassword,
  host: host
}).then(function(authResponse){
  return bridgeit.services.location.deletePOI({
    account: accountId,
    realm: realmId,
    host: host,
    id: '1234'
  })
}).then(function(){
  console.log('successfully deleted POI');
}).catch(function(error){
  console.log('deletePOI failed ' + error);
});
```

### getAllPOIs

```javascript
function bridgeit.services.location.getAllPOIs(params)
```

Fetches all saved POIs for the realm from the location service.

#### Parameters

| Name | Description | Type | Default | Required |
| ---- | ----------- | ---- | ------- | -------- |
| account | BridgeIt Services account name | String | | true |
| realm | BridgeIt Services realm (required only for non-admin logins) | String | | false |
| username | User name | String | | true |
| password | User password | String | | true |
| host | The BridgeIt Services host url | String | api.bridgeit.io | false |
| ssl | Whether to use SSL for network traffic | Boolean | false | false |

#### Return value

Promise with a result list of POIs.

#### Example

```javascript
bridgeit.services.auth.login({
  account: accountId,
  username: adminId,
  password: adminPassword,
  host: host
}).then(function(uri){
  return bridgeit.services.location.getAllPOIs({
    account: accountId,
    realm: realmId,
    host: host
  })
}).then(function(results){
  console.log('found ' + results.length + ' POIs');
}).catch(function(error){
  console.log('getAllPOIs failed ' + error);
});
```