/**
 * Speak & Learn - Pronunciation Practice App for Children (Enhanced)
 *
 * This script provides the core functionality for a pronunciation practice web application
 * designed for children, now including practice for words, example sentences, and definitions.
 * Features:
 * - Word/sentence/definition display from a comprehensive vocabulary dataset
 * - Audio playback for pronunciation models (using Speech Synthesis)
 * - Recording capabilities using the MediaRecorder API for each section
 * - Speech recognition using the Web Speech API for each section
 * - Basic feedback on pronunciation attempts for each section
 */

// ===== APP STATE =====
const appState = {
    currentWordIndex: 0,
    filteredVocabularyData: [], // <-- ADDED THIS
    // Store recordings and recognition instances per section
    sections: {
        word: { mediaRecorder: null, audioChunks: [], audioBlob: null, audioUrl: null, recognition: null, stream: null, isRecording: false, speechRecognitionActive: false },
        sentence: { mediaRecorder: null, audioChunks: [], audioBlob: null, audioUrl: null, recognition: null, stream: null, isRecording: false, speechRecognitionActive: false },
        definition: { mediaRecorder: null, audioChunks: [], audioBlob: null, audioUrl: null, recognition: null, stream: null, isRecording: false, speechRecognitionActive: false }
    },
    activeSection: null, // Track which section is currently being recorded/recognized
};

// ===== DOM ELEMENTS =====
const elements = {
    // Navigation
    prevWordBtn: document.getElementById('prev-word'),
    nextWordBtn: document.getElementById('next-word'),
    wordNumberDisplay: document.getElementById('word-number'),
    totalWordsDisplay: document.getElementById('total-words'),
    levelSelect: document.getElementById('level-select'), // <-- ADDED THIS

    // Word Section
    currentWordDisplay: document.getElementById('current-word'),
    wordListenBtn: document.querySelector('.listen-btn[data-section="word"]'),
    wordStartBtn: document.querySelector('.start-btn[data-section="word"]'),
    wordStopBtn: document.querySelector('.stop-btn[data-section="word"]'),
    wordPlaybackBtn: document.querySelector('.playback-btn[data-section="word"]'),
    wordSpeechResult: document.querySelector('.speech-result[data-section="word"]'),
    wordFeedback: document.querySelector('.feedback-message[data-section="word"]'),

    // Sentence Section
    currentSentenceDisplay: document.getElementById('current-sentence'),
    sentenceListenBtn: document.querySelector('.listen-btn[data-section="sentence"]'),
    sentenceStartBtn: document.querySelector('.start-btn[data-section="sentence"]'),
    sentenceStopBtn: document.querySelector('.stop-btn[data-section="sentence"]'),
    sentencePlaybackBtn: document.querySelector('.playback-btn[data-section="sentence"]'),
    sentenceSpeechResult: document.querySelector('.speech-result[data-section="sentence"]'),
    sentenceFeedback: document.querySelector('.feedback-message[data-section="sentence"]'),

    // Definition Section
    currentDefinitionDisplay: document.getElementById('current-definition'),
    definitionListenBtn: document.querySelector('.listen-btn[data-section="definition"]'),
    definitionStartBtn: document.querySelector('.start-btn[data-section="definition"]'),
    definitionStopBtn: document.querySelector('.stop-btn[data-section="definition"]'),
    definitionPlaybackBtn: document.querySelector('.playback-btn[data-section="definition"]'),
    definitionSpeechResult: document.querySelector('.speech-result[data-section="definition"]'),
    definitionFeedback: document.querySelector('.feedback-message[data-section="definition"]'),

    // Permissions Overlay
    permissionsOverlay: document.getElementById('permissions-overlay'),
    permissionsOkBtn: document.getElementById('permissions-ok'),

    // General accessors for dynamic elements
    getDisplayElement: (section) => document.getElementById(`current-${section}`),
    getListenBtn: (section) => document.querySelector(`.listen-btn[data-section="${section}"]`),
    getStartBtn: (section) => document.querySelector(`.start-btn[data-section="${section}"]`),
    getStopBtn: (section) => document.querySelector(`.stop-btn[data-section="${section}"]`),
    getPlaybackBtn: (section) => document.querySelector(`.playback-btn[data-section="${section}"]`),
    getSpeechResultElement: (section) => document.querySelector(`.speech-result[data-section="${section}"]`),
    getFeedbackElement: (section) => document.querySelector(`.feedback-message[data-section="${section}"]`),
};

