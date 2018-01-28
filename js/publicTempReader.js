import axios from 'axios';

//location of public sheets: add by form in variation
const sheetlink = `https://docs.google.com/spreadsheets/d/e/2PACX-1vReeXJJvN0cVl9WtRiJZGOM7Cy1ATJ0k2nvE3aXBjKdBn4y40eGE1qtlMlX43F8gWN7WgLQR3xmDWTp/pub?output=tsv`;

const tsvObj = axios.get(sheetlink)
	.then(res => {


    var rows =res.data.split('\r');
    var headerRow = rows.shift(), header = headerRow.split(/\t/gi);

    console.log(headerRow);

    var sheetJson = [];

    rows.forEach(row=>{
    	var entry=row.split(/\t/gi);
    	var rObj={};


    	entry.forEach((item, i)=>{

    			var elem = item.replace(/\n/gi, '');
    			(elem === "TRUE")? elem = true : null;
    			(elem === "FALSE")? elem = false : null;
                (elem.length === 0)? elem = null:  null ;
    			(header[i] === 'id')? elem = parseInt(elem) : null;
                (header[i] === 'draworder')? elem = parseInt(elem) : null;
    			//(header[i] === 'anchor')? elem = elem.split(';').map(each=>+each) : null;


    				rObj[header[i]] = elem

    	})

    	sheetJson.push(rObj);

    })

    //console.log(sheetJson); //once we have the sheet as json.... need to order objects and then assemble from contents

    return sort(sheetJson);

}).catch(console.log);


function sort(rowsJson){

    return rowsJson;
}

export default tsvObj;
