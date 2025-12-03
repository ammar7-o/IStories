// App state
let savedWords = JSON.parse(localStorage.getItem('savedWords')) || [];
let theme = localStorage.getItem('theme') || 'light';
let fontSize = 1.2; // rem
let lineHeight = 1.8;
let isAudioPlaying = false;
let currentStory = null;
let currentWordData = null;

// Sample dictionary (you can load from your Dictionarys/main.js file)
// const dictionary = {
//     'village': {
//         pos: 'n.',
//         definition: 'A small community in a rural area',
//         example: 'The small village was nestled in the valley.',
//         translation: 'قرية'
//     },
//     'journey': {
//         pos: 'n.',
//         definition: 'An act of traveling from one place to another',
//         example: 'Their journey across the desert took three days.',
//         translation: 'رحلة'
//     },
//     'mysterious': {
//         pos: 'adj.',
//         definition: 'Difficult or impossible to understand, explain, or identify',
//         example: 'The mysterious noise kept us awake all night.',
//         translation: 'غامض'
//     },
//     'island': {
//         pos: 'n.',
//         definition: 'A piece of land surrounded by water',
//         example: 'They spent their vacation on a tropical island.',
//         translation: 'جزيرة'
//     },
//     'ancient': {
//         pos: 'adj.',
//         definition: 'Belonging to the very distant past',
//         example: 'They discovered ancient ruins in the desert.',
//         translation: 'قديم'
//     },
//     'treasure': {
//         pos: 'n.',
//         definition: 'A quantity of precious metals, gems, or other valuable objects',
//         example: 'The pirates buried their treasure on the island.',
//         translation: 'كنز'
//     },
//     'adventure': {
//         pos: 'n.',
//         definition: 'An unusual and exciting, typically hazardous, experience or activity',
//         example: 'Their African adventure lasted six months.',
//         translation: 'مغامرة'
//     },
//     'forest': {
//         pos: 'n.',
//         definition: 'A large area covered chiefly with trees and undergrowth',
//         example: 'We went for a walk in the forest.',
//         translation: 'غابة'
//     },
//     'discover': {
//         pos: 'v.',
//         definition: 'Find something or someone unexpectedly or in the course of a search',
//         example: 'Scientists discovered a new species of butterfly.',
//         translation: 'يكتشف'
//     },
//     'secret': {
//         pos: 'n.',
//         definition: 'Something that is kept or meant to be kept unknown or unseen by others',
//         example: 'He shared his secret with his best friend.',
//         translation: 'سر'
//     }
// };

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

// Get story ID from URL
function getStoryIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return parseInt(urlParams.get('id')) || 1;
}

// Load story from your story files by ID
async function loadStory() {
    try {
        const storyId = getStoryIdFromUrl();

        // First check if stories are already loaded in window.storiesData
        if (typeof window.storiesData !== 'undefined') {
            const allStories = window.storiesData.stories || window.storiesData;
            currentStory = allStories.find(s => s.id === storyId);
            if (currentStory) {
                displayStory(currentStory);
                return;
            }
        }

        // If not loaded, try to load from external files
        // Load from stories/main.js
        const mainResponse = await fetch('../stories/main.js');
        const mainText = await mainResponse.text();

        // Extract stories from the JavaScript file
        const mainMatch = mainText.match(/window\.storiesData\s*=\s*({[\s\S]*?});/);
        if (mainMatch) {
            eval(mainMatch[0]); // This will set window.storiesData
            const allStories = window.storiesData.stories || window.storiesData;
            currentStory = allStories.find(s => s.id === storyId);
            if (currentStory) {
                displayStory(currentStory);
                return;
            }
        }

        // Try stories/more.js
        const moreResponse = await fetch('../stories/more.js');
        const moreText = await moreResponse.text();
        const moreMatch = moreText.match(/window\.storiesData\s*=\s*({[\s\S]*?});/);
        if (moreMatch) {
            eval(moreMatch[0]);
            const allStories = window.storiesData.stories || window.storiesData;
            currentStory = allStories.find(s => s.id === storyId);
            if (currentStory) {
                displayStory(currentStory);
                return;
            }
        }

        // If still not found, use fallback story
        currentStory = getFallbackStory(storyId);
        displayStory(currentStory);

    } catch (error) {
        console.error('Error loading story:', error);
        currentStory = getFallbackStory(1);
        displayStory(currentStory);
    }
}