// ===== VOCABULARY DATASET (Combined) =====
// Combining words, sentences, and definitions from previous interactions.
// NOTE: Ensure the order matches the original word list. Using first 137 entries.
const vocabularyData = [
    // --- Level 1 ---
    {
        text: "Hello",
        sentence: "Say 'Hello' when you see Grandma.",
        definition: "A word used when meeting someone.",
        category: "greetings",
        level: 1,
        audioWordPath: "audio/hello_word.mp3",
        audioSentencePath: "audio/hello_sentence.mp3",
        audioDefinitionPath: "audio/hello_definition.mp3"
    },
    {
        text: "Goodbye",
        sentence: "Wave 'Goodbye' to Daddy!",
        definition: "A word used when leaving someone.",
        category: "greetings",
        level: 1,
        audioWordPath: "audio/goodbye_word.mp3",
        audioSentencePath: "audio/goodbye_sentence.mp3",
        audioDefinitionPath: "audio/goodbye_definition.mp3"
    },
    {
        text: "Thank you",
        sentence: "Did you say 'Thank you' for the cookie?",
        definition: "Words used to show you are grateful.",
        category: "phrases",
        level: 1,
        audioWordPath: "audio/thank_you_word.mp3",
        audioSentencePath: "audio/thank_you_sentence.mp3",
        audioDefinitionPath: "audio/thank_you_definition.mp3"
    },
    {
        text: "Please",
        sentence: "Say 'Please' if you want more juice.",
        definition: "A polite word used when asking for something.",
        category: "phrases",
        level: 1,
        audioWordPath: "audio/please_word.mp3",
        audioSentencePath: "audio/please_sentence.mp3",
        audioDefinitionPath: "audio/please_definition.mp3"
    },
    {
        text: "Yes",
        sentence: "'Yes', I would like to play.",
        definition: "A word meaning okay or agreeing.",
        category: "phrases",
        level: 1,
        audioWordPath: "audio/yes_word.mp3",
        audioSentencePath: "audio/yes_sentence.mp3",
        audioDefinitionPath: "audio/yes_definition.mp3"
    },
    {
        text: "No",
        sentence: "'No', I don't want peas.",
        definition: "A word meaning not okay or disagreeing.",
        category: "phrases",
        level: 1,
        audioWordPath: "audio/no_word.mp3",
        audioSentencePath: "audio/no_sentence.mp3",
        audioDefinitionPath: "audio/no_definition.mp3"
    },
    {
        text: "Sorry",
        sentence: "It's okay, just say 'Sorry'.",
        definition: "A word used when you make a mistake.",
        category: "phrases",
        level: 1,
        audioWordPath: "audio/sorry_word.mp3",
        audioSentencePath: "audio/sorry_sentence.mp3",
        audioDefinitionPath: "audio/sorry_definition.mp3"
    },
    {
        text: "Excuse me",
        sentence: "Say 'Excuse me' when you need to pass.",
        definition: "Polite words used to get attention or pass someone.",
        category: "phrases",
        level: 1,
        audioWordPath: "audio/excuse_me_word.mp3",
        audioSentencePath: "audio/excuse_me_sentence.mp3",
        audioDefinitionPath: "audio/excuse_me_definition.mp3"
    },
    {
        text: "My name is",
        sentence: "Can you tell her 'My name is Sarah'?",
        definition: "A phrase used to tell someone your name.",
        category: "phrases",
        level: 1,
        audioWordPath: "audio/my_name_is_word.mp3",
        audioSentencePath: "audio/my_name_is_sentence.mp3",
        audioDefinitionPath: "audio/my_name_is_definition.mp3"
    },
    {
        text: "How are you",
        sentence: "Ask your friend, 'How are you?'",
        definition: "A question asking about someone's well-being.",
        category: "phrases",
        level: 1,
        audioWordPath: "audio/how_are_you_word.mp3",
        audioSentencePath: "audio/how_are_you_sentence.mp3",
        audioDefinitionPath: "audio/how_are_you_definition.mp3"
    },
    {
        text: "Red",
        sentence: "Look at that bright Red car!",
        definition: "The color of apples or fire trucks.",
        category: "colors",
        level: 1,
        audioWordPath: "audio/red_word.mp3",
        audioSentencePath: "audio/red_sentence.mp3",
        audioDefinitionPath: "audio/red_definition.mp3"
    },
    {
        text: "Blue",
        sentence: "My favorite color is Blue.",
        definition: "The color of the sky or ocean.",
        category: "colors",
        level: 1,
        audioWordPath: "audio/blue_word.mp3",
        audioSentencePath: "audio/blue_sentence.mp3",
        audioDefinitionPath: "audio/blue_definition.mp3"
    },
    {
        text: "Green",
        sentence: "The frog is Green.",
        definition: "The color of grass or leaves.",
        category: "colors",
        level: 1,
        audioWordPath: "audio/green_word.mp3",
        audioSentencePath: "audio/green_sentence.mp3",
        audioDefinitionPath: "audio/green_definition.mp3"
    },
    {
        text: "Yellow",
        sentence: "Can you find the Yellow block?",
        definition: "The color of the sun or bananas.",
        category: "colors",
        level: 1,
        audioWordPath: "audio/yellow_word.mp3",
        audioSentencePath: "audio/yellow_sentence.mp3",
        audioDefinitionPath: "audio/yellow_definition.mp3"
    },
    {
        text: "Orange",
        sentence: "I want the Orange crayon.", // This is for the color orange
        definition: "A color like the fruit orange.", // Definition for the color
        category: "colors",
        level: 1,
        audioWordPath: "audio/orange_color_word.mp3", // Differentiate if you also have the fruit "Orange"
        audioSentencePath: "audio/orange_color_sentence.mp3",
        audioDefinitionPath: "audio/orange_color_definition.mp3"
    },
    {
        text: "Purple",
        sentence: "She has a Purple backpack.",
        definition: "A color like grapes.",
        category: "colors",
        level: 1,
        audioWordPath: "audio/purple_word.mp3",
        audioSentencePath: "audio/purple_sentence.mp3",
        audioDefinitionPath: "audio/purple_definition.mp3"
    },
    {
        text: "Pink",
        sentence: "That Pink flower is pretty.",
        definition: "A light red color.",
        category: "colors",
        level: 1,
        audioWordPath: "audio/pink_word.mp3",
        audioSentencePath: "audio/pink_sentence.mp3",
        audioDefinitionPath: "audio/pink_definition.mp3"
    },
    {
        text: "Brown",
        sentence: "Teddy bear is Brown.",
        definition: "The color of dirt or chocolate.",
        category: "colors",
        level: 1,
        audioWordPath: "audio/brown_word.mp3",
        audioSentencePath: "audio/brown_sentence.mp3",
        audioDefinitionPath: "audio/brown_definition.mp3"
    },
    {
        text: "Black",
        sentence: "The cat is Black.",
        definition: "The darkest color, like night.",
        category: "colors",
        level: 1,
        audioWordPath: "audio/black_word.mp3",
        audioSentencePath: "audio/black_sentence.mp3",
        audioDefinitionPath: "audio/black_definition.mp3"
    },
    {
        text: "White",
        sentence: "Look at the fluffy White clouds.",
        definition: "The color of snow or milk.",
        category: "colors",
        level: 1,
        audioWordPath: "audio/white_word.mp3",
        audioSentencePath: "audio/white_sentence.mp3",
        audioDefinitionPath: "audio/white_definition.mp3"
    },
    {
        text: "One",
        sentence: "I have One cookie left.",
        definition: "The number 1.",
        category: "numbers",
        level: 1,
        audioWordPath: "audio/one_word.mp3",
        audioSentencePath: "audio/one_sentence.mp3",
        audioDefinitionPath: "audio/one_definition.mp3"
    },
    {
        text: "Two",
        sentence: "Can you show me Two fingers?",
        definition: "The number 2.",
        category: "numbers",
        level: 1,
        audioWordPath: "audio/two_word.mp3",
        audioSentencePath: "audio/two_sentence.mp3",
        audioDefinitionPath: "audio/two_definition.mp3"
    },
    {
        text: "Three",
        sentence: "Let's count: One, Two, Three!",
        definition: "The number 3.",
        category: "numbers",
        level: 1,
        audioWordPath: "audio/three_word.mp3",
        audioSentencePath: "audio/three_sentence.mp3",
        audioDefinitionPath: "audio/three_definition.mp3"
    },
    {
        text: "Four",
        sentence: "Give me Four blocks, please.",
        definition: "The number 4.",
        category: "numbers",
        level: 1,
        audioWordPath: "audio/four_word.mp3",
        audioSentencePath: "audio/four_sentence.mp3",
        audioDefinitionPath: "audio/four_definition.mp3"
    },
    {
        text: "Five",
        sentence: "Look, Five little ducks!",
        definition: "The number 5.",
        category: "numbers",
        level: 1,
        audioWordPath: "audio/five_word.mp3",
        audioSentencePath: "audio/five_sentence.mp3",
        audioDefinitionPath: "audio/five_definition.mp3"
    },
    {
        text: "Six",
        sentence: "He is Six years old now.",
        definition: "The number 6.",
        category: "numbers",
        level: 1,
        audioWordPath: "audio/six_word.mp3",
        audioSentencePath: "audio/six_sentence.mp3",
        audioDefinitionPath: "audio/six_definition.mp3"
    },
    {
        text: "Seven",
        sentence: "I see Seven birds in the tree.",
        definition: "The number 7.",
        category: "numbers",
        level: 1,
        audioWordPath: "audio/seven_word.mp3",
        audioSentencePath: "audio/seven_sentence.mp3",
        audioDefinitionPath: "audio/seven_definition.mp3"
    },
    {
        text: "Eight",
        sentence: "Put Eight candles on the cake.",
        definition: "The number 8.",
        category: "numbers",
        level: 1,
        audioWordPath: "audio/eight_word.mp3",
        audioSentencePath: "audio/eight_sentence.mp3",
        audioDefinitionPath: "audio/eight_definition.mp3"
    },
    {
        text: "Nine",
        sentence: "Can you find Nine shoes?",
        definition: "The number 9.",
        category: "numbers",
        level: 1,
        audioWordPath: "audio/nine_word.mp3",
        audioSentencePath: "audio/nine_sentence.mp3",
        audioDefinitionPath: "audio/nine_definition.mp3"
    },
    {
        text: "Ten",
        sentence: "Count all Ten toes!",
        definition: "The number 10.",
        category: "numbers",
        level: 1,
        audioWordPath: "audio/ten_word.mp3",
        audioSentencePath: "audio/ten_sentence.mp3",
        audioDefinitionPath: "audio/ten_definition.mp3"
    },
    {
        text: "Cat",
        sentence: "The Cat likes to sleep.",
        definition: "A small furry pet that says 'meow'.",
        category: "animals",
        level: 1,
        audioWordPath: "audio/cat_word.mp3",
        audioSentencePath: "audio/cat_sentence.mp3",
        audioDefinitionPath: "audio/cat_definition.mp3"
    },
    {
        text: "Dog",
        sentence: "Let's take the Dog for a walk.",
        definition: "A pet that barks and wags its tail.",
        category: "animals",
        level: 1,
        audioWordPath: "audio/dog_word.mp3",
        audioSentencePath: "audio/dog_sentence.mp3",
        audioDefinitionPath: "audio/dog_definition.mp3"
    },
    {
        text: "Bird",
        sentence: "Listen to the pretty Bird sing.",
        definition: "An animal with feathers that flies.",
        category: "animals",
        level: 1,
        audioWordPath: "audio/bird_word.mp3",
        audioSentencePath: "audio/bird_sentence.mp3",
        audioDefinitionPath: "audio/bird_definition.mp3"
    },
    {
        text: "Fish",
        sentence: "The Fish swims in the tank.",
        definition: "An animal that swims in water.",
        category: "animals",
        level: 1,
        audioWordPath: "audio/fish_word.mp3",
        audioSentencePath: "audio/fish_sentence.mp3",
        audioDefinitionPath: "audio/fish_definition.mp3"
    },
    {
        text: "Rabbit",
        sentence: "Look how fast the Rabbit hops!",
        definition: "A small furry animal with long ears that hops.",
        category: "animals",
        level: 1,
        audioWordPath: "audio/rabbit_word.mp3",
        audioSentencePath: "audio/rabbit_sentence.mp3",
        audioDefinitionPath: "audio/rabbit_definition.mp3"
    },
    {
        text: "Horse",
        sentence: "Can I ride the big Horse?",
        definition: "A large animal often ridden.",
        category: "animals",
        level: 1,
        audioWordPath: "audio/horse_word.mp3",
        audioSentencePath: "audio/horse_sentence.mp3",
        audioDefinitionPath: "audio/horse_definition.mp3"
    },
    {
        text: "Cow",
        sentence: "The Cow says 'moo' on the farm.",
        definition: "A farm animal that gives milk and says 'moo'.",
        category: "animals",
        level: 1,
        audioWordPath: "audio/cow_word.mp3",
        audioSentencePath: "audio/cow_sentence.mp3",
        audioDefinitionPath: "audio/cow_definition.mp3"
    },
    {
        text: "Pig",
        sentence: "The little Pig rolled in the mud.",
        definition: "A farm animal that oinks.",
        category: "animals",
        level: 1,
        audioWordPath: "audio/pig_word.mp3",
        audioSentencePath: "audio/pig_sentence.mp3",
        audioDefinitionPath: "audio/pig_definition.mp3"
    },
    {
        text: "Duck",
        sentence: "Feed the Duck at the pond.",
        definition: "A bird that swims and quacks.",
        category: "animals",
        level: 1,
        audioWordPath: "audio/duck_word.mp3",
        audioSentencePath: "audio/duck_sentence.mp3",
        audioDefinitionPath: "audio/duck_definition.mp3"
    },
    {
        text: "Sheep",
        sentence: "The fluffy Sheep eats grass.",
        definition: "A farm animal with wool that says 'baa'.",
        category: "animals",
        level: 1,
        audioWordPath: "audio/sheep_word.mp3",
        audioSentencePath: "audio/sheep_sentence.mp3",
        audioDefinitionPath: "audio/sheep_definition.mp3"
    },
    {
        text: "Apple",
        sentence: "Do you want an Apple for a snack?",
        definition: "A round fruit, often red or green.",
        category: "foods",
        level: 1,
        audioWordPath: "audio/apple_word.mp3",
        audioSentencePath: "audio/apple_sentence.mp3",
        audioDefinitionPath: "audio/apple_definition.mp3"
    },
    {
        text: "Banana",
        sentence: "Peel the Banana before you eat it.",
        definition: "A long yellow fruit.",
        category: "foods",
        level: 1,
        audioWordPath: "audio/banana_word.mp3",
        audioSentencePath: "audio/banana_sentence.mp3",
        audioDefinitionPath: "audio/banana_definition.mp3"
    },
    {
        text: "Orange", // This is for the fruit "Orange"
        sentence: "An Orange is juicy and sweet.",
        definition: "A round orange citrus fruit.",
        category: "foods",
        level: 1,
        audioWordPath: "audio/orange_fruit_word.mp3", // Differentiate from the color "Orange"
        audioSentencePath: "audio/orange_fruit_sentence.mp3",
        audioDefinitionPath: "audio/orange_fruit_definition.mp3"
    },
    {
        text: "Milk",
        sentence: "Drink your Milk to grow strong.",
        definition: "A white drink from cows.",
        category: "foods",
        level: 1,
        audioWordPath: "audio/milk_word.mp3",
        audioSentencePath: "audio/milk_sentence.mp3",
        audioDefinitionPath: "audio/milk_definition.mp3"
    },
    {
        text: "Bread",
        sentence: "Let's make a sandwich with Bread.",
        definition: "Food made from flour, used for sandwiches.",
        category: "foods",
        level: 1,
        audioWordPath: "audio/bread_word.mp3",
        audioSentencePath: "audio/bread_sentence.mp3",
        audioDefinitionPath: "audio/bread_definition.mp3"
    },
    {
        text: "Water",
        sentence: "I'm thirsty, can I have some Water?",
        definition: "Clear liquid we drink.",
        category: "foods",
        level: 1,
        audioWordPath: "audio/water_word.mp3",
        audioSentencePath: "audio/water_sentence.mp3",
        audioDefinitionPath: "audio/water_definition.mp3"
    },
    {
        text: "Juice",
        sentence: "Do you want apple Juice or orange Juice?",
        definition: "Drink made from fruits.",
        category: "foods",
        level: 1,
        audioWordPath: "audio/juice_word.mp3",
        audioSentencePath: "audio/juice_sentence.mp3",
        audioDefinitionPath: "audio/juice_definition.mp3"
    },
    {
        text: "Cookie",
        sentence: "You can have one Cookie after dinner.",
        definition: "A sweet baked treat.",
        category: "foods",
        level: 1,
        audioWordPath: "audio/cookie_word.mp3",
        audioSentencePath: "audio/cookie_sentence.mp3",
        audioDefinitionPath: "audio/cookie_definition.mp3"
    },
    {
        text: "Pizza",
        sentence: "Let's order Pizza tonight!",
        definition: "A round food with toppings like cheese.",
        category: "foods",
        level: 1,
        audioWordPath: "audio/pizza_word.mp3",
        audioSentencePath: "audio/pizza_sentence.mp3",
        audioDefinitionPath: "audio/pizza_definition.mp3"
    },
    {
        text: "Ice cream",
        sentence: "It's hot, let's get Ice cream!",
        definition: "A cold, sweet, frozen dessert.",
        category: "foods",
        level: 1,
        audioWordPath: "audio/ice_cream_word.mp3",
        audioSentencePath: "audio/ice_cream_sentence.mp3",
        audioDefinitionPath: "audio/ice_cream_definition.mp3"
    },
    {
        text: "Mom",
        sentence: "My Mom reads me stories.",
        definition: "Mother, female parent.",
        category: "family",
        level: 1,
        audioWordPath: "audio/mom_word.mp3",
        audioSentencePath: "audio/mom_sentence.mp3",
        audioDefinitionPath: "audio/mom_definition.mp3"
    },
    {
        text: "Dad",
        sentence: "My Dad plays catch with me.",
        definition: "Father, male parent.",
        category: "family",
        level: 1,
        audioWordPath: "audio/dad_word.mp3",
        audioSentencePath: "audio/dad_sentence.mp3",
        audioDefinitionPath: "audio/dad_definition.mp3"
    },
    {
        text: "Brother",
        sentence: "I share my room with my Brother.",
        definition: "A male sibling.",
        category: "family",
        level: 1,
        audioWordPath: "audio/brother_word.mp3",
        audioSentencePath: "audio/brother_sentence.mp3",
        audioDefinitionPath: "audio/brother_definition.mp3"
    },
    {
        text: "Sister",
        sentence: "My Sister likes to draw.",
        definition: "A female sibling.",
        category: "family",
        level: 1,
        audioWordPath: "audio/sister_word.mp3",
        audioSentencePath: "audio/sister_sentence.mp3",
        audioDefinitionPath: "audio/sister_definition.mp3"
    },
    {
        text: "Baby",
        sentence: "The Baby is sleeping.",
        definition: "A very young child.",
        category: "family",
        level: 1,
        audioWordPath: "audio/baby_word.mp3",
        audioSentencePath: "audio/baby_sentence.mp3",
        audioDefinitionPath: "audio/baby_definition.mp3"
    },
    {
        text: "Grandma",
        sentence: "Let's go visit Grandma.",
        definition: "Your mother's or father's mother.",
        category: "family",
        level: 1,
        audioWordPath: "audio/grandma_word.mp3",
        audioSentencePath: "audio/grandma_sentence.mp3",
        audioDefinitionPath: "audio/grandma_definition.mp3"
    },
    {
        text: "Grandpa",
        sentence: "Grandpa tells funny jokes.",
        definition: "Your mother's or father's father.",
        category: "family",
        level: 1,
        audioWordPath: "audio/grandpa_word.mp3",
        audioSentencePath: "audio/grandpa_sentence.mp3",
        audioDefinitionPath: "audio/grandpa_definition.mp3"
    },
    {
        text: "Family",
        sentence: "I love my whole Family.",
        definition: "A group of people related to each other.",
        category: "family",
        level: 1,
        audioWordPath: "audio/family_word.mp3",
        audioSentencePath: "audio/family_sentence.mp3",
        audioDefinitionPath: "audio/family_definition.mp3"
    },
    {
        text: "Head",
        sentence: "Put your hat on your Head.",
        definition: "The top part of your body with your brain.",
        category: "body",
        level: 1,
        audioWordPath: "audio/head_word.mp3",
        audioSentencePath: "audio/head_sentence.mp3",
        audioDefinitionPath: "audio/head_definition.mp3"
    },
    {
        text: "Eyes",
        sentence: "Close your Eyes and make a wish.",
        definition: "The parts of the body you see with.",
        category: "body",
        level: 1,
        audioWordPath: "audio/eyes_word.mp3",
        audioSentencePath: "audio/eyes_sentence.mp3",
        audioDefinitionPath: "audio/eyes_definition.mp3"
    },
    {
        text: "Nose",
        sentence: "Wipe your Nose with a tissue.",
        definition: "The part of the face used for smelling.",
        category: "body",
        level: 1,
        audioWordPath: "audio/nose_word.mp3",
        audioSentencePath: "audio/nose_sentence.mp3",
        audioDefinitionPath: "audio/nose_definition.mp3"
    },
    {
        text: "Mouth",
        sentence: "Open your Mouth to take a bite.",
        definition: "The part of the face used for eating and talking.",
        category: "body",
        level: 1,
        audioWordPath: "audio/mouth_word.mp3",
        audioSentencePath: "audio/mouth_sentence.mp3",
        audioDefinitionPath: "audio/mouth_definition.mp3"
    },
    {
        text: "Ears",
        sentence: "Cover your Ears if it's too loud.",
        definition: "The parts of the body on the sides of your head used for hearing.",
        category: "body",
        level: 1,
        audioWordPath: "audio/ears_word.mp3",
        audioSentencePath: "audio/ears_sentence.mp3",
        audioDefinitionPath: "audio/ears_definition.mp3"
    },
    {
        text: "Hands",
        sentence: "Wash your Hands before eating.",
        definition: "The parts at the end of your arms used for holding.",
        category: "body",
        level: 1,
        audioWordPath: "audio/hands_word.mp3",
        audioSentencePath: "audio/hands_sentence.mp3",
        audioDefinitionPath: "audio/hands_definition.mp3"
    },
    {
        text: "Feet",
        sentence: "Stomp your Feet to the music!",
        definition: "The parts at the end of your legs used for walking.",
        category: "body",
        level: 1,
        audioWordPath: "audio/feet_word.mp3",
        audioSentencePath: "audio/feet_sentence.mp3",
        audioDefinitionPath: "audio/feet_definition.mp3"
    },
    {
        text: "Book",
        sentence: "Let's read this Book together.",
        definition: "Something with pages you read.",
        category: "school",
        level: 1,
        audioWordPath: "audio/book_word.mp3",
        audioSentencePath: "audio/book_sentence.mp3",
        audioDefinitionPath: "audio/book_definition.mp3"
    },
    {
        text: "Pencil",
        sentence: "Can I borrow your Pencil?",
        definition: "A tool used for writing or drawing.",
        category: "school",
        level: 1,
        audioWordPath: "audio/pencil_word.mp3",
        audioSentencePath: "audio/pencil_sentence.mp3",
        audioDefinitionPath: "audio/pencil_definition.mp3"
    },
    {
        text: "Paper",
        sentence: "Draw a picture on this Paper.",
        definition: "Thin sheets used for writing or drawing on.",
        category: "school",
        level: 1,
        audioWordPath: "audio/paper_word.mp3",
        audioSentencePath: "audio/paper_sentence.mp3",
        audioDefinitionPath: "audio/paper_definition.mp3"
    },
    {
        text: "Backpack",
        sentence: "Put your lunch in your Backpack.",
        definition: "A bag carried on the back, often for school.",
        category: "school",
        level: 1,
        audioWordPath: "audio/backpack_word.mp3",
        audioSentencePath: "audio/backpack_sentence.mp3",
        audioDefinitionPath: "audio/backpack_definition.mp3"
    },
    {
        text: "Teacher",
        sentence: "Listen carefully to the Teacher.",
        definition: "Someone who teaches students.",
        category: "school",
        level: 1,
        audioWordPath: "audio/teacher_word.mp3",
        audioSentencePath: "audio/teacher_sentence.mp3",
        audioDefinitionPath: "audio/teacher_definition.mp3"
    },
    {
        text: "Student",
        sentence: "Every Student should try their best.",
        definition: "Someone who learns at school.",
        category: "school",
        level: 1,
        audioWordPath: "audio/student_word.mp3",
        audioSentencePath: "audio/student_sentence.mp3",
        audioDefinitionPath: "audio/student_definition.mp3"
    },
    {
        text: "Ball",
        sentence: "Throw the Ball back to me.",
        definition: "A round toy used for playing games.",
        category: "toys",
        level: 1,
        audioWordPath: "audio/ball_word.mp3",
        audioSentencePath: "audio/ball_sentence.mp3",
        audioDefinitionPath: "audio/ball_definition.mp3"
    },
    {
        text: "Doll",
        sentence: "She likes to play with her Doll.",
        definition: "A toy that looks like a person.",
        category: "toys",
        level: 1,
        audioWordPath: "audio/doll_word.mp3",
        audioSentencePath: "audio/doll_sentence.mp3",
        audioDefinitionPath: "audio/doll_definition.mp3"
    },
    {
        text: "Car",
        sentence: "Vroom! Drive the toy Car.",
        definition: "A toy vehicle with wheels.",
        category: "toys",
        level: 1,
        audioWordPath: "audio/car_word.mp3",
        audioSentencePath: "audio/car_sentence.mp3",
        audioDefinitionPath: "audio/car_definition.mp3"
    },
    {
        text: "Blocks",
        sentence: "Let's build a tower with Blocks.",
        definition: "Square or rectangular toys for building.",
        category: "toys",
        level: 1,
        audioWordPath: "audio/blocks_word.mp3",
        audioSentencePath: "audio/blocks_sentence.mp3",
        audioDefinitionPath: "audio/blocks_definition.mp3"
    },
    {
        text: "Bear",
        sentence: "My teddy Bear is soft.",
        definition: "A furry toy animal.",
        category: "toys",
        level: 1,
        audioWordPath: "audio/bear_word.mp3",
        audioSentencePath: "audio/bear_sentence.mp3",
        audioDefinitionPath: "audio/bear_definition.mp3"
    },
    {
        text: "Play",
        sentence: "Do you want to Play?",
        definition: "To do fun activities.",
        category: "actions",
        level: 1,
        audioWordPath: "audio/play_word.mp3",
        audioSentencePath: "audio/play_sentence.mp3",
        audioDefinitionPath: "audio/play_definition.mp3"
    },
    {
        text: "Eat",
        sentence: "It's time to Eat lunch.",
        definition: "To put food in your mouth.",
        category: "actions",
        level: 1,
        audioWordPath: "audio/eat_word.mp3",
        audioSentencePath: "audio/eat_sentence.mp3",
        audioDefinitionPath: "audio/eat_definition.mp3"
    },
    {
        text: "Drink",
        sentence: "Drink your water.",
        definition: "To swallow liquid.",
        category: "actions",
        level: 1,
        audioWordPath: "audio/drink_word.mp3",
        audioSentencePath: "audio/drink_sentence.mp3",
        audioDefinitionPath: "audio/drink_definition.mp3"
    },
    {
        text: "Sleep",
        sentence: "Go to Sleep now.",
        definition: "To rest with your eyes closed.",
        category: "actions",
        level: 1,
        audioWordPath: "audio/sleep_word.mp3",
        audioSentencePath: "audio/sleep_sentence.mp3",
        audioDefinitionPath: "audio/sleep_definition.mp3"
    },
    {
        text: "Sit",
        sentence: "Sit down on the chair.",
        definition: "To rest your bottom on something.",
        category: "actions",
        level: 1,
        audioWordPath: "audio/sit_word.mp3",
        audioSentencePath: "audio/sit_sentence.mp3",
        audioDefinitionPath: "audio/sit_definition.mp3"
    },
    {
        text: "Stand",
        sentence: "Stand up tall.",
        definition: "To be on your feet.",
        category: "actions",
        level: 1,
        audioWordPath: "audio/stand_word.mp3",
        audioSentencePath: "audio/stand_sentence.mp3",
        audioDefinitionPath: "audio/stand_definition.mp3"
    },
    {
        text: "Walk",
        sentence: "Walk to the door.",
        definition: "To move using your feet.",
        category: "actions",
        level: 1,
        audioWordPath: "audio/walk_word.mp3",
        audioSentencePath: "audio/walk_sentence.mp3",
        audioDefinitionPath: "audio/walk_definition.mp3"
    },
    {
        text: "Run",
        sentence: "Don't Run inside!",
        definition: "To move fast on your feet.",
        category: "actions",
        level: 1,
        audioWordPath: "audio/run_word.mp3",
        audioSentencePath: "audio/run_sentence.mp3",
        audioDefinitionPath: "audio/run_definition.mp3"
    },
    {
        text: "Jump",
        sentence: "Can you Jump up high?",
        definition: "To push off the ground with your feet.",
        category: "actions",
        level: 1,
        audioWordPath: "audio/jump_word.mp3",
        audioSentencePath: "audio/jump_sentence.mp3",
        audioDefinitionPath: "audio/jump_definition.mp3"
    },
    {
        text: "Sing",
        sentence: "Let's Sing a song.",
        definition: "To make music with your voice.",
        category: "actions",
        level: 1,
        audioWordPath: "audio/sing_word.mp3",
        audioSentencePath: "audio/sing_sentence.mp3",
        audioDefinitionPath: "audio/sing_definition.mp3"
    },
    {
        text: "Dance",
        sentence: "Dance to the music.",
        definition: "To move your body to music.",
        category: "actions",
        level: 1,
        audioWordPath: "audio/dance_word.mp3",
        audioSentencePath: "audio/dance_sentence.mp3",
        audioDefinitionPath: "audio/dance_definition.mp3"
    },
    {
        text: "Wash",
        sentence: "Wash your hands with soap.",
        definition: "To clean with water.",
        category: "actions",
        level: 1,
        audioWordPath: "audio/wash_word.mp3",
        audioSentencePath: "audio/wash_sentence.mp3",
        audioDefinitionPath: "audio/wash_definition.mp3"
    },
    {
        text: "Read",
        sentence: "Mommy will Read a book.",
        definition: "To look at and understand words.",
        category: "actions",
        level: 1,
        audioWordPath: "audio/read_word.mp3",
        audioSentencePath: "audio/read_sentence.mp3",
        audioDefinitionPath: "audio/read_definition.mp3"
    },
    {
        text: "Draw",
        sentence: "Draw a picture with crayons.",
        definition: "To make pictures with pencils or crayons.",
        category: "actions",
        level: 1,
        audioWordPath: "audio/draw_word.mp3",
        audioSentencePath: "audio/draw_sentence.mp3",
        audioDefinitionPath: "audio/draw_definition.mp3"
    },
    {
        text: "Help",
        sentence: "Can you Help me?",
        definition: "To make something easier for someone.",
        category: "actions",
        level: 1,
        audioWordPath: "audio/help_word.mp3",
        audioSentencePath: "audio/help_sentence.mp3",
        audioDefinitionPath: "audio/help_definition.mp3"
    },
    {
        text: "Sun",
        sentence: "The Sun is bright today.",
        definition: "The big yellow light in the sky during the day.",
        category: "nature",
        level: 1,
        audioWordPath: "audio/sun_word.mp3",
        audioSentencePath: "audio/sun_sentence.mp3",
        audioDefinitionPath: "audio/sun_definition.mp3"
    },
    {
        text: "Moon",
        sentence: "Look at the Moon at night.",
        definition: "The big white light in the sky at night.",
        category: "nature",
        level: 1,
        audioWordPath: "audio/moon_word.mp3",
        audioSentencePath: "audio/moon_sentence.mp3",
        audioDefinitionPath: "audio/moon_definition.mp3"
    },
    {
        text: "Star",
        sentence: "I see a tiny Star twinkling.",
        definition: "A small bright light in the night sky.",
        category: "nature",
        level: 1,
        audioWordPath: "audio/star_word.mp3",
        audioSentencePath: "audio/star_sentence.mp3",
        audioDefinitionPath: "audio/star_definition.mp3"
    },
    {
        text: "Tree",
        sentence: "A bird is sitting in the Tree.",
        definition: "A tall plant with leaves and branches.",
        category: "nature",
        level: 1,
        audioWordPath: "audio/tree_word.mp3",
        audioSentencePath: "audio/tree_sentence.mp3",
        audioDefinitionPath: "audio/tree_definition.mp3"
    },
    {
        text: "Flower",
        sentence: "Smell the pretty Flower.",
        definition: "A colorful part of a plant.",
        category: "nature",
        level: 1,
        audioWordPath: "audio/flower_word.mp3",
        audioSentencePath: "audio/flower_sentence.mp3",
        audioDefinitionPath: "audio/flower_definition.mp3"
    },
    {
        text: "Rain",
        sentence: "Bring an umbrella in the Rain.",
        definition: "Water falling from the clouds.",
        category: "nature",
        level: 1,
        audioWordPath: "audio/rain_word.mp3",
        audioSentencePath: "audio/rain_sentence.mp3",
        audioDefinitionPath: "audio/rain_definition.mp3"
    },
    {
        text: "Snow",
        sentence: "Let's play in the Snow!",
        definition: "Soft white frozen water that falls from the sky.",
        category: "nature",
        level: 1,
        audioWordPath: "audio/snow_word.mp3",
        audioSentencePath: "audio/snow_sentence.mp3",
        audioDefinitionPath: "audio/snow_definition.mp3"
    },
    {
        text: "House",
        sentence: "We live in a blue House.",
        definition: "A building where people live.",
        category: "places",
        level: 1,
        audioWordPath: "audio/house_word.mp3",
        audioSentencePath: "audio/house_sentence.mp3",
        audioDefinitionPath: "audio/house_definition.mp3"
    },
    {
        text: "Park",
        sentence: "Let's go play at the Park.",
        definition: "An outdoor place with grass and trees for playing.",
        category: "places",
        level: 1,
        audioWordPath: "audio/park_word.mp3",
        audioSentencePath: "audio/park_sentence.mp3",
        audioDefinitionPath: "audio/park_definition.mp3"
    },
    {
        text: "School",
        sentence: "Time to go to School.",
        definition: "A place where children learn.",
        category: "places",
        level: 1,
        audioWordPath: "audio/school_word.mp3",
        audioSentencePath: "audio/school_sentence.mp3",
        audioDefinitionPath: "audio/school_definition.mp3"
    },
    {
        text: "Store",
        sentence: "We buy food at the Store.",
        definition: "A place where you buy things.",
        category: "places",
        level: 1,
        audioWordPath: "audio/store_word.mp3",
        audioSentencePath: "audio/store_sentence.mp3",
        audioDefinitionPath: "audio/store_definition.mp3"
    },
    {
        text: "Bed",
        sentence: "Jump into Bed, it's sleepy time.",
        definition: "Furniture you sleep on.",
        category: "home",
        level: 1,
        audioWordPath: "audio/bed_word.mp3",
        audioSentencePath: "audio/bed_sentence.mp3",
        audioDefinitionPath: "audio/bed_definition.mp3"
    },
    {
        text: "Chair",
        sentence: "Sit on the little Chair.",
        definition: "Furniture you sit on.",
        category: "home",
        level: 1,
        audioWordPath: "audio/chair_word.mp3",
        audioSentencePath: "audio/chair_sentence.mp3",
        audioDefinitionPath: "audio/chair_definition.mp3"
    },
    {
        text: "Table",
        sentence: "Put your cup on the Table.",
        definition: "Furniture with a flat top used for eating or working.",
        category: "home",
        level: 1,
        audioWordPath: "audio/table_word.mp3",
        audioSentencePath: "audio/table_sentence.mp3",
        audioDefinitionPath: "audio/table_definition.mp3"
    },
    {
        text: "Door",
        sentence: "Please close the Door.",
        definition: "You walk through this to enter or leave a room.",
        category: "home",
        level: 1,
        audioWordPath: "audio/door_word.mp3",
        audioSentencePath: "audio/door_sentence.mp3",
        audioDefinitionPath: "audio/door_definition.mp3"
    },
    {
        text: "Window",
        sentence: "Look out the Window.",
        definition: "Glass in a wall you can see through.",
        category: "home",
        level: 1,
        audioWordPath: "audio/window_word.mp3",
        audioSentencePath: "audio/window_sentence.mp3",
        audioDefinitionPath: "audio/window_definition.mp3"
    },
    {
        text: "Shirt",
        sentence: "Put on your clean Shirt.",
        definition: "Clothes for your top body.",
        category: "clothes",
        level: 1,
        audioWordPath: "audio/shirt_word.mp3",
        audioSentencePath: "audio/shirt_sentence.mp3",
        audioDefinitionPath: "audio/shirt_definition.mp3"
    },
    {
        text: "Pants",
        sentence: "These Pants have pockets.",
        definition: "Clothes for your legs.",
        category: "clothes",
        level: 1,
        audioWordPath: "audio/pants_word.mp3",
        audioSentencePath: "audio/pants_sentence.mp3",
        audioDefinitionPath: "audio/pants_definition.mp3"
    },
    {
        text: "Socks",
        sentence: "Wear Socks with your shoes.",
        definition: "Clothes for your feet.",
        category: "clothes",
        level: 1,
        audioWordPath: "audio/socks_word.mp3",
        audioSentencePath: "audio/socks_sentence.mp3",
        audioDefinitionPath: "audio/socks_definition.mp3"
    },
    {
        text: "Shoes",
        sentence: "Tie your Shoes.",
        definition: "Coverings for your feet to wear outside.",
        category: "clothes",
        level: 1,
        audioWordPath: "audio/shoes_word.mp3",
        audioSentencePath: "audio/shoes_sentence.mp3",
        audioDefinitionPath: "audio/shoes_definition.mp3"
    },
    {
        text: "Hat",
        sentence: "Wear a Hat to keep the sun off.",
        definition: "Clothes for your head.",
        category: "clothes",
        level: 1,
        audioWordPath: "audio/hat_word.mp3",
        audioSentencePath: "audio/hat_sentence.mp3",
        audioDefinitionPath: "audio/hat_definition.mp3"
    },
    {
        text: "Happy",
        sentence: "I feel Happy when I play.",
        definition: "Feeling good or pleased.",
        category: "feelings",
        level: 1,
        audioWordPath: "audio/happy_word.mp3",
        audioSentencePath: "audio/happy_sentence.mp3",
        audioDefinitionPath: "audio/happy_definition.mp3"
    },
    {
        text: "Sad",
        sentence: "He looks Sad because his toy broke.",
        definition: "Feeling unhappy.",
        category: "feelings",
        level: 1,
        audioWordPath: "audio/sad_word.mp3",
        audioSentencePath: "audio/sad_sentence.mp3",
        audioDefinitionPath: "audio/sad_definition.mp3"
    },
    {
        text: "Mad",
        sentence: "Don't get Mad, share the toy.",
        definition: "Feeling angry.",
        category: "feelings",
        level: 1,
        audioWordPath: "audio/mad_word.mp3",
        audioSentencePath: "audio/mad_sentence.mp3",
        audioDefinitionPath: "audio/mad_definition.mp3"
    },
    {
        text: "Tired",
        sentence: "Yawn! I feel Tired.",
        definition: "Feeling like you need sleep.",
        category: "feelings",
        level: 1,
        audioWordPath: "audio/tired_word.mp3",
        audioSentencePath: "audio/tired_sentence.mp3",
        audioDefinitionPath: "audio/tired_definition.mp3"
    },
    {
        text: "Big",
        sentence: "That's a Big truck!",
        definition: "Large size.",
        category: "describing",
        level: 1,
        audioWordPath: "audio/big_word.mp3",
        audioSentencePath: "audio/big_sentence.mp3",
        audioDefinitionPath: "audio/big_definition.mp3"
    },
    {
        text: "Little",
        sentence: "Look at the Little puppy.",
        definition: "Small size.",
        category: "describing",
        level: 1,
        audioWordPath: "audio/little_word.mp3",
        audioSentencePath: "audio/little_sentence.mp3",
        audioDefinitionPath: "audio/little_definition.mp3"
    },
    {
        text: "Hot",
        sentence: "The soup is Hot.",
        definition: "High temperature.",
        category: "describing",
        level: 1,
        audioWordPath: "audio/hot_word.mp3",
        audioSentencePath: "audio/hot_sentence.mp3",
        audioDefinitionPath: "audio/hot_definition.mp3"
    },
    {
        text: "Cold",
        sentence: "The ice cream is Cold.",
        definition: "Low temperature.",
        category: "describing",
        level: 1,
        audioWordPath: "audio/cold_word.mp3",
        audioSentencePath: "audio/cold_sentence.mp3",
        audioDefinitionPath: "audio/cold_definition.mp3"
    },
    {
        text: "Fast",
        sentence: "The car goes Fast.",
        definition: "Moving quickly.",
        category: "describing",
        level: 1,
        audioWordPath: "audio/fast_word.mp3",
        audioSentencePath: "audio/fast_sentence.mp3",
        audioDefinitionPath: "audio/fast_definition.mp3"
    },

    // --- Level 2 ---
    { text: "Jump", sentence: "Can you Jump over the puddle?", definition: "To push off the ground with your feet.", category: "actions", level: 2 },
    { text: "Run", sentence: "Let's Run to the playground!", definition: "To move quickly on your feet.", category: "actions", level: 2 },
    { text: "Walk", sentence: "Walk slowly, don't run in the house.", definition: "To move at a regular pace on your feet.", category: "actions", level: 2 },
    { text: "Sit", sentence: "Please Sit down for story time.", definition: "To rest your body on a chair or floor.", category: "actions", level: 2 },
    { text: "Stand", sentence: "Stand up nice and tall.", definition: "To rise to an upright position on your feet.", category: "actions", level: 2 },
    { text: "Sleep", sentence: "It's time to go to Sleep.", definition: "To rest your body and mind, usually at night.", category: "actions", level: 2 },
    { text: "Eat", sentence: "Are you ready to Eat lunch?", definition: "To put food in your mouth and swallow it.", category: "actions", level: 2 },
    { text: "Drink", sentence: "Drink your water, please.", definition: "To swallow a liquid.", category: "actions", level: 2 },
    { text: "Play", sentence: "Do you want to Play with the blocks?", definition: "To do activities for fun.", category: "actions", level: 2 },
    { text: "Read", sentence: "Let's Read this picture book.", definition: "To look at and understand words.", category: "actions", level: 2 },
    { text: "Write", sentence: "Can you Write your name here?", definition: "To make letters or words on paper.", category: "actions", level: 2 },
    { text: "Draw", sentence: "Let's Draw a picture for Grandma.", definition: "To make pictures with pencils or crayons.", category: "actions", level: 2 },
    { text: "Sunny", sentence: "It's a warm and Sunny day outside.", definition: "Weather with lots of sun.", category: "weather", level: 2 },
    { text: "Rainy", sentence: "Bring your umbrella, it looks Rainy.", definition: "Weather with rain falling.", category: "weather", level: 2 },
    { text: "Cloudy", sentence: "It might rain later, it's very Cloudy.", definition: "Weather with many clouds in the sky.", category: "weather", level: 2 },
    { text: "Snowy", sentence: "Wear your boots, it's Snowy today!", definition: "Weather with snow falling.", category: "weather", level: 2 },
    { text: "Windy", sentence: "Hold onto your hat, it's quite Windy!", definition: "Weather with strong wind blowing.", category: "weather", level: 2 },
    { text: "Hot", sentence: "It's too Hot to play outside right now.", definition: "Weather that feels very warm.", category: "weather", level: 2 },
    { text: "Cold", sentence: "Put on a coat, it's Cold this morning.", definition: "Weather that feels very chilly.", category: "weather", level: 2 },
    { text: "Shirt", sentence: "I like your blue Shirt.", definition: "A piece of clothing for the top part of the body.", category: "clothes", level: 2 },
    { text: "Pants", sentence: "Don't forget to put on your Pants.", definition: "Clothing worn on the legs.", category: "clothes", level: 2 },
    { text: "Socks", sentence: "Where are your clean Socks?", definition: "Clothing worn on the feet, inside shoes.", category: "clothes", level: 2 },
    { text: "Shoes", sentence: "Tie your Shoes before we go.", definition: "Coverings worn on the feet.", category: "clothes", level: 2 },
    { text: "Hat", sentence: "Wear your sun Hat outside.", definition: "Clothing worn on the head.", category: "clothes", level: 2 },
    { text: "Jacket", sentence: "Zip up your Jacket, it's chilly.", definition: "A piece of clothing worn over other clothes for warmth.", category: "clothes", level: 2 },
    { text: "Sweater", sentence: "My cozy Sweater keeps me warm.", definition: "A warm knitted piece of clothing for the upper body.", category: "clothes", level: 2 },
    { text: "Happy", sentence: "I feel Happy when I play with my friends.", definition: "Feeling pleased or glad.", category: "feelings", level: 2 },
    { text: "Sad", sentence: "He was Sad because his toy broke.", definition: "Feeling unhappy.", category: "feelings", level: 2 },
    { text: "Angry", sentence: "She got Angry when her brother took her crayon.", definition: "Feeling very annoyed.", category: "feelings", level: 2 },
    { text: "Tired", sentence: "After running, I felt Tired.", definition: "Feeling like you need to rest or sleep.", category: "feelings", level: 2 },
    { text: "Scared", sentence: "The loud thunder made the dog feel Scared.", definition: "Feeling afraid or frightened.", category: "feelings", level: 2 },
    { text: "Dog", sentence: "The Dog likes to chase the ball.", definition: "A common pet animal that barks.", category: "animals", level: 2 },
    { text: "Cat", sentence: "My Cat likes to sleep in the sun.", definition: "A small furry pet animal that meows.", category: "animals", level: 2 },
    { text: "Bird", sentence: "Look at the Bird flying in the sky!", definition: "An animal with feathers and wings that can fly.", category: "animals", level: 2 },
    { text: "Fish", sentence: "The Fish swims in the water.", definition: "An animal that lives and breathes in water.", category: "animals", level: 2 },
    { text: "Bear", sentence: "A big brown Bear lives in the forest.", definition: "A large, heavy animal with thick fur.", category: "animals", level: 2 },
    { text: "Apple", sentence: "I ate a red Apple for a snack.", definition: "A round fruit with red or green skin.", category: "food", level: 2 },
    { text: "Banana", sentence: "Monkeys like to eat Bananas.", definition: "A long yellow fruit.", category: "food", level: 2 },
    { text: "Milk", sentence: "Drink your Milk to grow strong.", definition: "A white liquid produced by cows, good for drinking.", category: "food", level: 2 },
    { text: "Bread", sentence: "We made sandwiches with Bread.", definition: "A basic food made from flour and water, baked.", category: "food", level: 2 },
    { text: "Cheese", sentence: "I like Cheese on my pizza.", definition: "A food made from pressed milk curds.", category: "food", level: 2 },
    { text: "Head", sentence: "Pat your Head gently.", definition: "The top part of your body with your face and brain.", category: "body parts", level: 2 },
    { text: "Hand", sentence: "Wave your Hand to say hello.", definition: "The part of your body at the end of your arm, used for holding.", category: "body parts", level: 2 },
    { text: "Foot", sentence: "Put your sock on your Foot.", definition: "The part of your body at the end of your leg, used for walking.", category: "body parts", level: 2 },
    { text: "Eye", sentence: "Close one Eye and wink!", definition: "The part of your body you use to see.", category: "body parts", level: 2 },
    { text: "Nose", sentence: "You smell flowers with your Nose.", definition: "The part of your face used for smelling and breathing.", category: "body parts", level: 2 },
    { text: "Mouth", sentence: "Open your Mouth to eat.", definition: "The part of your face used for eating and talking.", category: "body parts", level: 2 },
    { text: "Ear", sentence: "You listen to music with your Ears.", definition: "The part of your body you use to hear.", category: "body parts", level: 2 },
    { text: "Mom", sentence: "My Mom reads me stories.", definition: "A female parent; mother.", category: "family", level: 2 },
    { text: "Dad", sentence: "My Dad helps me build things.", definition: "A male parent; father.", category: "family", level: 2 },
    { text: "Baby", sentence: "The Baby is sleeping in the crib.", definition: "A very young child.", category: "family", level: 2 },
    { text: "Brother", sentence: "My big Brother plays games with me.", definition: "A boy who has the same parents as you.", category: "family", level: 2 },
    { text: "Sister", sentence: "My little Sister likes dolls.", definition: "A girl who has the same parents as you.", category: "family", level: 2 },
    { text: "Ball", sentence: "Let's kick the Ball in the park.", definition: "A round object used in games.", category: "objects", level: 2 },
    { text: "Car", sentence: "We drive to the store in the Car.", definition: "A vehicle with wheels used for travel on roads.", category: "objects", level: 2 },
    { text: "Book", sentence: "This Book has colorful pictures.", definition: "A set of pages with words and pictures.", category: "objects", level: 2 },
    { text: "Chair", sentence: "Sit on the Chair at the table.", definition: "A seat for one person, with a back and legs.", category: "objects", level: 2 },
    { text: "Table", sentence: "Put your plate on the Table.", definition: "A piece of furniture with a flat top and legs.", category: "objects", level: 2 },
    { text: "Bed", sentence: "It's time to go to Bed.", definition: "A piece of furniture used for sleeping.", category: "objects", level: 2 },
    { text: "Toy", sentence: "Share your Toy with your friend.", definition: "An object for a child to play with.", category: "objects", level: 2 },
    { text: "Door", sentence: "Please close the Door.", definition: "A way to enter or exit a room or building.", category: "objects", level: 2 },
    { text: "Tree", sentence: "Birds build nests in the Tree.", definition: "A tall plant with a trunk and branches.", category: "nature", level: 2 },
    { text: "Flower", sentence: "Smell the pretty Flower.", definition: "The colorful part of a plant that makes seeds.", category: "nature", level: 2 },
    { text: "Sun", sentence: "The Sun is bright today.", definition: "The star that gives us light and heat during the day.", category: "nature", level: 2 },
    { text: "Moon", sentence: "Look at the full Moon tonight.", definition: "The big object we see in the sky at night.", category: "nature", level: 2 },
    { text: "Star", sentence: "Make a wish upon a Star.", definition: "A bright point of light we see in the sky at night.", category: "nature", level: 2 },
    { text: "Red", sentence: "The fire truck is Red.", definition: "The color of apples and strawberries.", category: "colors", level: 2 },
    { text: "Blue", sentence: "The sky is Blue.", definition: "The color of the ocean.", category: "colors", level: 2 },
    { text: "Green", sentence: "Grass is usually Green.", definition: "The color of leaves and broccoli.", category: "colors", level: 2 },
    { text: "Yellow", sentence: "The sun looks Yellow.", definition: "The color of lemons and bananas.", category: "colors", level: 2 },
    { text: "Sing", sentence: "Let's Sing a happy song together.", definition: "To make musical sounds with your voice.", category: "actions", level: 2 },
    { text: "Dance", sentence: "Dance to the music!", definition: "To move your body rhythmically to music.", category: "actions", level: 2 },
    { text: "Wash", sentence: "Wash your hands before eating.", definition: "To clean something with water and soap.", category: "actions", level: 2 },
    { text: "Help", sentence: "Can you Help me carry this?", definition: "To make it easier for someone to do something.", category: "actions", level: 2 },
    { text: "Give", sentence: "Please Give the book back to me.", definition: "To hand something over to someone.", category: "actions", level: 2 },
    { text: "Clap", sentence: "Clap your hands after the song.", definition: "To strike palms together to make noise.", category: "actions", level: 2 },
    { text: "Kick", sentence: "Kick the ball into the goal.", definition: "To strike something with your foot.", category: "actions", level: 2 },
    { text: "Throw", sentence: "Throw the frisbee to the dog.", definition: "To send something through the air.", category: "actions", level: 2 },
    { text: "Catch", sentence: "Try to Catch the ball.", definition: "To grab something moving through the air.", category: "actions", level: 2 },
    { text: "Push", sentence: "Push the door open.", definition: "To move something away using force.", category: "actions", level: 2 },
    { text: "Pull", sentence: "Pull the wagon behind you.", definition: "To move something towards you using force.", category: "actions", level: 2 },
    { text: "Open", sentence: "Open the box to see inside.", definition: "To move something so it is no longer closed.", category: "actions", level: 2 },
    { text: "Close", sentence: "Close the book when you are done.", definition: "To move something so it is no longer open.", category: "actions", level: 2 },
    { text: "Share", sentence: "Share your toys with your sister.", definition: "To let someone else use something you have.", category: "actions", level: 2 },
    { text: "Listen", sentence: "Listen to the teacher read.", definition: "To pay attention to sound.", category: "actions", level: 2 },
    { text: "Talk", sentence: "Talk quietly in the library.", definition: "To say words; speak.", category: "actions", level: 2 },
    { text: "Look", sentence: "Look at the airplane in the sky.", definition: "To direct your eyes towards something.", category: "actions", level: 2 },
    { text: "Warm", sentence: "The blanket feels Warm and cozy.", definition: "Having a comfortable, slightly hot temperature.", category: "weather/describing", level: 2 },
    { text: "Cool", sentence: "The water feels Cool on a hot day.", definition: "Having a comfortable, slightly cold temperature.", category: "weather/describing", level: 2 },
    { text: "Stormy", sentence: "It looks Stormy, with dark clouds.", definition: "Weather with strong wind, rain, thunder, or lightning.", category: "weather", level: 2 },
    { text: "Dress", sentence: "She wore a pretty Dress to the party.", definition: "A one-piece clothing item for girls/women.", category: "clothes", level: 2 },
    { text: "Skirt", sentence: "This Skirt matches my shirt.", definition: "Clothing worn from the waist down, not covering legs separately.", category: "clothes", level: 2 },
    { text: "Coat", sentence: "Wear your Coat, it's cold outside.", definition: "Outer clothing worn for warmth.", category: "clothes", level: 2 }, // Similar to Jacket, good for variation
    { text: "Boots", sentence: "Put on your rain Boots.", definition: "Sturdy footwear covering the foot and ankle, sometimes the lower leg.", category: "clothes", level: 2 },
    { text: "Gloves", sentence: "Wear Gloves to keep your hands warm.", definition: "Coverings for the hands, with separate fingers.", category: "clothes", level: 2 },
    { text: "Excited", sentence: "I am Excited about my birthday!", definition: "Feeling very happy and enthusiastic.", category: "feelings", level: 2 },
    { text: "Surprised", sentence: "He looked Surprised by the gift.", definition: "Feeling mild astonishment or shock.", category: "feelings", level: 2 },
    { text: "Shy", sentence: "She felt Shy meeting new people.", definition: "Feeling nervous or timid in the company of others.", category: "feelings", level: 2 },
    { text: "Silly", sentence: "Making Silly faces is fun.", definition: "Being playful and foolish.", category: "feelings", level: 2 },
    { text: "Brave", sentence: "You were Brave at the doctor's office.", definition: "Showing courage; not afraid.", category: "feelings", level: 2 },
    { text: "Monkey", sentence: "The Monkey swings from the tree.", definition: "An animal that lives in trees and likes bananas.", category: "animals", level: 2 },
    { text: "Lion", sentence: "The Lion has a loud roar.", definition: "A large wild cat known as the 'king of the jungle'.", category: "animals", level: 2 },
    { text: "Tiger", sentence: "A Tiger has stripes.", definition: "A large striped wild cat.", category: "animals", level: 2 },
    { text: "Elephant", sentence: "An Elephant has a long trunk.", definition: "A very large grey animal with big ears and a trunk.", category: "animals", level: 2 },
    { text: "Giraffe", sentence: "The Giraffe has a very long neck.", definition: "A tall African animal with spots and a long neck.", category: "animals", level: 2 },
    { text: "Grapes", sentence: "These green Grapes are sweet.", definition: "Small round fruits that grow in bunches.", category: "food", level: 2 },
    { text: "Carrot", sentence: "Rabbits like to eat Carrots.", definition: "An orange root vegetable.", category: "food", level: 2 },
    { text: "Peas", sentence: "Eat your green Peas.", definition: "Small, round green vegetables.", category: "food", level: 2 },
    { text: "Chicken", sentence: "We are having Chicken for dinner.", definition: "Meat from a bird often raised on farms.", category: "food", level: 2 },
    { text: "Rice", sentence: "Do you want Rice with your chicken?", definition: "Small grains often eaten as food.", category: "food", level: 2 },
    { text: "Arm", sentence: "Raise your Arm if you know the answer.", definition: "The part of your body between your shoulder and hand.", category: "body parts", level: 2 },
    { text: "Leg", sentence: "He hurt his Leg playing soccer.", definition: "The part of your body used for walking and standing.", category: "body parts", level: 2 },
    { text: "Finger", sentence: "Point with your Finger.", definition: "One of the five parts at the end of your hand.", category: "body parts", level: 2 },
    { text: "Toe", sentence: "Wiggle your Toes in the sand.", definition: "One of the five parts at the end of your foot.", category: "body parts", level: 2 },
    { text: "Tummy", sentence: "My Tummy feels full after eating.", definition: "Your stomach area (informal).", category: "body parts", level: 2 },
    { text: "Friend", sentence: "Play nicely with your Friend.", definition: "Someone you like and enjoy being with.", category: "people", level: 2 },
    { text: "Teacher", sentence: "Listen to the Teacher.", definition: "A person who helps students learn.", category: "people", level: 2 },
    { text: "Doctor", sentence: "The Doctor will help you feel better.", definition: "A person who helps sick people.", category: "people", level: 2 },
    { text: "Police Officer", sentence: "A Police Officer helps keep us safe.", definition: "A person who enforces laws.", category: "people", level: 2 },
    { text: "Firefighter", sentence: "A Firefighter puts out fires.", definition: "A person who fights fires.", category: "people", level: 2 },
    { text: "Bus", sentence: "We ride the yellow Bus to school.", definition: "A large vehicle that carries many people.", category: "objects/transportation", level: 2 },
    { text: "Train", sentence: "The Train goes 'choo-choo'.", definition: "A long vehicle that runs on tracks.", category: "objects/transportation", level: 2 },
    { text: "Boat", sentence: "Let's ride in a Boat on the lake.", definition: "Something that travels on water.", category: "objects/transportation", level: 2 },
    { text: "Plane", sentence: "Look at the Plane flying high.", definition: "Something that flies in the sky.", category: "objects/transportation", level: 2 },
    { text: "Bike", sentence: "Ride your Bike carefully.", definition: "A vehicle with two wheels you pedal.", category: "objects/transportation", level: 2 },
        // --- Level 3 ---
    { text: "Butterfly", sentence: "Look at the pretty Butterfly", definition: "An insect with colorful wings.", category: "animals", level: 3 },
    { text: "Elephant", sentence: "An Elephant has a long trunk", definition: "A very large gray animal with a trunk.", category: "animals", level: 3 },
    { text: "Dinosaur", sentence: "Roar like a Dinosaur", definition: "An ancient reptile, often very large.", category: "animals", level: 3 },
    { text: "Giraffe", sentence: "A Giraffe has a long neck", definition: "A tall African animal with a very long neck.", category: "animals", level: 3 },
    { text: "Strawberry", sentence: "Eat a sweet Strawberry", definition: "A small red fruit with seeds on the outside.", category: "foods", level: 3 },
    { text: "Watermelon", sentence: "Watermelon is refreshing", definition: "A large green fruit, red inside with seeds.", category: "foods", level: 3 },
    { text: "Computer", sentence: "Turn on the Computer", definition: "An electronic machine for information and games.", category: "technology", level: 3 },
    { text: "Playground", sentence: "Let's go to the Playground", definition: "An outdoor area with swings and slides for play.", category: "places", level: 3 },
    { text: "Hospital", sentence: "The nurse is at the Hospital", definition: "A place where sick people get treatment.", category: "places", level: 3 },
    { text: "Restaurant", sentence: "We ate at a nice Restaurant", definition: "A place where people pay to eat meals.", category: "places", level: 3 },
    { text: "Monkey", sentence: "The Monkey swings in the tree.", definition: "An animal that climbs trees and eats bananas.", category: "animals", level: 3 },
    { text: "Kangaroo", sentence: "A Kangaroo has a pouch.", definition: "An Australian animal that hops and has a pouch.", category: "animals", level: 3 },
    { text: "Penguin", sentence: "The Penguin waddles on the ice.", definition: "A bird that lives in cold places and swims.", category: "animals", level: 3 },
    { text: "Alligator", sentence: "An Alligator swims in the swamp.", definition: "A large reptile with a long snout and many teeth.", category: "animals", level: 3 },
    { text: "Crocodile", sentence: "Be careful near a Crocodile.", definition: "A large reptile similar to an alligator.", category: "animals", level: 3 },
    { text: "Peacock", sentence: "A Peacock has colorful feathers.", definition: "A bird with a large, colorful tail.", category: "animals", level: 3 },
    { text: "Flamingo", sentence: "The pink Flamingo stands on one leg.", definition: "A pink bird that often stands on one leg.", category: "animals", level: 3 },
    { text: "Zebra", sentence: "A Zebra has black and white stripes.", definition: "An African animal like a horse with stripes.", category: "animals", level: 3 },
    { text: "Turtle", sentence: "The slow Turtle hides in its shell.", definition: "A slow-moving reptile with a hard shell.", category: "animals", level: 3 },
    { text: "Octopus", sentence: "An Octopus has eight arms.", definition: "A sea animal with eight arms.", category: "animals", level: 3 },
    { text: "Spaghetti", sentence: "I like eating Spaghetti with sauce.", definition: "Long, thin pasta often served with sauce.", category: "foods", level: 3 },
    { text: "Broccoli", sentence: "Broccoli looks like little trees.", definition: "A green vegetable that looks like small trees.", category: "foods", level: 3 },
    { text: "Pineapple", sentence: "Pineapple tastes sweet and tangy.", definition: "A tropical fruit with a rough outside and sweet inside.", category: "foods", level: 3 },
    { text: "Cucumber", sentence: "Put Cucumber slices in the salad.", definition: "A long green vegetable often eaten in salads.", category: "foods", level: 3 },
    { text: "Sandwich", sentence: "Make me a peanut butter Sandwich.", definition: "Food made with fillings between slices of bread.", category: "foods", level: 3 },
    { text: "Pancakes", sentence: "We eat Pancakes for breakfast.", definition: "Flat cakes cooked on a griddle, often for breakfast.", category: "foods", level: 3 },
    { text: "Cereal", sentence: "Pour milk on your Cereal.", definition: "Grain food often eaten with milk for breakfast.", category: "foods", level: 3 },
    { text: "Chocolate", sentence: "Chocolate cake is my favorite.", definition: "A sweet brown food made from cacao beans.", category: "foods", level: 3 },
    { text: "Hamburger", sentence: "Let's grill a Hamburger.", definition: "A cooked patty of ground meat, often in a bun.", category: "foods", level: 3 },
    { text: "Vegetable", sentence: "Eat every Vegetable on your plate.", definition: "A plant or part of a plant used as food.", category: "foods", level: 3 },
    { text: "Library", sentence: "Borrow books from the Library.", definition: "A place where you can borrow books.", category: "places", level: 3 },
    { text: "Supermarket", sentence: "We buy groceries at the Supermarket.", definition: "A large store selling food and household items.", category: "places", level: 3 },
    { text: "Bakery", sentence: "The Bakery smells like fresh bread.", definition: "A place where bread and cakes are baked and sold.", category: "places", level: 3 },
    { text: "Museum", sentence: "We saw dinosaurs at the Museum.", definition: "A building where old or interesting objects are shown.", category: "places", level: 3 },
    { text: "Airport", sentence: "Planes take off from the Airport.", definition: "A place where airplanes take off and land.", category: "places", level: 3 },
    { text: "Station", sentence: "Wait for the train at the Station.", definition: "A place where trains or buses stop.", category: "places", level: 3 },
    { text: "Aquarium", sentence: "See fish at the Aquarium.", definition: "A place to see fish and other water animals.", category: "places", level: 3 },
    { text: "Movie Theater", sentence: "Let's watch a Movie Theater show.", definition: "A place where people watch movies.", category: "places", level: 3 },
    { text: "Swimming Pool", sentence: "Go swimming at the Swimming Pool.", definition: "A place with a pool for swimming.", category: "places", level: 3 },
    { text: "Gas Station", sentence: "Dad gets gas at the Gas Station.", definition: "A place to buy fuel for cars.", category: "places", level: 3 },
    { text: "Television", sentence: "Watch cartoons on Television.", definition: "A screen device for watching shows.", category: "household", level: 3 },
    { text: "Refrigerator", sentence: "Milk is in the Refrigerator.", definition: "A large kitchen appliance for keeping food cold.", category: "household", level: 3 },
    { text: "Telephone", sentence: "Answer the Telephone when it rings.", definition: "A device used for talking to people far away.", category: "household", level: 3 },
    { text: "Microwave", sentence: "Heat food in the Microwave.", definition: "An oven that cooks food quickly using special waves.", category: "household", level: 3 },
    { text: "Furniture", sentence: "The sofa is my favorite Furniture.", definition: "Items like chairs, tables, and beds.", category: "household", level: 3 },
    { text: "Curtains", sentence: "Close the Curtains at night.", definition: "Pieces of cloth hung to cover windows.", category: "household", level: 3 },
    { text: "Blanket", sentence: "Snuggle under a warm Blanket.", definition: "A warm covering used on a bed.", category: "household", level: 3 },
    { text: "Pillow", sentence: "Rest your head on the Pillow.", definition: "A soft cushion for resting your head.", category: "household", level: 3 },
    { text: "Toothbrush", sentence: "Use your Toothbrush every day.", definition: "A brush used for cleaning teeth.", category: "household", level: 3 },
    { text: "Umbrella", sentence: "Take an Umbrella when it rains.", definition: "A device used for protection from rain.", category: "household", level: 3 },
    { text: "Mountain", sentence: "Climb the tall Mountain.", definition: "A very large natural hill.", category: "nature", level: 3 },
    { text: "Forest", sentence: "Many trees grow in the Forest.", definition: "A large area covered with trees.", category: "nature", level: 3 },
    { text: "Ocean", sentence: "Ships sail on the Ocean.", definition: "A very large body of salt water.", category: "nature", level: 3 },
    { text: "River", sentence: "Fish swim in the River.", definition: "A large natural stream of water.", category: "nature", level: 3 },
    { text: "Rainbow", sentence: "See the colorful Rainbow after rain.", definition: "An arc of colors in the sky after rain.", category: "nature", level: 3 },
    { text: "Flower", sentence: "Smell the pretty Flower.", definition: "The colorful part of a plant.", category: "nature", level: 3 },
    { text: "Sunshine", sentence: "Feel the warm Sunshine.", definition: "The light from the sun.", category: "nature", level: 3 },
    { text: "Moonlight", sentence: "Walk in the soft Moonlight.", definition: "The light from the moon.", category: "nature", level: 3 },
    { text: "Thunderstorm", sentence: "A Thunderstorm has lightning.", definition: "A storm with thunder and lightning.", category: "nature", level: 3 },
    { text: "Volcano", sentence: "Lava comes from a Volcano.", definition: "A mountain that can erupt with lava.", category: "nature", level: 3 },
    { text: "Bicycle", sentence: "Ride your Bicycle carefully.", definition: "A two-wheeled vehicle you pedal.", category: "toys", level: 3 },
    { text: "Tricycle", sentence: "A Tricycle has three wheels.", definition: "A three-wheeled vehicle you pedal.", category: "toys", level: 3 },
    { text: "Puzzle", sentence: "Put the Puzzle pieces together.", definition: "A game where you fit pieces together.", category: "toys", level: 3 },
    { text: "Building Blocks", sentence: "Build a tower with Building Blocks.", definition: "Blocks used for construction play.", category: "toys", level: 3 },
    { text: "Crayons", sentence: "Color pictures with Crayons.", definition: "Sticks of colored wax for drawing.", category: "toys", level: 3 },
    { text: "Play-Doh", sentence: "Make shapes with Play-Doh.", definition: "Soft modeling clay for play.", category: "toys", level: 3 },
    { text: "Action Figure", sentence: "My favorite Action Figure is Batman.", definition: "A toy figure, often a superhero.", category: "toys", level: 3 },
    { text: "Dollhouse", sentence: "Play with dolls in the Dollhouse.", definition: "A miniature house for dolls.", category: "toys", level: 3 },
    { text: "Stuffed Animal", sentence: "Hug your soft Stuffed Animal.", definition: "A soft toy animal filled with stuffing.", category: "toys", level: 3 },
    { text: "Video Game", sentence: "He likes playing a Video Game.", definition: "An electronic game played on a screen.", category: "toys", level: 3 },
    { text: "Pajamas", sentence: "Wear your Pajamas to bed.", definition: "Clothes worn for sleeping.", category: "clothes", level: 3 },
    { text: "Sneakers", sentence: "Put on your Sneakers to run.", definition: "Soft shoes worn for sports or casual wear.", category: "clothes", level: 3 },
    { text: "Sandals", sentence: "Wear Sandals in the summer.", definition: "Open shoes worn in warm weather.", category: "clothes", level: 3 },
    { text: "Sunglasses", sentence: "Wear Sunglasses when it's bright.", definition: "Glasses worn to protect eyes from the sun.", category: "clothes", level: 3 },
    { text: "Necklace", sentence: "She wore a shiny Necklace.", definition: "Jewelry worn around the neck.", category: "clothes", level: 3 },
    { text: "Bracelet", sentence: "Mom has a pretty Bracelet.", definition: "Jewelry worn around the wrist.", category: "clothes", level: 3 },
    { text: "Pocket", sentence: "Keep keys in your Pocket.", definition: "A small bag sewn into clothing.", category: "clothes", level: 3 },
    { text: "Zipper", sentence: "Pull up the Zipper on your coat.", definition: "A fastener used on clothes and bags.", category: "clothes", level: 3 },
    { text: "Buttons", sentence: "My shirt has blue Buttons.", definition: "Small discs used to fasten clothing.", category: "clothes", level: 3 },
    { text: "Mittens", sentence: "Wear Mittens when it's cold.", definition: "Warm coverings for hands in winter.", category: "clothes", level: 3 },
    { text: "Airplane", sentence: "An Airplane flies high in the sky.", definition: "A vehicle that flies in the sky.", category: "transportation", level: 3 },
    { text: "Helicopter", sentence: "A Helicopter can hover in the air.", definition: "A flying vehicle with rotating blades.", category: "transportation", level: 3 },
    { text: "Motorcycle", sentence: "A Motorcycle is fast and loud.", definition: "A two-wheeled vehicle with an engine.", category: "transportation", level: 3 },
    { text: "Ambulance", sentence: "An Ambulance takes people to the hospital.", definition: "A vehicle used to take sick people to the hospital.", category: "transportation", level: 3 },
    { text: "Firetruck", sentence: "A Firetruck helps put out fires.", definition: "A large red truck used to fight fires.", category: "transportation", level: 3 },
    { text: "Police Car", sentence: "The Police Car has flashing lights.", definition: "A car used by police officers.", category: "transportation", level: 3 },
    { text: "School Bus", sentence: "Ride the yellow School Bus.", definition: "A bus that takes children to school.", category: "transportation", level: 3 },
    { text: "Subway", sentence: "Take the Subway under the city.", definition: "An underground train system.", category: "transportation", level: 3 },
    { text: "Sailboat", sentence: "A Sailboat uses wind to move.", definition: "A boat moved by wind hitting its sails.", category: "transportation", level: 3 },
    { text: "Bulldozer", sentence: "A Bulldozer pushes dirt.", definition: "A powerful tractor used for pushing earth.", category: "transportation", level: 3 },
    { text: "Doctor", sentence: "The Doctor helps sick people.", definition: "A person who treats sick people.", category: "occupations", level: 3 },
    { text: "Nurse", sentence: "A Nurse takes your temperature.", definition: "A person who cares for sick people, often works with doctors.", category: "occupations", level: 3 },
    { text: "Firefighter", sentence: "A Firefighter is brave.", definition: "A person who puts out fires.", category: "occupations", level: 3 },
    { text: "Police Officer", sentence: "A Police Officer keeps us safe.", definition: "A person who enforces laws and keeps people safe.", category: "occupations", level: 3 },
    { text: "Farmer", sentence: "A Farmer grows food.", definition: "A person who grows crops or raises animals.", category: "occupations", level: 3 },
    { text: "Pilot", sentence: "The Pilot flies the airplane.", definition: "A person who flies airplanes.", category: "occupations", level: 3 },
    { text: "Astronaut", sentence: "An Astronaut travels to space.", definition: "A person who travels into space.", category: "occupations", level: 3 },
    { text: "Musician", sentence: "A Musician plays an instrument.", definition: "A person who plays music.", category: "occupations", level: 3 },
    { text: "Artist", sentence: "An Artist paints beautiful pictures.", definition: "A person who creates art like paintings or drawings.", category: "occupations", level: 3 },
    { text: "Chef", sentence: "The Chef cooks delicious meals.", definition: "A professional cook, often in a restaurant.", category: "occupations", level: 3 },
    { text: "Happy", sentence: "I feel Happy when I play.", definition: "Feeling good or pleased.", category: "feelings", level: 3 },
    { text: "Sadness", sentence: "Sadness makes me want to cry.", definition: "The feeling of being unhappy.", category: "feelings", level: 3 },
    { text: "Excited", sentence: "I get Excited about birthdays.", definition: "Feeling very happy and enthusiastic.", category: "feelings", level: 3 },
    { text: "Surprised", sentence: "He looked Surprised by the gift.", definition: "Feeling amazed by something unexpected.", category: "feelings", level: 3 },
    { text: "Angry", sentence: "Don't get Angry over little things.", definition: "Feeling mad or annoyed.", category: "feelings", level: 3 },
    { text: "Scared", sentence: "She felt Scared during the storm.", definition: "Feeling afraid or frightened.", category: "feelings", level: 3 },
    { text: "Friendship", sentence: "Friendship is important.", definition: "The relationship between friends.", category: "concepts", level: 3 },
    { text: "Sharing", sentence: "Sharing toys is kind.", definition: "Letting someone else use something that is yours.", category: "concepts", level: 3 },
    { text: "Listening", sentence: "Good Listening helps you learn.", definition: "Paying attention to sound.", category: "concepts", level: 3 },
    { text: "Patience", sentence: "Have Patience while waiting.", definition: "Waiting calmly without getting upset.", category: "concepts", level: 3 },

    // --- Level 4 ---
    // (Adding a few examples - the full list would be very long)
    { text: "Street", sentence: "Drive down the Street", definition: "A paved road in a town or city.", category: "Complex Consonant", level: 4 },
    { text: "Splash", sentence: "Make a big Splash in the water", definition: "A sound made when something hits water.", category: "Complex Consonant", level: 4 },
    { text: "Strong", sentence: "Show me how Strong you are", definition: "Having great power or force.", category: "Complex Consonant", level: 4 },
    { text: "Rabbit", sentence: "The fluffy Rabbit eats carrots", definition: "A hopping animal with long ears.", category: "/r/ Sound", level: 4 },
    { text: "Around", sentence: "Look Around the big room", definition: "On all sides; surrounding.", category: "/r/ Sound", level: 4 },
    { text: "Lion", sentence: "The loud Lion roars", definition: "A large wild cat.", category: "/L/ Sound", level: 4 },
    { text: "Yellow", sentence: "The sun is bright Yellow", definition: "A bright color like the sun.", category: "/L/ Sound", level: 4 },
    { text: "Think", sentence: "Think before you speak", definition: "To use your mind.", category: "/TH/ Sound", level: 4 },
    { text: "Three", sentence: "Count one, two, Three", definition: "The number 3.", category: "/TH/ Sound", level: 4 },
    { text: "Animal", sentence: "Point to the Animal", definition: "A living creature, like a dog or cat.", category: "Multisyllabic Sound", level: 4 },
    { text: "Banana", sentence: "Eat a yellow Banana", definition: "A long, yellow fruit.", category: "Multisyllabic Sound", level: 4 },
    { text: "Stop", sentence: "Stop at the red light.", definition: "To cease moving or doing something.", category: "S-Blends L4", level: 4 },
    { text: "Spoon", sentence: "Eat soup with a Spoon.", definition: "A utensil used for eating liquids.", category: "S-Blends L4", level: 4 },
    { text: "Bread", sentence: "Make toast with Bread.", definition: "Food made from baked flour.", category: "R-Blends L4", level: 4 },
    { text: "Cry", sentence: "Please don't Cry.", definition: "To shed tears.", category: "R-Blends L4", level: 4 },
    { text: "Blue", sentence: "The sky is Blue.", definition: "The color of the clear sky.", category: "L-Blends L4", level: 4 },
    { text: "Cloud", sentence: "Look at the white Cloud.", definition: "A white mass in the sky.", category: "L-Blends L4", level: 4 },
    { text: "Hand", sentence: "Hold my Hand.", definition: "The part at the end of the arm.", category: "Final Clusters L4", level: 4 },
    { text: "Jump", sentence: "Can you Jump rope?", definition: "To push off the ground.", category: "Final Clusters L4", level: 4 },
    { text: "Shadow", sentence: "Your Shadow follows you.", definition: "A dark shape cast by an object blocking light.", category: "Palatals L4", level: 4 },
    { text: "Machine", sentence: "A washing Machine cleans clothes.", definition: "A device that performs a task.", category: "Palatals L4", level: 4 },
    { text: "Carrot", sentence: "A rabbit eats a Carrot.", definition: "An orange root vegetable.", category: "Medial R L4", level: 4 },
    { text: "Cereal", sentence: "Eat Cereal for breakfast.", definition: "Grain eaten for breakfast.", category: "Medial R L4", level: 4 },
    { text: "Jelly", sentence: "Eat toast with Jelly.", definition: "A sweet spread made from fruit.", category: "Medial L L4", level: 4 },
    { text: "Salad", sentence: "Make a green Salad.", definition: "A dish of raw vegetables.", category: "Medial L L4", level: 4 },
    { text: "Fan", sentence: "Turn on the Fan when it's hot.", definition: "A device that creates airflow.", category: "Voicing Pairs L4", level: 4 },
    { text: "Van", sentence: "Dad drives a big Van.", definition: "A vehicle for transporting goods or people.", category: "Voicing Pairs L4", level: 4 },
    { text: "Helicopter", sentence: "A Helicopter flies low.", definition: "A flying machine with large rotating blades.", category: "Multisyllabic L4", level: 4 },
    { text: "Ambulance", sentence: "An Ambulance has sirens.", definition: "A vehicle for taking sick people to the hospital.", category: "Multisyllabic L4", level: 4 },
    { text: "Scissors", sentence: "Use Scissors to cut paper.", definition: "A tool for cutting paper.", category: "Mixed Sounds L4", level: 4 },
    { text: "Zebra", sentence: "A Zebra lives in Africa.", definition: "An animal with black and white stripes.", category: "Mixed Sounds L4", level: 4 },
    { text: "Scratch", sentence: "Don't Scratch the table.", definition: "To mark a surface with something sharp.", category: "Complex Consonant", level: 4 },
    { text: "Stream", sentence: "Fish swim in the Stream.", definition: "A small, narrow river.", category: "Complex Consonant", level: 4 },
    { text: "Throw", sentence: "Throw the ball to me.", definition: "To propel something through the air.", category: "Complex Consonant", level: 4 },
    { text: "Squeeze", sentence: "Squeeze the orange for juice.", definition: "To firmly press from opposite sides.", category: "Complex Consonant", level: 4 },
    { text: "Rainbow", sentence: "Look at the colorful Rainbow!", definition: "An arc of colors in the sky after rain.", category: "/r/ Sound", level: 4 },
    { text: "Forest", sentence: "Many trees grow in the Forest.", definition: "A large area covered with trees.", category: "/r/ Sound", level: 4 },
    { text: "Mirror", sentence: "Look at yourself in the Mirror.", definition: "A surface that reflects images.", category: "/r/ Sound", level: 4 },
    { text: "Ladder", sentence: "Climb up the Ladder carefully.", definition: "A piece of equipment for climbing up or down.", category: "/L/ Sound", level: 4 },
    { text: "Pillow", sentence: "Rest your head on the Pillow.", definition: "A soft cushion for the head.", category: "/L/ Sound", level: 4 },
    { text: "Elephant", sentence: "An Elephant has a long trunk.", definition: "A very large grey animal with tusks.", category: "/L/ Sound", level: 4 }, // Also Multisyllabic
    { text: "Bath", sentence: "Take a warm Bath before bed.", definition: "Washing your body in a tub of water.", category: "/TH/ Sound", level: 4 },
    { text: "Feather", sentence: "The bird dropped a soft Feather.", definition: "One of the soft things covering a bird's body.", category: "/TH/ Sound", level: 4 },
    { text: "Brother", sentence: "My Brother is older than me.", definition: "A boy or man with the same parents.", category: "/TH/ Sound", level: 4 },
    { text: "Butterfly", sentence: "A Butterfly has colorful wings.", definition: "An insect with large, often bright wings.", category: "Multisyllabic Sound", level: 4 },
    { text: "Dinosaur", sentence: "A Dinosaur lived long ago.", definition: "An extinct reptile, often very large.", category: "Multisyllabic Sound", level: 4 },
    { text: "Umbrella", sentence: "Use an Umbrella when it rains.", definition: "A device used for protection from rain or sun.", category: "Multisyllabic Sound", level: 4 },
    { text: "Slide", sentence: "Go down the Slide at the park.", definition: "A structure with a smooth surface for sliding down.", category: "S-Blends L4", level: 4 },
    { text: "Snake", sentence: "A long Snake slithered past.", definition: "A reptile with no legs.", category: "S-Blends L4", level: 4 },
    { text: "Swing", sentence: "Let's play on the Swing set.", definition: "A seat hanging from ropes or chains, for swinging.", category: "S-Blends L4", level: 4 },
    { text: "Frog", sentence: "A green Frog jumped.", definition: "A small amphibian that hops.", category: "R-Blends L4", level: 4 },
    { text: "Train", sentence: "The Train goes 'choo-choo'.", definition: "A series of connected railway cars.", category: "R-Blends L4", level: 4 },
    { text: "Grass", sentence: "The Grass is green in summer.", definition: "Common green plants covering the ground.", category: "R-Blends L4", level: 4 },
    { text: "Plane", sentence: "Look at the Plane flying high.", definition: "An aircraft with wings and engines.", category: "L-Blends L4", level: 4 },
    { text: "Flower", sentence: "Smell the pretty red Flower.", definition: "The colorful, reproductive part of a plant.", category: "L-Blends L4", level: 4 },
    { text: "Clock", sentence: "What time does the Clock say?", definition: "An instrument that shows the time.", category: "L-Blends L4", level: 4 },
    { text: "Nest", sentence: "Birds build a Nest for their eggs.", definition: "A structure built by birds for laying eggs.", category: "Final Clusters L4", level: 4 },
    { text: "Lamp", sentence: "Turn on the Lamp to read.", definition: "A device for giving light.", category: "Final Clusters L4", level: 4 },
    { text: "Milk", sentence: "Drink Milk for strong bones.", definition: "A white liquid from cows.", category: "Final Clusters L4", level: 4 },
    { text: "Chair", sentence: "Sit on the wooden Chair.", definition: "A seat for one person.", category: "Palatals L4", level: 4 },
    { text: "Shoe", sentence: "Tie your Shoe laces.", definition: "A covering for the foot.", category: "Palatals L4", level: 4 },
    { text: "Juice", sentence: "Drink your orange Juice.", definition: "Liquid from fruits or vegetables.", category: "Palatals L4", level: 4 },
    { text: "Orange", sentence: "Peel the Orange before eating.", definition: "A round, orange-colored citrus fruit.", category: "Medial R L4", level: 4 }, // Also /r/ sound
    { text: "Giraffe", sentence: "A Giraffe has a very long neck.", definition: "A tall African animal with a long neck.", category: "Medial R L4", level: 4 },
    { text: "Squirrel", sentence: "The Squirrel hid a nut.", definition: "A small rodent with a bushy tail.", category: "Medial R L4", level: 4 },
    { text: "Balloon", sentence: "Hold the string of the Balloon.", definition: "A flexible bag inflated with air or gas.", category: "Medial L L4", level: 4 },
    { text: "Dollar", sentence: "This toy costs one Dollar.", definition: "A basic unit of money in the US and other countries.", category: "Medial L L4", level: 4 },
    { text: "Follow", sentence: "Follow the leader.", definition: "To go or come after someone or something.", category: "Medial L L4", level: 4 },
    { text: "Pig", sentence: "The Pig oinks in the mud.", definition: "A farm animal with a snout.", category: "Voicing Pairs L4", level: 4 },
    { text: "Big", sentence: "That is a very Big dog.", definition: "Large in size.", category: "Voicing Pairs L4", level: 4 },
    { text: "Coat", sentence: "Wear your Coat when it's cold.", definition: "An outer garment worn for warmth.", category: "Voicing Pairs L4", level: 4 },
    { text: "Goat", sentence: "A Goat likes to climb rocks.", definition: "A horned animal related to sheep.", category: "Voicing Pairs L4", level: 4 },
    { text: "Television", sentence: "Watch cartoons on Television.", definition: "A device that receives broadcast signals and displays images.", category: "Multisyllabic L4", level: 4 },
    { text: "Watermelon", sentence: "Watermelon is sweet and juicy.", definition: "A large green fruit with red flesh and black seeds.", category: "Multisyllabic L4", level: 4 },
    { text: "Computer", sentence: "We use the Computer for games.", definition: "An electronic device for processing data.", category: "Multisyllabic L4", level: 4 },
    { text: "Strawberry", sentence: "I like red Strawberry jam.", definition: "A sweet red fruit with small seeds on the surface.", category: "Mixed Sounds L4", level: 4 }, // Also R-blend, Medial R
    { text: "Playground", sentence: "Let's go to the Playground.", definition: "An outdoor area for children to play.", category: "Mixed Sounds L4", level: 4 }, // Also L-blend
    { text: "Breakfast", sentence: "Eat your Breakfast quickly.", definition: "The first meal of the day.", category: "Mixed Sounds L4", level: 4 }, // Also R-blend, Final Cluster
    { text: "Surprise", sentence: "It's a birthday Surprise!", definition: "An unexpected event or gift.", category: "Mixed Sounds L4", level: 4 }, // Also S-blend, /r/ sound
    { text: "Treasure", sentence: "Pirates look for buried Treasure.", definition: "Valuable items like gold or jewels.", category: "Palatals L4", level: 4 }, // Also /r/ sound
    { text: "Bridge", sentence: "Drive the car over the Bridge.", definition: "A structure built over a river or road.", category: "Palatals L4", level: 4 }, // Also R-blend
    { text: "Split", sentence: "Can you Split the cookie in half?", definition: "To divide into parts.", category: "Complex Consonant", level: 4 },
    { text: "Spray", sentence: "Spray water on the plants.", definition: "Liquid sent through the air in tiny drops.", category: "Complex Consonant", level: 4 },
    { text: "Stripe", sentence: "The zebra has black and white Stripes.", definition: "A long, narrow band of color.", category: "Complex Consonant", level: 4 },
    { text: "Thread", sentence: "Use a needle and Thread to sew.", definition: "A long, thin strand of cotton or other fiber.", category: "Complex Consonant", level: 4 },
    { text: "Radio", sentence: "Listen to music on the Radio.", definition: "A device for receiving broadcast sound signals.", category: "/r/ Sound", level: 4 },
    { text: "Story", sentence: "Read me a bedtime Story.", definition: "An account of imaginary or real people and events.", category: "/r/ Sound", level: 4 },
    { text: "Tiger", sentence: "A Tiger has orange and black stripes.", definition: "A large striped wild cat.", category: "/r/ Sound", level: 4 },
    { text: "Hello", sentence: "Say Hello to your friend.", definition: "A greeting.", category: "/L/ Sound", level: 4 },
    { text: "Sleepy", sentence: "The baby looks Sleepy.", definition: "Feeling ready for sleep; tired.", category: "/L/ Sound", level: 4 },
    { text: "Family", sentence: "My Family lives in this house.", definition: "A group consisting of parents and children.", category: "/L/ Sound", level: 4 }, // Also Multisyllabic
    { text: "Mouth", sentence: "Chew food with your Mouth.", definition: "The opening in the face used for eating and speaking.", category: "/TH/ Sound", level: 4 },
    { text: "Tooth", sentence: "Brush each Tooth carefully.", definition: "A hard structure in the jaw used for biting and chewing.", category: "/TH/ Sound", level: 4 },
    { text: "Mother", sentence: "My Mother tucked me in.", definition: "A female parent.", category: "/TH/ Sound", level: 4 }, // Also /r/ sound
    { text: "Octopus", sentence: "An Octopus has eight arms.", definition: "A sea animal with a soft body and eight tentacles.", category: "Multisyllabic Sound", level: 4 },
    { text: "Kangaroo", sentence: "A Kangaroo can jump very high.", definition: "An Australian animal that hops and carries its baby in a pouch.", category: "Multisyllabic Sound", level: 4 },
    { text: "Telephone", sentence: "Answer the Telephone when it rings.", definition: "A device used for talking to someone far away.", category: "Multisyllabic Sound", level: 4 }, // Also /L/ sound
    { text: "Smile", sentence: "Give me a big Smile!", definition: "To form one's features into a pleased or kind expression.", category: "S-Blends L4", level: 4 },
    { text: "Star", sentence: "Look at the bright Star in the sky.", definition: "A fixed luminous point in the night sky.", category: "S-Blends L4", level: 4 },
    { text: "Swim", sentence: "Let's Swim in the pool.", definition: "To propel the body through water by using the limbs.", category: "S-Blends L4", level: 4 },
    { text: "Truck", sentence: "The big Truck carried sand.", definition: "A large vehicle used for transporting goods.", category: "R-Blends L4", level: 4 },
    { text: "Green", sentence: "The traffic light turned Green.", definition: "The color of growing grass or leaves.", category: "R-Blends L4", level: 4 },
    { text: "Pretty", sentence: "That is a Pretty flower.", definition: "Attractive in a delicate way.", category: "R-Blends L4", level: 4 },
    { text: "Flag", sentence: "Wave the Flag high.", definition: "A piece of cloth with a design, used as a symbol.", category: "L-Blends L4", level: 4 },
    { text: "Sleep", sentence: "Go to Sleep now.", definition: "To rest your mind and body by closing your eyes.", category: "L-Blends L4", level: 4 },
    { text: "Glass", sentence: "Drink water from the Glass.", definition: "A hard, brittle substance, typically transparent.", category: "L-Blends L4", level: 4 },
    { text: "Tent", sentence: "We sleep in a Tent when camping.", definition: "A portable shelter made of cloth.", category: "Final Clusters L4", level: 4 },
    { text: "Gift", sentence: "I received a Gift for my birthday.", definition: "A present.", category: "Final Clusters L4", level: 4 },
    { text: "Cold", sentence: "It feels Cold outside.", definition: "Of or at a low temperature.", category: "Final Clusters L4", level: 4 },
    { text: "Cheese", sentence: "I like Cheese on crackers.", definition: "A food made from pressed curds of milk.", category: "Palatals L4", level: 4 },
    { text: "Sheep", sentence: "A Sheep says 'baa'.", definition: "A farm animal with a thick woolly coat.", category: "Palatals L4", level: 4 },
    { text: "Watch", sentence: "Watch the movie carefully.", definition: "To look at or observe something for a period of time.", category: "Palatals L4", level: 4 },
    { text: "Story", sentence: "Tell me a funny Story.", definition: "An account of events.", category: "Medial R L4", level: 4 }, // Already listed under /r/ sound, good for mixed practice
    { text: "Zero", sentence: "Zero comes before one.", definition: "The number 0; none.", category: "Medial R L4", level: 4 },
    { text: "Furry", sentence: "My teddy bear is soft and Furry.", definition: "Covered with fur.", category: "Medial R L4", level: 4 },
    { text: "Silly", sentence: "Don't be Silly!", definition: "Having or showing a lack of common sense; foolish.", category: "Medial L L4", level: 4 },
    { text: "Tummy", sentence: "My Tummy hurts.", definition: "A person's stomach or abdomen.", category: "Medial L L4", level: 4 }, // Informal, but common
    { text: "Color", sentence: "What is your favorite Color?", definition: "The property possessed by an object of producing different sensations on the eye.", category: "Medial L L4", level: 4 },
    { text: "Cup", sentence: "Drink from the Cup.", definition: "A small open container used for drinking.", category: "Voicing Pairs L4", level: 4 },
    { text: "Cub", sentence: "A bear Cub is small.", definition: "The young of certain animals, such as bears or lions.", category: "Voicing Pairs L4", level: 4 },
    { text: "Zip", sentence: "Zip up your jacket.", definition: "To fasten with a zipper.", category: "Voicing Pairs L4", level: 4 },
    { text: "Sip", sentence: "Take a Sip of water.", definition: "To drink something by taking small mouthfuls.", category: "Voicing Pairs L4", level: 4 },
    { text: "Alligator", sentence: "An Alligator lives in swamps.", definition: "A large reptile similar to a crocodile.", category: "Multisyllabic L4", level: 4 }, // Also /L/ sound
    { text: "Elephant", sentence: "The Elephant sprayed water.", definition: "A very large mammal with a trunk.", category: "Multisyllabic L4", level: 4 }, // Repeated for emphasis/practice
    { text: "Avocado", sentence: "I like Avocado on toast.", definition: "A pear-shaped fruit with green flesh.", category: "Multisyllabic L4", level: 4 },
    { text: "Bicycle", sentence: "Ride your Bicycle to the park.", definition: "A vehicle with two wheels, handlebars, and pedals.", category: "Mixed Sounds L4", level: 4 }, // /L/ sound, S-blend
    { text: "Chocolate", sentence: "Chocolate cake is delicious.", definition: "A food preparation made from cacao seeds.", category: "Mixed Sounds L4", level: 4 }, // Palatal, /L/ sound
    { text: "Library", sentence: "Borrow books from the Library.", definition: "A place containing books for reading or borrowing.", category: "Mixed Sounds L4", level: 4 }, // /L/ sound, /r/ sound
    { text: "Present", sentence: "Open your birthday Present.", definition: "A gift.", category: "Mixed Sounds L4", level: 4 }, // R-blend, Final Cluster
    { text: "Measure", sentence: "Measure the flour for the cake.", definition: "To find the size or amount of something.", category: "Palatals L4", level: 4 }, // Also /r/ sound
    { text: "Garage", sentence: "Park the car in the Garage.", definition: "A building for keeping cars.", category: "Palatals L4", level: 4 }, // Also /r/ sound

    // --- Level 5 ---
    // (Adding a few examples)
    { text: "February", sentence: "My birthday is in February.", definition: "The second month of the year.", category: "Complex R/L", level: 5 },
    { text: "Library", sentence: "Let's borrow books from the Library.", definition: "A place for borrowing books.", category: "Complex R/L", level: 5 },
    { text: "Strength", sentence: "Show me your Strength.", definition: "The quality of being strong.", category: "Advanced Clusters", level: 5 },
    { text: "Crisply", sentence: "The cold air felt Crisply.", definition: "In a crisp or sharp manner.", category: "Advanced Clusters", level: 5 },
    { text: "Statistics", sentence: "Math class uses Statistics.", definition: "Facts and figures collected together.", category: "Challenging S/Z/TH", level: 5 },
    { text: "Necessary", sentence: "Water is Necessary for plants.", definition: "Needed; required.", category: "Challenging S/Z/TH", level: 5 },
    { text: "Suggestion", sentence: "Do you have a Suggestion?", definition: "An idea or plan offered.", category: "Advanced Palatals/Voicing", level: 5 },
    { text: "Schedule", sentence: "What is our Schedule today?", definition: "A plan for activities or events.", category: "Advanced Palatals/Voicing", level: 5 },
    { text: "Opportunity", sentence: "This is a great Opportunity.", definition: "A chance to do something.", category: "Long Multisyllabic", level: 5 },
    { text: "Responsibility", sentence: "Taking care of a pet is a Responsibility.", definition: "Having a duty to deal with something.", category: "Long Multisyllabic", level: 5 },
    { text: "Rural", sentence: "They live in a Rural area, far from the city.", definition: "Relating to the countryside.", category: "Complex R/L", level: 5 },
    { text: "Brewery", sentence: "They visited the local Brewery.", definition: "A place where beer is made.", category: "Complex R/L", level: 5 },
    { text: "Parallel", sentence: "The two lines run Parallel to each other.", definition: "Side by side and having the same distance continuously between them.", category: "Complex R/L", level: 5 },
    { text: "Literally", sentence: "I was Literally frozen with fear.", definition: "In a literal manner or sense; exactly.", category: "Complex R/L", level: 5 },
    { text: "Regularly", sentence: "She exercises Regularly.", definition: "At uniform intervals of time or space.", category: "Complex R/L", level: 5 },
    { text: "Splurge", sentence: "Let's Splurge on a fancy dinner.", definition: "To spend money freely or extravagantly.", category: "Advanced Clusters", level: 5 },
    { text: "Thrive", sentence: "Plants Thrive in sunlight.", definition: "To grow or develop well or vigorously.", category: "Advanced Clusters", level: 5 },
    { text: "Scramble", sentence: "We had to Scramble over the rocks.", definition: "To move hurriedly or clumsily.", category: "Advanced Clusters", level: 5 },
    { text: "Shrink", sentence: "The sweater might Shrink in the wash.", definition: "To become smaller in size.", category: "Advanced Clusters", level: 5 },
    { text: "Exquisite", sentence: "The artwork was Exquisite.", definition: "Extremely beautiful and delicate.", category: "Advanced Clusters", level: 5 }, // Also Challenging S/Z/TH
    { text: "Thesis", sentence: "He wrote his Thesis on ancient history.", definition: "A long essay involving personal research.", category: "Challenging S/Z/TH", level: 5 },
    { text: "Synthesis", sentence: "The report is a Synthesis of different ideas.", definition: "Combining parts to form a whole.", category: "Challenging S/Z/TH", level: 5 },
    { text: "Thesaurus", sentence: "Use a Thesaurus to find similar words.", definition: "A book listing words grouped by similarity.", category: "Challenging S/Z/TH", level: 5 },
    { text: "Emphasize", sentence: "The teacher will Emphasize the main points.", definition: "To give special importance to something.", category: "Challenging S/Z/TH", level: 5 },
    { text: "Possesses", sentence: "She Possesses great musical talent.", definition: "To have or own something.", category: "Challenging S/Z/TH", level: 5 },
    { text: "Visualize", sentence: "Visualize yourself succeeding.", definition: "To form a mental image of something.", category: "Advanced Palatals/Voicing", level: 5 }, // Also Challenging S/Z/TH
    { text: "Measure", sentence: "Measure the ingredients carefully.", definition: "To find the size or amount of something.", category: "Advanced Palatals/Voicing", level: 5 },
    { text: "Decision", sentence: "It was a difficult Decision to make.", definition: "A choice made after thinking.", category: "Advanced Palatals/Voicing", level: 5 },
    { text: "Pleasure", sentence: "Reading is a great Pleasure for her.", definition: "A feeling of happy satisfaction and enjoyment.", category: "Advanced Palatals/Voicing", level: 5 },
    { text: "Garage", sentence: "Park the car in the Garage.", definition: "A building for housing a motor vehicle.", category: "Advanced Palatals/Voicing", level: 5 },
    { text: "Imagination", sentence: "Use your Imagination to write a story.", definition: "The ability to form mental images or concepts.", category: "Long Multisyllabic", level: 5 },
    { text: "Congratulations", sentence: "Congratulations on your graduation!", definition: "An expression of praise for an achievement.", category: "Long Multisyllabic", level: 5 },
    { text: "Understanding", sentence: "Having Understanding is important in friendship.", definition: "Sympathetic awareness or tolerance.", category: "Long Multisyllabic", level: 5 },
    { text: "Communication", sentence: "Good Communication is key to teamwork.", definition: "The imparting or exchanging of information.", category: "Long Multisyllabic", level: 5 },
    { text: "Environment", sentence: "We need to protect the Environment.", definition: "The surroundings or conditions in which a person, animal, or plant lives.", category: "Long Multisyllabic", level: 5 },
    { text: "Refrigerator", sentence: "Put the milk in the Refrigerator.", definition: "An appliance for keeping food cold.", category: "Long Multisyllabic", level: 5 }, // Also Complex R/L
    { text: "Thermometer", sentence: "Use a Thermometer to check the temperature.", definition: "An instrument for measuring temperature.", category: "Long Multisyllabic", level: 5 }, // Also /TH/ Sound
    { text: "Vegetable", sentence: "Eat at least one Vegetable daily.", definition: "A plant or part of a plant used as food.", category: "Long Multisyllabic", level: 5 },
    { text: "Architecture", sentence: "He studies modern Architecture.", definition: "The art or practice of designing and constructing buildings.", category: "Mixed Difficulty", level: 5 }, // Complex R, Palatal
    { text: "Specific", sentence: "Can you be more Specific?", definition: "Clearly defined or identified.", category: "Mixed Difficulty", level: 5 }, // S-blend, Final Cluster
    { text: "Throughout", sentence: "It rained Throughout the night.", definition: "In every part of; from end to end.", category: "Mixed Difficulty", level: 5 }, // Complex R, /TH/ sound
    { text: "Exercise", sentence: "Regular Exercise is healthy.", definition: "Activity requiring physical effort.", category: "Mixed Difficulty", level: 5 }, // Complex R, Challenging S/Z/TH
    { text: "Especially", sentence: "I like ice cream, Especially chocolate.", definition: "Used to single out one person or thing over all others.", category: "Mixed Difficulty", level: 5 }, // S-blend, Palatal, Medial L
    { text: "Frequently", sentence: "We Frequently visit the park.", definition: "Often; regularly.", category: "Mixed Difficulty", level: 5 }, // Complex R, Medial L
    { text: "Organization", sentence: "The Organization helps homeless people.", definition: "An organized group of people with a particular purpose.", category: "Mixed Difficulty", level: 5 }, // Complex R, Challenging S/Z/TH, Long Multisyllabic
    { text: "Recognize", sentence: "I Recognize that song.", definition: "To identify someone or something seen before.", category: "Mixed Difficulty", level: 5 }, // Complex R, Challenging S/Z/TH
    { text: "Characteristic", sentence: "Patience is a good Characteristic.", definition: "A feature or quality typical of someone or something.", category: "Mixed Difficulty", level: 5 }, // Complex R, Palatal, Long Multisyllabic
    { text: "Appropriate", sentence: "Wear Appropriate clothes for the party.", definition: "Suitable or proper in the circumstances.", category: "Mixed Difficulty", level: 5 }, // Complex R, Long Multisyllabic
    { text: "Immediately", sentence: "Call the doctor Immediately.", definition: "At once; instantly.", category: "Mixed Difficulty", level: 5 }, // Medial L, Long Multisyllabic
    { text: "Unfortunately", sentence: "Unfortunately, the store was closed.", definition: "It is unfortunate that.", category: "Mixed Difficulty", level: 5 }, // Complex R, Palatal, Medial L, Long Multisyllabic
    { text: "Professional", sentence: "She is a Professional musician.", definition: "Relating to or belonging to a profession.", category: "Mixed Difficulty", level: 5 }, // Complex R, Palatal, Long Multisyllabic
    { text: "Development", sentence: "Child Development is a complex process.", definition: "The process of developing or being developed.", category: "Mixed Difficulty", level: 5 }, // Medial L, Long Multisyllabic
    { text: "Experience", sentence: "Traveling gives you valuable Experience.", definition: "Practical contact with and observation of facts or events.", category: "Mixed Difficulty", level: 5 }, // Complex R, Challenging S/Z/TH, Long Multisyllabic
    { text: "Technology", sentence: "Technology changes rapidly.", definition: "Machinery and equipment developed from scientific knowledge.", category: "Mixed Difficulty", level: 5 }, // Palatal, Medial L, Long Multisyllabic
    { text: "Government", sentence: "The Government makes laws.", definition: "The governing body of a nation, state, or community.", category: "Mixed Difficulty", level: 5 }, // Complex R, Long Multisyllabic
    { text: "Knowledge", sentence: "He has great Knowledge of history.", definition: "Facts, information, and skills acquired through experience or education.", category: "Mixed Difficulty", level: 5 }, // Palatal, Medial L
    { text: "Business", sentence: "She started her own Business.", definition: "A person's regular occupation, profession, or trade.", category: "Mixed Difficulty", level: 5 }, // Challenging S/Z/TH
    { text: "Research", sentence: "Scientists conduct Research.", definition: "The systematic investigation into materials and sources to establish facts.", category: "Mixed Difficulty", level: 5 }, // Complex R, Palatal
    { text: "Analysis", sentence: "The report provides a detailed Analysis.", definition: "Detailed examination of the elements or structure of something.", category: "Mixed Difficulty", level: 5 }, // Medial L, Challenging S/Z/TH
    { text: "Strategy", sentence: "They developed a new marketing Strategy.", definition: "A plan of action designed to achieve a major aim.", category: "Mixed Difficulty", level: 5 }, // Complex R, Palatal
    // --- Level 6 ---
    // (Adding a few examples)
    { text: "Experiment", sentence: "Let's do a science Experiment.", definition: "A scientific test to discover something.", category: "Complex Clusters L6", level: 6 },
    { text: "Distinctly", sentence: "I can Distinctly hear the music.", definition: "Clearly; easy to see or hear.", category: "Complex Clusters L6", level: 6 },
    { text: "Entrepreneur", sentence: "An Entrepreneur starts a business.", definition: "A person who starts a business.", category: "Advanced R-Sounds L6", level: 6 },
    { text: "Extraordinary", sentence: "That performance was Extraordinary.", definition: "Very unusual or remarkable.", category: "Advanced R-Sounds L6", level: 6 },
    { text: "Collaborate", sentence: "Let's Collaborate on the project.", definition: "To work together with others.", category: "Advanced L-Sounds L6", level: 6 },
    { text: "Calculate", sentence: "Can you Calculate the total cost?", definition: "To find an answer using math.", category: "Advanced L-Sounds L6", level: 6 },
    { text: "Sensational", sentence: "The magic show was Sensational.", definition: "Causing great excitement or interest.", category: "Difficult Sibilants L6", level: 6 },
    { text: "Association", sentence: "Join the student Association.", definition: "A group of people with a common interest.", category: "Difficult Sibilants L6", level: 6 },
    { text: "Authenticate", sentence: "You need to Authenticate your account.", definition: "To prove something is real or true.", category: "Difficult TH/CH/J L6", level: 6 },
    { text: "Methodology", sentence: "Follow the scientific Methodology.", definition: "A system of methods used in a particular area.", category: "Difficult TH/CH/J L6", level: 6 },
    { text: "Photosynthesis", sentence: "Plants use Photosynthesis for food.", definition: "How plants use sunlight to make food.", category: "Academic Science L6", level: 6 },
    { text: "Hypothesis", sentence: "Test your Hypothesis with an experiment.", definition: "A proposed explanation needing testing.", category: "Academic Science L6", level: 6 },
    { text: "Civilization", sentence: "Ancient Egypt was a great Civilization.", definition: "An advanced society with culture and government.", category: "Academic Social Studies L6", level: 6 },
    { text: "Democracy", sentence: "Voting is important in a Democracy.", definition: "Government by the people, often through voting.", category: "Academic Social Studies L6", level: 6 },
    { text: "Multiplication", sentence: "Practice your Multiplication facts.", definition: "Adding a number to itself multiple times.", category: "Academic Math L6", level: 6 },
    { text: "Denominator", sentence: "The Denominator is the bottom number.", definition: "The bottom number in a fraction.", category: "Academic Math L6", level: 6 },
    { text: "Aluminum", sentence: "Wrap the food in Aluminum foil.", definition: "A light, silver-colored metal.", category: "Rapid Shifts L6", level: 6 },
    { text: "Cinnamon", sentence: "Sprinkle Cinnamon on the toast.", definition: "A spice from the bark of a tree.", category: "Rapid Shifts L6", level: 6 },
    { text: "Advice", sentence: "That is good Advice.", definition: "Suggestions about what someone should do (noun).", category: "Subtle Distinctions L6", level: 6 },
    { text: "Advise", sentence: "I Advise you to be careful.", definition: "To offer suggestions to someone (verb).", category: "Subtle Distinctions L6", level: 6 },
    { text: "Explanatory", sentence: "The manual provides Explanatory notes.", definition: "Serving to explain something.", category: "Complex Clusters L6", level: 6 },
    { text: "Constraint", sentence: "Budget Constraint limited our options.", definition: "A limitation or restriction.", category: "Complex Clusters L6", level: 6 },
    { text: "Abstract", sentence: "The painting was Abstract, not realistic.", definition: "Existing in thought or as an idea but not having a physical existence.", category: "Complex Clusters L6", level: 6 },
    { text: "Structure", sentence: "The building has a complex Structure.", definition: "The arrangement of parts in something complex.", category: "Complex Clusters L6", level: 6 },
    { text: "Interpret", sentence: "How do you Interpret this poem?", definition: "To explain the meaning of something.", category: "Advanced R-Sounds L6", level: 6 },
    { text: "Prioritize", sentence: "You must Prioritize your tasks.", definition: "To decide the order for dealing with tasks based on importance.", category: "Advanced R-Sounds L6", level: 6 },
    { text: "Bureaucracy", sentence: "Dealing with government Bureaucracy can be slow.", definition: "A system of government with many complicated rules and procedures.", category: "Advanced R-Sounds L6", level: 6 },
    { text: "Territory", sentence: "The wolf marked its Territory.", definition: "An area of land under the jurisdiction of a ruler or state.", category: "Advanced R-Sounds L6", level: 6 },
    { text: "Illustrate", sentence: "Use a diagram to Illustrate your point.", definition: "To explain or make clear using examples, charts, or pictures.", category: "Advanced L-Sounds L6", level: 6 },
    { text: "Voluntarily", sentence: "She Voluntarily helped clean up.", definition: "Done, given, or acting of one's own free will.", category: "Advanced L-Sounds L6", level: 6 },
    { text: "Legislation", sentence: "New Legislation was passed to protect wildlife.", definition: "Laws, considered collectively.", category: "Advanced L-Sounds L6", level: 6 }, // Also Difficult Sibilants
    { text: "Simultaneously", sentence: "The two events happened Simultaneously.", definition: "At the same time.", category: "Advanced L-Sounds L6", level: 6 }, // Also Difficult Sibilants
    { text: "Assess", sentence: "We need to Assess the situation.", definition: "To evaluate or estimate the nature, ability, or quality of.", category: "Difficult Sibilants L6", level: 6 },
    { text: "Excessive", sentence: "Avoid Excessive speed when driving.", definition: "More than is necessary, normal, or desirable.", category: "Difficult Sibilants L6", level: 6 },
    { text: "Possession", sentence: "The antique map is his prized Possession.", definition: "The state of having, owning, or controlling something.", category: "Difficult Sibilants L6", level: 6 },
    { text: "Transition", sentence: "The Transition to high school can be challenging.", definition: "The process or a period of changing from one state or condition to another.", category: "Difficult Sibilants L6", level: 6 },
    { text: "Challenge", sentence: "Climbing the mountain was a huge Challenge.", definition: "A task or situation that tests someone's abilities.", category: "Difficult TH/CH/J L6", level: 6 },
    { text: "Objective", sentence: "What is the main Objective of this meeting?", definition: "A goal or purpose.", category: "Difficult TH/CH/J L6", level: 6 },
    { text: "Justification", sentence: "Provide a Justification for your decision.", definition: "The action of showing something to be right or reasonable.", category: "Difficult TH/CH/J L6", level: 6 }, // Also Difficult Sibilants
    { text: "Synthesize", sentence: "Synthesize the information from these sources.", definition: "To combine a number of things into a coherent whole.", category: "Difficult TH/CH/J L6", level: 6 }, // Also Difficult Sibilants
    { text: "Metabolism", sentence: "Exercise can boost your Metabolism.", definition: "Chemical processes in the body to maintain life.", category: "Academic Science L6", level: 6 },
    { text: "Ecosystem", sentence: "Pollution harms the delicate Ecosystem.", definition: "A biological community of interacting organisms and their environment.", category: "Academic Science L6", level: 6 },
    { text: "Genetics", sentence: "Genetics explains how traits are inherited.", definition: "The study of heredity and the variation of inherited characteristics.", category: "Academic Science L6", level: 6 },
    { text: "Astronomy", sentence: "Astronomy is the study of stars and planets.", definition: "The branch of science dealing with celestial objects, space, and the universe.", category: "Academic Science L6", level: 6 },
    { text: "Constitution", sentence: "The US Constitution outlines the government's structure.", definition: "A body of fundamental principles according to which a state is governed.", category: "Academic Social Studies L6", level: 6 }, // Also Difficult Sibilants
    { text: "Judicial", sentence: "The Judicial branch interprets laws.", definition: "Relating to judges or the law courts.", category: "Academic Social Studies L6", level: 6 }, // Also Difficult TH/CH/J
    { text: "Economics", sentence: "Economics studies production, consumption, and wealth transfer.", definition: "The branch of knowledge concerned with the production, consumption, and transfer of wealth.", category: "Academic Social Studies L6", level: 6 },
    { text: "Anthropology", sentence: "Anthropology is the study of human societies and cultures.", definition: "The study of human societies, cultures, and their development.", category: "Academic Social Studies L6", level: 6 }, // Also Difficult TH
    { text: "Numerator", sentence: "The Numerator is the top number in a fraction.", definition: "The number above the line in a common fraction.", category: "Academic Math L6", level: 6 },
    { text: "Algebra", sentence: "Algebra uses letters to represent numbers.", definition: "A branch of mathematics dealing with symbols and the rules for manipulating them.", category: "Academic Math L6", level: 6 },
    { text: "Geometry", sentence: "Geometry deals with shapes, sizes, and space.", definition: "The branch of mathematics concerned with properties of space.", category: "Academic Math L6", level: 6 },
    { text: "Probability", sentence: "Calculate the Probability of rolling a six.", definition: "The likelihood of something happening.", category: "Academic Math L6", level: 6 }, // Also Complex R/L
    { text: "Anemone", sentence: "The clownfish lives in a sea Anemone.", definition: "A marine animal resembling a flower.", category: "Rapid Shifts L6", level: 6 },
    { text: "Phenomenon", sentence: "A solar eclipse is a natural Phenomenon.", definition: "A fact or situation observed to exist, especially one whose cause is in question.", category: "Rapid Shifts L6", level: 6 },
    { text: "Specifically", sentence: "I Specifically asked for no onions.", definition: "In a way that is exact and clear; precisely.", category: "Rapid Shifts L6", level: 6 }, // Also Difficult Sibilants, Advanced L
    { text: "Preliminary", sentence: "These are just the Preliminary results.", definition: "Coming before a more important action or event.", category: "Rapid Shifts L6", level: 6 }, // Also Complex R/L
    { text: "Affect", sentence: "Lack of sleep can Affect your mood.", definition: "To have an effect on; make a difference to (verb).", category: "Subtle Distinctions L6", level: 6 },
    { text: "Effect", sentence: "The medicine had a positive Effect.", definition: "A change which is a consequence of an action (noun).", category: "Subtle Distinctions L6", level: 6 },
    { text: "Principal", sentence: "The Principal leads the school.", definition: "The most important person; head of a school (noun/adjective).", category: "Subtle Distinctions L6", level: 6 },
    { text: "Principle", sentence: "Honesty is an important Principle.", definition: "A fundamental truth or belief (noun).", category: "Subtle Distinctions L6", level: 6 },
    { text: "Complement", sentence: "The sauce will Complement the dish.", definition: "Something that completes or enhances something else (verb/noun).", category: "Subtle Distinctions L6", level: 6 },
    { text: "Compliment", sentence: "She received a Compliment on her dress.", definition: "An expression of praise or admiration (noun/verb).", category: "Subtle Distinctions L6", level: 6 },
    { text: "Perseverance", sentence: "Perseverance is key to achieving goals.", definition: "Persistence in doing something despite difficulty.", category: "Mixed Difficulty L6", level: 6 }, // Adv R, Difficult Sibilants
    { text: "Inconspicuous", sentence: "He tried to remain Inconspicuous in the crowd.", definition: "Not clearly visible or attracting attention.", category: "Mixed Difficulty L6", level: 6 }, // Difficult Sibilants, Complex Clusters
    { text: "Miscellaneous", sentence: "The drawer contained Miscellaneous items.", definition: "Consisting of various types.", category: "Mixed Difficulty L6", level: 6 }, // Adv L, Difficult Sibilants
    { text: "Simplicity", sentence: "There is beauty in Simplicity.", definition: "The quality or condition of being easy to understand or do.", category: "Mixed Difficulty L6", level: 6 }, // Difficult Sibilants, Adv L
    { text: "Thoroughly", sentence: "Read the instructions Thoroughly.", definition: "Completely; very much.", category: "Mixed Difficulty L6", level: 6 }, // Adv R, Difficult TH
    { text: "Exaggerate", sentence: "Don't Exaggerate the story.", definition: "To represent something as being larger or greater than it really is.", category: "Mixed Difficulty L6", level: 6 }, // Difficult Sibilants, Adv R, Difficult J
    { text: "Psychology", sentence: "Psychology studies the human mind and behavior.", definition: "The scientific study of the human mind and its functions.", category: "Mixed Difficulty L6", level: 6 }, // Difficult Sibilants, Adv L, Difficult J
    { text: "Authorization", sentence: "You need Authorization to access this area.", definition: "Official permission or approval.", category: "Mixed Difficulty L6", level: 6 }, // Difficult TH, Difficult Sibilants, Adv R
    // --- Level 7 ---
    // (Adding a few examples)
    { text: "Exacerbate", sentence: "Don't Exacerbate the problem.", definition: "To make a problem or bad situation worse.", category: "Complex Sequences L7", level: 7 },
    { text: "Exclusively", sentence: "This offer is Exclusively for members.", definition: "Only; restricted to certain people or things.", category: "Complex Sequences L7", level: 7 },
    { text: "Worcestershire", sentence: "Pass the Worcestershire sauce, please.", definition: "A type of sauce (difficult to pronounce).", category: "Advanced Rhotics/Laterals L7", level: 7 },
    { text: "Prerogative", sentence: "Choosing the movie is my Prerogative.", definition: "A special right or privilege.", category: "Advanced Rhotics/Laterals L7", level: 7 },
    { text: "Statistical", sentence: "Provide a Statistical analysis.", definition: "Relating to statistics (facts and figures).", category: "Complex Sibilants/Affricates L7", level: 7 },
    { text: "Anesthetist", sentence: "The Anesthetist monitors the patient.", definition: "A medical specialist who administers anesthesia.", category: "Complex Sibilants/Affricates L7", level: 7 },
    { text: "Thistle", sentence: "A Thistle is a prickly plant.", definition: "A prickly plant.", category: "Challenging TH L7", level: 7 },
    { text: "Thoroughfare", sentence: "Main Street is a busy Thoroughfare.", definition: "A main road or route.", category: "Challenging TH L7", level: 7 },
    { text: "Idiosyncrasy", sentence: "His messy room was an Idiosyncrasy.", definition: "A peculiar habit or feature.", category: "Abstract Nouns L7", level: 7 },
    { text: "Ubiquity", sentence: "Note the Ubiquity of smartphones.", definition: "The state of being present everywhere.", category: "Abstract Nouns L7", level: 7 },
    { text: "Indistinguishable", sentence: "The twins were nearly Indistinguishable.", definition: "Impossible to tell apart.", category: "Complex Adj/Adv L7", level: 7 },
    { text: "Uncharacteristically", sentence: "He was Uncharacteristically quiet today.", definition: "In a way not typical of someone's character.", category: "Complex Adj/Adv L7", level: 7 },
    { text: "Ephemeral", sentence: "Fame can be Ephemeral.", definition: "Lasting for a very short time.", category: "Low Frequency L7", level: 7 },
    { text: "Quixotic", sentence: "His plans were idealistic and Quixotic.", definition: "Idealistic but impractical.", category: "Low Frequency L7", level: 7 },
    { text: "Itinerary", sentence: "Check the flight Itinerary.", definition: "A planned route or schedule for a journey.", category: "Precision/Agility L7", level: 7 },
    { text: "Veterinarian", sentence: "Take your sick pet to the Veterinarian.", definition: "An animal doctor.", category: "Precision/Agility L7", level: 7 },
    { text: "Mitochondria", sentence: "Mitochondria are the powerhouses of the cell.", definition: "Parts of a cell that generate energy.", category: "Advanced Sci/Tech L7", level: 7 },
    { text: "Photosynthesize", sentence: "Plants Photosynthesize to create energy.", definition: "To perform photosynthesis (verb).", category: "Advanced Sci/Tech L7", level: 7 },
    { text: "Massachusetts", sentence: "Boston is the capital of Massachusetts.", definition: "A state in the northeastern USA.", category: "Difficult Places L7", level: 7 },
    { text: "Mississippi", sentence: "The Mississippi River is very long.", definition: "A large river and a state in the USA.", category: "Difficult Places L7", level: 7 },
    { text: "Exemplary", sentence: "Her behavior was Exemplary.", definition: "Serving as a desirable model; representing the best of its kind.", category: "Complex Sequences L7", level: 7 },
    { text: "Excruciating", sentence: "The pain was Excruciating.", definition: "Intensely painful.", category: "Complex Sequences L7", level: 7 },
    { text: "Exterior", sentence: "Paint the Exterior of the house.", definition: "The outer surface or structure of something.", category: "Complex Sequences L7", level: 7 },
    { text: "Ruralization", sentence: "Ruralization is the opposite of urbanization.", definition: "The process of becoming more rural.", category: "Advanced Rhotics/Laterals L7", level: 7 },
    { text: "Arbitrarily", sentence: "The rules were applied Arbitrarily.", definition: "Based on random choice or personal whim, rather than any reason or system.", category: "Advanced Rhotics/Laterals L7", level: 7 },
    { text: "Literary", sentence: "She studied Literary criticism.", definition: "Concerning the writing, study, or content of literature.", category: "Advanced Rhotics/Laterals L7", level: 7 },
    { text: "Collaborator", sentence: "He was a key Collaborator on the project.", definition: "A person who works jointly on an activity or project.", category: "Advanced Rhotics/Laterals L7", level: 7 }, // Also Advanced L
    { text: "Circumstantial", sentence: "The evidence was purely Circumstantial.", definition: "Pointing indirectly toward someone's guilt but not conclusively proving it.", category: "Complex Sibilants/Affricates L7", level: 7 }, // Also R/L
    { text: "Juxtaposition", sentence: "The Juxtaposition of colors was striking.", definition: "The fact of two things being seen or placed close together with contrasting effect.", category: "Complex Sibilants/Affricates L7", level: 7 },
    { text: "Prestigious", sentence: "She attended a Prestigious university.", definition: "Inspiring respect and admiration; having high status.", category: "Complex Sibilants/Affricates L7", level: 7 },
    { text: "Acquiesce", sentence: "He will Acquiesce to their demands.", definition: "To accept something reluctantly but without protest.", category: "Complex Sibilants/Affricates L7", level: 7 },
    { text: "Clothes", sentence: "Put on your warm Clothes.", definition: "Items worn to cover the body (often difficult due to 'th' and 'z' sounds together).", category: "Challenging TH L7", level: 7 },
    { text: "Bequeath", sentence: "He decided to Bequeath his fortune to charity.", definition: "To leave property to a person or other beneficiary by a will.", category: "Challenging TH L7", level: 7 },
    { text: "Notwithstanding", sentence: "Notwithstanding the bad weather, the event went ahead.", definition: "In spite of.", category: "Challenging TH L7", level: 7 },
    { text: "Ambiguity", sentence: "The Ambiguity of the statement caused confusion.", definition: "Uncertainty or inexactness of meaning in language.", category: "Abstract Nouns L7", level: 7 },
    { text: "Conundrum", sentence: "This ethical Conundrum is difficult to solve.", definition: "A confusing and difficult problem or question.", category: "Abstract Nouns L7", level: 7 },
    { text: "Vicissitude", sentence: "They remained friends through the Vicissitudes of life.", definition: "A change of circumstances or fortune, typically one that is unwelcome or unpleasant.", category: "Abstract Nouns L7", level: 7 },
    { text: "Paradigm", sentence: "This discovery represents a Paradigm shift.", definition: "A typical example or pattern of something; a model.", category: "Abstract Nouns L7", level: 7 },
    { text: "Unequivocally", sentence: "She stated Unequivocally that she was innocent.", definition: "In a way that leaves no doubt.", category: "Complex Adj/Adv L7", level: 7 },
    { text: "Indefatigable", sentence: "She was an Indefatigable campaigner for human rights.", definition: "Persisting tirelessly.", category: "Complex Adj/Adv L7", level: 7 },
    { text: "Surreptitiously", sentence: "He Surreptitiously slipped the note into her hand.", definition: "In a way that attempts to avoid notice or attention; secretively.", category: "Complex Adj/Adv L7", level: 7 }, // Also R/L, Sibilants
    { text: "Obsequious", sentence: "They were served by Obsequious waiters.", definition: "Obedient or attentive to an excessive or servile degree.", category: "Low Frequency L7", level: 7 },
    { text: "Pernicious", sentence: "The Pernicious effects of jealousy.", definition: "Having a harmful effect, especially in a gradual or subtle way.", category: "Low Frequency L7", level: 7 },
    { text: "Salubrious", sentence: "The Salubrious mountain air.", definition: "Health-giving; healthy.", category: "Low Frequency L7", level: 7 },
    { text: "Pulchritudinous", sentence: "She was praised for her Pulchritudinous appearance.", definition: "Beautiful.", category: "Low Frequency L7", level: 7 },
    { text: "Anachronism", sentence: "The sword is an Anachronism in the modern play.", definition: "Something belonging to a period other than that in which it exists.", category: "Precision/Agility L7", level: 7 },
    { text: "Onomatopoeia", sentence: "'Buzz' and 'hiss' are examples of Onomatopoeia.", definition: "The formation of a word from a sound associated with what is named.", category: "Precision/Agility L7", level: 7 },
    { text: "Otorhinolaryngologist", sentence: "An Otorhinolaryngologist specializes in ear, nose, and throat conditions.", definition: "An ear, nose, and throat doctor.", category: "Precision/Agility L7", level: 7 }, // Also Sci/Tech
    { text: "Archaeologist", sentence: "The Archaeologist discovered ancient artifacts.", definition: "A person who studies human history through excavation and analysis of artifacts.", category: "Precision/Agility L7", level: 7 }, // Also Sci/Tech
    { text: "Algorithm", sentence: "The search engine uses a complex Algorithm.", definition: "A process or set of rules to be followed in calculations or problem-solving.", category: "Advanced Sci/Tech L7", level: 7 },
    { text: "Hemoglobin", sentence: "Hemoglobin carries oxygen in the blood.", definition: "A protein in red blood cells that transports oxygen.", category: "Advanced Sci/Tech L7", level: 7 },
    { text: "Neurotransmitter", sentence: "Serotonin is a Neurotransmitter.", definition: "A chemical messenger that transmits signals across a nerve synapse.", category: "Advanced Sci/Tech L7", level: 7 },
    { text: "Spectroscopy", sentence: "Spectroscopy is used to analyze material composition.", definition: "The study of the interaction between matter and electromagnetic radiation.", category: "Advanced Sci/Tech L7", level: 7 },
    { text: "Connecticut", sentence: "Hartford is the capital of Connecticut.", definition: "A state in the northeastern USA.", category: "Difficult Places L7", level: 7 },
    { text: "Albuquerque", sentence: "Albuquerque is a major city in New Mexico.", definition: "A city in New Mexico, USA.", category: "Difficult Places L7", level: 7 },
    { text: "Schenectady", sentence: "Schenectady is a city in New York state.", definition: "A city in New York, USA.", category: "Difficult Places L7", level: 7 },
    { text: "Leicester", sentence: "Leicester is a city in England.", definition: "A city in the East Midlands of England.", category: "Difficult Places L7", level: 7 },
    { text: "Procrastinate", sentence: "Don't Procrastinate on your homework.", definition: "To delay or postpone action; put off doing something.", category: "Mixed Difficulty L7", level: 7 },
    { text: "Hierarchy", sentence: "Understand the company Hierarchy.", definition: "A system in which members are ranked according to status or authority.", category: "Mixed Difficulty L7", level: 7 },
    { text: "Incongruous", sentence: "The modern furniture looked Incongruous in the old house.", definition: "Not in harmony or keeping with the surroundings.", category: "Mixed Difficulty L7", level: 7 },
    { text: "Maneuverability", sentence: "The small car has excellent Maneuverability.", definition: "The quality of being easy to move and steer.", category: "Mixed Difficulty L7", level: 7 },
    { text: "Susceptible", sentence: "Young children are Susceptible to colds.", definition: "Likely or liable to be influenced or harmed by a particular thing.", category: "Mixed Difficulty L7", level: 7 },
    { text: "Remuneration", sentence: "The job offers competitive Remuneration.", definition: "Money paid for work or a service.", category: "Mixed Difficulty L7", level: 7 },
    { text: "Serendipity", sentence: "Finding the rare book was pure Serendipity.", definition: "The occurrence of events by chance in a happy or beneficial way.", category: "Mixed Difficulty L7", level: 7 },
    { text: "Superfluous", sentence: "Remove any Superfluous information.", definition: "Unnecessary, especially through being more than enough.", category: "Mixed Difficulty L7", level: 7 },
    { text: "Gregarious", sentence: "He was a popular and Gregarious man.", definition: "Fond of company; sociable.", category: "Mixed Difficulty L7", level: 7 },
    { text: "Lackadaisical", sentence: "His Lackadaisical attitude annoyed his boss.", definition: "Lacking enthusiasm and determination; carelessly lazy.", category: "Mixed Difficulty L7", level: 7 },
    { text: "Sesquipedalian", sentence: "He uses overly Sesquipedalian language.", definition: "Characterized by long words; long-winded.", category: "Mixed Difficulty L7", level: 7 },
    { text: "Disinterested", sentence: "We need a Disinterested third party to judge.", definition: "Not influenced by considerations of personal advantage; impartial.", category: "Mixed Difficulty L7", level: 7 } // Subtle Distinction from 'uninterested'
];


