import secret from '../client_secret_old.json';
import './googleapi.js';
import tsvObj from './publicTempReader.js';
import {sort} from './publicTempReader.js';

      var CLIENT_ID = secret.web.client_id;
      var API_KEY = secret.web.apikey;
      var DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"];

      var SCOPES = 'https://www.googleapis.com/auth/drive.metadata.readonly';

      // var authorizeButton = document.getElementById('authorize-button');
      // var signoutButton = document.getElementById('signout-button');

      /**
       *  On load, called to load the auth2 library and API client library.
       */
      function handleClientLoad() {

        gapi.load('client:auth2', initClient);
      }

      /**
       *  Initializes the API client library and sets up sign-in state
       *  listeners.
       */
      function initClient() {
        var allFiles = gapi.client.init({
          apiKey: API_KEY,
          clientId: CLIENT_ID,
          discoveryDocs: DISCOVERY_DOCS,
          scope: SCOPES
        }).then(function () {
          handleAuthClick();
          tsvObj.then(res=>{
            listFiles(res);
          })

        }).catch(console.log);

        return allFiles;
      }

      /**
       *  Sign in the user upon button click.
       */
      function handleAuthClick(event) {
        gapi.auth2.getAuthInstance().signIn();
      }

      /**
       * Append a pre element to the body containing the given message
       * as its text node. Used to display the results of the API call.
       *
       * @param {string} message Text to be placed in pre element.
       */
      // function appendPre(message, link) {
      //   var pre = document.getElementById('content');
      //   var href = document.createElement('a');
      //   var br = document.createElement('br');
      //   href.href = link;
      //   href.target = '_blank';
      //   var textContent = document.createTextNode(message + '\n');
      //   href.append(textContent);
      //   pre.appendChild(href);
      //   pre.appendChild(br);
      // }

      function swap (file, link, rows){
        var rowsRev = rows.map(row=>{
          if (file.name === row.src){
            row.src = link;
          } else if (file.name === row.paneimageurl){
            row.paneimageurl = link;
          }
          return row;
        })

        return rowsRev;


      }

      /**
       * Print files.
       */
      function listFiles(objComp) {
        var filesFound = gapi.client.drive.files.list({
          'pageSize': 100,
          'fields': "nextPageToken, files(id, name, fileExtension, webContentLink)"
        }).then(function(response) {

          console.log(objComp, sort(objComp));
          //

          //appendPre('Files:');
          var files = response.result.files;
          var objUpdated = objComp;


          if (files && files.length > 0) {
            for (var i = 0; i < files.length; i++) {
              var file = files[i];

              var link = (file.webContentLink)? file.webContentLink.replace('&export=download', '') : null;

              if (file.fileExtension === 'jpg'||file.fileExtension === 'png'||file.fileExtension === 'svg'){

                objUpdated = swap (file, link, objUpdated);
                //appendPre(file.name + ' (' + file.id + ')', link);

              }

            }
            console.log(objUpdated);
          } else {
            appendPre('No files found.');
          }
          return files;
        }).catch(console.log);
        return filesFound;
      }

handleClientLoad();
