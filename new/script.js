// App state
let currentPage = 'home';
let currentStory = null;
let savedWords = JSON.parse(localStorage.getItem('savedWords')) || [];
let theme = localStorage.getItem('theme') || 'light';
let fontSize = 1.2; // rem
let lineHeight = 1.8;
let stories = []; // Will be loaded from external file

// Store current word for saving
let currentWordData = null;

// DOM elements
const pages = document.querySelectorAll('.page');
const navLinks = document.querySelectorAll('.nav-link');
const levelBtns = document.querySelectorAll('.level-btn');
const storiesGrid = document.getElementById('storiesGrid');
const storyText = document.getElementById('storyText');
const dictionaryPopup = document.getElementById('dictionaryPopup');
const vocabularyList = document.getElementById('vocabularyList');
const themeToggle = document.getElementById('themeToggle');
const backToStories = document.getElementById('backToStories');
const fontSmaller = document.getElementById('fontSmaller');
const fontNormal = document.getElementById('fontNormal');
const fontLarger = document.getElementById('fontLarger');
const lineSpacingBtn = document.getElementById('lineSpacing');
const listenBtn = document.getElementById('listenBtn');
const saveWordBtn = document.getElementById('saveWordBtn');
const closePopup = document.getElementById('closePopup');

// Function to scroll to top of page
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// Initialize the app
function init() {
    // Wait for stories to be loaded from external file
    if (typeof window.storiesData !== 'undefined') {
        stories = window.storiesData.stories || window.storiesData;
        renderStories();
    } else {
        // Fallback if external file fails
        stories = [
            {
                id: 1,
                title: "The Mysterious Island",
                level: "beginner",
                cover: "🏝️",
                coverType: "emoji",
                wordCount: 350,
                content: ["This is a sample story. Click on words like village or journey to see the dictionary."]
            }
        ];
        renderStories();
    }

    renderVocabulary();
    updateStats();
    applyTheme();

    // Event listeners
    setupEventListeners();
}

// Set up all event listeners
function setupEventListeners() {
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            switchPage(link.dataset.page);
            // Scroll to top when switching pages
            scrollToTop();
        });
    });

    levelBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            levelBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderStories(btn.dataset.level);
        });
    });

    backToStories.addEventListener('click', () => {
        switchPage('home');
        scrollToTop();
    });

    themeToggle.addEventListener('click', toggleTheme);

    fontSmaller.addEventListener('click', () => adjustFontSize(-0.1));
    fontNormal.addEventListener('click', () => resetFontSize());
    fontLarger.addEventListener('click', () => adjustFontSize(0.1));
    lineSpacingBtn.addEventListener('click', toggleLineSpacing);
    listenBtn.addEventListener('click', toggleAudio);

    saveWordBtn.addEventListener('click', saveCurrentWord);
    closePopup.addEventListener('click', hideDictionary);

    // Close dictionary when clicking outside
    document.addEventListener('click', (e) => {
        if (!dictionaryPopup.contains(e.target) && !e.target.classList.contains('word')) {
            hideDictionary();
        }
    });

    // Touch events for mobile long press
    document.addEventListener('touchstart', handleTouchStart);
    document.addEventListener('touchend', handleTouchEnd);

    // CTA button
    document.querySelector('.cta-button').addEventListener('click', () => {
        if (stories.length > 0) {
            openStoryInNewPage(stories[0].id);
        }
    });
}

// Touch handling for mobile
let touchTimer;
let touchTarget;

function handleTouchStart(e) {
    if (e.target.classList.contains('word')) {
        touchTarget = e.target;
        touchTimer = setTimeout(() => {
            showSentenceTranslation(e.target);
        }, 500);
    }
}

function handleTouchEnd() {
    clearTimeout(touchTimer);
}