// ===== CORE FUNCTIONS =====
function filterVocabulary() {
    const selectedLevel = elements.levelSelect.value;

    stopAllActivity(); // Stop any activity before filtering

    if (selectedLevel === 'all') {
        appState.filteredVocabularyData = [...vocabularyData]; // Use a copy of all words
    } else {
        const levelNum = parseInt(selectedLevel, 10);
        appState.filteredVocabularyData = vocabularyData.filter(item => item.level === levelNum);
    }

    // Reset index and update display after filtering
    appState.currentWordIndex = 0;

    if (appState.filteredVocabularyData.length === 0 && selectedLevel !== 'all') {
        // Handle case where a level might have no words (show warning and switch to 'all')
        showError(`No words found for Level ${selectedLevel}. Showing all levels.`, 'word'); // Show error in word section
        elements.levelSelect.value = 'all'; // Reset dropdown
        appState.filteredVocabularyData = [...vocabularyData]; // Ensure it falls back to all data
    }

    // Update total count display FIRST
    elements.totalWordsDisplay.textContent = appState.filteredVocabularyData.length;

    // THEN update the content display
    if (appState.filteredVocabularyData.length > 0) {
        displayCurrentContent();
    } else {
        // Handle the case where even 'all' might somehow be empty (edge case)
        elements.currentWordDisplay.textContent = "N/A";
        elements.currentSentenceDisplay.textContent = "No vocabulary loaded.";
        elements.currentDefinitionDisplay.textContent = "";
        elements.wordNumberDisplay.textContent = 0;
        ['word', 'sentence', 'definition'].forEach(resetSectionUI);
        // Disable navigation if no words
        elements.prevWordBtn.disabled = true;
        elements.nextWordBtn.disabled = true;
    }
}
/**
 * Initialize the application when the page loads
 */
