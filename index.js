const bodyParser = require('body-parser');
const express = require('express');
const ffmpegStatic = require('ffmpeg-static');
const ffmpeg = require('fluent-ffmpeg');
const multer = require('multer');
const path = require('path');

const app = express();

const fileUpload = multer({ dest: 'uploads/' });
app.use(bodyParser.urlencoded({ extended: true }));

// Tell fluent-ffmpeg where it can find FFmpeg
ffmpeg.setFfmpegPath(ffmpegStatic);

// set view engine 
app.set('views', path.join(__dirname));
app.set('view engine', 'hbs');

app.get('/', function (req, res) {
  res.render('Home');
});

app.post("/", fileUpload.single("video"), (req, res) => {
  // check file 
  if (!req.file) {
    return res.status(400).send("File is required.");
  }

  // setting up veriables 
  const videoPath = req.file.path;
  const outputFileName = Date.now() + "_output_video.mp4";
  const outputPath = path.join("output/", outputFileName);
  console.log("outputPath", outputPath);

  // convert video resolution
  ffmpeg().input(videoPath).outputOptions('-vf scale=320:240').saveToFile(outputPath).on("end", () => {
    res.download(outputPath, outputFileName);
  }).on("error", (err) => {
    res.status(500).send("Error in video conversion: " + err.message);
  }).run();
});

app.listen(3000, () => {
  console.log('listening on http://localhost:3000');
});

