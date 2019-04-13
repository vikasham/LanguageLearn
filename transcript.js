async function syncRecognizeWords(
  filename,
  encoding,
  sampleRateHertz,
  languageCode
) {
  // [START speech_sync_recognize_words]
  // Imports the Google Cloud client library
  const fs = require('fs');
  const speech = require('@google-cloud/speech');

  // Creates a client
  const client = new speech.SpeechClient();

  /**
   * TODO(developer): Uncomment the following lines before running the sample.
   */
  //const filename = 'examples-recordings/audio.wav';
  //const encoding = 'LINEAR16';
  //const sampleRateHertz = 16000;
  //const languageCode = 'en-US';

  const config = {
    enableWordTimeOffsets: true,
    encoding: encoding,
    sampleRateHertz: sampleRateHertz,
    languageCode: languageCode,
  };
  const audio = {
    content: fs.readFileSync(filename).toString('base64'),
  };

  const request = {
    config: config,
    audio: audio,
  };

  var resultString = "";

  // Detects speech in the audio file
  const [response] = await client.recognize(request);

  return new Promise((resolve, reject) => {
    response.results.forEach(result => {
      //console.log(`Transcription: `, result.alternatives[0].transcript);

      resultString = result.alternatives[0].transcript;

      result.alternatives[0].words.forEach(wordInfo => {
        // NOTE: If you have a time offset exceeding 2^32 seconds, use the
        // wordInfo.{x}Time.seconds.high to calculate seconds.
        const startSecs =
          `${wordInfo.startTime.seconds}` +
          `.` +
          wordInfo.startTime.nanos / 100000000;
        const endSecs =
          `${wordInfo.endTime.seconds}` +
          `.` +
          wordInfo.endTime.nanos / 100000000;
        //console.log(`Word: ${wordInfo.word}`);
        //console.log(`\t ${startSecs} secs - ${endSecs} secs`);
      });

      resolve(resultString);
    });
  });


  //if at least one word was added, cut the


  // [END speech_sync_recognize_words]
}

module.exports = Object.assign({syncRecognizeWords})