function initApp() {
    // Add event listener for the level selector FIRST
    elements.levelSelect.addEventListener('change', filterVocabulary);

    // Initial filter based on default dropdown value
    filterVocabulary(); // This now also calls displayCurrentContent and updates total words

    // Initialize speech recognition for each section
    initSpeechRecognition('word');
    initSpeechRecognition('sentence');
    initSpeechRecognition('definition');

    // Event listener for permissions overlay
    elements.permissionsOkBtn.addEventListener('click', () => {
        elements.permissionsOverlay.classList.add('hidden');
    });

    // Show permissions overlay if needed (simplified check)
    if (navigator.permissions) {
        navigator.permissions.query({ name: 'microphone' }).then(permissionStatus => {
            if (permissionStatus.state === 'prompt') {
                setTimeout(() => {
                    elements.permissionsOverlay.classList.remove('hidden');
                }, 1000);
            }
            // Handle changes in permission status if needed
            permissionStatus.onchange = () => {
                 if (permissionStatus.state !== 'granted' && permissionStatus.state !== 'prompt') { // Avoid showing error during prompt
                    showError("Microphone permission is needed. Please allow access.", 'word'); // Show in word section
                 }
            };
        }).catch(err => {
             console.warn("Permission query failed:", err);
             // Fallback for browsers not supporting Permissions API query reliably
             setTimeout(() => {
                // Basic check if we can get user media later to decide overlay
             }, 1000);
        });
    } else {
         // Fallback for browsers not supporting Permissions API
         console.warn("Permissions API not supported.");
         // Show overlay as a fallback, user interaction will trigger actual prompt
          setTimeout(() => {
            elements.permissionsOverlay.classList.remove('hidden');
        }, 1000);
    }


    // Feature detection for required APIs
    checkBrowserSupport();

    // Add event listeners for all buttons (moved setupListeners call here for clarity)
    setupEventListeners();

    // Update total words display (This is now handled within filterVocabulary)
    // elements.totalWordsDisplay.textContent = appState.filteredVocabularyData.length;
}

