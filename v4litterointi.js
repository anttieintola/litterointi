var sel;
var startTC;
var endTC;
var startFrames;
var endFrames;
var range;
var rangeTime;
var rangeInSeconds;
var edlText;
var filename;
var blob = window.webkitURL;
var oldText = document.getElementById("litContent").innerHTML;
var pointsArray;
var textsArray;
var textText;
var clipboardText;
var srtFileContents;
 
var playClicked;
var wordTimeArray = [];
var spans = document.getElementsByClassName("word");
var spanL = spans.length;
for (var ii=0;ii < spanL;ii++)
{
	var spanData = spans[ii].getAttribute("data-tippy-content");
	wordTimeArray.push(spanData);
}

filename = document.getElementById("fileid").getAttribute("data-filename");
filename = filename.slice(1,-1);



function getRange() {
	document.activeElement.blur();
	wavesurfer.clearRegions();
    sel = window.getSelection();
    startTC = sel.getRangeAt(0).startContainer.parentNode.getAttribute('data-tippy-content');
	if (startTC == " " || startTC == "0:0:0")
	{
		startTC = sel.getRangeAt(0).startContainer.parentNode.previousElementSibling.getAttribute('data-tippy-content');
	}
    try {
        endTC = sel.getRangeAt(0).endContainer.parentNode.nextElementSibling.getAttribute('data-tippy-content');
		if (endTC == " " || endTC == "0:0:0")
		{
			try
				{endTC = sel.getRangeAt(0).endContainer.parentNode.getAttribute('data-tippy-content');}
			catch
				{endTC = sel.getRangeAt(0).endContainer.parentNode.previousElementSibling.getAttribute('data-tippy-content');}			
		}

    } catch {
        endTC = sel.getRangeAt(0).endContainer.parentNode.getAttribute('data-tippy-content');
		if (endTC == " " || endTC == "0:0:0")
		{
			endTC = sel.getRangeAt(0).endContainer.parentNode.previousElementSibling.getAttribute('data-tippy-content');	
		}
    }
	
		
    startFrames = timecode_to_frames(startTC);
    endFrames = timecode_to_frames(endTC);
    range = parseInt(endFrames) - parseInt(startFrames);
    rangeInSeconds = Math.floor(range / 25);
    console.log(range);
    rangeTime = displayTime(range);
	rangeTime = rangeTime.substring(3);
    console.log("Kesto: " + rangeTime);
    document.getElementById("timecode").innerHTML = startTC + " - " + endTC;
	document.getElementById("rangeCode").style.visibility="visible";
    document.getElementById("rangeCode").innerHTML =rangeTime;
    console.log(startTC + " " + endTC);
	
	waveIn = audioSeconds = (timecode_to_frames(startTC) / 25);
	waveOut = audioSeconds = (timecode_to_frames(endTC) / 25);
	wsRegions.addRegion({
		start: waveIn,
		end: waveOut,
		drag: false,
		resize: false,
		color: "rgba(255,255,255,0.5)"
	});
	if (wavesurfer.isPlaying() === false)
	{
		dontPlay = true;
	}
	else
	{dontPlay = false;}

	wavesurfer.play(waveIn);
	
	if (dontPlay)
	{
	wavesurfer.setMute(true);
	setTimeout(pause, 20);
	}
}

