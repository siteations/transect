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

    return sheetJson;

}).catch(console.log);


export function sort(rowsJson){
    var slides=[];
    var base = 0, intern=0;
    var obj = {};

    rowsJson.forEach(row=>{
        if (row.type==='base' && row.subtype==='background'){
            obj = {
                slideSeries: base,
                background: row.src,
                title : row.coretitle,
                additions: [],
            } //clear and start again

             base ++;

            slides.push(obj);
            intern = slides.length-1;
        }

        if (row.type==='add' && row.subtype==='overlay'){
            var obj = slides[intern]; //current object
            obj.additions.push({
                overlay: row.src,
                newTitle: row.coretitle,
                pane: null,
                tooltip: null,
            });
            //console.log(slides);

        }

        if (row.type==='add' && row.subtype==='pane'){
            var obj = slides[intern]; //current object
            if (obj.additions.length > 0 &&  obj.additions[obj.additions.length-1].pane===null){ // no current additions, just add overlay pane
                obj.additions[obj.additions.length-1].pane = [{
                            type: row.panetype,
                            title: row.panetitle,
                            src: row.paneimageurl,
                            caption: row.panecaption,
                            source: row.panesource,
                            text: row.panetext,
                    }];
            } else if (obj.additions.length === 0 ){ // current additions

                    obj.additions.push({
                        overlay: null,
                        newTitle: null,
                        pane: [{
                            type: row.panetype,
                            title: row.panetitle,
                            src: row.paneimageurl,
                            caption: row.panecaption,
                            source: row.panesource,
                            text: row.panetext,
                        }],
                        tooltip: null,
                    });
            } else {
                obj.additions[obj.additions.length-1].pane. push({
                            type: row.panetype,
                            title: row.panetitle,
                            src: row.paneimageurl,
                            caption: row.panecaption,
                            source: row.panesource,
                            text: row.panetext,
                    });
            }

        }; //panes checked

        if (row.type==='add' && row.subtype==='tooltip'){
            //console.log(row, slides)
            var obj = slides[intern]; //current object
            if (obj.additions.length > 0 &&  obj.additions[obj.additions.length-1].tooltip===null) { // no current additions, just add overlay pane
                obj.additions[obj.additions.length-1].tooltip = row.src
            } else { // current additions
                    obj.additions.push({
                        overlay: null,
                        newTitle: null,
                        pane: null,
                        tooltip: row.src,
                    });
            }

        } //tooltips checked



    })

    return slides;
}

export default tsvObj;
