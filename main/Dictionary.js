// dictionary.js
const dictionary = {
    // Story 1: Hello World
    "hello": { pos: "interjection", definition: "A greeting", example: "Hello! How are you?", translation: "مرحبًا" },
    "world": { pos: "noun", definition: "The earth and everything in it", example: "The world is full of mysteries.", translation: "العالم" },
    "website": { pos: "noun", definition: "A site on the internet", example: "The website has many articles.", translation: "موقع" },
    "made": { pos: "verb", definition: "Created or built", example: "The cake was made yesterday.", translation: "صنع" },
    "welcome": { pos: "interjection", definition: "A greeting", example: "Welcome to the website!", translation: "مرحبًا بكم" },
    "learn": { pos: "verb", definition: "Acquire knowledge or skills", example: "You can learn Spanish online.", translation: "تعلم" },
    "languages": { pos: "noun", definition: "Systems of communication", example: "There are many languages in the world.", translation: "اللغات" },
    "interactive": { pos: "adjective", definition: "Allows user interaction", example: "This game is interactive.", translation: "تفاعلية" },
    "stories": { pos: "noun", definition: "Narratives or tales", example: "The website has interactive stories.", translation: "القصص" },
    "click": { pos: "verb", definition: "Press a button or link", example: "Click the button to start.", translation: "اضغط" },
    "word": { pos: "noun", definition: "A single unit of language", example: "Click on any word to see its meaning.", translation: "كلمة" },
    "translation": { pos: "noun", definition: "Rendering into another language", example: "See the translation of each word.", translation: "الترجمة" },
    "definition": { pos: "noun", definition: "Meaning of a word", example: "Check the definition in the dictionary.", translation: "التعريف" },

    // Story 2: The Lost Treasure
    "lost": { pos: "adjective", definition: "Unable to find one's way", example: "He was lost in the jungle.", translation: "ضائع" },
    "treasure": { pos: "noun", definition: "A quantity of valuable objects", example: "They discovered a hidden treasure.", translation: "كنز" },
    "ancient": { pos: "adjective", definition: "Very old; from a long time ago", example: "The ancient temple was still standing.", translation: "قديم" },
    "jungle": { pos: "noun", definition: "A dense forest in a tropical region", example: "The explorers walked through the jungle.", translation: "غابة" },
    "trap": { pos: "noun", definition: "A device or trick used to catch or deceive", example: "They fell into a trap set by the thieves.", translation: "فخ" },
    "puzzle": { pos: "noun", definition: "A problem or enigma to be solved", example: "The puzzle was very difficult.", translation: "لغز" },
    "professor": { pos: "noun", definition: "A teacher of the highest rank in a university", example: "Professor Evans is an expert in archaeology.", translation: "أستاذ جامعي" },
    "archaeologist": { pos: "noun", definition: "Someone who studies ancient civilizations", example: "The archaeologist discovered ancient artifacts.", translation: "عالم آثار" },
    "team": { pos: "noun", definition: "A group working together", example: "Her team won the competition.", translation: "فريق" },
    "journey": { pos: "noun", definition: "An act of traveling from one place to another", example: "The journey through the mountains took three days.", translation: "رحلة" },
    "determined": { pos: "adjective", definition: "Having made a firm decision and being resolved", example: "She was determined to finish the marathon.", translation: "مصمم" },

    // Story 3: The Quantum Paradox
    "quantum": { pos: "adjective", definition: "Relating to quantum theory in physics", example: "Quantum mechanics describes nature at the smallest scales.", translation: "كمي" },
    "entanglement": { pos: "noun", definition: "A phenomenon in quantum physics where particles remain connected", example: "Quantum entanglement allows particles to affect each other instantly.", translation: "تشابك" },
    "equation": { pos: "noun", definition: "A mathematical statement that two expressions are equal", example: "She solved the complex equation.", translation: "معادلة" },
    "anomaly": { pos: "noun", definition: "Something that deviates from the norm", example: "The test results showed an anomaly.", translation: "شذوذ" },
    "deja vu": { pos: "noun", definition: "A feeling of having already experienced the present situation", example: "She experienced a strong sense of deja vu.", translation: "إحساس بالماضي" },
    "observer": { pos: "noun", definition: "A person who watches or notices something", example: "The observer recorded the experiment.", translation: "مراقب" },

    // Story 4: The Forest Guardian
    "forest": { pos: "noun", definition: "A large area covered with trees", example: "He walked through the forest.", translation: "غابة" },
    "guardian": { pos: "noun", definition: "A person who protects something", example: "He is the guardian of the forest.", translation: "حارس" },
    "deer": { pos: "noun", definition: "A hoofed grazing animal", example: "The deer was injured in the forest.", translation: "غزال" },
    "peaceful": { pos: "adjective", definition: "Free from disturbance", example: "The forest returned to its peaceful state.", translation: "سلمي" },

    // Story 5: The Secret of the Old Clock
    "antique": { pos: "adjective", definition: "Belonging to ancient times", example: "She collects antique furniture.", translation: "قديم" },
    "clock": { pos: "noun", definition: "A device for measuring time", example: "The old clock stopped working.", translation: "ساعة" },
    "compartment": { pos: "noun", definition: "A separate section or part of something", example: "The secret compartment contained documents.", translation: "حجرة" },
    "historian": { pos: "noun", definition: "A person who studies and writes about history", example: "The historian explained the artifact's history.", translation: "مؤرخ" },

    // Story 6: The City of Dreams
    "city": { pos: "noun", definition: "A large town", example: "The city was bustling with life.", translation: "مدينة" },
    "dreamscape": { pos: "noun", definition: "A landscape of dreams", example: "She entered a digital dreamscape.", translation: "عالم الأحلام" },
    "programmer": { pos: "noun", definition: "Someone who writes computer software", example: "The programmer fixed the bug.", translation: "مبرمج" },
    "corporation": { pos: "noun", definition: "A large company authorized to act as a single entity", example: "The corporation launched a new product.", translation: "شركة" },

    // Story 7: The Ocean Explorer
    "ocean": { pos: "noun", definition: "A large body of salt water", example: "Maria loved the ocean.", translation: "المحيط" },
    "fish": { pos: "noun", definition: "Aquatic animals with gills and fins", example: "The fish swam in the clear water.", translation: "سمك" },
    "shell": { pos: "noun", definition: "The hard protective outer case of a mollusk", example: "She found a beautiful shell.", translation: "صدفة" },
    "marine": { pos: "adjective", definition: "Relating to the sea", example: "Marine life is diverse.", translation: "بحري" },

    // Story 8: The Mountain Adventure
    "mountain": { pos: "noun", definition: "A large natural elevation of the earth's surface", example: "The mountain peak was covered with snow.", translation: "جبل" },
    "peak": { pos: "noun", definition: "The highest point of a mountain", example: "They reached the mountain peak.", translation: "قمة" },
    "cave": { pos: "noun", definition: "A natural underground space", example: "They found shelter in a cave.", translation: "كهف" },
    "civilization": { pos: "noun", definition: "A human society with its culture and institutions", example: "Ancient civilization left behind art.", translation: "حضارة" },

    // Story 9: The Digital Revolution
    "artificial": { pos: "adjective", definition: "Made or produced by humans rather than occurring naturally", example: "Artificial intelligence is growing rapidly.", translation: "اصطناعي" },
    "intelligence": { pos: "noun", definition: "The ability to acquire knowledge and skills", example: "Human intelligence is remarkable.", translation: "ذكاء" },
    "neural": { pos: "adjective", definition: "Relating to nerves or the nervous system", example: "Neural networks are used in AI.", translation: "عصبي" },
    "consciousness": { pos: "noun", definition: "The state of being aware of one's surroundings", example: "He pondered the nature of consciousness.", translation: "وعي" },

    // Story 10: The Baker's Secret
    "baker": { pos: "noun", definition: "Someone who makes bread or pastries", example: "The baker makes delicious bread.", translation: "خباز" },
    "bread": { pos: "noun", definition: "A staple food made from flour and water", example: "The bread was freshly baked.", translation: "خبز" },
    "ingredient": { pos: "noun", definition: "A component of a mixture or recipe", example: "Sugar is a key ingredient.", translation: "مكون" },

    // Story 11: The Time Traveler's Diary
    "time": { pos: "noun", definition: "The measured or measurable period during which an action occurs", example: "Time flies quickly.", translation: "الوقت" },
    "diary": { pos: "noun", definition: "A personal record of events and thoughts", example: "She wrote in her diary daily.", translation: "مذكرات" },
    "machine": { pos: "noun", definition: "A device with moving parts performing work", example: "The machine was broken.", translation: "آلة" },
    "temporal": { pos: "adjective", definition: "Relating to time", example: "Temporal changes are inevitable.", translation: "زمني" },

    // Story 12: The Language of Stars
    "star": { pos: "noun", definition: "A luminous point in the night sky", example: "We watched the stars at night.", translation: "نجم" },
    "alien": { pos: "noun", definition: "A being from another planet", example: "The alien sent a message.", translation: "كائن فضائي" },
    "civilization": { pos: "noun", definition: "A human society with culture and institutions", example: "Ancient civilization left behind art.", translation: "حضارة" },
    "warning": { pos: "noun", definition: "A statement or event that indicates danger", example: "They received a warning about the storm.", translation: "تحذير" },

    // Story 13: The Garden Mystery
    "garden": { pos: "noun", definition: "A piece of land used for growing plants", example: "He tended his garden every morning.", translation: "حديقة" },
    "vegetable": { pos: "noun", definition: "A plant or part of a plant used as food", example: "She planted fresh vegetables.", translation: "خضار" },
    "rabbit": { pos: "noun", definition: "A small burrowing mammal with long ears", example: "The rabbit hopped across the garden.", translation: "أرنب" },

    // Story 14: The Memory Thief
    "memory": { pos: "noun", definition: "The faculty by which the mind stores and remembers information", example: "He has a good memory.", translation: "ذاكرة" },
    "hunter": { pos: "noun", definition: "A person who hunts animals or items", example: "He was a memory hunter.", translation: "صياد" },
    "stolen": { pos: "adjective", definition: "Taken without permission", example: "His memories had been stolen.", translation: "مسروق" },
    "market": { pos: "noun", definition: "A place where goods are bought and sold", example: "The market was crowded.", translation: "سوق" }
};