function addToList() {
    getRange();
	startInsideParent=false;
	endInsideParent=false;
    startObj = sel.getRangeAt(0).startContainer.parentNode;
    endObj = sel.getRangeAt(0).endContainer.parentNode;
	theText = litContent.innerText;
    startText = startObj.innerText;
    try{startText += startObj.nextElementSibling.innerText;startInsideParent=true;}
	catch{startText += startObj.parentElement.nextElementSibling.firstChild.innerText;}
	
    try{startText += startObj.nextElementSibling.nextElementSibling.innerText;}
	catch{
		if (startInsideParent===true)
			{startText += startObj.parentElement.nextElementSibling.firstChild.innerText;}
		else
			{startText += startObj.parentElement.nextElementSibling.firstChild.nextElementSibling.innerText;}
		}
    console.log(startText);
	
	
	endText = endObj.innerText;
	try{endText = endObj.previousElementSibling.innerText + endText;endInsideParent=true;}
	catch{endText = endObj.parentElement.previousElementSibling.lastElementChild.innerText + endText;}
	
	try{endText = endObj.previousElementSibling.previousElementSibling.innerText + endText;}
	catch{
		if (endInsideParent===true)
		{endText = endObj.parentElement.previousElementSibling.lastElementChild.innerText + endText;}
		else
		{endText = endObj.parentElement.previousElementSibling.lastElementChild.previousElementSibling.innerText + endText;}
	}
    //try{endText = endObj.previousElementSibling.previousElementSibling.innerText;}catch{endText ="";}
    //try{endText += endObj.previousElementSibling.innerText;}catch{endText +="";}
    //try{endText += endObj.innerText;}catch{endText +="";}
    console.log(endText);
	
	rangeText = window.getSelection().toString();
	console.log(rangeText);

    clipElement = '<li class="listElement" data-inText="'+startText+'" data-outText="'+endText+'" data-allText="'+rangeText+'" data-inTC="'+startTC+'" data-outTC="'+endTC+'" data-dur="' + rangeInSeconds + '"><span class="li-img-container"><span class="material-symbols-outlined selectRange" data-inTC="'+startTC+'" data-outTC="'+endTC+'">data_array</span></span><span class="li-txt-container"><b>' + startTC + '</b> <i>' + startText + '</i><br><b>' + endTC + '</b> <i>' + endText + '</i></span></li>';
    document.getElementById("slippylist").innerHTML += clipElement;
    countListDuration();
	createArray();
	saveListToLocalStorage();
}

function saveListToLocalStorage()
{
filename = document.getElementById("fileid").getAttribute("data-filename");
filename = filename.slice(1,-1);
localStorage.clear();
var lis = document.getElementsByTagName("li");
for (y=0;y<lis.length;y++)
{
	document.getElementsByTagName("li")[y].removeAttribute("style");
}
	var listContent = document.getElementById("slippylist").innerHTML;
	var stName=filename+"listContent";
	window.localStorage.setItem(stName, listContent);
	//console.log(stName+" "+localStorage.getItem(stName));
}

function loadListFromLocalStorage()
{
	try
	{
	var stName=filename+"listContent";
	var tempList = window.localStorage.getItem(stName);
	$("#slippylist").html(tempList);
	countListDuration();}
	catch(e)
	{console.log("LS tyhjä");
	console.log(e);}
	$("li").removeClass("slip-reordering");
}

function countListDuration() {
    var tDur = 0;
    var ul = document.getElementById("slippylist");
    var listItems = ul.getElementsByTagName("li");
    for (var i = 0; i < listItems.length; ++i) {
        var s = listItems[i].getAttribute('data-dur');
        s = Number(s);
        tDur += s;
    }
    tDur = secsToTime(tDur);
    document.getElementById("total").innerHTML = tDur;
}

function secsToTime(d) {
    var date = new Date(0);
    date.setSeconds(d);
    var timeString = date.toISOString().substr(14, 5);
    return timeString;
}
var dblElement = document.getElementsByClassName("word");

for (var i = 0; i < dblElement.length; i++) {
    dblElement[i].addEventListener('dblclick', updateTime, false);
};

function updateTime() {
    startTC = this.getAttribute('data-tippy-content');
	if (startTC == " " || startTC == "0:0:0")
	{
		try
		{startTC = this.previousSibling.getAttribute('data-tippy-content');
			
		}
		catch
		{startTC = this.nextSibling.getAttribute('data-tippy-content');}
	}
    document.getElementById("timecode").innerHTML = startTC;
	document.getElementById("rangeCode").style.visibility="hidden";
    document.getElementById("rangeCode").innerHTML = "00:00:00:00";
    audioSeconds = (timecode_to_frames(startTC) / 25);
	if (wavesurfer.isPlaying() === false)
	{
		dontPlay = true;
	}
	else
	{dontPlay = false;}

	wavesurfer.play(audioSeconds);
	
	if (dontPlay)
	{
	wavesurfer.setMute(true);
	setTimeout(pause, 20);
	}
	
	wavesurfer.clearRegions();
}


/* document.body.addEventListener('click', function(){
		wavesurfer.clearRegions();
}); */

document.getElementById("playpause").addEventListener('click', function(){
togglePlay();
});

document.getElementById("plusSize").addEventListener('click', function() {
    fontSize = window.getComputedStyle(document.getElementById('litContent')).fontSize;
    fontSize = parseInt(fontSize);
    fontSize++;
    document.getElementById("litContent").style.fontSize = fontSize+"px";
	  document.activeElement.blur();
});
document.getElementById("minusSize").addEventListener('click', function() {

    fontSize = window.getComputedStyle(document.getElementById('litContent')).fontSize;
    fontSize = parseInt(fontSize);
    fontSize--;
    document.getElementById("litContent").style.fontSize = fontSize+"px";
	  document.activeElement.blur();
});

