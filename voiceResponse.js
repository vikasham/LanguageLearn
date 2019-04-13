function voiceRespond(text, languageCode)
{
    const fs = require('fs');
    const path = require(`path`);

    const DIRECTORY = "examples-voiceResponses";
    // Create path to write recordings to.
    if (!fs.existsSync(DIRECTORY)){
    	fs.mkdirSync(DIRECTORY);
    }
    const fileName = path.join(DIRECTORY, "voice_response.mp3");

    // Imports the Google Cloud client library
    const textToSpeech = require('@google-cloud/text-to-speech');

    // Creates a client
    const client = new textToSpeech.TextToSpeechClient();

    // The text to synthesize
    //const text = 'Hello, world!';

    // Construct the request
    const request = {
      input: {text: text},
      // Select the language and SSML Voice Gender (optional)
      voice: {languageCode: languageCode, ssmlGender: 'NEUTRAL'},
      // Select the type of audio encoding
      audioConfig: {audioEncoding: 'MP3'},
    };

    // Performs the Text-to-Speech request
    return new Promise((resolve, reject) => {
      client.synthesizeSpeech(request, (err, response) => {
        if (err) {
          console.error('ERROR:', err);
          reject(err)
          return;
        }

        // Write the binary audio content to a local file
        fs.writeFile(fileName, response.audioContent, 'binary', err => {
          if (err) {
            console.error('ERROR:', err);
            reject(err)
            return;
          }
          console.log('Audio content written to file: voice_response.mp3');
          resolve(fileName)
        });
      });
    })

}

const player = require('play-sound')(opts = {})

function speak(file) {
  player.play(file, (err) => {
    if (err)
      throw err
  })
}

module.exports = Object.assign({voiceRespond, speak})
