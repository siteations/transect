import axios from 'axios';


//-----------------------------------------GRAB FROM PUBLIC SPREADSHEET-----------------------------------------------

export function tsvObj(sheetlink){
    var rows = axios.get(sheetlink)
	.then(res => {


    var rows =res.data.split('\r');
    var headerRow = rows.shift(), header = headerRow.split(/\t/gi);

    //console.log(headerRow);

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

    return sheetJson;

}).catch(console.log);
 return rows;
}

//-----------------------------------------SORT STRUCTURE FROM TSV TO HIERARCH. JSON-----------------------------------------------

export function sort(rowsJson){
    var slides=[];
    var base = 0, intern=0;
    var obj = {};

    rowsJson.forEach(row=>{
        if (row.type==='base' && row.subtype==='background' && row.active){
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

        if (row.type==='add' && row.subtype==='overlay' && row.active){
            var obj = slides[intern]; //current object
            obj.additions.push({
                overlay: row.src,
                newTitle: row.coretitle,
                pane: null,
                tooltip: null,
            });
            //console.log(slides);

        }

        if (row.type==='add' && row.subtype==='pane' && row.active){
            var obj = slides[intern]; //current object
            if (obj.additions.length > 0 &&  obj.additions[obj.additions.length-1].pane===null){ // no current additions, just add overlay pane
                obj.additions[obj.additions.length-1].pane = [{
                            type: row.panetype,
                            title: row.panetitle,
                            subtitle: row.panesubtitle,
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
                            subtitle: row.panesubtitle,
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
                            subtitle: row.panesubtitle,
                            src: row.paneimageurl,
                            caption: row.panecaption,
                            source: row.panesource,
                            text: row.panetext,
                    });
            }

        }; //panes checked

        if (row.type==='add' && row.subtype==='tooltip' && row.active){
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

//-----------------------------------------SWAP WEB ADDESSES for Names-----------------------------------------------

export function swap (file, link, rows){
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


//-----------------------------------------SWAP WEB ADDESSES for Names-----------------------------------------------

export function display (objs){
    console.log(objs);

    var slideIndex = 0, internalIndex=0;

    var dots=[]
    objs.forEach((series, i)=>{
        var arr=[[i, 0]];
        var adds = series.additions.length;
        for (var j=1; j<adds; j++){
            arr.push([i,j])
        }
        dots=dots.concat(arr);

    })
    var nav = document.getElementById('switch');

    dots.forEach(dot=>{
        var dSpan=document.createElement('span');
        dSpan.value=dot[0];
        dSpan.data=dot[1];
        dSpan.className='dots';
        dSpan.onclick=(e)=>{
            e.preventDefault();
            var val = e.target.value;
            var val2 = e.target.data;
            update(val, val2);
          };

        nav.append(dSpan);
    })
    var note = document.createElement('span');
    note.innerHTML = ' click box to advance slides, touch title or panel for more info';
    nav.append(note);

    update();

    console.dir(dots);

    var main = document.getElementById('title');

  main.onclick=(e)=>{
    e.preventDefault();
    update();
  };


function list(text){
    var arr=text.split('.');
    var ul = document.createElement('ul');

    arr.forEach(item=>{
        if (item !== ''){
            var li = document.createElement('li');
            li.innerHTML=item;
            ul.append(li);
        }
    });

    return ul;
}

function para(text, po){

    var arr=text.split('|');
    console.log('text at split', arr);

    arr.forEach((item)=>{
        var p = document.createElement('p');
        p.innerHTML=item;

        po.append(p);

    });
}


function paneload(subslide){

    var values = Object.keys(subslide);
    var type = subslide.type;


    values.forEach(value=>{
        var contents = subslide[value];

        var element = document.getElementById('pane-'+value);
        if (value !== 'type' && value !== 'src' && value !=='text' && contents){
            element.innerHTML=contents;
        } else if (value === 'src' && contents) {
            element.src = contents;
        } else if (value === 'text' ){
            console.log(type, value, contents);
            element.innerHTML= '';
            if (type==='a'&& contents){
                para(contents, element); //div
            } else if (type==='b'&& contents){
                element.append(list(contents));
            }

        } else if (!contents && value === 'src'){
            element.src = '';
        } else if (!contents && value !== 'type' && value !== 'src' && value !=='text' ){
            element.innerHTML = '';
        }

    })

    var div = document.getElementById('a');
    div.className="";

    console.log(subslide);


}

function paneclear(){

    var div = document.getElementById('a');
    div.className="hidden";

    console.log('clear pane');


}


function update(a,b){
    if (slideIndex>objs.length-1){
        slideIndex=0, internalIndex=0;
    }
    if (a >= 0 && b >= 0){
        slideIndex=a, internalIndex=b;
    }

    console.log(slideIndex, internalIndex);

    var current = objs[slideIndex];

    var img = document.getElementsByClassName('slide');
    var arr = Array.from(img);
    var edit = arr.filter(each=>each.id==='background')
    edit.forEach((item,i)=>{
        if (i<edit.length-1){
            item.remove();
        }
    });
    console.log(edit);

    //img.remove();
    var img2 = document.createElement('img');
        img2.id='background';
        img2.className="slide bw fadebk";
        img2.src=current.background;
        img2.onload = (e) => {
                img2.style.opacity=1;
                console.log('loaded bk');
                };
    var node = document.getElementById('content');
    node.append(img2);


    var title = document.getElementById('title');
        title.innerHTML=current.title;
        console.dir(title);


    if (current.additions.length>0 && internalIndex<=current.additions.length-1){
        var subslide = current.additions[internalIndex];

        if (subslide.pane && subslide.pane.length>0){
            var pane = document.getElementById('paneUnder');
            pane.className="fadeIn8";

            var panel = document.getElementById('pane');
            panel.className="fadeIn";

            paneload(subslide.pane[0])


        } else {
            var pane = document.getElementById('paneUnder');
            pane.className="hidden";

            var panel = document.getElementById('pane');
            panel.className="hidden";

            paneclear();

        }

        if (subslide.overlay){
            var over = document.getElementById('overlay');
            over.src=subslide.overlay;
            over.className="overlay fadebk";
            over.onload = (e) => {
                over.style.opacity=1;
                console.log('loaded');
                };
        } else {
            var over = document.getElementById('overlay');
            over.className="overlay hidden";
        }

        if (subslide.newTitle){
            var title2 = document.getElementById('title');
            title2.innerHTML=subslide.newTitle;
        }

        if (subslide.tooltip){
            var curTitle = document.getElementById('title');
            var curPanel = document.getElementById('pane');

            var tooltip = document.getElementById('tooltip');
            tooltip.src = subslide.tooltip;
            curTitle.classList.add("cursor");
            curPanel.classList.add("cursor");

            var showHide = (type)=>{
                if (type){
                    tooltip.className="tooltip";
                } else {
                    tooltip.className="tooltip hidden";
                }
            }
            curTitle.onmouseover = (e)=>showHide('show')
            curTitle.onmouseout = (e)=>showHide()
            curPanel.onmouseover = (e)=>showHide('show')
            curPanel.onmouseout = (e)=>showHide()

            //seriously is this a fade on, fade off section
        } else {
            var curTitle = document.getElementById('title');
            var curPanel = document.getElementById('pane');
            var tooltip = document.getElementById('tooltip');
            curTitle.onmouseover = null;
            curTitle.onmouseout = null;
            curPanel.onmouseover = null;
            curPanel.onmouseout = null;
            curTitle.classList.remove("cursor");
            curPanel.classList.remove("cursor");
            tooltip.className="tooltip hidden";
        }

        internalIndex ++;

    } else {
            var pane = document.getElementById('paneUnder');
            pane.className="hidden";

            var panel = document.getElementById('pane');
            panel.className="hidden";
            panel.onmouseover = null;
            panel.onmouseout = null;

            var over = document.getElementById('overlay');
            over.className="overlay hidden";

            var tt = document.getElementById('tooltip');
            tt.className="tooltip hidden";

            var curTitle = document.getElementById('title');
            curTitle.classList.remove("cursor");
            curTitle.onmouseover = null;
            curTitle.onmouseout = null;

        internalIndex = 0;
        slideIndex ++;
    }

    //console.log(slideIndex, internalIndex);
} //update done





}
