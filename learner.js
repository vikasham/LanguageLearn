// Imports modules.
const fs = require(`fs`);
const path = require(`path`);
const axios = require('axios')
const transcriber = require('./transcript.js')
const voice = require('./voiceResponse.js')
const translate = require('./translate.js')

const AudioRecorder = require(`node-audiorecorder`);

const DIRECTORY = `examples-recordings`;
const audioRecorder = new AudioRecorder({
	program: process.platform === `win32` ? `sox` : `rec`,
  // Following options only available when using `rec` or `sox`.
  silence: 3,         // Duration of silence in seconds before it stops recording.
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

var sourceLang = 'de';
var destLang = 'en';
var responseLang = 'en';

process.on('message', (m, jsonData) => {
	data = JSON.parse(jsonData)
  if (m === 'run') {
		sourceLang = data.sourceLang
		responseLand = data.responseLang
    askRespond()
  }
});

function getResponse(context) {
	var cont

	if (context.size > 3) {
		for (var i = context.size - 4; i < context.size; i++) {
			cont.push(context[i])
		}
	} else {
		cont = context
	}

	console.log(cont)

	return new Promise((resolve, reject) => {
		axios.post('http://localhost:8080/cakechat_api/v1/actions/get_response', {
			context : cont,
			emotion : 'neutral'
		}).then((res) => {
			console.log("Message from chat bot: " + res.data.response)
			resolve(res.data.response)
		}).catch((error) => {
			reject(error)
		})
	})
}

var conversation = new Array()

function askRespond () {
	console.log("Begin askRespond")
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

	setTimeout(() => {
		audioRecorder.stop()
		//make sure to set language accordingly
		var prom = transcriber.syncRecognizeWords("examples-recordings/audio.wav", "LINEAR16", 16000, sourceLang);

		//get transcribe, put through translateText(transcriber output, desired language to convert)

		prom.then((arg) => {
			console.log("Transcribed: " + arg);

			if (!arg) {
				askRespond()
				return;
			}

			var translatePromise = translate.translateText(arg, destLang)
			translatePromise.then((translatedText) => {
				console.log("Translated to: " + translatedText);

				conversation.push(translatedText)

				var chatbotResponsePromise = getResponse(conversation);
				chatbotResponsePromise.then((chatbotResponse) => {

					var translateBackPromise = translate.translateText(chatbotResponse, responseLang)
					translateBackPromise.then((text) => {
						console.log("Translated back to: " + text)
						var voiceProm = voice.voiceRespond(text, responseLang);
						voiceProm.then((arg) => {
							var doneSpeakingPromise = voice.speak(arg);
							doneSpeakingPromise.then(() => {
                process.send("done");
							})
						})
					})
				})
			})
		})
	}, 3000)
}

module.exports = Object.assign({askRespond})
