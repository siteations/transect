import secret from '../client_secret_old.json';
import './googleapi.js';

import {tsvObj, sort, swap, display} from './publicTempReader.js';

var CLIENT_ID = secret.web.client_id;
var API_KEY = secret.web.apikey;
var DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"];

var SCOPES = 'https://www.googleapis.com/auth/drive.metadata.readonly';

var sheetlink;

//location of public sheets: add by form in variation
//const sheetlink = `https://docs.google.com/spreadsheets/d/e/2PACX-1vReeXJJvN0cVl9WtRiJZGOM7Cy1ATJ0k2nvE3aXBjKdBn4y40eGE1qtlMlX43F8gWN7WgLQR3xmDWTp/pub?output=tsv`;

window.onload = getForm;

function getForm(){
  var button = document.getElementById('submit');

  button.onclick=(e)=>{
    e.preventDefault();
    sheetlink = document.getElementById('sheet').value;
    var form = document.getElementById('formlink');
    form.className = "off";
    console.dir(form);

    handleClientLoad();
  };

}

//----------------Google API calls---------------------------------------
function handleClientLoad() {
  gapi.load('client:auth2', initClient);
}


function initClient() {
  var allFiles = gapi.client.init({
    apiKey: API_KEY,
    clientId: CLIENT_ID,
    discoveryDocs: DISCOVERY_DOCS,
    scope: SCOPES
  }).then(function () {
    handleAuthClick();
    tsvObj(sheetlink).then(res=>{
      listFiles(res);
    })

  }).catch(console.log);

  return allFiles;
}


function handleAuthClick(event) {
  gapi.auth2.getAuthInstance().signIn();
}


//----------------Google API files for manipulation---------------------------------------

function listFiles(objComp) {
  var filesFound = gapi.client.drive.files.list({
    'pageSize': 200,
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
        }
      }
      var sortedItems = sort(objUpdated);
      display(sortedItems);


    } else {
      alert('No files found.');
    }
    return files;
  }).catch(console.log);
  return filesFound;
}

//handleClientLoad();
