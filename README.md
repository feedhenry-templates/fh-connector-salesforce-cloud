#Cloud Code for SF Demo App

## Registering a new Salesforce Push Topic to listen for:
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