// Imports modules.
const fs = require(`fs`);
const path = require(`path`);

const transcriber = require('./transcript.js')
const voice = require('./voiceResponse.js')
const translate = require('./translate.js')

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

const request = require('request')

function getResponse(context) {
	var cont
	for (var i = context.size() - 4; i < context.size(); i++) {
		cont.push(context[i])
	}

	return new Promise((resolve, reject) => {
		request.post({
			url : 'http://localhost:8080/cakechat_api/v1/actions/get_response',
			form : {
				context : cont,
				emotion : 'neutral'
			},
			json : true
		}, (err, httpResponse, body) => {
			if (err) reject(err)
			
			console.log("Received: " + httpResponse.response)
			resolve(httpResponse.response)
		}
	})
}


var sourceLang = 'ko';
var destLang = 'en';

var conversation = new Array()

setTimeout(() => {
	audioRecorder.stop()
	//make sure to set language accordingly
	var prom = transcriber.syncRecognizeWords("examples-recordings/audio.wav", "LINEAR16", 16000, sourceLang);

	//get transcribe, put through translateText(transcriber output, desired language to convert)

	prom.then((arg) => {
		console.log("Transcribed: " + arg);

		var translatePromise = translate.translateText(arg, destLang)
		translatePromise.then((translatedText) => {
			console.log("Translated to: " + translatedText);

			conversation.push(translatedText)

			var chatbotResponsePromise = getResponse(conversation);
			chatbotResponsePromise.then((response) => {
				var responseLanguage = sourceLang;
				var translateBackPromise = translate.translateText(chatbotResponse, responseLanguage)
				translateBackPromise.then((text) => {
					console.log("Translated back to: " + text)
					var voiceProm = voice.voiceRespond(text, responseLanguage);
					voiceProm.then((arg) => {
						voice.speak(arg);
					})
				})
			})
		})
	})
}, 3000)
