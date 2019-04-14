async function translateText(text, target) {
  // Imports the Google Cloud client library
  const {Translate} = require('@google-cloud/translate');

  // Creates a client
  const translate = new Translate();

  /**
   * TODO(developer): Uncomment the following lines before running the sample.
   */
  //const text = 'Hello, world!';
//  const target = 'ru';

  // Translates the text into the target language. "text" can be a string for
  // translating a single piece of text, or an array of strings for translating
  // multiple texts.
  let [translations] = await translate.translate(text, target);

  return new Promise((resolve, reject) => {
    translations = Array.isArray(translations) ? translations : [translations];
    translations.forEach((translation, i) => {
      resolve(translation);
    });
  })
}

async function detectLanguage(text) {
  // [START translate_detect_language]
  // Imports the Google Cloud client library
  const {Translate} = require('@google-cloud/translate');

  // Creates a client
  const translate = new Translate();

  // Detects the language. "text" can be a string for detecting the language of
  // a single piece of text, or an array of strings for detecting the languages
  // of multiple texts.
  let [detections] = await translate.detect(text);
  detections = Array.isArray(detections) ? detections : [detections];
  console.log('Detections:');
  detections.forEach(detection => {
    console.log(`${detection.input} => ${detection.language}`);
  });
}
//detectLanguage('hey how are you');

module.exports = Object.assign({translateText})
