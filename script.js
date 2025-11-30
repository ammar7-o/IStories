
        // App state
        let currentPage = 'home';
        let currentStory = null;
        let savedWords = JSON.parse(localStorage.getItem('savedWords')) || [];
        let theme = localStorage.getItem('theme') || 'light';
        let fontSize = 1.2; // rem
        let lineHeight = 1.8;
        let stories = []; // Will be loaded from external file

     

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
        const practiceBtn = document.getElementById('practiceBtn');
        const uploadStoryBtn = document.getElementById('uploadStoryBtn');
        const adminTabs = document.querySelectorAll('.admin-tab');
        const adminContents = document.querySelectorAll('.admin-content');

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
                        title: "Sample Story",
                        level: "beginner",
                        content: ["This is a sample story. Click on words like village or journey to see the dictionary."],
                        wordCount: 10
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
                });
            });

            levelBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    levelBtns.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    renderStories(btn.dataset.level);
                });
            });

            backToStories.addEventListener('click', () => switchPage('home'));

            themeToggle.addEventListener('click', toggleTheme);

            fontSmaller.addEventListener('click', () => adjustFontSize(-0.1));
            fontNormal.addEventListener('click', () => resetFontSize());
            fontLarger.addEventListener('click', () => adjustFontSize(0.1));
            lineSpacingBtn.addEventListener('click', toggleLineSpacing);
            listenBtn.addEventListener('click', toggleAudio);

            saveWordBtn.addEventListener('click', saveCurrentWord);
            closePopup.addEventListener('click', hideDictionary);

            practiceBtn.addEventListener('click', startPractice);
            uploadStoryBtn.addEventListener('click', uploadStory);

            adminTabs.forEach(tab => {
                tab.addEventListener('click', () => {
                    const tabId = tab.dataset.tab;
                    adminTabs.forEach(t => t.classList.remove('active'));
                    adminContents.forEach(c => c.classList.remove('active'));
                    tab.classList.add('active');
                    document.getElementById(`${tabId}Tab`).classList.add('active');
                });
            });

            // Close dictionary when clicking outside
            document.addEventListener('click', (e) => {
                if (!dictionaryPopup.contains(e.target) && !e.target.classList.contains('word')) {
                    hideDictionary();
                }
            });

            // Touch events for mobile long press
            document.addEventListener('touchstart', handleTouchStart);
            document.addEventListener('touchend', handleTouchEnd);
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

        // Render stories grid
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
                storyCard.innerHTML = `
            <div class="story-image">
                <i class="fas fa-book"></i>
            </div>
            <div class="story-content">
                <span class="story-level ${story.level}">${story.level.charAt(0).toUpperCase() + story.level.slice(1)}</span>
                <h3 class="story-title">${story.title}</h3>
                <p>${story.content[0].substring(0, 100)}...</p>
                <div class="story-meta">
                    <span><i class="fas fa-font"></i> ${story.wordCount} words</span>
                    <span><i class="fas fa-clock"></i> ${Math.ceil(story.wordCount / 200)} min read</span>
                </div>
            </div>
        `;

                storyCard.addEventListener('click', () => openStory(story));
                storiesGrid.appendChild(storyCard);
            });
        }

        // Open a story with word selection
        function openStory(story) {
            currentStory = story;
            document.getElementById('storyTitle').textContent = story.title;

            // Render story content with interactive words
            storyText.innerHTML = '';
            story.content.forEach(paragraph => {
                const p = document.createElement('div');
                p.className = 'paragraph';

                // Add paragraph controls
                const controls = document.createElement('div');
                controls.className = 'paragraph-controls';
                controls.innerHTML = `<button class="control-btn"><i class="fas fa-volume-up"></i></button>`;
                p.appendChild(controls);

                // Process text to make ALL words clickable, not just those in dictionary
                const words = paragraph.split(' ');
                const processedWords = words.map(word => {
                    const cleanWord = word.replace(/[.,!?;:"]/g, '').toLowerCase();
                    const isUnknown = savedWords.some(w => w.word === cleanWord && w.status === 'unknown');
                    const isSaved = savedWords.some(w => w.word === cleanWord && w.status === 'saved');

                    let className = 'word';
                    if (isUnknown) className += ' unknown';
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
        }

        // Set up word interactions (click and long press)
        function setupWordInteractions() {
            document.querySelectorAll('.word').forEach(word => {
                // Click for dictionary
                word.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const wordText = word.dataset.word;

                    if (dictionary[wordText]) {
                        // Word has translation - show dictionary
                        showDictionary(wordText, word);
                    } else {
                        // Word has no translation - show message
                        showNoTranslationMessage(wordText, word);
                    }
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
            if (!wordData) return;

            document.getElementById('popupWord').textContent = word;
            document.getElementById('popupPos').textContent = wordData.pos;
            document.getElementById('popupDefinition').textContent = wordData.definition;
            document.getElementById('popupExample').textContent = wordData.example;
            document.getElementById('popupTranslation').textContent = wordData.translation;

            // Update save button text for words with translations
            saveWordBtn.innerHTML = '<i class="fas fa-bookmark"></i> Save Word';
            saveWordBtn.style.display = 'block';

            // Position the popup near the word
            const rect = element.getBoundingClientRect();
            dictionaryPopup.style.top = `${rect.bottom + window.scrollY + 10}px`;
            dictionaryPopup.style.left = `${Math.max(10, rect.left + window.scrollX - 150)}px`;
            dictionaryPopup.style.display = 'block';

            // Store current word for saving
            dictionaryPopup.currentWord = word;
            dictionaryPopup.currentElement = element;
            dictionaryPopup.hasTranslation = true;
        }

        // Show message for words without translations
        function showNoTranslationMessage(word, element) {
            // Update popup content for no translation
            document.getElementById('popupWord').textContent = word;
            document.getElementById('popupPos').textContent = "No data available";
            document.getElementById('popupDefinition').textContent = "This word is not yet in our dictionary.";
            document.getElementById('popupExample').textContent = "We're constantly adding new words to our database.";
            document.getElementById('popupTranslation').textContent = "لا توجد ترجمة متاحة";

            // Update save button text for words without translations
            saveWordBtn.innerHTML = '<i class="fas fa-bookmark"></i> Save Word (No Translation)';
            saveWordBtn.style.display = 'block';

            // Position the popup near the word
            const rect = element.getBoundingClientRect();
            dictionaryPopup.style.top = `${rect.bottom + window.scrollY + 10}px`;
            dictionaryPopup.style.left = `${Math.max(10, rect.left + window.scrollX - 150)}px`;
            dictionaryPopup.style.display = 'block';

            // Store current word
            dictionaryPopup.currentWord = word;
            dictionaryPopup.currentElement = element;
            dictionaryPopup.hasTranslation = false;
        }

        // Hide dictionary popup
        function hideDictionary() {
            dictionaryPopup.style.display = 'none';
            dictionaryPopup.currentWord = null;
            dictionaryPopup.currentElement = null;
            dictionaryPopup.hasTranslation = false;
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

        // Save current word to vocabulary (works for both words with and without translations)
        function saveCurrentWord() {
            const word = dictionaryPopup.currentWord;
            if (!word) return;

            const hasTranslation = dictionaryPopup.hasTranslation;
            const wordData = dictionary[word];

            // Check if word is already saved
            const existingIndex = savedWords.findIndex(w => w.word === word);

            if (existingIndex === -1) {
                // Create new word entry
                const newWord = {
                    word: word,
                    status: 'saved',
                    added: new Date().toISOString(),
                    nextReview: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
                    story: currentStory ? currentStory.title : 'Unknown',
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
            } else {
                savedWords[existingIndex].status = 'saved';
                savedWords[existingIndex].hasTranslation = hasTranslation;
            }

            localStorage.setItem('savedWords', JSON.stringify(savedWords));
            renderVocabulary();
            updateStats();
            hideDictionary();

            // Update word appearance in the story
            if (dictionaryPopup.currentElement) {
                dictionaryPopup.currentElement.classList.add('saved');
                dictionaryPopup.currentElement.classList.remove('unknown');
            }

            // Show confirmation message
            const message = hasTranslation
                ? `"${word}" saved to vocabulary with translation!`
                : `"${word}" saved to vocabulary (translation will be added later)`;

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
    `;

            document.body.appendChild(notification);

            // Remove after 3 seconds
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
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
                    <span class="word-pos">${word.pos}</span>
                    <span class="word-translation">${word.translation}</span>
                    ${translationBadge}
                </div>
                <div class="word-example">${word.example}</div>
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

        // Mark word as known
        function markAsKnown(index) {
            savedWords[index].status = 'known';
            savedWords[index].mastered = new Date().toISOString();
            localStorage.setItem('savedWords', JSON.stringify(savedWords));
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

            // Count words without translations
            const wordsWithoutTranslation = savedWords.filter(w => !w.hasTranslation).length;

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

        // Start vocabulary practice
        function startPractice() {
            if (savedWords.length === 0) {
                alert('Add some words to your vocabulary first!');
                return;
            }

            alert('Starting flashcard practice with spaced repetition. This would open a practice interface in a real implementation.');
        }

        // Upload a new story (demo functionality)
        function uploadStory() {
            const title = document.getElementById('adminStoryTitle').value;
            const level = document.getElementById('storyLevel').value;
            const content = document.getElementById('storyContent').value;

            if (!title || !content) {
                alert('Please fill in all required fields');
                return;
            }

            // In a real app, this would send to a backend
            alert(`Story "${title}" uploaded successfully! This would be saved to a database in a real implementation.`);

            // Clear form
            document.getElementById('adminStoryTitle').value = '';
            document.getElementById('storyContent').value = '';
        }

        // Initialize the app when DOM is loaded
        document.addEventListener('DOMContentLoaded', init);
        // Add this function to render cover images
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

        // Update the renderStories function to use covers
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
                storyCard.innerHTML = `
            <div class="story-image">
                ${renderStoryCover(story)}
            </div>
            <div class="story-content">
                <span class="story-level ${story.level}">${story.level.charAt(0).toUpperCase() + story.level.slice(1)}</span>
                <h3 class="story-title">${story.title}</h3>
                <p>${story.content[0].substring(0, 100)}...</p>
                <div class="story-meta">
                    <span><i class="fas fa-font"></i> ${story.wordCount} words</span>
                    <span><i class="fas fa-clock"></i> ${Math.ceil(story.wordCount / 200)} min read</span>
                </div>
            </div>
        `;

                storyCard.addEventListener('click', () => openStory(story));
                storiesGrid.appendChild(storyCard);
            });
        }
   