// App state
let savedWords = JSON.parse(localStorage.getItem('savedWordsfr')) || [];
let theme = localStorage.getItem('theme') || 'light';
let fontSize = 1.2; // rem
let lineHeight = 1.8;
let isAudioPlaying = false;
let currentStory = null;
let currentWordData = null; // سيخزن الكلمة الحالية المعروضة في النافذة المنبثقة
let dictionary = {}; // Dictionary will be loaded from JSON file

// DOM elements
const storyTitle = document.getElementById('storyTitle');
const storyText = document.getElementById('storyText');
const dictionaryPopup = document.getElementById('dictionaryPopup');
const themeToggle = document.getElementById('themeToggle');
const fontSmaller = document.getElementById('fontSmaller');
const fontNormal = document.getElementById('fontNormal');
const fontLarger = document.getElementById('fontLarger');
const lineSpacingBtn = document.getElementById('lineSpacing');
const listenBtn = document.getElementById('listenBtn');
const saveWordBtn = document.getElementById('saveWordBtn');
const closePopup = document.getElementById('closePopup');
const modalOverlay = document.getElementById('modalOverlay');
const popupWord = document.getElementById('popupWord');
const popupPos = document.getElementById('popupPos');
const popupDefinition = document.getElementById('popupDefinition');
const popupExample = document.getElementById('popupExample');
const popupTranslation = document.getElementById('popupTranslation');
const readingProgressBar = document.getElementById('readingProgressBar');
const backToHome = document.getElementById('backToHome');
const exportVocabularyBtn = document.getElementById('exportVocabulary');
const vocabularyList = document.getElementById('vocabularyList');
const navTabs = document.querySelectorAll('.nav-tab');
const pages = document.querySelectorAll('.page');
const googleSearchBtn = document.getElementById('googleSearchBtn'); 
const listenWordBtn = document.getElementById('listenWordBtn');
const removebtn = document.getElementById("removebtn");
const sound = document.getElementById("sound");
const lvl = document.getElementById("lvl");
const googleTranslateBtn = document.getElementById('googleTranslateBtn');

// Get story ID from URL
function getStoryIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return parseInt(urlParams.get('id')) || 1;
}

// ----------------------------------------------------
// 📚 وظائف القواميس المتعددة
// ----------------------------------------------------

// Load dictionaries from JSON file(s)
async function loadDictionary(dictionaryPaths) {
    // التأكد من أن dictionaryPaths مصفوفة
    if (!Array.isArray(dictionaryPaths)) {
        dictionaryPaths = dictionaryPaths ? [dictionaryPaths] : [];
    }
    
    // إعادة تعيين القاموس قبل التحميل
    dictionary = {}; 
    
    if (dictionaryPaths.length === 0) {
        console.log('No dictionary paths provided.');
        return;
    }

    try {
        const loadPromises = dictionaryPaths.map(async (path) => {
            if (!path) return {}; // تجاهل المسارات الفارغة

            try {
                const response = await fetch(path);
                if (!response.ok) {
                    throw new Error(`Failed to load dictionary: ${response.status} from ${path}`);
                }
                const dictContent = await response.json();
                console.log(`Loaded ${Object.keys(dictContent).length} words from: ${path}`);
                return dictContent;
            } catch (error) {
                console.error(`Error loading dictionary from ${path}:`, error);
                return {};
            }
        });

        const allDictionaries = await Promise.all(loadPromises);

        // دمج جميع القواميس: (القواميس الأحدث في المصفوفة تطغى على الأقدم)
        dictionary = allDictionaries.reduce((mergedDict, currentDict) => {
            return { ...mergedDict, ...currentDict };
        }, {});

        console.log(`Final merged dictionary size: ${Object.keys(dictionary).length} words.`);

    } catch (error) {
        console.error('Error during dictionary loading process:', error);
    }
    
    // Fallback إذا لم يتم تحميل أي قاموس
    if (Object.keys(dictionary).length === 0) {
        console.warn('No dictionaries loaded, using empty dictionary');
        dictionary = {};
    }
}

