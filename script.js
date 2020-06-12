const video = document.getElementById("video");

//Getting the models
Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri("/weights"),
  faceapi.nets.faceLandmark68Net.loadFromUri("/weights"),
  faceapi.nets.faceRecognitionNet.loadFromUri("/weights"),
  faceapi.nets.faceExpressionNet.loadFromUri("/weights"),
]).then(startVideo);

async function startVideo() {
  let stream = null;

  try {
    stream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = stream;
  } catch (err) {
    console.error(err);
  }
}

startVideo();

video.addEventListener("play", () => {
  //Creating the overlay canvas
  const canvas = faceapi.createCanvasFromMedia(video);
  document.body.append(canvas);
  const displaySize = { width: video.width, height: video.height };
  faceapi.matchDimensions(canvas, displaySize);

  //Getting the differente detections and resizing them
  setInterval(async () => {
    const detections = await faceapi
      .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceExpressions();
    const resizedDetections = faceapi.resizeResults(detections, displaySize);

    //Clearning the canvas before displaying a new box
    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);

    //Displaying detected face bounding boxes
    faceapi.draw.drawDetections(canvas, resizedDetections);
    //Displaying detected face landmarks
    faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
    //Displaying face expression results
    faceapi.draw.drawFaceExpressions(canvas, resizedDetections);
  }, 100);
});