function addKeyboardShortcuts()
{
	
	$(document).keyup(function(e){
		
		if (e.which == 81) {
			getRange();
			document.activeElement.blur();
		} else if (e.which == 87) {
			addToList();
			document.activeElement.blur();
		}
		else if (e.key == " " ||
		  e.code == "Space" ||      
		  e.keyCode == 32      
	  ) {
	togglePlay();
	  }		
	});
	
	$(document).keydown(function(e)
	{
	 if(e.keyCode == 32 && e.target == document.body) {
		e.preventDefault();
	  }
	});

}



function disableKeyboardShortcuts()
{
	console.log("dis");
	$(document).unbind("keyup keydown");
	$(document).keydown(function(e)
	{
	 if(e.keyCode == 32 && e.target == document.body) {
		e.preventDefault();
	  }
	});
}

function timecode_to_frames(timecode) {
    var a = timecode.split(':');
    return ((Number(a[0]) * 3600 + Number(a[1]) * 60 + Number(a[2])) * 25 + Number(a[3]));
}

function displayTime(currentFrame) {
    var fps = 25;
    var h = Math.floor(currentFrame / (60 * 60 * fps));
    var m = (Math.floor(currentFrame / (60 * fps))) % 60;
    var s = (Math.floor(currentFrame / fps)) % 60;
    var f = currentFrame % fps;
    return showTwoDigits(h) + ":" + showTwoDigits(m) + ":" + showTwoDigits(s) + ":" + showTwoDigits(f);
}

function showTwoDigits(number) {
    return ("00" + number).slice(-2);
}

function copyC() {
    var listContent = document.getElementById("slippylist").innerText;
    navigator.clipboard.writeText(listContent);
}


$(document).on("click", ".selectRange", function(){
		bgC=$(this).css("background-color");
		console.log(bgC);
		$(".word").css("text-decoration","none");
		$(".selectRange").css("background-color","transparent");
		
		if (bgC!="rgb(161, 64, 11)")
		{	
		compareIn=$(this).attr("data-inTC");
		compareOut=$(this).attr("data-outTC");
		$(this).css("background-color","#a1400b");
		highlightRange(compareIn,compareOut);
		}
		else
		{
		$(".word").css("text-decoration","none");
		$(".selectRange").css("background-color","transparent");
		}
		document.activeElement.blur();
});




var list = document.querySelector('ul#slippylist');

new Slip(list);
list.addEventListener('slip:swipe', function(e) {
    e.target.parentNode.removeChild(e.target);
    countListDuration();
	saveListToLocalStorage();
});

list.addEventListener('slip:reorder', function(e) {
    e.target.parentNode.insertBefore(e.target, e.detail.insertBefore);
	countListDuration();
	saveListToLocalStorage();
    return false;
}, false);


function highlightRange(compareIn,compareOut)
{

	for (w=0;w<spanL;w++)
	{
		if (compareIn==wordTimeArray[w])
		{	
			var rangeIndexIn=w;
			break;
		}
	}
	w=rangeIndexIn;
	for (w=0;w<spanL;w++)
	{
		if (compareOut==wordTimeArray[w])
		{	
			var rangeIndexOut=w;
			break;
		}
	}

	for (w=rangeIndexIn;w<rangeIndexOut;w++)
	{
			//$(".word").eq(w).css("background-color","#524702");

			$(".word").eq(w).css("text-decoration","underline");
			$(".word").eq(w).css("text-decoration-color","#a1400b");
			$(".word").eq(w).css("text-decoration-style","double");
	} 
	
	
	playHere=(timecode_to_frames(compareIn) / 25);
	wavesurfer.setMute(true);
	wavesurfer.play(playHere);
	setTimeout(pause, 20);	
}










//audio


var wavesurfer = WaveSurfer.create({
    container: '#waveform',
    waveColor: 'violet',
    progressColor: 'violet',
	height: 50,
	barHeight: 5,
	cursorColor: "#b2ff19",
	responsive: true,
	showTime: true
});

const wsRegions = wavesurfer.registerPlugin(RegionsPlugin.create())

audio_file.onchange = function() {
  var files = this.files;
  var file = URL.createObjectURL(files[0]);
  document.getElementById("loaderContainer").style.visibility="visible";
  wavesurfer.load(file);
  document.activeElement.blur();
}

