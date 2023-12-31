require("dotenv").config();
import request from "request";

const PAGE_ACCESS_TOKEN= process.env.PAGE_ACCESS_TOKEN;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN;

let getHomePage = (req, res) => {
    return res.send("Xin chao")
};
let postWebhook = (req, res) => {
    let body = req.body;

    // console.log(`\u{1F7EA} Received webhook:`);
    // console.dir(body, { depth: null });
    // Send a 200 OK response if this is a page webhook

    if (body.object === "page") {
      body.entry.forEach(function (entry) {
        // Gets the body of the webhook event
        let webhook_event = entry.messaging[0];
        console.log(webhook_event);

        // Get the sender PSID
        let sender_psid = webhook_event.sender.id;
        console.log("Sender PSID: " + sender_psid);

        // Check if the event is a message or postback and
        // pass the event to the appropriate handler function
        if (webhook_event.message) {
          handleMessage(sender_psid, webhook_event.message);
        } else if (webhook_event.postback) {
          handlePostback(sender_psid, webhook_event.postback);
        }
      });
      // Returns a '200 OK' response to all requests
      res.status(200).send("EVENT_RECEIVED");
      // Determine which webhooks were triggered and get sender PSIDs and locale, message content and more.
    } else {
      // Return a '404 Not Found' if event is not from a page subscription
      res.sendStatus(404);
    }
};
let getWebhook =(req, res) => {
    // Parse the query params
    let mode = req.query["hub.mode"];
    let token = req.query["hub.verify_token"];
    let challenge = req.query["hub.challenge"];

    // Check if a token and mode is in the query string of the request
    if (mode && token) 
    {
      // Check the mode and token sent is correct
      if (mode === "subscribe" && token === VERIFY_TOKEN) 
      {
        // Respond with the challenge token from the request
        console.log("WEBHOOK_VERIFIED");
        res.status(200).send(challenge);
      } 
      else 
      {
        // Respond with '403 Forbidden' if verify tokens do not match
        res.sendStatus(403);
      }
    }
};

// Handles messages events
function handleMessage(sender_psid, received_message) {
  let response;

  // Check if the message contains text
  if (received_message.text) {    
    let username = getUserName(sender_psid);
    // Create the payload for a basic text message
    response = {
      "text": `Xin chào bạn, nếu bạn không tra được SBD của mình trên Website thì hãy để lại SBD cho Team ViAiPi kiểm tra lại nhé !`
    }
  }  
  
  // Sends the response message
  callSendAPI(sender_psid, response);   
}

// Handles messaging_postbacks events
function handlePostback(sender_psid, received_postback) {
  
}

let getUserName = (sender_psid) =>
{
  let username = '';

  // Send the HTTP request to the Messenger Platform
  request({
    "uri": 'https://graph.facebook.com/${sender_psid}?fields=first_name,last_name,profile_pic&access_token=${PAGE_ACCESS_TOKEN}',
    "method": "GET",
  }, (err, res, body) => {

    if (!err) {
      body = JSON.parse(body);
      username = '${body.first_name} ${body.last_name}';
    } else {
      console.error("Unable to send message:" + err);
    }
  }); 

  return username;
}

// Sends response messages via the Send API
function callSendAPI(sender_psid, response) {
  // Construct the message body
  let request_body = {
    "recipient": {
      "id": sender_psid
    },
    "message": response
  }

  // Send the HTTP request to the Messenger Platform
  request({
    "uri": "https://graph.facebook.com/v2.6/me/messages",
    "qs": { "access_token": PAGE_ACCESS_TOKEN },
    "method": "POST",
    "json": request_body
  }, (err, res, body) => {
    if (!err) {
      console.log('message sent!') 
    } else {
      console.error("Unable to send message:" + err);
    }
  }); 
}

module.exports = {
    getHomePage: getHomePage, //key: value
    getWebhook: getWebhook,
    postWebhook: postWebhook
}