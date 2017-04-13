# SalesForce Connector API

[![Dependency Status](https://img.shields.io/david/feedhenry-templates/fh-connector-salesforce-cloud.svg?style=flat-square)](https://david-dm.org/feedhenry-templates/fh-connector-salesforce-cloud)

* [Group SalesForce Connector API](#group-salesforce-connector-api)
  + [Login](#login)
  + [List Accounts](#list-accounts)
  + [Get Account Details](#get-account-details)
  + [List Cases](#list-cases)
  + [Get Case Details](#get-case-details)
  + [List Campaigns](#list-campaigns)
  + [Group Push Topics](#group-push-topics)
* [Tests](#tests)
  + [Unit tests](#unit-tests)
  + [Unit coverage](#unit-coverage)

## Group SalesForce Connector API

### Login 

The login service exposes SalesForce login directly, when not using FH AAA Authentication.

|              |              |
|--------------|--------------|
| Endpoint     | /cloud/login |
| HTTP Method  | POST         |

#### Request (application/json)

##### Body

```json
{
  "username": "user1",
  "password": "password1"
}
```

#### Response 200 (application/json)

##### Body

```json
{
  "status": "TODO - accesstoken or something returned??"
}
```

### List Accounts 

List SalesForce Accounts

|              |                     |
|--------------|---------------------|
| Endpoint     | /cloud/listAccounts |
| HTTP Method  | POST                |

#### Request (application/json)

##### Body

```json
{
  "accessToken": "",
  "instanceUrl": "" 
}
```

#### Response 200 (application/json)

##### Body

```json
{
  "accounts": ["TODO"]
}
```

### Get Account Details

|              |                          |
|--------------|--------------------------|
| Endpoint     | /cloud/getAccountDetails |
| HTTP Method  | POST                     |

#### Request (application/json)

##### Body

```json
{
  "accountId": "",
  "auth": {
    "instanceUrl": "",
    "accessToken": ""
  }
}
``` 

#### Response 200 (application/json)

##### Body

```json
{
  "account": ["TODO"]
}
```

### List Cases

|              |                          |
|--------------|--------------------------|
| Endpoint     | /cloud/listCases         |
| HTTP Method  | POST                     |

#### Request (application/json)

##### Body

```json
{
  "accessToken": "",
  "instanceUrl": "" 
}
```

#### Response 200 (application/json)

##### Body

```json
{
  "cases": ["TODO"]
}
```

### Get Case Details

|              |                          |
|--------------|--------------------------|
| Endpoint     | /cloud/getCaseDetails    |
| HTTP Method  | POST                     |

#### Request (application/json)

##### Body

```json
{
  "accountId": "",
  "auth": {
    "instanceUrl": "",
    "accessToken": ""
  }
}
```

#### Response 200 (application/json)

##### Body

```json
{
  "account": ["TODO"]
}
```

### List Campaigns

|              |                          |
|--------------|--------------------------|
| Endpoint     | /cloud/listCampaigns     |
| HTTP Method  | POST                     |

#### Request (application/json)

##### Body

```json
{
  "accessToken": "",
  "instanceUrl": "" 
}
```

#### Response 200 (application/json)

##### Body

```json
{
  "Campaigns": ["TODO"]
}
```

### Group Push Topics

Registering a new Salesforce Push Topic to listen for. Part of the salesforce connector is the ability to set up Push Notifications based on an existing topic defined by a developer in Salesforce. To define such a topic - in this example, changes to the Account object: 

1. Log into salesforce

1. Click username - > Developer Console (pops up)

1. In dev console popup, Debug -> Open Annon Execute Window

1. Enter this code, and click execute - you have registered a push topic. Change query to alter data that comes back.

    ```java
    PushTopic pushTopic = new PushTopic();
    pushTopic.Name = 'AccountChanges2';
    pushTopic.Query = 'SELECT Id, Name FROM Account';
    pushTopic.ApiVersion = 29.0;
    pushTopic.NotifyForOperationCreate = true;
    pushTopic.NotifyForOperationUpdate = true;
    pushTopic.NotifyForOperationUndelete = true;
    pushTopic.NotifyForOperationDelete = true;
    pushTopic.NotifyForFields = 'All';
    insert pushTopic;
    ```
    
1. Set up environment variables for salesforce topic polling user, INCLUDING security token - process.env.SF_TOPIC_USERNAME, process.env.SF_TOPIC_PASSWORD

1. Register for this notification in node-salesforce

More info: http://wiki.developerforce.com/page/Getting_Started_with_the_Force.com_Streaming_API

## Tests

All the tests are in the "test/" directory. The cloud app is using mocha as the test runner. 

### Unit tests

```shell
npm run serve
npm run unit
```

or

```shell
npm run test
```

### Unit coverage

```shell
npm run coverage
```

