var HTTPS = require('https');
var cool = require('cool-ascii-faces');
const http = require('http');

var botID = process.env.BOT_ID;

function respond() {
  var request = JSON.parse(this.req.chunks[0]),
      //botRegex = /^\/cool guy$/;
      botRegex = /^\/sod$/;

  if(request.text && botRegex.test(request.text)) {
    this.res.writeHead(200);
    postMessage();
    this.res.end();
  } else {
    console.log("don't care");
    this.res.writeHead(200);
    this.res.end();
  }
}

function postMessage() {
  getSOD(); 
}

function getSOD() {
  var botResponse, options, body, botReq;

  /* First get the current date and year */
    // Date object initialized in west coast time
  let ca_date_string = new Date().toLocaleString("en-US", { timeZone: "America/Los_Angeles" });
  // Date object initialized from the above datetime string
  let date_ca = new Date(ca_date_string);

  // year as (YYYY) format
  let year = date_ca.getFullYear();

  // month as (MM) format
  let month = ("0" + (date_ca.getMonth() + 1)).slice(-2);

  // date as (DD) format
  let date = ("0" + date_ca.getDate()).slice(-2);

  // date as YYYY/MM/DD format
  let date_yyyy_mm_dd = year + "/" + month + "/" + date;

  // Then Make the API Url Call
  let url = "http://calapi.inadiutorium.cz/api/v0/en/calendars/default/" + date_yyyy_mm_dd;
  console.log(url);

  // Submit the request
  http.get(url, (resp) => {
    let data = '';

    // A chunk of data has been recieved.
    resp.on('data', (chunk) => {
      data += chunk;
    });

    // The whole response has been received.
    resp.on('end', () => {
      /* Example Response:
        {"date":"2020-07-22","season":"ordinary","season_week":16,"celebrations":[{"title":"Saint Mary Magdalene","colour":"white","rank":"feast","rank_num":2.7}],"weekday":"wednesday"}
      */
      let obj =  JSON.parse(data);
      let cel = obj.celebrations; // get the celebrations array

      // Loop through the array of celebrations
      for(var index = 0; index < cel.length; index++) {
      // for(var index = 0; index < 1; index++) {

        let iCel = cel[index]

        iName = iCel.title
        iRank = iCel.rank
        iStringColor = iCel.colour
        let iOut = "Today is the " + iRank + " of " + iName + " with litugical color: " + iStringColor
        console.log(iOut);
        

        //* Send Message *//
        botResponse = iOut;
        options = {
          hostname: 'api.groupme.com',
          path: '/v3/bots/post',
          method: 'POST'
        };
      
        body = {
          "bot_id" : botID,
          "text" : botResponse
        };
      
        console.log('sending ' + botResponse + ' to ' + botID);
      
        botReq = HTTPS.request(options, function(res) {
            if(res.statusCode == 202) {
              //neat
            } else {
              console.log('rejecting bad status code ' + res.statusCode);
            }
        });
      
        botReq.on('error', function(err) {
          console.log('error posting message '  + JSON.stringify(err));
        });
        botReq.on('timeout', function(err) {
          console.log('timeout posting message '  + JSON.stringify(err));
        });
        botReq.end(JSON.stringify(body));
        //* End send message *//
      }

    });

  }).on("error", (err) => {
    console.log("Error: " + err.message);
  });
}

function sleep(millis) {
  return new Promise(resolve => setTimeout(resolve, millis));
}


exports.respond = respond;