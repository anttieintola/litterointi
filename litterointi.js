var sel;
var startTC;
var endTC;
var startFrames;
var endFrames;
var range;
var rangeTime;
var rangeInSeconds;

var blob = window.webkitURL;

document.getElementById('file').addEventListener('change', function(event) {
    var file = this.files[0],
        fileURL = blob.createObjectURL(file);
    document.getElementById("audio").style.visibility = "visible";
    document.getElementById('audio').src = fileURL;
});

function getRange() {
    sel = window.getSelection();
    startTC = sel.getRangeAt(0).startContainer.parentNode.getAttribute('data-tippy-content');
    try {
        endTC = sel.getRangeAt(0).endContainer.parentNode.nextSibling.getAttribute('data-tippy-content');
    } catch {
        endTC = sel.getRangeAt(0).endContainer.parentNode.getAttribute('data-tippy-content');
    }
    startFrames = timecode_to_frames(startTC);
    endFrames = timecode_to_frames(endTC);
    range = parseInt(endFrames) - parseInt(startFrames);
    rangeInSeconds = Math.floor(range / 25);
    console.log(range);
    rangeTime = displayTime(range);
    console.log("Kesto: " + rangeTime);
    document.getElementById("timecode").innerHTML = startTC + " - " + endTC;
    document.getElementById("rangeCode").innerHTML = rangeTime;
    console.log(startTC + " " + endTC);
}

function addToList() {
    getRange();
    startObj = sel.getRangeAt(0).startContainer.parentNode;
    endObj = sel.getRangeAt(0).endContainer.parentNode;
    startText = startObj.innerText;
    startText += startObj.nextElementSibling.innerText;
    startText += startObj.nextElementSibling.nextElementSibling.innerText;
    console.log(startText);
    endText = endObj.previousElementSibling.previousElementSibling.innerText;
    endText += endObj.previousElementSibling.innerText;
    endText += endObj.innerText;
    console.log(endText);
    clipElement = '<li data-dur="' + rangeInSeconds + '"><b>' + startTC + '</b> <i>' + startText + '</i><br><b>' + endTC + '</b> <i>' + endText + '</i></li>';
    document.getElementById("slippylist").innerHTML += clipElement;
    countListDuration();
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
    document.getElementById("timecode").innerHTML = startTC;
    document.getElementById("rangeCode").innerHTML = "00:00:00:00";
    audioSeconds = (timecode_to_frames(startTC) / 25);
    document.getElementById("audio").currentTime = audioSeconds;
    document.getElementById("audio").focus();
}

document.getElementById("plusSize").addEventListener('click', function() {
    fontSize = window.getComputedStyle(document.getElementById('content')).fontSize;
    fontSize = parseInt(fontSize);
    fontSize++;
    document.getElementById("content").style.fontSize = fontSize;
});
document.getElementById("minusSize").addEventListener('click', function() {
    fontSize = window.getComputedStyle(document.getElementById('content')).fontSize;
    fontSize = parseInt(fontSize);
    fontSize--;
    document.getElementById("content").style.fontSize = fontSize;
});
document.onkeyup = function(e) {
    if (e.which == 81) {
        getRange();
    } else if (e.which == 87) {
        addToList();
    }
};

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
var list = document.querySelector('ul#slippylist');

new Slip(list);
list.addEventListener('slip:swipe', function(e) {
    e.target.parentNode.removeChild(e.target);
    countListDuration();
});

list.addEventListener('slip:reorder', function(e) {
    e.target.parentNode.insertBefore(e.target, e.detail.insertBefore);
    return false;
}, false);