wavesurfer.on('ready', function () {
	document.getElementById("waveform").style.height="50px";
	document.getElementById("waveform").style.visibility="visible";
	//document.getElementById("waveform").style.width="80%";
	document.getElementById("content").style.marginTop="130px";
	document.getElementById("clipList").style.top="170px";
	document.getElementById("playpause").style.visibility="visible";
	document.getElementById("quickexport").style.visibility="visible";
	document.getElementById("waveTCcontainer").style.display="block";
	document.getElementById("loaderContainer").style.display="none";
    togglePlay();
});

wavesurfer.on('audioprocess', function () {
	var nowTime = wavesurfer.getCurrentTime();
	nowTime = wavesecsToTime(nowTime);
	var timeToCompare="0:"+nowTime;
	findWord(timeToCompare);
	document.getElementById("waveTC").innerHTML = nowTime;
	var exEl=$("#waveform wave wave").css("width");
	$("#waveTCcontainer").css("left",exEl);
});

wavesurfer.on('seek', function () {
	var nowTime = wavesurfer.getCurrentTime();
	nowTime = wavesecsToTime(nowTime);
	var timeToCompare="0:"+nowTime;
	findWord(timeToCompare);
	document.getElementById("waveTC").innerHTML = nowTime;
	var exEl=$("#waveform wave wave").css("width");
	$("#waveTCcontainer").css("left",exEl);
});

function play(){
	 wavesurfer.play();
}

function pause(){
	wavesurfer.setMute(false);
	 wavesurfer.pause();
}


function wavesecsToTime(currentFrame) {
	currentFrame=Number(currentFrame); 
	var rounded = Math.round(currentFrame * 100) / 100;
	rounded = rounded.toString();
	var timeArr = rounded.split(".");
	var frms = timeArr[1];
	frms = Number(frms);
	
	if (frms != 0)
	{frms = Math.trunc(frms/4); }

	if (frms <= 9)
	{
		frms = "0"+frms;
	}
	 if (isNaN(frms) === true)
	 {frms=00;}
	
	ss = Number(timeArr[0]);
	var minutes = Math.floor(ss / 60);
	var seconds = ss - minutes * 60;
	
	if (minutes <=9)
	{minutes = "0"+minutes;}
	if (seconds <= 9)
	{seconds = "0"+seconds;}
	
	
	return minutes+":"+seconds+":"+frms;
}

function togglePlay()
{
	wavesurfer.playPause();
	
	if (wavesurfer.isPlaying() === true)
	{document.getElementById("playpausespan").innerText="pause_circle";}
	else
	{document.getElementById("playpausespan").innerText="play_circle";}
}

function findWord(timeToCompare)
{
	for (w=0;w<spanL;w++)
	{
		if (timeToCompare==wordTimeArray[w])
		{	
			$(".word").css("background-color","transparent");
			$(".word").eq(w).css("background-color","#80226a"); 
			
			break;
		}
	}
}


//EDL


function secsToTimeEDL(dd) {
  var date = new Date(0);
  date.setSeconds(dd); // specify value for SECONDS here
  var timeString = date.toISOString().substr(11, 8);
  return timeString + ':00';
}

function createArray() {
  var listItems = $("#slippylist li");
  lastOutPoint = 0;
  var tcIn = 0;
  var tcOut = 0;
  totalDuration = 0;

  pointsArray = [];
  textsArray = [];
  listItems.each(function(idx, li) {
    var listItem = $(li);
    var pointIn = tempIn = listItem.attr("data-inTC");
    var pointOut = tempOut = listItem.attr("data-outTC");
	var pointDur = timecode_to_frames(pointOut) - timecode_to_frames(pointIn);
    //var tDur = parseInt(listItem.attr("data-dur"));
	
	var textIn = listItem.attr("data-inText");
	var textOut = listItem.attr("data-outText");
	var allText = listItem.attr("data-allText");

    tcIn = displayTime(lastOutPoint);
    tcIn = '1' + tcIn.slice(1);
    tcOut = displayTime(lastOutPoint + pointDur);
    tcOut = '1' + tcOut.slice(1);

    pointIn = '10' + pointIn.slice(1);
    pointOut = '10' + pointOut.slice(1);

    var tempArray = [pointIn, pointOut, tcIn, tcOut];
    pointsArray.push(tempArray);
	
	var tempTextArray = [tempIn, tempOut, textIn, textOut, allText];
	textsArray.push(tempTextArray);
	
    lastOutPoint = lastOutPoint + pointDur;
    //totalDuration += tDur;
  });
  console.log(pointsArray);
  console.log(createEdl());
 
  //$("#totalDuration").html("YhteensÃ¤: " + durToTime(totalDuration));
}