// Page navigation
function switchPage(page) {
    currentPage = page;
    pages.forEach(p => p.classList.remove('active'));
    document.getElementById(page).classList.add('active');

    navLinks.forEach(link => {
        if (link.dataset.page === page) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

// NEW FUNCTION: Open story in a new page WITH story title
function openStoryInNewPage(storyId) {
    // Find the story in the stories array
    const story = stories.find(s => s.id == storyId);

    if (story) {
        // Store the story data in localStorage before redirecting
        localStorage.setItem('currentReadingStory', JSON.stringify({
            id: story.id,
            title: story.title,
            level: story.level
        }));

        // Create a new page URL with the story ID
        const storyPage = story.src;
        window.location.href = storyPage;
    }
}

// Function to render cover images
function renderStoryCover(story) {
    if (!story.cover) {
        // Default book icon if no cover specified
        return '<i class="fas fa-book"></i>';
    }

    if (story.coverType === 'emoji') {
        return `<div class="story-emoji">${story.cover}</div>`;
    } else if (story.coverType === 'image') {
        return `<img src="${story.cover}" alt="${story.title}" class="story-image">`;
    } else if (story.coverType === 'icon') {
        return `<i class="${story.cover}"></i>`;
    } else {
        // Default to emoji if type not specified
        return `<div class="story-emoji">${story.cover}</div>`;
    }
}

// Render stories grid with clickable cards
function renderStories(level = 'all') {
    storiesGrid.innerHTML = '';

    const filteredStories = level === 'all'
        ? stories
        : stories.filter(story => story.level === level);

    if (filteredStories.length === 0) {
        storiesGrid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 40px;">
                <p>No stories found for this level.</p>
            </div>
        `;
        return;
    }

    filteredStories.forEach(story => {
        const storyCard = document.createElement('div');
        storyCard.className = 'story-card';
        storyCard.dataset.storyId = story.id; // Add story ID as data attribute

        storyCard.innerHTML = `
            <div class="story-image">
                ${renderStoryCover(story)}
            </div>
            <div class="story-content">
                <span class="story-level ${story.level}">${story.level.charAt(0).toUpperCase() + story.level.slice(1)}</span>
                <h3 class="story-title">${story.title}</h3>
                <p>${story.content[0].substring(0, 100)}...</p>
                <div class="story-meta">
                    <span><i class="fas fa-font"></i> ${story.wordCount || 'N/A'} words</span>
                    <span><i class="fas fa-clock"></i> ${Math.ceil((story.wordCount || 100) / 200)} min read</span>
                </div>
            </div>
        `;

        // UPDATED: Open story in new page when clicked
        storyCard.addEventListener('click', () => {
            openStoryInNewPage(story.id);
        });

        storiesGrid.appendChild(storyCard);
    });
}

// This function is for backward compatibility (not used with new page approach)
function openStory(story) {
    currentStory = story;
    document.getElementById('storyTitle').textContent = story.title;

    // Render story content with interactive words
    storyText.innerHTML = '';
    story.content.forEach(paragraph => {
        const p = document.createElement('div');
        p.className = 'paragraph';

        // Process text to make ALL words clickable
        const words = paragraph.split(' ');
        const processedWords = words.map(word => {
            const cleanWord = word.replace(/[.,!?;:"]/g, '').toLowerCase();
            const isSaved = savedWords.some(w => w.word === cleanWord);

            let className = 'word';
            if (isSaved) className += ' saved';
            if (!dictionary[cleanWord]) className += ' no-translation';

            return `<span class="${className}" data-word="${cleanWord}">${word}</span>`;
        });

        p.innerHTML += processedWords.join(' ');
        storyText.appendChild(p);
    });

    // Add word click listeners
    setupWordInteractions();

    switchPage('stories');

    // Scroll to top after page transition
    setTimeout(() => {
        scrollToTop();
    }, 100);
}

// Set up word interactions (click and long press)
function setupWordInteractions() {
    document.querySelectorAll('.word').forEach(word => {
        // Click for dictionary
        word.addEventListener('click', (e) => {
            e.stopPropagation();
            const wordText = word.dataset.word;
            showDictionary(wordText, word);
        });

        // Mouse events for desktop long press
        let pressTimer;
        word.addEventListener('mousedown', (e) => {
            pressTimer = setTimeout(() => {
                showSentenceTranslation(e.target);
            }, 500);
        });

        word.addEventListener('mouseup', () => {
            clearTimeout(pressTimer);
        });

        word.addEventListener('mouseleave', () => {
            clearTimeout(pressTimer);
        });

        // Context menu prevention
        word.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            showSentenceTranslation(e.target);
        });
    });
}

// Show dictionary popup for words with translations
function showDictionary(word, element) {
    const wordData = dictionary[word];

    document.getElementById('popupWord').textContent = word;

    if (wordData) {
        document.getElementById('popupTranslation').textContent = wordData.translation;
        document.getElementById('popupPos').style.display = 'none';
        document.getElementById('popupDefinition').style.display = 'none';
        document.getElementById('popupExample').style.display = 'none';
    } else {
        document.getElementById('popupTranslation').textContent = "لا توجد ترجمة متاحة";
        document.getElementById('popupPos').style.display = 'none';
        document.getElementById('popupDefinition').style.display = 'none';
        document.getElementById('popupExample').style.display = 'none';
    }

    // Update save button
    const isSaved = savedWords.some(w => w.word === word);
    saveWordBtn.innerHTML = isSaved
        ? '<i class="fas fa-check"></i> Already Saved'
        : '<i class="fas fa-bookmark"></i> Save Word';
    saveWordBtn.disabled = isSaved;

    // Position the popup near the word
    const rect = element.getBoundingClientRect();
    dictionaryPopup.style.top = `${rect.bottom + window.scrollY + 10}px`;
    dictionaryPopup.style.left = `${Math.max(10, rect.left + window.scrollX - 150)}px`;
    dictionaryPopup.style.display = 'block';

    // Store current word for saving
    currentWordData = { word, element };
}

// Hide dictionary popup
function hideDictionary() {
    dictionaryPopup.style.display = 'none';
    currentWordData = null;
}

// Show sentence translation
function showSentenceTranslation(element) {
    const sentence = element.closest('.paragraph').textContent;

    // Create a translation popup
    const translationPopup = document.createElement('div');
    translationPopup.className = 'dictionary-popup';
    translationPopup.innerHTML = `
        <div class="dictionary-header">
            <div class="dictionary-word">Sentence Translation</div>
            <button class="close-popup"><i class="fas fa-times"></i></button>
        </div>
        <div class="dictionary-definition">${sentence}</div>
        <div class="dictionary-example">هذه ترجمة عربية للنص الكامل للجملة</div>
        <div class="dictionary-actions">
            <button class="close-popup">Close</button>
        </div>
    `;

    // Position near the sentence
    const rect = element.getBoundingClientRect();
    translationPopup.style.top = `${rect.bottom + window.scrollY + 10}px`;
    translationPopup.style.left = `${Math.max(10, rect.left + window.scrollX)}px`;

    document.body.appendChild(translationPopup);

    // Add close functionality
    translationPopup.querySelectorAll('.close-popup').forEach(btn => {
        btn.addEventListener('click', () => {
            document.body.removeChild(translationPopup);
        });
    });

    // Auto-close after 5 seconds
    setTimeout(() => {
        if (document.body.contains(translationPopup)) {
            document.body.removeChild(translationPopup);
        }
    }, 5000);
}

// Save current word to vocabulary
function saveCurrentWord() {
    if (!currentWordData) return;

    const { word, element } = currentWordData;
    const wordData = dictionary[word];

    // Check if word is already saved
    if (savedWords.some(w => w.word === word)) {
        showNotification('Word already saved!');
        return;
    }

    // Get story title - FIXED VERSION
    let storyTitle = 'Unknown';

    // Get story from localStorage (for reader page)
    const storyData = localStorage.getItem('currentReadingStory');
    if (storyData) {
        const parsedStory = JSON.parse(storyData);
        storyTitle = parsedStory.title;
    }
    // If in stories page on main site
    else if (currentPage === 'stories' && currentStory) {
        storyTitle = currentStory.title;
    }
    // Try to get from URL parameters
    else {
        const urlParams = new URLSearchParams(window.location.search);
        const storyId = urlParams.get('id');

        if (storyId && stories.length > 0) {
            const story = stories.find(s => s.id == storyId);
            if (story) {
                storyTitle = story.title;
            }
        }
    }

    // Create new word entry
    const newWord = {
        word: word,
        status: 'saved',
        added: new Date().toISOString(),
        nextReview: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        story: storyTitle,
        hasTranslation: !!wordData
    };

    // Add translation data if available
    if (wordData) {
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
    renderVocabulary();
    updateStats();
    hideDictionary();

    // Update word appearance in the story
    if (element) {
        element.classList.add('saved');
        element.classList.remove('unknown');
    }

    // Show confirmation message
    const message = wordData
        ? `"${word}" saved to vocabulary from "${storyTitle}"!`
        : `"${word}" saved to vocabulary from "${storyTitle}" (translation will be added later)`;

    showNotification(message);
}

// Show temporary notification
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--secondary);
        color: white;
        padding: 12px 20px;
        border-radius: var(--radius);
        box-shadow: var(--shadow);
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

// Render vocabulary list
function renderVocabulary() {
    vocabularyList.innerHTML = '';

    if (savedWords.length === 0) {
        vocabularyList.innerHTML = `
            <div class="vocabulary-item" style="justify-content: center; padding: 40px;">
                <p>No words saved yet. Click on words in stories to add them to your vocabulary.</p>
            </div>
        `;
        return;
    }

    savedWords.forEach((word, index) => {
        const item = document.createElement('div');
        item.className = 'vocabulary-item';

        // Add warning badge for words without translations
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
                <button title="Mark as known" data-index="${index}">
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
                markAsKnown(index);
            } else if (e.currentTarget.querySelector('.fa-trash')) {
                deleteWord(index);
            }
        });
    });
}
function removeAll() {
    const confirmed = window.confirm("Are you sure you want to remove all saved words? This action cannot be undone.");

    if (!confirmed) return; // user canceled

    // Clear localStorage
    localStorage.setItem('savedWords', JSON.stringify([]));

    // Clear in-memory array
    savedWords = [];

    // Show notification
    showNotification(`All saved words removed successfully! (${savedWords.length} words)`);

    // Update UI
    renderVocabulary();
    updateVocabularyStats();
}


// Mark word as known
function markAsKnown(index) {
    savedWords[index].status = 'known';
    savedWords[index].mastered = new Date().toISOString();
    localStorage.setItem('savedWords', JSON.stringify(savedWords));
    showNotification('Word marked as mastered!');
    renderVocabulary();
    updateStats();
}

// Delete word from vocabulary
function deleteWord(index) {
    const word = savedWords[index].word;
    savedWords.splice(index, 1);
    localStorage.setItem('savedWords', JSON.stringify(savedWords));
    renderVocabulary();
    updateStats();

    // Show deletion confirmation
    showNotification(`"${word}" removed from vocabulary`);
}

// Update vocabulary statistics
function updateStats() {
    document.getElementById('totalWords').textContent = savedWords.length;
    document.getElementById('masteredWords').textContent = savedWords.filter(w => w.status === 'known').length;

    const dueForReview = savedWords.filter(w => {
        if (!w.nextReview) return false;
        return new Date(w.nextReview) <= new Date();
    }).length;

    document.getElementById('practiceDue').textContent = dueForReview;

    // Simple streak calculation (for demo)
    const streak = Math.min(7, savedWords.length);
    document.getElementById('readingStreak').textContent = streak;
}

// Toggle theme
function toggleTheme() {
    theme = theme === 'light' ? 'dark' : 'light';
    applyTheme();
    localStorage.setItem('theme', theme);
}

// Apply current theme
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
    fontSize = Math.max(1, Math.min(2, fontSize)); // Limit between 1rem and 2rem
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
    // In a real app, this would use the Web Speech API
    alert('Text-to-speech would play here. This feature requires a real TTS API implementation.');
    listenBtn.classList.toggle('active');
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

// Helper function to format date
function formatDateForExport(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
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

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', init);