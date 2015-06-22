var mediaConstraints = { video: true };

navigator.getUserMedia(mediaConstraints, onMediaSuccess, onMediaError);

document.querySelector('#stop').disabled = true;

document.querySelector('#start').onclick = function() {
  this.disabled = true;
  document.querySelector('#stop').disabled = false;
  var timeInterval = 30000;

  // get blob after specific time interval
  mediaRecorder.start(timeInterval);
};

document.querySelector('#stop').onclick = function() {
  this.disabled = true;
  mediaRecorder.stop();
};

var mediaRecorder;
var blobURL, dataURL, uploadURL, imgurURL;
var phoneNumber;

var reader  = new FileReader();

function onMediaSuccess(stream) {
    var video = document.createElement('video');

    video = mergeProps(video, {
        controls: false,
        width: 320,
        height: 240,
        src: URL.createObjectURL(stream),
        autoplay: true
    });
    video.play();

    videosContainer.appendChild(video);

    mediaRecorder = new MediaStreamRecorder(stream);
    mediaRecorder.mimeType = 'image/gif'; // this line is mandatory
    mediaRecorder.videoWidth  = 320;
    mediaRecorder.videoHeight = 240;
    mediaRecorder.ondataavailable = function(blob) {
        blobURL = URL.createObjectURL(blob);


        var xhr = new XMLHttpRequest;
        xhr.responseType = 'blob';

        xhr.onload = function() {
           var recoveredBlob = xhr.response;

           var reader = new FileReader;

           reader.onload = function() {
            dataURL = reader.result;
            //  window.location = blobAsDataUrl;
            uploadURL = dataURL.replace('data:image/gif;base64,', '');
           };

           reader.readAsDataURL(recoveredBlob);
        };

        xhr.open('GET', blobURL);
        xhr.send();

        $('#gif-container').append('<img src="' + blobURL + '"/>');
        $('#gif-container').append('<div class="row"><div class="col-md-3"></div><div class="col-md-6"><span class="inside-title">Share Your Selfie</span><br><a class="btn btn-social-icon btn-facebook" onclick=share("facebook")><i class="fa fa-facebook"></i></a>&nbsp;<a class="btn btn-social-icon btn-twitter" onclick=share("twitter")><i class="fa fa-twitter"></i></a>&nbsp;<a class="btn btn-social-icon btn-pinterest" onclick=textMessage()><i class="glyphicon glyphicon-phone"></i></a>&nbsp;<a id="download" class="btn btn-social-icon btn-default" onclick=share("download")><i class="glyphicon glyphicon-download-alt"></i></a><br><br></div><div class="col-md-3"></div></div>');
    };
}

function onMediaError(e) {
  console.error('Media Error', e);
}

function textMessage() {
  getNumber();
  share('twilio');
}

function getNumber() {
  phoneNumber = prompt("Please a phone number (United States)", "(XXX)-XXX-XXXX").replace("[()\\s-]+", "");
}

function share(site) {
  if(imgurURL) {
    if(site == 'facebook') {
      window.open('https://www.facebook.com/sharer/sharer.php?t=Selfie&u=' + imgurURL);
    } else if(site == 'twitter') {
      window.open('https://twitter.com/intent/tweet?text=Selfie&url='+ imgurURL +'&via=josephmilla&hashtags=SorryNotSorry,ChallengePost,SummerJam');
    } else if(site == 'twilio') {
      $.ajax({
        url: 'http://45.55.134.228:8081/twilio',
        type: 'GET',
        data: {
          receiver: phoneNumber,
          url: imgurURL
        },
        success: function(result) {
          console.log("Message was sent!");
        }
      });
    } else {
      var a = $("#download")
      .attr("href", imgurURL)
      .attr("download", "selfie.gif")
      a[0].click();
    }
  } else {
    $.ajax({
      url: 'https://api.imgur.com/3/image',
      type: 'POST',
      headers: {
        Authorization: 'Client-ID d40b60584afc371',
        Accept: 'application/json'
      },
      data: {
        image: uploadURL,
        type: 'base64'
      },
      success: function(result) {
        var id = result.data.id;
        // window.location = 'https://imgur.com/gallery/' + id;
        imgurURL = 'http://i.imgur.com/'+ id + '.gif';
        if(site == 'facebook') {
          // window.open('https://www.facebook.com/sharer/sharer.php?t=Selfie&u=' + imgurURL);
          window.open('https://www.facebook.com/dialog/share?app_id=145634995501895&display=popup&href=https%3A%2F%2Fdevelopers.facebook.com%2Fdocs%2F&redirect_uri=https%3A%2F%2Fdevelopers.facebook.com%2Ftools%2Fexplorer')
        } else if(site == 'twitter') {
          window.open('https://twitter.com/intent/tweet?text=Selfie&url='+ imgurURL +'&via=josephmilla&hashtags=SorryNotSorry,ChallengePost,SummerJam');
        } else if(site == 'twilio') {
          $.ajax({
            url: 'http://45.55.134.228:8081/twilio',
            type: 'GET',
            data: {
              receiver: phoneNumber,
              url: imgurURL
            },
            success: function(result) {
              console.log("Message was sent!");
            }
          });
        } else {
          var a = $("#download")
          .attr("href", imgurURL)
          .attr("download", "selfie.gif")
          a[0].click();
        }
      }
    });
  }
}

var videosContainer = document.getElementById('videos-container');
var index = 1;

window.onbeforeunload = function() {
  document.querySelector('#start').disabled = false;
};