/**
 * Check browser support for required APIs
 */
function checkBrowserSupport() {
    let warnings = [];
    const hasSpeechRecognition = 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
    const hasMediaRecorder = 'MediaRecorder' in window;
    const hasSpeechSynthesis = 'speechSynthesis' in window;

    if (!hasSpeechRecognition) {
        warnings.push("Speech recognition not supported. Practice speaking won't work.");
        disableButtonsInSection('word', ['.start-btn']);
        disableButtonsInSection('sentence', ['.start-btn']);
        disableButtonsInSection('definition', ['.start-btn']);
    }
    if (!hasMediaRecorder) {
        warnings.push("Audio recording not supported. 'Play My Voice' won't work.");
        disableButtonsInSection('word', ['.start-btn', '.stop-btn', '.playback-btn']);
        disableButtonsInSection('sentence', ['.start-btn', '.stop-btn', '.playback-btn']);
        disableButtonsInSection('definition', ['.start-btn', '.stop-btn', '.playback-btn']);
    }
    if (!hasSpeechSynthesis) {
        warnings.push("Text-to-speech not supported. 'Listen' button won't work.");
        disableButtonsInSection('word', ['.listen-btn']);
        disableButtonsInSection('sentence', ['.listen-btn']);
        disableButtonsInSection('definition', ['.listen-btn']);
    }

    if (warnings.length > 0) {
        // Display a general error in one place, e.g., the word feedback area
        showError(warnings.join(' '), 'word');
    }
}

