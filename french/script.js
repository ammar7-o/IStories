// App state
let currentPage = 'home';
let currentStory = null;
let savedWords = JSON.parse(localStorage.getItem('french_vocabulary')) || []; // CHANGED KEY
let theme = localStorage.getItem('theme') || 'light';
let fontSize = 1.2; // rem
let lineHeight = 1.8;
let stories = []; // Will be loaded from external file

// Store current word for saving
let currentWordData = null;

// Flashcard system variables
let currentCards = [];
let currentCardIndex = 0;
let cardsReviewed = 0;
let sessionCards = [];

// Dictionary fallback
let dictionary = window.dictionary || {};

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

// Flashcard DOM elements
const flashcard = document.getElementById('flashcard');
const flashcardWord = document.getElementById('flashcardWord');
const flashcardTranslation = document.getElementById('flashcardTranslation');
const flashcardStory = document.getElementById('flashcardStory');
const cardAgain = document.getElementById('cardAgain');
const cardHard = document.getElementById('cardHard');
const cardGood = document.getElementById('cardGood');
const cardEasy = document.getElementById('cardEasy');
const shuffleCards = document.getElementById('shuffleCards');
const resetProgress = document.getElementById('resetProgress');
const progressText = document.getElementById('progressText');
const progressFill = document.getElementById('progressFill');

// Flashcard statistics elements
const dueCards = document.getElementById('dueCards');
const totalCards = document.getElementById('totalCards');
const masteredCards = document.getElementById('masteredCards');
const learningCards = document.getElementById('learningCards');

// Function to scroll to top of page
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// Initialize the app
function init() {
    // Migrate data from old key if it exists
    migrateLocalStorage();
    
    // Wait for stories to be loaded from external file
    if (typeof window.storiesData !== 'undefined') {
        stories = window.storiesData.stories || window.storiesData;
        renderStories();
    } else {
        // Fallback if external file fails
        stories = [
            {
                id: 1,
                title: "L'Île Mystérieuse",
                level: "beginner",
                cover: "🏝️",
                coverType: "emoji",
                wordCount: 350,
                content: ["Ceci est une histoire d'exemple. Cliquez sur des mots comme village ou voyage pour voir le dictionnaire."]
            }
        ];
        renderStories();
    }

    renderVocabulary();
    updateStats();
    applyTheme();
    initFlashcards(); // Initialize flashcards

    // Event listeners
    setupEventListeners();
}

// Migration function for localStorage keys
function migrateLocalStorage() {
    // Migrate saved words from old key to new key
    const oldKey = 'savedWords';
    const newKey = 'french_vocabulary';
    
    const oldData = localStorage.getItem(oldKey);
    if (oldData && !localStorage.getItem(newKey)) {
        localStorage.setItem(newKey, oldData);
        console.log(`Migrated vocabulary data from "${oldKey}" to "${newKey}"`);
    }
    
    // Also migrate theme if needed
    const oldThemeKey = 'theme';
    const newThemeKey = 'french_theme';
    const oldThemeData = localStorage.getItem(oldThemeKey);
    if (oldThemeData && !localStorage.getItem(newThemeKey)) {
        localStorage.setItem(newThemeKey, oldThemeData);
    }
    // Update theme variable to use new key
    theme = localStorage.getItem(newThemeKey) || 'light';
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
    
    // Refresh flashcards when switching to flashcards page
    if (page === 'flashcards') {
        loadFlashcards();
    }
}

function removeAll() {
    const confirmed = window.confirm("Êtes-vous sûr de vouloir supprimer tous les mots enregistrés ? Cette action ne peut pas être annulée.");

    if (!confirmed) return; // user canceled

    // Clear localStorage with new key
    localStorage.setItem('french_vocabulary', JSON.stringify([]));

    // Clear in-memory array
    savedWords = [];

    // Show notification in French
    showNotification(`Tous les mots ont été supprimés avec succès ! (${savedWords.length} mots)`);

    // Update UI
    renderVocabulary();
    updateStats();
}