function createEdl() {

  sqname=$("#sqName").val();
  filename=$("#clipName").val();
  edlText = "";
  edlIndex = 1;
  tempIndex = "";
  edlText += "TITLE:   "+sqname+"\n";
  edlText += "FCM: NON-DROP FRAME";
  var loopTime = pointsArray.length;
  for (i = 0; i <= loopTime - 1; i++) {
    tempIndex = fixIndex(edlIndex);
    edlText += "\n" + tempIndex + "  " + filename + " V     C        " + pointsArray[i][0] + " " + pointsArray[i][1] + " " + pointsArray[i][2] + " " + pointsArray[i][3] + "\n";
    edlIndex++;
    tempIndex = fixIndex(edlIndex);
    edlText += tempIndex + "  " + filename + " A     C        " + pointsArray[i][0] + " " + pointsArray[i][1] + " " + pointsArray[i][2] + " " + pointsArray[i][3] + "\n";
    edlIndex++;
    tempIndex = fixIndex(edlIndex);
    edlText += tempIndex + "  " + filename + " A2    C        " + pointsArray[i][0] + " " + pointsArray[i][1] + " " + pointsArray[i][2] + " " + pointsArray[i][3];
    edlIndex++;
  }
  return edlText;
}

function createTextFile()
{   createArray();
	textText="";
	for (i=0; i<textsArray.length; i++)
	{
	textText += textsArray[i][0]+" - "+textsArray[i][1]+"\n";
	textText += textsArray[i][4]+"\n \n \n";
	}
	return textText;
}

function createClipboardText()
{
	createArray();
	clipboardText="";
	for (i=0; i<textsArray.length; i++)
	{
	clipboardText += "*"+textsArray[i][0]+"* "+textsArray[i][2]+"\n";
	clipboardText += "*"+textsArray[i][1]+"* "+textsArray[i][3]+"\n \n \n";
	}
}

function createSrtFile()
{
	srtFileContents="";
	createArray();
	var srtIndex=1;
	for (s=0;s<textsArray.length;s++)
	{
		var srtIn=textsArray[s][0];
		var srtInList = srtIn.split(":");
		var srtInMilliseconds = srtInList[3]*40;
		if (srtInMilliseconds > 0 && srtInMilliseconds <= 99)
			{srtInMilliseconds="0"+srtInMilliseconds;}
		else if (srtInMilliseconds==0)
			{srtInMilliseconds="000";}
		srtIn = "0"+srtInList[0]+":"+srtInList[1]+":"+srtInList[2]+","+srtInMilliseconds;
		
		var srtOut=textsArray[s][1];
		var srtOutList = srtOut.split(":");
		var srtOutMilliseconds = srtOutList[3]*40;
		if (srtOutMilliseconds > 0 && srtOutMilliseconds <= 99)
			{srtOutMilliseconds="0"+srtOutMilliseconds;}
		else if (srtOutMilliseconds==0)
			{srtOutMilliseconds="000";}
		srtOut = "0"+srtOutList[0]+":"+srtOutList[1]+":"+srtOutList[2]+","+srtOutMilliseconds;
		
		srtFileContents += srtIndex+"\n";
		srtFileContents += srtIn+" --> "+srtOut+"\n";
		srtFileContents += textsArray[s][4]+"\n\n";
		srtIndex++;
	}
}




function fixIndex(current) {
  if (current < 10) {
    ti = "00000" + current;
  } else if (current >= 10 && current < 100) {
    ti = "0000" + current;
  } else {
    ti = "000" + current;
  }
  return ti;
}


//edl save modal

$("#saveEdlButton").on("click", function(){
		 createArray();
         const link = document.createElement("a");
         const content = createEdl();
		 console.log(content);
         const edlfile = new Blob([content], { type: 'text/plain' });
         link.href = URL.createObjectURL(edlfile);
         link.download = filename+".edl";
         link.click();
         URL.revokeObjectURL(link.href);
    	 modal.style.display = "none";
		 addKeyboardShortcuts();
});

$("#saveTextButton").on("click", function(){
		 createTextFile();
         const link = document.createElement("a");
         const content = textText;
         const txtfile = new Blob([content], { type: 'text/plain' });
         link.href = URL.createObjectURL(txtfile);
         link.download = filename+".txt";
         link.click();
         URL.revokeObjectURL(link.href);
    	 modal.style.display = "none";
		 addKeyboardShortcuts();
});