/** Helper to disable buttons in a section */
function disableButtonsInSection(section, selectors) {
    selectors.forEach(selector => {
        const btn = document.querySelector(`${selector}[data-section="${section}"]`);
        if (btn) btn.disabled = true;
    });
}


/**
 * Display the current word, sentence, and definition
 */
function displayCurrentContent() {
    // Use the filtered data array
    if (appState.filteredVocabularyData.length === 0 || appState.currentWordIndex >= appState.filteredVocabularyData.length) {
         console.warn("Attempting to display content with invalid index or empty filtered list.");
         // Optionally display a "No words for this level" message here
         elements.currentWordDisplay.textContent = "N/A";
         elements.currentSentenceDisplay.textContent = "No words available for this level.";
         elements.currentDefinitionDisplay.textContent = "";
         elements.wordNumberDisplay.textContent = 0;
         // Disable navigation buttons if no content
         elements.prevWordBtn.disabled = true;
         elements.nextWordBtn.disabled = true;
         return; // Prevent errors
    }
    const currentEntry = appState.filteredVocabularyData[appState.currentWordIndex]; // <-- USE FILTERED DATA

    elements.currentWordDisplay.textContent = currentEntry.text;
    elements.currentSentenceDisplay.textContent = currentEntry.sentence;
    elements.currentDefinitionDisplay.textContent = currentEntry.definition;

    // Update word number display
    elements.wordNumberDisplay.textContent = appState.currentWordIndex + 1;

    // Reset UI elements for all sections
    ['word', 'sentence', 'definition'].forEach(section => {
        resetSectionUI(section);
    });

    // Enable/Disable navigation buttons based on index and filtered list length
    elements.prevWordBtn.disabled = appState.currentWordIndex === 0;
    elements.nextWordBtn.disabled = appState.currentWordIndex >= appState.filteredVocabularyData.length - 1;
}

