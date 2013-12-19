#SalesForce Connector

## Login
The login service exposes SalesForce login directly, when not using FH AAA Authentication.
POST /cloud/**login**
{ username : "", password : ""}

## List Accounts
POST /cloud/**listAccounts**
{ accessToken : '', instanceUrl : '' }

## List Cases
POST /cloud/**listCases**
{ accessToken : '', instanceUrl : '' }

## List Campaigns
POST /cloud/**listCampaigns**
{ accessToken : '', instanceUrl : '' }

## Get Account Details
POST /cloud/**getAccountDetails**
{ 
  accountId : '', 
  auth : { 
    accessToken : '', 
    instanceUrl : '' 
  }
}

## Get Case Details
POST /cloud/**getCaseDetails**
{ 
  caseId : '', 
  auth : { 
    accessToken : '', 
    instanceUrl : '' 
  }
}



## Using Push Topics: Registering a new Salesforce Push Topic to listen for:
Part of the salesforce connector is the ability to set up Push Notifications based on an existing topic defined by a developer in Salesforce. To define such a topic - in this example, changes to the Account object: 

1. Log into salesforce
2. Click username - > Developer Console (pops up)
3. In dev console popup, Debug -> Open Annon Execute Window
4. Enter this code, and click execute - you have registered a push topic. Change query to alter data that comes back.

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
    
5. Set up environment variables for salesforce topic polling user, INCLUDING security token - process.env.SF_TOPIC_USERNAME, process.env.SF_TOPIC_PASSWORD
6. Register for this notification in node-salesforce

More info: http://wiki.developerforce.com/page/Getting_Started_with_the_Force.com_Streaming_API