// Load story from database files by ID
async function loadStory() {
    try {
        // إظهار مؤشر التحميل
        storyTitle.textContent = 'Loading...';
        storyText.innerHTML = '<div class="loading" style="text-align: center; padding: 40px; color: var(--text-light);">Loading story...</div>';
        
        const storyId = getStoryIdFromUrl();
        const fallbackId = 1; // ID of the default fallback story

        // 1. First check if stories are already loaded in window.storiesData
        if (typeof window.storiesData !== 'undefined') {
            const allStories = window.storiesData.stories || window.storiesData;
            currentStory = allStories.find(s => s.id === storyId);
            if (currentStory) {
                // ✅ استخدام الحقل 'dictionaries'
                await loadDictionary(currentStory.dictionaries);
                displayStory(currentStory);
                return;
            }
        }

        // 2. If not loaded, try to load from external files (main.js)
        const mainResponse = await fetch('../database/main.js');
        const mainText = await mainResponse.text();

        // Try safer parsing instead of eval
        const mainMatch = mainText.match(/window\.storiesData\s*=\s*({[\s\S]*?});/);
        if (mainMatch) {
            try {
                // Remove the assignment part and parse as JSON
                const jsonStr = mainMatch[1].replace(/window\.storiesData\s*=\s*/, '');
                window.storiesData = JSON.parse(jsonStr);
            } catch (e) {
                // Fallback to eval if JSON.parse fails
                eval(mainMatch[0]);
            }
            
            const allStories = window.storiesData.stories || window.storiesData;
            currentStory = allStories.find(s => s.id === storyId);
            if (currentStory) {
                // ✅ استخدام الحقل 'dictionaries'
                await loadDictionary(currentStory.dictionaries);
                displayStory(currentStory);
                return;
            }
        }

        // 3. Try database/more.js
        const moreResponse = await fetch('../database/more.js');
        const moreText = await moreResponse.text();
        const moreMatch = moreText.match(/window\.storiesData\s*=\s*({[\s\S]*?});/);
        if (moreMatch) {
            try {
                const jsonStr = moreMatch[1].replace(/window\.storiesData\s*=\s*/, '');
                window.storiesData = JSON.parse(jsonStr);
            } catch (e) {
                eval(moreMatch[0]);
            }
            
            const allStories = window.storiesData.stories || window.storiesData;
            currentStory = allStories.find(s => s.id === storyId);
            if (currentStory) {
                // ✅ استخدام الحقل 'dictionaries'
                await loadDictionary(currentStory.dictionaries);
                displayStory(currentStory);
                return;
            }
        }

        // 4. If still not found, use fallback story
        currentStory = getFallbackStory(storyId);
        // ✅ استخدام الحقل 'dictionaries' في القصة الاحتياطية (مع Fallback للحقل القديم)
        if (currentStory.dictionaries || currentStory.dictionary) {
            await loadDictionary(currentStory.dictionaries || currentStory.dictionary);
        }
        displayStory(currentStory);

    } catch (error) {
        console.error('Error loading story:', error);
        showNotification('Failed to load story. Using fallback story.', 'error');
        currentStory = getFallbackStory(fallbackId);
        displayStory(currentStory);
    }
}

// ----------------------------------------------------
// 🧭 وظائف حفظ واستعادة موقع القراءة
// ----------------------------------------------------

// حفظ موقع القراءة في localStorage
function saveReadingPosition() {
    if (currentStory && window.scrollY > 0) {
        const positionData = {
            id: currentStory.id,
            scrollPosition: window.scrollY
        };
        localStorage.setItem('readingPosition', JSON.stringify(positionData));
    }
}

// استعادة موقع القراءة المحفوظ
function restoreReadingPosition() {
    const savedPosition = JSON.parse(localStorage.getItem('readingPosition'));
    const storyId = getStoryIdFromUrl();

    if (savedPosition && savedPosition.id === storyId) {
        // التأكد من أن المحتوى قد تم تحميله بالكامل
        const checkContentLoaded = () => {
            if (document.readyState === 'complete' && storyText.innerHTML && !storyText.innerHTML.includes('loading')) {
                window.scrollTo(0, savedPosition.scrollPosition);
                console.log(`Restored scroll position for story ${storyId} to ${savedPosition.scrollPosition}px.`);
            } else {
                setTimeout(checkContentLoaded, 100);
            }
        };
        checkContentLoaded();
    }
}

// ----------------------------------------------------
// 📝 وظائف عرض القصة والقائمة الاحتياطية
// ----------------------------------------------------

// Fallback story if loading fails
function getFallbackStory(storyId) {
    const fallbackStories = {
        1: {
            id: 1,
            title: "The Mysterious Island",
            level: "beginner",
            wordCount: 350,
            dictionaries: ["../dictionarys/main.json"], 
            content: [
                "In the middle of the ocean, there was a small island. No one knew about this island because it was always hidden by fog. One day, a brave explorer named Leo discovered the island during his long journey.",
                "The island had beautiful white beaches and tall palm trees. In the center of the island, there was an ancient temple. The temple walls were covered with mysterious symbols that told the story of the people who lived there long ago.",
                "Leo explored the temple carefully. He found a secret room behind a large stone door. Inside the room, there was an old map showing the location of a hidden treasure. The treasure was hidden deep in the forest on the other side of the island.",
                "With the map in his hand, Leo walked through the dense forest. He saw colorful birds and heard strange animal sounds. After hours of walking, he found a cave exactly where the map showed.",
                "Inside the cave, Leo discovered the treasure: a chest full of gold coins and precious jewels. But more importantly, he found a diary written by the island's last king. The diary told about the island's history and wisdom.",
                "Leo realized that the real treasure was not the gold, but the knowledge he gained. He decided to share this knowledge with the world. He returned to his village with stories of adventure and friendship."
            ]
        },
        2: {
            id: 2,
            title: "The Lost City",
            level: "intermediate",
            wordCount: 500,
            dictionaries: ["../dictionarys/main.json"],
            content: [
                "Deep in the Amazon rainforest, legends spoke of a lost city made of gold. For centuries, explorers searched for this mythical place, but none returned to tell the tale.",
                "Her journey began in a small village at the edge of the jungle. The villagers warned her about the dangers that lay ahead: poisonous snakes, treacherous rivers, and tribes that had never seen outsiders.",
                "For weeks, she navigated through dense vegetation. She crossed rivers filled with piranhas and climbed steep mountains. One night, while studying her maps by torchlight, she noticed a pattern in the stars.",
                "Following the celestial guidance, she discovered a hidden path behind a waterfall. The path led to a massive stone gateway covered in vines. As she cleared the vegetation, intricate carvings appeared.",
                "Beyond the gateway lay the lost city, just as magnificent as the legends described. Golden temples reflected the sunlight, and stone pathways connected elaborate plazas. But the city was empty, silent except for the sounds of the jungle reclaiming its territory."
            ]
        }
    };

    return fallbackStories[storyId] || fallbackStories[1];
}

