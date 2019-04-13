// Imports modules.
const fs = require(`fs`);
const path = require(`path`);

const AudioRecorder = require(`node-audiorecorder`);

// Constants.
const DIRECTORY = `examples-recordings`;

// Initialize recorder and file stream.
const audioRecorder = new AudioRecorder({
	program: process.platform === `win32` ? `sox` : `rec`,
  // Following options only available when using `rec` or `sox`.
  silence: 1,         // Duration of silence in seconds before it stops recording.
  thresholdStart: 0.5,  // Silence threshold to start recording.
  thresholdStop: 0.5,   // Silence threshold to stop recording.
}, console);

// Create path to write recordings to.
if (!fs.existsSync(DIRECTORY)){
	fs.mkdirSync(DIRECTORY);
}

// Create file path with random name.
const fileName = path.join(DIRECTORY, "audio.wav");

console.log(`Writing new recording file at: `, fileName);

// Create write stream.
const fileStream = fs.createWriteStream(fileName, { encoding: `binary` });

// Start and write to the file.
audioRecorder.start().stream().pipe(fileStream);

// Log information on the following events
audioRecorder.stream().on(`close`, function(code) {
	console.warn(`Recording closed. Exit code: `, code);
});

audioRecorder.stream().on(`end`, function() {
	console.warn(`Recording ended.`);
});

audioRecorder.stream().on(`error`, function() {
	console.warn(`Recording error.`);
});

// Keep process alive.
process.stdin.resume();

// // Imports the Google Cloud client library
// const speech = require('@google-cloud/speech');
//
// // Creates a client
// const client = new speech.SpeechClient();
//
// // Reads a local audio file and converts it to base64
// const file = fs.readFileSync(fileName);
// const audioBytes = file.toString('base64');
//
// // The audio file's encoding, sample rate in hertz, and BCP-47 language code
// const audio = {
//   content: audioBytes,
// };
// const config = {
//   encoding: 'LINEAR16',
//   sampleRateHertz: 16000,
//   languageCode: 'en-US',
// };
// const request = {
//   audio: audio,
//   config: config,
// };
//
// // Detects speech in the audio file
// client
//   .recognize(request)
//   .then(data => {
//     const response = data[0];
//     const transcription = response.results
//       .map(result => result.alternatives[0].transcript)
//       .join('\n');
//     console.log(`Transcription: ${transcription}`);
//   })
//   .catch(err => {
//     console.error('ERROR:', err);
//   });