// Fallback story if loading fails
function getFallbackStory(storyId) {
    const fallbackStories = {
        1: {
            id: 1,
            title: "The Mysterious Island",
            level: "beginner",
            wordCount: 350,
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

    story.content.forEach(paragraph => {
        const p = document.createElement('div');
        p.className = 'paragraph';

        // Process each word in the paragraph
        const words = paragraph.split(' ');
        const processedWords = words.map(word => {
            // Clean the word (remove punctuation)
            const cleanWord = word.toLowerCase().replace(/[.,!?;:"]/g, '');

            // Check if word is already saved
            const isSaved = savedWords.some(savedWord => savedWord.word === cleanWord);
            const hasTranslation = dictionary[cleanWord];

            // Determine CSS class
            let className = 'word';
            if (isSaved) className += ' saved';
            if (!hasTranslation) className += ' no-translation';

            // Return word with data attribute
            return `<span class="${className}" data-word="${cleanWord}">${word}</span>`;
        });

        p.innerHTML = processedWords.join(' ');
        storyText.appendChild(p);
    });

    // Add click events to words
    setupWordInteractions();
    updateReadingProgress();
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

// Show dictionary popup (simple version)
// Show dictionary popup (simple version)
// Show dictionary popup (simple version)
function showDictionary(word, element) {
    const wordData = dictionary[word];

    // Set content
    popupWord.textContent = word;

    if (wordData) {
        // Word has translation
        popupTranslation.textContent = wordData.translation;
        // Hide other fields as in original
        popupPos.style.display = 'none';
        popupDefinition.style.display = 'none';
        popupExample.style.display = 'none';

        // Update save button
        const isSaved = savedWords.some(w => w.word === word);
        saveWordBtn.innerHTML = isSaved
            ? '<i class="fas fa-check"></i> Already Saved'
            : '<i class="fas fa-bookmark"></i> Save Word';
        saveWordBtn.disabled = isSaved;
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
    }

    // Store current word for saving
    currentWordData = {
        word: word,
        element: element,
        hasTranslation: !!wordData,
        wordData: wordData
    };

    // Position the popup near the clicked word - ORIGINAL STYLE
    const rect = element.getBoundingClientRect();
    dictionaryPopup.style.top = `${rect.bottom + window.scrollY + 10}px`;
    dictionaryPopup.style.left = `${Math.max(10, rect.left + window.scrollX - 150)}px`;
    dictionaryPopup.style.display = 'block';

    // No overlay/modal - original simple popup style
}


// Hide dictionary popup
function hideDictionary() {
    dictionaryPopup.style.display = 'none';
    currentWordData = null;
}
document.addEventListener('click', (e) => {
    if (!dictionaryPopup.contains(e.target) && !e.target.classList.contains('word')) {
        hideDictionary();
    }
});

// Save current word to vocabulary
function saveCurrentWord() {
    if (!currentWordData) return;

    const { word, element, hasTranslation, wordData } = currentWordData;

    // Check if word is already saved
    if (savedWords.some(w => w.word === word)) {
        showNotification('Word already saved!');
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
        story: storyTitle, // This will now show the correct story title
        hasTranslation: hasTranslation
    };

    // Add translation data if available
    if (hasTranslation && wordData) {
        newWord.translation = wordData.translation;
        newWord.definition = wordData.definition;
        newWord.example = wordData.example;
        newWord.pos = wordData.pos;
    } else {
        // For words without translations
        newWord.translation = "No translation available";
        newWord.definition = "This word is not yet in our dictionary";
        newWord.example = "We're working on adding more words to our database";
        newWord.pos = "unknown";
    }

    savedWords.push(newWord);
    localStorage.setItem('savedWords', JSON.stringify(savedWords));

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

    showNotification(message);
}

// Show notification
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #10b981;
        color: white;
        padding: 12px 24px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 1000;
        font-weight: 500;
        animation: slideIn 0.3s ease;
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
            <div style="text-align: center; padding: 40px;">
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

        item.innerHTML = `
            <div class="word-info">
                <div class="word-main">
                    <span class="word-text">${word.word}</span>
                    <span class="word-translation">${word.translation}</span>
                    ${translationBadge}
                </div>
                ${word.story ? `<div class="word-story" style="font-size: 0.8rem; color: var(--text-light); margin-top: 5px;">From: ${word.story}</div>` : ''}
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
    savedWords[index].status = 'mastered';
    localStorage.setItem('savedWords', JSON.stringify(savedWords));
    updateVocabularyStats();
    showNotification('Word marked as mastered!');
    renderVocabulary();
}

// Delete word from vocabulary
function deleteWord(index) {
    const word = savedWords[index].word;
    savedWords.splice(index, 1);
    localStorage.setItem('savedWords', JSON.stringify(savedWords));
    updateVocabularyStats();
    renderVocabulary();
    showNotification(`"${word}" removed from vocabulary`);
}

// Export vocabulary as CSV
function exportVocabulary() {
    if (savedWords.length === 0) {
        showNotification('No vocabulary to export!');
        return;
    }

    // Create CSV content
    const headers = ['Word', 'Translation', 'Status', 'Story', 'Date Added'];
    const csvRows = [
        headers.join(','),
        ...savedWords.map(word => {
            return [
                `"${word.word}"`,
                `"${word.translation}"`,
                `"${word.status || 'saved'}"`,
                `"${word.story || 'Unknown'}"`,
                `"${new Date(word.added || word.date).toLocaleDateString()}"`
            ].join(',');
        })
    ];

    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.setAttribute('href', url);
    const date = new Date();
    const formattedDate = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
    link.setAttribute('download', `my_vocabulary_${formattedDate}.csv`);

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showNotification(`Vocabulary exported! (${savedWords.length} words)`);
}

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

// Toggle audio (text-to-speech)
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

// Start text-to-speech
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
            showNotification('Error playing audio.');
        };
    } else {
        showNotification('Text-to-speech is not supported in your browser.');
    }
}

// Stop text-to-speech
function stopAudio() {
    if ('speechSynthesis' in window) {
        speechSynthesis.cancel();
        isAudioPlaying = false;
    }
}

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
        }
    });

    // Stop audio when leaving page
    window.addEventListener('beforeunload', () => {
        if (isAudioPlaying && 'speechSynthesis' in window) {
            speechSynthesis.cancel();
        }
    });
}

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
`;
document.head.appendChild(style);

// Initialize
async function init() {
    applyTheme();
    setupEventListeners();
    await loadStory();
    updateVocabularyStats();
    renderVocabulary();
}

// Start the app
document.addEventListener('DOMContentLoaded', init);