$("#saveSrtButton").on("click", function(){
		 createSrtFile();
         const link = document.createElement("a");
         const content = srtFileContents;
         const srtfile = new Blob([content], { type: 'text/plain' });
         link.href = URL.createObjectURL(srtfile);
         link.download = filename+".srt";
         link.click();
         URL.revokeObjectURL(link.href);
    	 modal.style.display = "none";
		 addKeyboardShortcuts();
});

$("#copyTextButton").on("click", function(){
	createClipboardText();
	navigator.clipboard.writeText(clipboardText);
	$("#statusinfo").html("KOPIOITU!");
	setTimeout(function(){
	modal.style.display = "none";
	$("#statusinfo").html("");
	addKeyboardShortcuts();
	},1000);
	
});


$(".saveicon").click(function(){
	filename = document.getElementById("fileid").getAttribute("data-filename");
	filename = filename.slice(1,-1);
	$("#modalbg").css("display","block");
	$("#clipName").val(filename);
	$("#sqName").val(filename);
	disableKeyboardShortcuts();
});

var modal = document.getElementById("modalbg");
window.onclick = function(event) {
  if (event.target == modal) {
    modal.style.display = "none";
	addKeyboardShortcuts();
  }
}


filename = document.getElementById("fileid").getAttribute("data-filename");
filename = filename.slice(1,-1);
loadListFromLocalStorage();
addKeyboardShortcuts();


//Slip.js
/* Copyright (c) 2014-2021 Kornel Lesiński. All rights reserved.

Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:

1. Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.

2. Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. */


wavesurfer.on('region-created', function(regi) {
             r = regi;
         });

function dload() {
 var region = r;
 var start = region.start;
 var end = region.end;
 var downloadUrl = wavesurfer.backend.getPeaks(start, end);
 start = Math.round(wavesurfer.backend.buffer.sampleRate * start);
 end = Math.round(wavesurfer.backend.buffer.sampleRate * end);
 end = end - start;
 let originalBuffer = bufferToWave(wavesurfer.backend.buffer, start, end);
 var anchor = document.createElement('a');
 anchor.href = originalBuffer;
 anchor.download = filename+'_ef.wav';
 anchor.click();
}



document.getElementById('quickexport').addEventListener('click', function() {
	getRange();
 dload();
});


// Convert a audio-buffer segment to a Blob using WAVE representation
// The returned Object URL can be set directly as a source for an Auido element.
// (C) Ken Fyrstenberg / MIT license
function bufferToWave(abuffer, offset, len) {

 var numOfChan = abuffer.numberOfChannels,
	 length = len * numOfChan * 2 + 44,
	 buffer = new ArrayBuffer(length),
	 view = new DataView(buffer),
	 channels = [],
	 i, sample,
	 pos = 0;

 // write WAVE header
 setUint32(0x46464952); // "RIFF"
 setUint32(length - 8); // file length - 8
 setUint32(0x45564157); // "WAVE"

 setUint32(0x20746d66); // "fmt " chunk
 setUint32(16); // length = 16
 setUint16(1); // PCM (uncompressed)
 setUint16(numOfChan);
 setUint32(abuffer.sampleRate);
 setUint32(abuffer.sampleRate * 2 * numOfChan); // avg. bytes/sec
 setUint16(numOfChan * 2); // block-align
 setUint16(16); // 16-bit (hardcoded in this demo)

 setUint32(0x61746164); // "data" - chunk
 setUint32(length - pos - 4); // chunk length

 // write interleaved data
 for (i = 0; i < abuffer.numberOfChannels; i++)
	 channels.push(abuffer.getChannelData(i));

 while (pos < length) {
	 for (i = 0; i < numOfChan; i++) { // interleave channels
		 sample = Math.max(-1, Math.min(1, channels[i][offset])); // clamp
		 sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0; // scale to 16-bit signed int
		 view.setInt16(pos, sample, true); // update data chunk
		 pos += 2;
	 }
	 offset++ // next source sample
 }

 // create Blob
 return (URL || webkitURL).createObjectURL(new Blob([buffer], {
	 type: "audio/wav"
 }));

 function setUint16(data) {
	 view.setUint16(pos, data, true);
	 pos += 2;
 }

 function setUint32(data) {
	 view.setUint32(pos, data, true);
	 pos += 4;
 }
}
