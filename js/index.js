import axios from 'axios';


const sheetlink = `https://docs.google.com/spreadsheets/d/e/2PACX-1vReeXJJvN0cVl9WtRiJZGOM7Cy1ATJ0k2nvE3aXBjKdBn4y40eGE1qtlMlX43F8gWN7WgLQR3xmDWTp/pub?output=tsv`;

axios.get(sheetlink)
	.then(res => {


    var rows =res.data.split('\r');
    var headerRow = rows.shift(), header = headerRow.split(/\t/gi);

    console.log(rows);

    var sheetJson = [];

    rows.forEach(row=>{
    	var entry=row.split(/\t/gi);
    	var rObj={};


    	entry.forEach((item, i)=>{
    		if (item !== ""){
    			var elem = item.replace(/\n/gi, '');
    			(elem === "TRUE")? elem = true : null;
    			(elem === "FALSE")? elem = false : null;

    			(header[i] === 'id')? elem = parseInt(elem) : null;
    			(header[i] === 'anchor')? elem = elem.split(';').map(each=>+each) : null;


    				rObj[header[i]] = elem

    			//rObj[header[i]] = elem.replace(/\n/gi, '')
    		}
    	})

    	sheetJson.push(rObj);

    })

    axios.get(`https://www.googleapis.com/drive/v2/17sThIjpAfMzRjdRcC3lGS1tgVH7JvaI5`)
    .then(res=>{
    	console.log(res.data);
    })

    var img = document.createElement("img");
    img.src = sheetJson[0].url;
    document.getElementById('app').append(img);


})