// Display story with clickable words
function displayStory(story) {
    storyTitle.textContent = story.title;
    storyText.innerHTML = '';
    
    if (sound && story.sound) sound.src = story.sound;
    if (lvl && story.level) lvl.innerHTML = story.level;

    story.content.forEach(paragraph => {
        const p = document.createElement('div');
        p.className = 'paragraph';
        p.innerHTML = makeWordsClickable(paragraph);
        storyText.appendChild(p);
    });

    setupWordInteractions();
    updateReadingProgress();
}
function makeWordsClickable(htmlString, options = {}) {
    const debug = !!options.debug;

    // regex لكلمة فرنسية/انجليزية مع دعم apostrophes في البداية والنهاية والوسط
    const wordPattern = /[A-Za-zÀ-ÖØ-öø-ÿ0-9’']+(?:[’'\-][A-Za-zÀ-ÖØ-öø-ÿ0-9]+)*/;

    // نستخدم عنصر مؤقت لعمل parse للـ HTML بأمان
    const container = document.createElement('div');
    container.innerHTML = htmlString;

    // عقدة تسمح بتجاوز عناصر معينة
    const skipTags = new Set(['SCRIPT', 'STYLE', 'CODE', 'PRE', 'TEXTAREA']);

    // دالة لتوحيد apostrophes (تحويل كل الـ apostrophes إلى نوع واحد)
    function normalizeApostrophe(word) {
        return word.replace(/[’']/g, "'"); // تحويل كل الـ apostrophes إلى '
    }

    // دالة للتحقق مما إذا كانت الكلمة لديها ترجمة
    function hasTranslation(word) {
        // أولاً: تحقق بالكلمة كما هي
        if (dictionary[word.toLowerCase()]) {
            return true;
        }
        
        // توحيد apostrophes وتحويل إلى حروف صغيرة
        const normalizedWord = normalizeApostrophe(word.toLowerCase());
        
        // تحقق بالكلمة مع apostrophe موحد
        if (dictionary[normalizedWord]) {
            return true;
        }
        
        // 2. تحقق بالكلمة بدون أي apostrophe
        const withoutAnyApostrophe = normalizedWord.replace(/'/g, '');
        if (dictionary[withoutAnyApostrophe]) {
            return true;
        }
        
        // 3. معالجة الكلمات مع apostrophe في المنتصف (مثل lorsqu'ils)
        if (normalizedWord.includes("'")) {
            const parts = normalizedWord.split("'");
            
            // جرب كل الإمكانيات:
            
            // أ) الكلمة بدون apostrophe (lorsquils)
            const joined = parts.join('');
            if (dictionary[joined]) {
                return true;
            }
            
            // ب) الجزء الأول فقط (lorsqu) إذا كان موجودًا
            if (parts[0] && dictionary[parts[0]]) {
                return true;
            }
            
            // ج) الجزء الثاني فقط (ils) إذا كان موجودًا
            if (parts[1] && dictionary[parts[1]]) {
                return true;
            }
            
            // د) جرب أشكال أخرى مع apostrophe مختلف
            // مثل: lorsqu'ils -> l + ils
            if (parts[0] && parts[1]) {
                const firstPart = parts[0];
                const secondPart = parts[1];
                
                // حاول مع l في البداية إذا كان الجزء الأول ينتهي بـ l
                if (firstPart.endsWith('l') || firstPart.endsWith('L')) {
                    const withL = firstPart.slice(-1) + "'" + secondPart;
                    if (dictionary[withL]) {
                        return true;
                    }
                }
            }
        }
        
        // 4. بصيغة المفرد إذا كانت تنتهي بـ s
        if (normalizedWord.endsWith('s') && !normalizedWord.endsWith("'s")) {
            const singular = normalizedWord.slice(0, -1);
            if (dictionary[singular]) {
                return true;
            }
            
            // جرب أيضًا المفرد بدون apostrophe
            if (dictionary[singular.replace(/'/g, '')]) {
                return true;
            }
        }
        
        // 5. بصيغة المفرد إذا كانت تنتهي بـ es
        if (normalizedWord.endsWith('es') && !normalizedWord.endsWith("'es")) {
            const singular = normalizedWord.slice(0, -2);
            if (dictionary[singular]) {
                return true;
            }
            if (dictionary[singular.replace(/'/g, '')]) {
                return true;
            }
        }
        
        // 6. للكلمات المركبة
        if (normalizedWord.includes('-')) {
            const withoutHyphen = normalizedWord.replace(/-/g, '');
            if (dictionary[withoutHyphen]) {
                return true;
            }
            
            // تحقق من أجزاء الكلمة المركبة
            const parts = normalizedWord.split('-');
            for (let part of parts) {
                if (dictionary[part]) {
                    return true;
                }
                if (dictionary[part.replace(/'/g, '')]) {
                    return true;
                }
            }
        }
        
        return false;
    }

    // دالة للتحقق مما إذا تم حفظ الكلمة
    function isWordSaved(word) {
        const normalizedWord = normalizeApostrophe(word.toLowerCase());
        
        return savedWords.some(savedWord => {
            const saved = savedWord.word.toLowerCase();
            const savedNormalized = normalizeApostrophe(saved);
            
            // مقارنات متعددة
            if (savedNormalized === normalizedWord) return true;
            
            // بدون apostrophe
            if (savedNormalized.replace(/'/g, '') === normalizedWord.replace(/'/g, '')) return true;
            
            // معالجة الكلمات المركبة
            if (savedNormalized === normalizedWord.replace(/-/g, '')) return true;
            
            return false;
        });
    }

    // نمشي شجرة العقد ونغيّر الـ text nodes فقط
    function walk(node) {
        // لا نمر عبر عناصر يجب تجاهلها
        if (node.nodeType === Node.ELEMENT_NODE && skipTags.has(node.tagName)) return;

        // إذا parent هو span.word (أي تم تغليفه سابقًا) — لا ننفّذ داخلها
        if (node.parentNode && node.parentNode.nodeType === Node.ELEMENT_NODE) {
            const p = node.parentNode;
            if (p.classList && p.classList.contains('word')) return;
        }

        if (node.nodeType === Node.TEXT_NODE) {
            // إذا النص يحتوي شيء مفيد
            const text = node.nodeValue;
            if (!text || !/\S/.test(text)) return; // لا شيء ملموس

            // ننقسم بحسب كلمة/فاصل
            const fragments = [];
            let idx = 0;
            const regexGlobal = new RegExp(wordPattern.source, 'g');

            let m;
            let lastIndex = 0;
            while ((m = regexGlobal.exec(text)) !== null) {
                const start = m.index;
                const match = m[0];
                
                // إضافة النص قبل المطابقة كما هو
                if (start > lastIndex) {
                    fragments.push(document.createTextNode(text.slice(lastIndex, start)));
                }

                // إنشاء عنصر span للكلمة
                const span = document.createElement('span');
                span.className = 'word';
                
                // تخزين الكلمة كما هي
                const displayWord = match;
                let dataWord = normalizeApostrophe(match.toLowerCase());
                
                span.setAttribute('data-word', dataWord);
                span.textContent = displayWord;
                
                // التحقق من وجود ترجمة وإضافة class مناسب
                if (!hasTranslation(match)) {
                    span.classList.add('no-translation');
                    if (debug) {
                        console.log(`No translation for: "${match}" (normalized: "${dataWord}")`);
                    }
                } else {
                    if (debug) {
                        console.log(`Found translation for: "${match}" (normalized: "${dataWord}")`);
                    }
                }
                
                // التحقق إذا تم حفظ الكلمة
                if (isWordSaved(match)) {
                    span.classList.add('saved');
                }

                fragments.push(span);
                lastIndex = start + match.length;
            }
            
            // باقي النص
            if (lastIndex < text.length) {
                fragments.push(document.createTextNode(text.slice(lastIndex)));
            }

            // إن لم يكن هناك أي مطابقة، نترك النص كما هي
            if (fragments.length === 0) return;

            // استبدال نص العقدة الحالية بالعناصر الجديدة
            for (const f of fragments) {
                node.parentNode.insertBefore(f, node);
            }
            node.parentNode.removeChild(node);
            return;
        }

        // نمشي أولاد العقدة
        let child = node.firstChild;
        while (child) {
            // cache next sibling لأننا قد نغير DOM
            const next = child.nextSibling;
            walk(child);
            child = next;
        }
    }

    walk(container);

    if (debug) {
        console.log('makeWordsClickable result:', container.innerHTML);
    }

    return container.innerHTML;
}
function processToken(token) {
    // فصل علامات الترقيم الطرفية
    const match = token.match(/^([\w'’\\u0600-\\u06FF\\u0750-\\u077F\\uFB50-\\uFDFF\\uFE70-\\uFEFF-]+)([.,!?;:"]*)$/);
    
    if (!match) {
        return token; // لأرقام أو رموز خاصة
    }
    
    const word = match[1];
    const punctuation = match[2];
    
    // تنظيف الكلمة
    let cleanWord = word.toLowerCase().replace(/^[.,!?;:"]+|[.,!?;:"]+$/g, '');
    
    if (cleanWord.length === 0) {
        return word + punctuation;
    }
    
    // البحث
    const isSaved = savedWords.some(w => w.word === cleanWord || 
                                        w.word === cleanWord.replace(/'/g, ''));
    const hasTranslation = dictionary[cleanWord] || 
                          dictionary[cleanWord.replace(/'/g, '')] ||
                          dictionary[cleanWord.replace(/-/g, '')];
    
    let className = 'word';
    if (isSaved) className += ' saved';
    if (!hasTranslation) className += ' no-translation';
    
    return `<span class="${className}" data-word="${cleanWord}">${word}${punctuation}</span>`;
}

// Setup word click interactions
function setupWordInteractions() {
    document.querySelectorAll('.word').forEach(word => {
        word.addEventListener('click', (e) => {
            e.stopPropagation();
            const wordText = word.dataset.word;
            showDictionary(wordText, word);
        });
    });
}

// Validate word data
function validateWordData(wordData) {
    if (!wordData || typeof wordData !== 'object') return false;
    
    // التأكد من أن الكلمة تحتوي على البيانات الأساسية
    return wordData.word && wordData.translation;
}

// Show dictionary popup
function showDictionary(word, element) {
    if (!word) return;
    
    const wordData = dictionary[word];

    // Set content
    popupWord.textContent = word;

    // Hide/Show Listen button based on browser support
    if (listenWordBtn) {
        listenWordBtn.style.display = 'speechSynthesis' in window ? 'inline-block' : 'none';
    }

    if (wordData) {
        // Word has translation
        popupTranslation.textContent = wordData.translation;
        // Hide other fields as in original (since your JSON only has translation)
        popupPos.style.display = 'none';
        popupDefinition.style.display = 'none';
        popupExample.style.display = 'none';

        // Update save button
        const isSaved = savedWords.some(w => w.word === word);
        saveWordBtn.innerHTML = isSaved
            ? '<i class="fas fa-check"></i> Already Saved'
            : '<i class="fas fa-bookmark"></i> Save Word';
        saveWordBtn.disabled = isSaved;
        saveWordBtn.classList.toggle('disabled', isSaved);
        saveWordBtn.classList.remove('no-translation-btn');
    } else {
        // Word has no translation
        popupTranslation.textContent = "لا توجد ترجمة متاحة";
        // Hide other fields as in original
        popupPos.style.display = 'none';
        popupDefinition.style.display = 'none';
        popupExample.style.display = 'none';

        // Update save button for no translation
        saveWordBtn.innerHTML = '<i class="fas fa-bookmark"></i> Save Word (No Translation)';
        saveWordBtn.disabled = false;
        saveWordBtn.classList.add('no-translation-btn');
    }

    // Validate current word data
    if (!validateWordData({ word: word, translation: wordData?.translation || "No translation" })) {
        console.warn('Invalid word data for:', word);
    }

    // Store current word for saving and listening
    currentWordData = {
        word: word,
        element: element,
        hasTranslation: !!wordData,
        wordData: wordData
    };

    // Position the popup near the clicked word
    const rect = element.getBoundingClientRect();
    dictionaryPopup.style.top = `${rect.bottom + window.scrollY + 10}px`;
    dictionaryPopup.style.left = `${Math.max(10, rect.left + window.scrollX - 150)}px`;
    dictionaryPopup.style.display = 'block';
}

// Hide dictionary popup
function hideDictionary() {
    dictionaryPopup.style.display = 'none';
    currentWordData = null;
}

document.addEventListener('click', (e) => {
    if (dictionaryPopup && !dictionaryPopup.contains(e.target) && !e.target.classList.contains('word')) {
        hideDictionary();
    }
});

// ----------------------------------------------------
// 📖 وظائف المفردات والإحصائيات
// ----------------------------------------------------

// Show notification
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // ألوان مختلفة لأنواع مختلفة من الإشعارات
    const colors = {
        success: 'rgb(13, 167, 116)',
        warning: '#f59e0b',
        error: '#ef4444',
        info: '#3b82f6'
    };
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${colors[type] || colors.success};
        color: white;
        padding: 12px 24px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 1000;
        font-weight: 500;
        animation: slideIn 0.3s ease;
        max-width: 400px;
        word-wrap: break-word;
    `;

    document.body.appendChild(notification);

    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Save current word to vocabulary
function saveCurrentWord() {
    if (!currentWordData) {
        showNotification('No word selected', 'error');
        return;
    }

    const { word, element, hasTranslation, wordData } = currentWordData;

    // Check if word is already saved
    if (savedWords.some(w => w.word === word)) {
        showNotification('Word already saved!', 'info');
        return;
    }

    // Get current story title
    const storyTitle = currentStory ? currentStory.title : 'Unknown Story';

    // Create new word entry
    const newWord = {
        word: word,
        status: 'saved',
        added: new Date().toISOString(),
        nextReview: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
        story: storyTitle,
        hasTranslation: hasTranslation
    };

    // Add translation data if available
    if (hasTranslation && wordData) {
        newWord.translation = wordData.translation;
        // Since your JSON only has translation, add placeholder for other fields
        newWord.definition = "Check back later for definition";
        newWord.example = "Check back later for example";
        newWord.pos = "unknown";
    } else {
        // For words without translations
        newWord.translation = "No translation available";
        newWord.definition = "This word is not yet in our dictionary";
        newWord.example = "We're working on adding more words to our database";
        newWord.pos = "unknown";
    }

    savedWords.push(newWord);
    localStorage.setItem('savedWordsfr', JSON.stringify(savedWords));

    hideDictionary();

    // Update word appearance in the story
    if (element) {
        element.classList.add('saved');
        element.classList.remove('no-translation');
    }

    // Update vocabulary if on vocabulary page
    if (document.querySelector('.nav-tab.active[data-page="vocabulary"]')) {
        renderVocabulary();
        updateVocabularyStats();
    }

    // Show confirmation message
    const message = hasTranslation
        ? `"${word}" saved to vocabulary from "${storyTitle}"!`
        : `"${word}" saved to vocabulary from "${storyTitle}" (translation will be added later)`;

    showNotification(message, hasTranslation ? 'success' : 'warning');
}

// Function to translate on Google
function translateOnGoogle() {
    if (!currentWordData || !currentWordData.word) return;

    const wordToTranslate = currentWordData.word;

    // رابط Google Translate: en→ar (يمكن تعديل اللغات حسب الحاجة)
    const translateUrl = `https://translate.google.com/?sl=auto&tl=ar&text=${encodeURIComponent(wordToTranslate)}&op=translate`;

    window.open(translateUrl, '_blank');
}

// Update vocabulary stats
function updateVocabularyStats() {
    const totalWords = document.getElementById('totalWords');
    const masteredWords = document.getElementById('masteredWords');
    const practiceDue = document.getElementById('practiceDue');
    const readingStreak = document.getElementById('readingStreak');

    if (totalWords) totalWords.textContent = savedWords.length;
    if (masteredWords) masteredWords.textContent = savedWords.filter(w => w.status === 'mastered' || w.status === 'known').length;

    // Calculate due for practice (words added in last 3 days)
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    const dueCount = savedWords.filter(w => new Date(w.added || w.date) > threeDaysAgo).length;
    if (practiceDue) practiceDue.textContent = dueCount;

    // Simple streak calculation
    const streak = Math.min(30, savedWords.length);
    if (readingStreak) readingStreak.textContent = streak;
}

// Render vocabulary list
function renderVocabulary() {
    if (!vocabularyList) return;

    vocabularyList.innerHTML = '';

    if (savedWords.length === 0) {
        vocabularyList.innerHTML = `
            <div style="text-align: center; padding: 40px; color: var(--text-light);">
                <p>No words saved yet. Click on words in stories to add them to your vocabulary.</p>
            </div>
        `;
        return;
    }

    savedWords.forEach((word, index) => {
        const item = document.createElement('div');
        item.className = 'vocabulary-item';

        const translationBadge = !word.hasTranslation
            ? `<span class="no-translation-badge" style="background: #f59e0b; color: white; padding: 2px 6px; border-radius: 4px; font-size: 0.7rem; margin-left: 8px;">No Translation</span>`
            : '';

        const masteredBadge = word.status === 'mastered'
            ? `<span class="mastered-badge" style="background: rgb(13, 167, 116); color: white; padding: 2px 6px; border-radius: 4px; font-size: 0.7rem; margin-left: 8px;">Mastered</span>`
            : '';

        item.innerHTML = `
            <div class="word-info">
                <div class="word-main">
                    <span class="word-text">${word.word}</span>
                    <span class="word-translation">${word.translation}</span>
                    ${translationBadge}
                    ${masteredBadge}
                </div>
                ${word.story ? `<div class="word-story" style="font-size: 0.8rem; color: var(--text-light); margin-top: 5px;">From: ${word.story}</div>` : ''}
                <div class="word-date" style="font-size: 0.7rem; color: var(--text-lighter); margin-top: 3px;">
                    Added: ${new Date(word.added || word.date).toLocaleDateString()}
                </div>
            </div>
            <div class="word-actions">
                <button title="Mark as mastered" data-index="${index}">
                    <i class="fas fa-check"></i>
                </button>
                <button title="Delete" data-index="${index}">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;

        vocabularyList.appendChild(item);
    });

    // Add event listeners for vocabulary actions
    document.querySelectorAll('.word-actions button').forEach(button => {
        button.addEventListener('click', (e) => {
            const index = parseInt(e.currentTarget.dataset.index);
            if (e.currentTarget.querySelector('.fa-check')) {
                markAsMastered(index);
            } else if (e.currentTarget.querySelector('.fa-trash')) {
                deleteWord(index);
            }
        });
    });
}

// Mark word as mastered
function markAsMastered(index) {
    if (index < 0 || index >= savedWords.length) return;
    
    savedWords[index].status = 'mastered';
    savedWords[index].masteredDate = new Date().toISOString();
    localStorage.setItem('savedWordsfr', JSON.stringify(savedWords));
    
    updateVocabularyStats();
    showNotification(`"${savedWords[index].word}" marked as mastered!`, 'success');
    renderVocabulary();
}

// Delete word from vocabulary
function deleteWord(index) {
    if (index < 0 || index >= savedWords.length) return;
    
    const word = savedWords[index].word;
    const confirmed = window.confirm(`Are you sure you want to delete "${word}" from your vocabulary?`);
    
    if (confirmed) {
        savedWords.splice(index, 1);
        localStorage.setItem('savedWordsfr', JSON.stringify(savedWords));
        updateVocabularyStats();
        renderVocabulary();
        showNotification(`"${word}" removed from vocabulary`, 'info');
    }
}

// Delete all words
function removeAll() {
    if (savedWords.length === 0) {
        showNotification('No words to remove!', 'info');
        return;
    }
    
    const confirmed = window.confirm(`Are you sure you want to remove all ${savedWords.length} saved words? This action cannot be undone.`);

    if (!confirmed) return; // user canceled

    // Clear localStorage
    localStorage.setItem('savedWordsfr', JSON.stringify([]));

    // Clear in-memory array
    savedWords = [];

    // Show notification
    showNotification(`All saved words removed successfully!`, 'success');

    // Update UI
    renderVocabulary();
    updateVocabularyStats();
}

// Export vocabulary as CSV file
function exportVocabulary() {
    if (savedWords.length === 0) {
        showNotification('No vocabulary to export!');
        return;
    }

    // Create CSV content with headers
    const headers = ['Word', 'Translation', 'Status', 'Story', 'Date Added'];

    // Create CSV rows
    const csvRows = [
        headers.join(','), // Add headers first
        ...savedWords.map(word => {
            return [
                `"${word.word || ''}"`,
                `"${(word.translation || '').replace(/"/g, '""')}"`, // Escape quotes in CSV
                `"${word.status || ''}"`,
                `"${(word.story || '').replace(/"/g, '""')}"`,
                `"${word.added ? new Date(word.added).toLocaleDateString('en-US') : ''}"`
            ].join(',');
        })
    ];

    // Join rows with newlines
    const csvString = csvRows.join('\n');

    // Create a Blob (file-like object)
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });

    // Create download URL
    const url = URL.createObjectURL(blob);

    // Create invisible download link
    const link = document.createElement('a');
    link.setAttribute('href', url);

    // Create filename with current date
    const date = new Date();
    const formattedDate = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
    link.setAttribute('download', `my_vocabulary_${formattedDate}.csv`);

    // Hide the link and trigger download
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();

    // Clean up
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    // Show success message
    showNotification(`Vocabulary exported successfully! (${savedWords.length} words)`);
}

// ----------------------------------------------------
// 🎨 وظائف التخصيص
// ----------------------------------------------------

// Toggle theme
function toggleTheme() {
    theme = theme === 'light' ? 'dark' : 'light';
    applyTheme();
    localStorage.setItem('theme', theme);
}

// Apply theme
function applyTheme() {
    if (theme === 'dark') {
        document.body.classList.add('dark-mode');
        themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    } else {
        document.body.classList.remove('dark-mode');
        themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
    }
}

// Adjust font size
function adjustFontSize(change) {
    fontSize += change;
    fontSize = Math.max(1, Math.min(2, fontSize));
    storyText.style.fontSize = `${fontSize}rem`;

    // Update active button
    fontSmaller.classList.toggle('active', fontSize < 1.2);
    fontNormal.classList.toggle('active', fontSize === 1.2);
    fontLarger.classList.toggle('active', fontSize > 1.2);
}

// Reset font size
function resetFontSize() {
    fontSize = 1.2;
    storyText.style.fontSize = `${fontSize}rem`;

    fontSmaller.classList.remove('active');
    fontNormal.classList.add('active');
    fontLarger.classList.remove('active');
}

// Toggle line spacing
function toggleLineSpacing() {
    lineHeight = lineHeight === 1.8 ? 2.2 : 1.8;
    storyText.style.lineHeight = lineHeight;
    lineSpacingBtn.classList.toggle('active', lineHeight === 2.2);
}

// ----------------------------------------------------
// 🔊 وظائف الصوت
// ----------------------------------------------------

// Toggle audio (text-to-speech for whole story)
function toggleAudio() {
    if (!currentStory) return;

    if (isAudioPlaying) {
        stopAudio();
        listenBtn.classList.remove('active');
    } else {
        startAudio();
        listenBtn.classList.add('active');
    }
}

// Start text-to-speech for the whole story
function startAudio() {
    if ('speechSynthesis' in window && currentStory) {
        const utterance = new SpeechSynthesisUtterance();
        utterance.text = currentStory.content.join(' ');
        utterance.rate = 0.9;
        utterance.pitch = 1;
        utterance.volume = 1;

        speechSynthesis.speak(utterance);
        isAudioPlaying = true;

        utterance.onend = () => {
            isAudioPlaying = false;
            listenBtn.classList.remove('active');
        };

        utterance.onerror = () => {
            isAudioPlaying = false;
            listenBtn.classList.remove('active');
            showNotification('Error playing audio.', 'error');
        };
    } else {
        showNotification('Text-to-speech is not supported in your browser.', 'error');
    }
}

// Stop text-to-speech
function stopAudio() {
    if ('speechSynthesis' in window) {
        speechSynthesis.cancel();
        isAudioPlaying = false;
    }
}

// Function to listen to the currently selected word
function listenToWord() {
    if (!currentWordData || !currentWordData.word) return;
    
    // Stop any current reading (story or other word)
    if ('speechSynthesis' in window) {
        speechSynthesis.cancel();
    }
    
    const wordToSpeak = currentWordData.word;
    const utterance = new SpeechSynthesisUtterance(wordToSpeak);
    
    utterance.rate = 0.8; 
    
    speechSynthesis.speak(utterance);
}

// ----------------------------------------------------
// 🌐 وظائف البحث
// ----------------------------------------------------

// Function to open Google Search for the current word
function searchOnGoogle() {
    if (!currentWordData || !currentWordData.word) return;

    const wordToSearch = currentWordData.word;
    
    // Construct the Google search URL
    const googleSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(wordToSearch)}+meaning`;
    
    // Open the URL in a new tab/window
    window.open(googleSearchUrl, '_blank');
    
    // Hide the dictionary popup after searching
    hideDictionary();
}

// ----------------------------------------------------
// 📊 وظائف التقدم
// ----------------------------------------------------

// Update reading progress
function updateReadingProgress() {
    window.addEventListener('scroll', () => {
        const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (winScroll / height) * 100;
        if (readingProgressBar) {
            readingProgressBar.style.width = scrolled + '%';
        }
    });
}

// ----------------------------------------------------
// 🔄 وظائف التنقل
// ----------------------------------------------------

// Switch page
function switchPage(page) {
    pages.forEach(p => p.classList.remove('active'));
    const pageElement = document.getElementById(page + 'Page');
    if (pageElement) pageElement.classList.add('active');

    navTabs.forEach(tab => tab.classList.remove('active'));
    document.querySelector(`.nav-tab[data-page="${page}"]`).classList.add('active');

    if (page === 'vocabulary') {
        renderVocabulary();
        updateVocabularyStats();
    }
}

// ----------------------------------------------------
// 🛠️ وظائف التنظيف والإدارة
// ----------------------------------------------------

// Cleanup function
function cleanup() {
    window.removeEventListener('scroll', saveReadingPosition);
    window.removeEventListener('beforeunload', saveReadingPosition);
    
    // إلغاء أي كلام قيد التشغيل
    if ('speechSynthesis' in window) {
        speechSynthesis.cancel();
    }
    
    // تنظيف أي event listeners إضافية إذا لزم الأمر
    document.removeEventListener('click', hideDictionary);
}

// ----------------------------------------------------
// 🎯 إعداد Event Listeners
// ----------------------------------------------------

// Setup event listeners
function setupEventListeners() {
    if (themeToggle) themeToggle.addEventListener('click', toggleTheme);
    if (fontSmaller) fontSmaller.addEventListener('click', () => adjustFontSize(-0.1));
    if (fontNormal) fontNormal.addEventListener('click', resetFontSize);
    if (fontLarger) fontLarger.addEventListener('click', () => adjustFontSize(0.1));
    if (lineSpacingBtn) lineSpacingBtn.addEventListener('click', toggleLineSpacing);
    if (listenBtn) listenBtn.addEventListener('click', toggleAudio);
    if (saveWordBtn) saveWordBtn.addEventListener('click', saveCurrentWord);
    if (closePopup) closePopup.addEventListener('click', hideDictionary);
    if (modalOverlay) modalOverlay.addEventListener('click', hideDictionary);
    if (backToHome) backToHome.addEventListener('click', () => window.location.href = '../index.html');
    if (exportVocabularyBtn) exportVocabularyBtn.addEventListener('click', exportVocabulary);
    
    // Link Google Search button
    if (googleSearchBtn) googleSearchBtn.addEventListener('click', searchOnGoogle); 
    
    // Link Listen Word button
    if (listenWordBtn) listenWordBtn.addEventListener('click', listenToWord);
    
    // Link Remove All button
    if (removebtn) removebtn.addEventListener("click", removeAll);
    
    // Link Google Translate button
    if (googleTranslateBtn) googleTranslateBtn.addEventListener('click', translateOnGoogle);

    // Navigation tabs
    navTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            switchPage(tab.dataset.page);
        });
    });

    // Close dictionary with Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            hideDictionary();
            // Stop any speech when closing the popup
            if ('speechSynthesis' in window) {
                speechSynthesis.cancel();
            }
        }
    });

    // 🧭 حفظ موقع القراءة عند التمرير
    window.addEventListener('scroll', saveReadingPosition);
    // 🧭 حفظ موقع القراءة عند مغادرة الصفحة
    window.addEventListener('beforeunload', saveReadingPosition);

    // Stop audio when leaving page
    window.addEventListener('beforeunload', () => {
        if (isAudioPlaying && 'speechSynthesis' in window) {
            speechSynthesis.cancel();
        }
    });
    
    // تنظيف عند الخروج
    window.addEventListener('beforeunload', cleanup);
}

// ----------------------------------------------------
// 🎨 إضافة CSS animations
// ----------------------------------------------------

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(-10px); }
        to { opacity: 1; transform: translateY(0); }
    }
    .word.saved {
        animation: fadeIn 0.3s ease;
    }
    .no-translation-btn {
        opacity: 0.7;
    }
    .no-translation-btn:hover {
        opacity: 1;
    }
    button.disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
    .loading {
        animation: pulse 1.5s infinite;
    }
    @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
    }
`;
document.head.appendChild(style);

// ----------------------------------------------------
// 🚀 دالة التهيئة (Initialization)
// ----------------------------------------------------

// Initialize
async function init() {
    applyTheme();
    setupEventListeners();
    await loadStory();
    updateVocabularyStats();
    renderVocabulary();
    
    // 🧭 استعادة موقع القراءة بعد تحميل القصة وعرضها
    restoreReadingPosition(); 
}

// Start the app
document.addEventListener('DOMContentLoaded', init);