/**
 * Reset UI elements for a specific section
 */
function resetSectionUI(section) {
    const speechResultEl = elements.getSpeechResultElement(section);
    const feedbackEl = elements.getFeedbackElement(section);
    const playbackBtn = elements.getPlaybackBtn(section);
    const stopBtn = elements.getStopBtn(section);
    const startBtn = elements.getStartBtn(section);

    if (speechResultEl) {
        speechResultEl.innerHTML = `<p class="placeholder">Your ${section} will appear here.</p>`;
    }
    if (feedbackEl) {
        feedbackEl.textContent = '';
        feedbackEl.className = 'feedback-message';
    }

    // Clean up previous audio URL if it exists
    if (appState.sections[section].audioUrl) {
        URL.revokeObjectURL(appState.sections[section].audioUrl);
        appState.sections[section].audioUrl = null;
        appState.sections[section].audioBlob = null;
    }
    if (playbackBtn) playbackBtn.disabled = true;
    if (stopBtn) stopBtn.disabled = true;
    // Only enable start button if browser supports the necessary APIs
     if (startBtn && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) && ('MediaRecorder' in window)) {
        startBtn.disabled = false;
    }
}


/**
 * Navigate to the previous word
 */
function previousWord() {
    // Use the filtered data array length
    if (appState.currentWordIndex > 0) {
        stopAllActivity(); // Stop activity before navigating
        appState.currentWordIndex--;
        displayCurrentContent();
    }
}

/**
 * Navigate to the next word
 */
function nextWord() {
    // Use the filtered data array length
    if (appState.currentWordIndex < appState.filteredVocabularyData.length - 1) { // <-- USE FILTERED DATA LENGTH
        stopAllActivity(); // Stop activity before navigating
        appState.currentWordIndex++;
        displayCurrentContent();
    }
}

/**
 * Stop any active recording or speech synthesis
 */
function stopAllActivity() {
     window.speechSynthesis.cancel(); // Stop any text-to-speech
     ['word', 'sentence', 'definition'].forEach(section => {
        if (appState.sections[section].isRecording) {
            stopRecording(section);
        }
         if (appState.sections[section].speechRecognitionActive && appState.sections[section].recognition) {
             try { appState.sections[section].recognition.abort(); } catch(e) {}
             appState.sections[section].speechRecognitionActive = false;
         }
         // Ensure buttons are reset visually if needed
         const listenBtn = elements.getListenBtn(section);
         if (listenBtn) listenBtn.classList.remove('active');
         const playbackBtn = elements.getPlaybackBtn(section);
         if (playbackBtn) playbackBtn.classList.remove('active');
     });
     appState.activeSection = null;
}


/**
 * Play the model audio for the specified section (word, sentence, or definition)
 */
