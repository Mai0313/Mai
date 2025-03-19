var vidNames = [];

// 從 JSON 檔案讀取影片名稱列表
$.getJSON("./vids/vid_names.json", function(data) {
    vidNames = data;
    
    // 隨機選擇一個影片索引
    vidNum = Math.floor(Math.random() * vidNames.length);

    refresh();  // 在這裡調用 refresh，確保 vidNames 已經更新
});

var playMy = true;
var vidNum = Math.floor(Math.random() * vidNames.length);
console.log(vidNum);

function refresh() {
    $("#vidSrc").attr("src", "./vids/" + vidNum + ".mp4");
    $("#vidName").text(vidNames[vidNum]);
    document.getElementById("vid").volume = 0.3;
    $("#vid")[0].load();  // 修正 load() 調用，不帶參數
}

refresh();

var musBoxI = 0;
var musBoxActive = 0;
$("#musBtn").click(function() {
    if (musBoxActive == 0) {
        if (musBoxI == 0) {
            musBoxActive = 1;
            $("#musBox").css("display", "block");
            setTimeout(() => {
                $("#musBox").css("opacity", "1");
            }, 10);
            setTimeout(() => {
                musBoxI = 1;
                musBoxActive = 0;
            }, 500);
        } else {
            musBoxActive = 1;
            $("#musBox").css("opacity", "0");
            setTimeout(() => {
                $("#musBox").css("display", "none");
                musBoxI = 0;
                musBoxActive = 0;
            }, 500);
        }
    }
});
$("#musBoxClose").click(function() {
    if (musBoxActive == 0 && musBoxI == 1) {
        musBoxActive = 1;
        $("#musBox").css("opacity", "0");
        setTimeout(() => {
            $("#musBox").css("display", "none");
            musBoxI = 0;
            musBoxActive = 0;
        }, 500);
    }
});

$('body').click(() => {
    var video = document.getElementById('vid');
    console.log(playMy);
    if (playMy) {
        video.play(); // 播放
    } else {
        video.pause(); // 暫停
    }
    playMy = !playMy;
});

var moreType = true;
$('#more').click((event) => {
    if (moreType) {
        $('.myList').css('display', 'block');
    } else {
        $('.myList').css('display', 'none');
    }
    moreType = !moreType;
    event.stopPropagation();
});

function nextSong() {
    if (vidNum != vidNames.length - 1) {
        vidNum++;
    } else {
        vidNum = 0;
    }
    refresh();
}
function prevSong() {
    if (vidNum != 0) {
        vidNum--;
    } else {
        vidNum = vidNames.length - 1;
    }
    refresh();
}

$("#vid").on('ended', function(){
    nextSong();
});

function clock() {
    var d = new Date();
    var hours = d.getHours();
    var minutes = d.getMinutes();
    var seconds = d.getSeconds();
    if (hours <= 9) hours = "0" + hours;
    if (minutes <= 9) minutes = "0" + minutes;
    if (seconds <= 9) seconds = "0" + seconds;
    var date_time = hours + ":" + minutes + ":" + seconds;
    if (document.layers) {
        document.layers.time.document.write(date_time);
        document.layers.time.document.close();
    } else {
        document.getElementById("clock").innerHTML = date_time;
    }
    setTimeout(clock, 1000);
}

$(window).on('wheel', function(e) {
    var delta = e.originalEvent.deltaY;
    var video = document.getElementById("vid");
    if (delta > 0) {
        // 向下滾動，降低音量
        if (video.volume > 0.1) {
            video.volume -= 0.1;
        } else {
            video.volume = 0;
        }
    } else if (delta < 0) {
        // 向上滾動，增加音量
        if (video.volume < 0.9) {
            video.volume += 0.1;
        } else {
            video.volume = 1;
        }
    }
});

var audioContext = new (window.AudioContext || window.webkitAudioContext)();
var audioSource = audioContext.createMediaElementSource(document.getElementById("vid"));
var analyser = audioContext.createAnalyser();

analyser.fftSize = 4096;

audioSource.connect(analyser);
analyser.connect(audioContext.destination);

var canvas = document.getElementById("audioVisualizer");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
var canvasContext = canvas.getContext("2d");

function draw() {
    requestAnimationFrame(draw);

    var freqData = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(freqData);

    canvasContext.clearRect(0, 0, canvas.width, canvas.height);

    for (var i = 0; i < freqData.length; i++) {
        var value = freqData[i];
        var percent = value / 256;
        var height = canvas.height * percent;
        var offset = canvas.height - height - 1;
        var barWidth = canvas.width / freqData.length;
        canvasContext.fillStyle = 'rgba(255, 255, 255, 0.5)';
        canvasContext.fillRect(i * barWidth, offset, barWidth, height);
    }
}

draw();

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