// Open story in a new page WITH story title
function openStoryInNewPage(storyId) {
    // Find the story in the stories array
    const story = stories.find(s => s.id == storyId);

    if (story) {
        // Store the story data in localStorage before redirecting
        localStorage.setItem('french_current_story', JSON.stringify({ // Changed key
            id: story.id,
            title: story.title,
            level: story.level
        }));

        // Create a new page URL with the story ID
        const storyPage = 'reader/index.html?id=' + storyId;
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
                <p>Aucune histoire trouvée pour ce niveau.</p>
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
                <span class="story-level ${story.level}">${getFrenchLevel(story.level)}</span>
                <h3 class="story-title">${story.title}</h3>
                <p>${story.content[0].substring(0, 100)}...</p>
                <div class="story-meta">
                    <span><i class="fas fa-font"></i> ${story.wordCount || 'N/A'} mots</span>
                    <span><i class="fas fa-clock"></i> ${Math.ceil((story.wordCount || 100) / 200)} min de lecture</span>
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

// Helper function to get French level names
function getFrenchLevel(level) {
    const levels = {
        'beginner': 'Débutant',
        'intermediate': 'Intermédiaire',
        'advanced': 'Avancé'
    };
    return levels[level] || level.charAt(0).toUpperCase() + level.slice(1);
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
    const wordData = dictionary[word] || {
        translation: "Traduction non disponible"
    };

    document.getElementById('popupWord').textContent = word;
    document.getElementById('popupTranslation').textContent = wordData.translation;

    // Update save button
    const isSaved = savedWords.some(w => w.word === word);
    saveWordBtn.innerHTML = isSaved
        ? '<i class="fas fa-check"></i> Déjà enregistré'
        : '<i class="fas fa-bookmark"></i> Enregistrer le mot';
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
            <div class="dictionary-word">Traduction de la phrase</div>
            <button class="close-popup"><i class="fas fa-times"></i></button>
        </div>
        <div class="dictionary-definition">${sentence}</div>
        <div class="dictionary-example">Traduction en anglais de la phrase complète</div>
        <div class="dictionary-actions">
            <button class="close-popup">Fermer</button>
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
    const wordData = dictionary[word] || {};

    // Check if word is already saved
    if (savedWords.some(w => w.word === word)) {
        showNotification('Mot déjà enregistré !');
        return;
    }

    // Get story title
    let storyTitle = 'Inconnu';

    // Get story from localStorage (for reader page) - using new key
    const storyData = localStorage.getItem('french_current_story');
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
        hasTranslation: !!wordData.translation
    };

    // Add translation data if available
    if (wordData.translation) {
        newWord.translation = wordData.translation;
    } else {
        // For words without translations
        newWord.translation = "Traduction non disponible";
    }

    savedWords.push(newWord);
    localStorage.setItem('french_vocabulary', JSON.stringify(savedWords)); // Changed key
    renderVocabulary();
    updateStats();
    hideDictionary();

    // Update flashcard stats if we're on that page
    if (currentPage === 'flashcards') {
        updateFlashcardStats();
    }

    // Update word appearance in the story
    if (element) {
        element.classList.add('saved');
        element.classList.remove('unknown');
    }

    // Show confirmation message in French
    const message = wordData.translation
        ? `"${word}" enregistré dans le vocabulaire depuis "${storyTitle}" !`
        : `"${word}" enregistré dans le vocabulaire depuis "${storyTitle}" (traduction à ajouter plus tard)`;

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
                <p>Aucun mot enregistré. Cliquez sur des mots dans les histoires pour les ajouter à votre vocabulaire.</p>
            </div>
        `;
        return;
    }

    savedWords.forEach((word, index) => {
        const item = document.createElement('div');
        item.className = 'vocabulary-item';

        // Add warning badge for words without translations
        const translationBadge = !word.hasTranslation
            ? `<span class="no-translation-badge" style="background: #f59e0b; color: white; padding: 2px 6px; border-radius: 4px; font-size: 0.7rem; margin-left: 8px;">Pas de traduction</span>`
            : '';

        item.innerHTML = `
            <div class="word-info">
                <div class="word-main">
                    <span class="word-text">${word.word}</span>
                    <span class="word-translation">${word.translation}</span>
                    ${translationBadge}
                </div>
                ${word.story ? `<div class="word-story" style="font-size: 0.8rem; color: var(--text-light); margin-top: 5px;">De: ${word.story}</div>` : ''}
            </div>
            <div class="word-actions">
                <button title="Marquer comme connu" data-index="${index}">
                    <i class="fas fa-check"></i>
                </button>
                <button title="Supprimer" data-index="${index}">
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

// Mark word as known
function markAsKnown(index) {
    savedWords[index].status = 'known';
    savedWords[index].mastered = new Date().toISOString();
    localStorage.setItem('french_vocabulary', JSON.stringify(savedWords)); // Changed key
    showNotification('Mot marqué comme maîtrisé !');
    renderVocabulary();
    updateStats();
    updateFlashcardStats(); // Also update flashcard stats
}

// Delete word from vocabulary
function deleteWord(index) {
    const word = savedWords[index].word;
    savedWords.splice(index, 1);
    localStorage.setItem('french_vocabulary', JSON.stringify(savedWords)); // Changed key
    renderVocabulary();
    updateStats();
    updateFlashcardStats(); // Also update flashcard stats

    // Show deletion confirmation in French
    showNotification(`"${word}" supprimé du vocabulaire`);
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
    localStorage.setItem('french_theme', theme); // Changed key
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
    alert('La synthèse vocale jouerait ici. Cette fonctionnalité nécessite une implémentation API TTS réelle.');
    listenBtn.classList.toggle('active');
}

// Export vocabulary as CSV file
function exportVocabulary() {
    if (savedWords.length === 0) {
        showNotification('Aucun vocabulaire à exporter !');
        return;
    }

    // Create CSV content with headers in French
    const headers = ['Mot', 'Traduction', 'Statut', 'Histoire', 'Date d\'ajout'];

    // Create CSV rows
    const csvRows = [
        headers.join(','), // Add headers first
        ...savedWords.map(word => {
            return [
                `"${word.word || ''}"`,
                `"${(word.translation || '').replace(/"/g, '""')}"`, // Escape quotes in CSV
                `"${getFrenchStatus(word.status)}"`,
                `"${(word.story || '').replace(/"/g, '""')}"`,
                `"${word.added ? new Date(word.added).toLocaleDateString('fr-FR') : ''}"`
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
    link.setAttribute('download', `vocabulaire_francais_${formattedDate}.csv`);

    // Hide the link and trigger download
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();

    // Clean up
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    // Show success message in French
    showNotification(`Vocabulaire exporté avec succès ! (${savedWords.length} mots)`);
}

// Helper function to get French status
function getFrenchStatus(status) {
    const statusMap = {
        'saved': 'Enregistré',
        'known': 'Maîtrisé'
    };
    return statusMap[status] || status;
}

// =============== FLASHCARD FUNCTIONS ===============

// Initialize flashcards
function initFlashcards() {
    updateFlashcardStats();
    setupFlashcardListeners();
    // Don't load cards immediately, wait until page is shown
}

// Load flashcards from saved words
function loadFlashcards() {
    // Filter words that need review
    currentCards = savedWords.filter(word => {
        // If no nextReview date, it's due
        if (!word.nextReview) return true;
        
        // Check if review is due
        return new Date(word.nextReview) <= new Date();
    });
    
    // Initialize session
    sessionCards = [...currentCards];
    currentCardIndex = 0;
    cardsReviewed = 0;
    
    if (sessionCards.length > 0) {
        loadCard(0);
        enableCardButtons(true);
    } else {
        showNoCardsMessage();
        enableCardButtons(false);
    }
    
    updateProgress();
    updateFlashcardStats();
}

// Load a specific card
function loadCard(index) {
    if (index >= sessionCards.length) {
        showSessionComplete();
        return;
    }
    
    const card = sessionCards[index];
    
    // Front side (word)
    flashcardWord.textContent = card.word;
    flashcardTranslation.textContent = card.translation || "Traduction non disponible";
    
    // Back side details
    flashcardStory.textContent = card.story ? `De: ${card.story}` : "";
    
    // Reset card to front side
    flashcard.classList.remove('flipped');
    
    // Update progress
    updateProgress();
}

// Show no cards message
function showNoCardsMessage() {
    flashcardWord.textContent = "Aucune carte disponible";
    flashcardTranslation.textContent = "Ajoutez des mots des histoires pour les pratiquer";
    flashcardStory.textContent = "Lisez des histoires et enregistrez des mots pour les pratiquer ici";
    
    progressText.textContent = "0/0";
    progressFill.style.width = "0%";
}

// Show session complete message
function showSessionComplete() {
    flashcardWord.textContent = "Session terminée ! 🎉";
    flashcardTranslation.textContent = "Excellent travail !";
    flashcardStory.textContent = `Vous avez révisé ${cardsReviewed} cartes`;
    
    progressText.textContent = `${cardsReviewed}/${cardsReviewed}`;
    progressFill.style.width = "100%";
    
    enableCardButtons(false);
}

// Update progress display
function updateProgress() {
    const total = sessionCards.length;
    const reviewed = cardsReviewed;
    
    progressText.textContent = `${reviewed}/${total}`;
    
    if (total > 0) {
        const percentage = (reviewed / total) * 100;
        progressFill.style.width = `${percentage}%`;
    } else {
        progressFill.style.width = "0%";
    }
}

// Update flashcard statistics
function updateFlashcardStats() {
    const total = savedWords.length;
    const due = savedWords.filter(word => {
        if (!word.nextReview) return true;
        return new Date(word.nextReview) <= new Date();
    }).length;
    
    const mastered = savedWords.filter(word => word.status === 'known').length;
    const learning = savedWords.filter(word => word.status === 'saved').length;
    
    dueCards.textContent = due;
    totalCards.textContent = total;
    masteredCards.textContent = mastered;
    learningCards.textContent = learning;
}

// Set up flashcard event listeners
function setupFlashcardListeners() {
    // Flip card on click
    if (flashcard) {
        flashcard.addEventListener('click', () => {
            if (sessionCards.length > 0) {
                flashcard.classList.toggle('flipped');
            }
        });
    }
    
    // Card review buttons - updated with French labels
    if (cardAgain) cardAgain.addEventListener('click', () => reviewCard(1)); // Again (1 day)
    if (cardHard) cardHard.addEventListener('click', () => reviewCard(3)); // Hard (3 days)
    if (cardGood) cardGood.addEventListener('click', () => reviewCard(7)); // Good (7 days)
    if (cardEasy) cardEasy.addEventListener('click', () => reviewCard(14)); // Easy (14 days)
    
    // Control buttons
    if (shuffleCards) shuffleCards.addEventListener('click', shuffleFlashcards);
    if (resetProgress) resetProgress.addEventListener('click', resetCardProgress);
}

// Review a card with spaced repetition
function reviewCard(daysToAdd) {
    if (currentCardIndex >= sessionCards.length) return;
    
    const card = sessionCards[currentCardIndex];
    
    // Update card in savedWords
    const wordIndex = savedWords.findIndex(w => w.word === card.word);
    if (wordIndex !== -1) {
        // Calculate next review date
        const nextReviewDate = new Date();
        nextReviewDate.setDate(nextReviewDate.getDate() + daysToAdd);
        
        savedWords[wordIndex].nextReview = nextReviewDate.toISOString();
        
        // If marked "Again", reset to learning
        if (daysToAdd === 1) {
            savedWords[wordIndex].status = 'saved';
        }
        // If marked "Easy", mark as mastered
        else if (daysToAdd === 14) {
            savedWords[wordIndex].status = 'known';
            savedWords[wordIndex].mastered = new Date().toISOString();
        }
        
        // Save to localStorage with new key
        localStorage.setItem('french_vocabulary', JSON.stringify(savedWords)); // Changed key
    }
    
    // Move to next card
    cardsReviewed++;
    currentCardIndex++;
    
    if (currentCardIndex < sessionCards.length) {
        loadCard(currentCardIndex);
    } else {
        showSessionComplete();
    }
    
    // Update stats
    updateFlashcardStats();
    updateStats(); // Update main stats too
}

// Enable/disable card buttons
function enableCardButtons(enabled) {
    const buttons = [cardAgain, cardHard, cardGood, cardEasy];
    buttons.forEach(btn => {
        if (btn) btn.disabled = !enabled;
    });
}

// Shuffle flashcards
function shuffleFlashcards() {
    if (sessionCards.length > 0) {
        // Fisher-Yates shuffle algorithm
        for (let i = sessionCards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [sessionCards[i], sessionCards[j]] = [sessionCards[j], sessionCards[i]];
        }
        
        currentCardIndex = 0;
        cardsReviewed = 0;
        loadCard(currentCardIndex);
        
        showNotification('Cartes mélangées !');
    }
}

// Reset all card progress
function resetCardProgress() {
    const confirmed = confirm("Réinitialiser la progression de toutes les cartes ? Cela ramènera tous les mots à l'état 'à réviser'.");
    
    if (confirmed) {
        savedWords.forEach(word => {
            word.nextReview = new Date().toISOString();
            word.status = 'saved';
            delete word.mastered;
        });
        
        localStorage.setItem('french_vocabulary', JSON.stringify(savedWords)); // Changed key
        
        loadFlashcards();
        updateFlashcardStats();
        updateStats();
        
        showNotification('Progression des cartes réinitialisée !');
    }
}

// =============== END FLASHCARD FUNCTIONS ===============

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