function playModelAudio(section) {
    try {
        // Ensure there's data to play from.
        if (appState.filteredVocabularyData.length === 0) {
            console.warn("No filtered vocabulary data to play.");
            showError(`No vocabulary loaded to play the ${section}.`, section);
            return;
        }
        // Ensure the currentWordIndex is valid.
        if (appState.currentWordIndex < 0 || appState.currentWordIndex >= appState.filteredVocabularyData.length) {
            console.warn(`Invalid currentWordIndex: ${appState.currentWordIndex}`);
            showError(`Cannot play ${section}, invalid item selected.`, section);
            return;
        }

        const currentEntry = appState.filteredVocabularyData[appState.currentWordIndex];
        let audioPath = null;
        let textToSpeakForTTS = null; // For fallback to Text-to-Speech

        // Determine the audio path and fallback text based on the section
        switch (section) {
            case 'word':
                if (currentEntry.audioWordPath) {
                    audioPath = currentEntry.audioWordPath;
                } else {
                    textToSpeakForTTS = currentEntry.text; // Fallback text for word
                }
                break;
            case 'sentence':
                if (currentEntry.audioSentencePath) {
                    audioPath = currentEntry.audioSentencePath;
                } else {
                    textToSpeakForTTS = currentEntry.sentence; // Fallback text for sentence
                }
                break;
            case 'definition':
                if (currentEntry.audioDefinitionPath) { // Check for custom definition audio
                    audioPath = currentEntry.audioDefinitionPath;
                } else {
                    textToSpeakForTTS = currentEntry.definition; // Fallback text for definition
                }
                break;
            default:
                console.error("Invalid section for audio playback:", section);
                showError(`Cannot play audio for an unknown section: ${section}.`, 'word'); // Show general error
                return;
        }

        // Cancel any ongoing speech synthesis or audio playback
        window.speechSynthesis.cancel();
        // If you manage a global audio player instance, stop it here:
        // if (globalAudioPlayer && !globalAudioPlayer.paused) {
        //     globalAudioPlayer.pause();
        //     globalAudioPlayer.currentTime = 0;
        // }

        const listenBtn = elements.getListenBtn(section); // Get the listen button for the current section

        if (audioPath) {
            // Play custom audio file
            const customAudio = new Audio(audioPath);
            // globalAudioPlayer = customAudio; // Assign to global player if managing one

            customAudio.onplay = () => {
                if (listenBtn) listenBtn.classList.add('active');
            };
            customAudio.onended = () => {
                if (listenBtn) listenBtn.classList.remove('active');
            };
            customAudio.onerror = (event) => {
                console.error(`Error playing custom audio for ${section} from ${audioPath}:`, event);
                if (listenBtn) listenBtn.classList.remove('active');
                showError(`Problem playing your audio for ${section}. Check file path or file.`, section);
                // Optional: Fallback to TTS if custom audio fails and fallback text is available
                if (textToSpeakForTTS && ('speechSynthesis' in window)) {
                    console.log(`Falling back to TTS for ${section} due to custom audio error.`);
                    playTTS(textToSpeakForTTS, section, listenBtn);
                }
            };

            const playPromise = customAudio.play();
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    console.error(`Play promise rejected for custom audio ${section} from ${audioPath}:`, error);
                    if (listenBtn) listenBtn.classList.remove('active');
                    showError(`Could not play your audio for ${section}. Browser may have blocked it.`, section);
                     // Optional: Fallback to TTS
                    if (textToSpeakForTTS && ('speechSynthesis' in window)) {
                        console.log(`Falling back to TTS for ${section} due to play promise rejection.`);
                        playTTS(textToSpeakForTTS, section, listenBtn);
                    }
                });
            }

        } else if (textToSpeakForTTS && ('speechSynthesis' in window)) {
            // Fallback to Text-to-Speech if no custom audio path and TTS is supported
            playTTS(textToSpeakForTTS, section, listenBtn);
        } else {
            // No custom audio and no TTS fallback (or TTS not supported)
            console.warn(`No custom audio path and no fallback text (or TTS not supported) for ${section}.`);
            showError(`No audio available for this ${section}.`, section);
            if (listenBtn) listenBtn.classList.remove('active'); // Ensure button is not stuck in active state
        }

    } catch (error) {
        console.error(`Error in playModelAudio for ${section}:`, error);
        showError(`Could not play audio for ${section}. An unexpected error occurred.`, section);
        const listenBtn = elements.getListenBtn(section);
        if (listenBtn) listenBtn.classList.remove('active');
    }
}
// Helper function for Text-to-Speech (extracted and used for fallback)
function playTTS(textToSpeak, section, listenBtnElement) {
    if (!textToSpeak || textToSpeak.trim() === "") {
        console.warn(`TTS requested for ${section}, but no text was provided.`);
        if (listenBtnElement) listenBtnElement.classList.remove('active');
        showError(`No text to speak for the ${section}.`, section);
        return;
    }

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.rate = (section === 'definition') ? 0.9 : 0.8; // Slower for definition
    utterance.pitch = 1.2;
    utterance.lang = 'en-US'; // Explicitly set language

    // Voice selection logic
    const voices = window.speechSynthesis.getVoices();
    if (voices.length === 0 && window.speechSynthesis.onvoiceschanged !== undefined) {
        // Voices might load asynchronously
        window.speechSynthesis.onvoiceschanged = () => {
            const updatedVoices = window.speechSynthesis.getVoices();
            const englishVoices = updatedVoices.filter(voice => voice.lang.startsWith('en-'));
            if (englishVoices.length > 0) {
                // Prefer a female voice if available, otherwise first English voice
                const femaleVoices = englishVoices.filter(voice => /female|zira|samantha|eva/i.test(voice.name.toLowerCase()));
                utterance.voice = femaleVoices.length > 0 ? femaleVoices[0] : englishVoices[0];
            }
            window.speechSynthesis.speak(utterance);
        };
        // Trigger loading if onvoiceschanged is not immediately fired by some browsers
        if (speechSynthesis.getVoices().length === 0) {
             // Some browsers might need a speak call to trigger voice list loading
             // This is a bit of a hack, but can sometimes help.
             // speechSynthesis.speak(new SpeechSynthesisUtterance(''));
             // speechSynthesis.cancel();
        }
    } else if (voices.length > 0) {
        const englishVoices = voices.filter(voice => voice.lang.startsWith('en-'));
        if (englishVoices.length > 0) {
            const femaleVoices = englishVoices.filter(voice => /female|zira|samantha|eva/i.test(voice.name.toLowerCase()));
            utterance.voice = femaleVoices.length > 0 ? femaleVoices[0] : englishVoices[0];
        }
        window.speechSynthesis.speak(utterance);
    } else {
        // No voices and onvoiceschanged not supported or didn't fire
        console.warn("Speech synthesis voices not available. Using default voice.");
        window.speechSynthesis.speak(utterance); // Speak with default voice
    }

    // Event handlers for the utterance
    utterance.onstart = () => {
        if (listenBtnElement) listenBtnElement.classList.add('active');
    };
    utterance.onend = () => {
        if (listenBtnElement) listenBtnElement.classList.remove('active');
    };
    utterance.onerror = (event) => {
        console.error(`Speech synthesis error for ${section}:`, event);
        if (listenBtnElement) listenBtnElement.classList.remove('active');
        showError(`Problem playing computer voice for ${section}. Error: ${event.error}`, section);
    };
}

/**
 * Initialize the speech recognition object for a specific section
 */
function initSpeechRecognition(section) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return; // Already checked in checkBrowserSupport

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 3;

    // Attach event handlers specific to the section
    recognition.onresult = (event) => handleSpeechResult(event, section);
    recognition.onerror = (event) => handleSpeechError(event, section);
    recognition.onend = () => handleSpeechEnd(section);

    appState.sections[section].recognition = recognition;
}

/**
 * Start the speech recognition process for a specific section
 */
function startSpeechRecognition(section) {
    const recognition = appState.sections[section].recognition;
    if (!recognition) {
        showError("Speech recognition not initialized.", section);
        return;
    }
    try {
        // Abort if already active for this section
        if (appState.sections[section].speechRecognitionActive) {
            recognition.abort();
        }
        recognition.start();
        appState.sections[section].speechRecognitionActive = true;
    } catch (error) {
        console.error(`Speech recognition error for ${section}:`, error);
        appState.sections[section].speechRecognitionActive = false;
        showError(`Problem starting speech recognition for ${section}.`, section);
    }
}

/**
 * Handle the result from speech recognition for a specific section
 */
function handleSpeechResult(event, section) {
    appState.sections[section].speechRecognitionActive = false;
    const speechResultEl = elements.getSpeechResultElement(section);

    try {
        // Use the filtered data array
        if (appState.filteredVocabularyData.length === 0) return; // Add check for empty filtered list
        const currentEntry = appState.filteredVocabularyData[appState.currentWordIndex]; // <-- USE FILTERED DATA
        let targetText = '';
        switch (section) {
            case 'word': targetText = currentEntry.text; break;
            case 'sentence': targetText = currentEntry.sentence; break;
            case 'definition': targetText = currentEntry.definition; break;
        }

        let speechResultText = "";
        if (event.results && event.results.length > 0 && event.results[0].length > 0) {
            speechResultText = event.results[0][0].transcript; // Keep case for display, lowercase for compare
        } else {
            throw new Error("No speech results detected");
        }

        speechResultEl.innerHTML = `<p>${speechResultText}</p>`;
        compareAndGiveFeedback(targetText, speechResultText, section);

    } catch (error) {
        console.error(`Error processing speech results for ${section}:`, error);
        if (speechResultEl) { // Check if element exists before modifying
            speechResultEl.innerHTML = `<p class="error">Sorry, I couldn't understand that. Please try again.</p>`;
        }
    }
}

/**
 * Compare the recognized speech with the target text and provide feedback for a section
 */
function compareAndGiveFeedback(targetText, spokenText, section) {
    const feedbackEl = elements.getFeedbackElement(section);
    targetText = targetText.toLowerCase().trim().replace(/[.,!?]/g, ''); // Normalize target
    spokenText = spokenText.toLowerCase().trim().replace(/[.,!?]/g, ''); // Normalize spoken

    const similarity = calculateSimilarity(targetText, spokenText);

    if (similarity > 0.8) {
        feedbackEl.textContent = "Great job! 🌟";
        feedbackEl.className = 'feedback-message feedback-success';
    } else if (similarity > 0.6) {
        feedbackEl.textContent = "Good try! Let's practice again. 😊";
        feedbackEl.className = 'feedback-message'; // Neutral feedback style
    } else {
        feedbackEl.textContent = "Keep practicing! Try again. 💪";
        feedbackEl.className = 'feedback-message feedback-error';
    }
}

/**
 * Calculate Levenshtein distance (implementation remains the same)
 */
function levenshteinDistance(str1, str2) {
    if (str1 === str2) return 0;
    if (!str1 || str1.length === 0) return str2 ? str2.length : 0;
    if (!str2 || str2.length === 0) return str1.length;

    const m = str1.length;
    const n = str2.length;
    const dp = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));

    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;

    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
            dp[i][j] = Math.min(
                dp[i - 1][j] + 1,     // Deletion
                dp[i][j - 1] + 1,     // Insertion
                dp[i - 1][j - 1] + cost // Substitution
            );
        }
    }
    return dp[m][n];
}


/**
 * Calculate similarity score based on Levenshtein distance
 */
function calculateSimilarity(str1, str2) {
    const maxLength = Math.max(str1.length, str2.length);
    if (maxLength === 0) return 1.0; // Both empty
    const distance = levenshteinDistance(str1, str2);
    return 1.0 - (distance / maxLength);
}


/**
 * Handle speech recognition errors for a specific section
 */
function handleSpeechError(event, section) {
    appState.sections[section].speechRecognitionActive = false;
    console.error(`Speech recognition error for ${section}:`, event.error);

    let errorMessage = `Problem with speech recognition for ${section}: `;
    switch (event.error) {
        case 'no-speech': errorMessage += "No speech detected."; break;
        case 'audio-capture': errorMessage += "Microphone not working."; break;
        case 'not-allowed':
            errorMessage += "Microphone permission denied.";
            elements.permissionsOverlay.classList.remove('hidden');
            break;
        case 'network': errorMessage += "Network error."; break;
        case 'aborted': return; // Expected, do nothing
        default: errorMessage += "Please try again.";
    }
    showError(errorMessage, section);
    // Ensure UI is reset if recording was active
    if (appState.sections[section].isRecording) {
        resetRecordingUI(section);
    }
}

/**
 * Handle speech recognition ending for a specific section
 */
function handleSpeechEnd(section) {
    appState.sections[section].speechRecognitionActive = false;
    // If recording stopped but no result came, show message
    const speechResultEl = elements.getSpeechResultElement(section);
    if (appState.sections[section].isRecording === false && // Check if recording is already stopped
        speechResultEl &&
        speechResultEl.querySelector('.placeholder')) {
           // Check if placeholder is still showing
           if (!speechResultEl.querySelector('p:not(.placeholder)')) {
                 speechResultEl.innerHTML = `<p class="error">I didn't hear anything clearly for the ${section}. Try again.</p>`;
           }
    }
     // Ensure stop button is disabled if recognition ends unexpectedly while recording
    if (appState.sections[section].isRecording) {
         elements.getStopBtn(section).disabled = false; // Keep stop enabled
    } else {
        elements.getStartBtn(section).disabled = false;
        elements.getStopBtn(section).disabled = true;
    }
}


/**
 * Start recording audio for a specific section
 */
function startRecording(section) {
    // Stop any other active recording/recognition first
    stopAllActivity();

    // Reset UI for the target section before starting
    resetSectionUI(section);

    appState.activeSection = section; // Set the currently active section
    const sectionState = appState.sections[section];
    sectionState.audioChunks = []; // Reset chunks for this section

    navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
            sectionState.stream = stream;
            sectionState.mediaRecorder = new MediaRecorder(stream);

            sectionState.mediaRecorder.ondataavailable = event => {
                if (event.data.size > 0) {
                    sectionState.audioChunks.push(event.data);
                }
            };
            sectionState.mediaRecorder.onstop = () => processRecording(section);
            sectionState.mediaRecorder.onerror = (event) => {
                console.error(`MediaRecorder error for ${section}:`, event);
                showError(`Problem recording ${section}.`, section);
                resetRecordingUI(section); // Reset UI on error
            };

            sectionState.mediaRecorder.start();
            sectionState.isRecording = true;

            // Update UI for this section
            elements.getStartBtn(section).disabled = true;
            elements.getStopBtn(section).disabled = false;
            elements.getPlaybackBtn(section).disabled = true; // Disable playback while recording

            // Start speech recognition for this section
            startSpeechRecognition(section);

        })
        .catch(error => {
            console.error(`Error accessing microphone for ${section}:`, error);
            let errorMsg = `Could not access microphone for ${section}. `;
            if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
                errorMsg += "Permission denied.";
                elements.permissionsOverlay.classList.remove('hidden');
            } else {
                errorMsg += "Check connection/settings.";
            }
            showError(errorMsg, section);
            appState.activeSection = null; // Clear active section on error
        });
}

/**
 * Stop recording audio for a specific section
 */
function stopRecording(section) {
    const sectionState = appState.sections[section];
    if (!sectionState.mediaRecorder || !sectionState.isRecording) return;

    try {
        sectionState.mediaRecorder.stop(); // This triggers onstop -> processRecording
        sectionState.isRecording = false;

        // Stop stream tracks
        if (sectionState.stream) {
            sectionState.stream.getTracks().forEach(track => track.stop());
            sectionState.stream = null;
        }

        // Stop speech recognition if active for this section
        if (sectionState.speechRecognitionActive && sectionState.recognition) {
             try { sectionState.recognition.stop(); } catch(e) { console.warn("Error stopping recognition:", e); } // Use stop instead of abort if possible
            sectionState.speechRecognitionActive = false;
        }


    } catch (error) {
        console.error(`Error stopping recording for ${section}:`, error);
        showError(`Problem stopping recording for ${section}.`, section);
    } finally {
         // Always reset UI regardless of errors during stop
        resetRecordingUI(section);
        appState.activeSection = null; // Clear active section
    }
}

/** Resets the recording buttons UI for a section */
function resetRecordingUI(section) {
     const startBtn = elements.getStartBtn(section);
     const stopBtn = elements.getStopBtn(section);
     // Only enable start button if browser supports the necessary APIs
     if (startBtn && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) && ('MediaRecorder' in window)) {
        startBtn.disabled = false;
     }
     if (stopBtn) stopBtn.disabled = true;
     // Playback button state is handled in processRecording
}


/**
 * Process the recording for a specific section after it stops
 */
function processRecording(section) {
    const sectionState = appState.sections[section];
    const playbackBtn = elements.getPlaybackBtn(section);

    try {
        if (sectionState.audioChunks.length === 0) {
            console.warn(`No audio chunks for ${section}`);
            if (playbackBtn) playbackBtn.disabled = true; // Ensure playback is disabled
            return;
        }

        const audioType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus') ? 'audio/webm;codecs=opus' : 'audio/webm';
        sectionState.audioBlob = new Blob(sectionState.audioChunks, { type: audioType });

        if (sectionState.audioBlob.size === 0) {
            console.warn(`Empty audio blob for ${section}`);
             if (playbackBtn) playbackBtn.disabled = true; // Ensure playback is disabled
            return;
        }

        // Clean up old URL if it exists
        if (sectionState.audioUrl) {
            URL.revokeObjectURL(sectionState.audioUrl);
        }
        sectionState.audioUrl = URL.createObjectURL(sectionState.audioBlob);

        if (playbackBtn) playbackBtn.disabled = false; // Enable playback

    } catch (error) {
        console.error(`Error processing recording for ${section}:`, error);
        showError(`Problem processing recording for ${section}.`, section);
        if (playbackBtn) playbackBtn.disabled = true;
         // Clean up URL if created before error
         if (sectionState.audioUrl) {
            URL.revokeObjectURL(sectionState.audioUrl);
            sectionState.audioUrl = null;
        }
        sectionState.audioBlob = null;
    } finally {
         sectionState.audioChunks = []; // Clear chunks after processing
    }
}

/**
 * Play back the recorded audio for a specific section
 */
function playbackRecording(section) {
    const sectionState = appState.sections[section];
    const playbackBtn = elements.getPlaybackBtn(section);

    if (!sectionState.audioUrl) {
        showError(`No recording available for ${section}.`, section);
        return;
    }

    try {
        const audio = new Audio(sectionState.audioUrl);

        audio.onplay = () => playbackBtn?.classList.add('active');
        audio.onended = () => playbackBtn?.classList.remove('active');
        audio.onerror = (error) => {
            console.error(`Error playing audio for ${section}:`, error);
            playbackBtn?.classList.remove('active');
            showError(`Could not play recording for ${section}.`, section);
        };

        const playPromise = audio.play();
        if (playPromise !== undefined) {
            playPromise.catch(error => {
                console.error(`Play promise rejected for ${section}:`, error);
                playbackBtn?.classList.remove('active');
                showError(`Could not play recording for ${section}.`, section);
            });
        }
    } catch (error) {
        console.error(`Error in playbackRecording for ${section}:`, error);
        showError(`Could not play recording for ${section}.`, section);
    }
}

/**
 * Display an error message in the specified section's feedback area
 */
function showError(message, section) {
    const feedbackEl = elements.getFeedbackElement(section);
    if (feedbackEl) {
        feedbackEl.textContent = message;
        feedbackEl.className = 'feedback-message feedback-error';
    } else {
        // Fallback if section-specific feedback area not found
        console.error("Fallback error:", message);
        // Optionally display in a general error area if you add one
    }
}

// ===== EVENT LISTENERS SETUP =====
function setupEventListeners() {
    // Navigation Buttons (These listeners are fine outside initApp, but ensure not duplicated)
    elements.prevWordBtn.addEventListener('click', previousWord);
    elements.nextWordBtn.addEventListener('click', nextWord);

    // Permissions Overlay OK Button
    elements.permissionsOkBtn.addEventListener('click', () => {
        elements.permissionsOverlay.classList.add('hidden');
    });

    // Add listeners for all section-specific action buttons
    document.querySelectorAll('.action-button').forEach(button => {
        const section = button.dataset.section;
        if (!section) return; // Skip buttons without a data-section attribute

        // Avoid adding listeners to the overlay's OK button here
        if (button.id === 'permissions-ok') return;

        if (button.classList.contains('listen-btn')) {
            button.addEventListener('click', () => playModelAudio(section));
        } else if (button.classList.contains('start-btn')) {
            button.addEventListener('click', () => startRecording(section));
        } else if (button.classList.contains('stop-btn')) {
            button.addEventListener('click', () => stopRecording(section));
        } else if (button.classList.contains('playback-btn')) {
            button.addEventListener('click', () => playbackRecording(section));
        }
    });

    // Initialize voices for speech synthesis (can also be done here or in initApp)
    if (window.speechSynthesis) {
        const loadVoices = () => {
            // Attempt to get voices. This helps trigger loading on some browsers.
             window.speechSynthesis.getVoices();
        };
        // Event handler for when voices change
        if (speechSynthesis.onvoiceschanged !== undefined) {
            speechSynthesis.onvoiceschanged = loadVoices;
        }
        // Call it once initially as well
        loadVoices();
    }
}

// ===== INITIALIZE APP =====
window.addEventListener('DOMContentLoaded', initApp);
