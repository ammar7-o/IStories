document.querySelector(".app").insertAdjacentHTML("beforeend", `
    <!-- Reading Progress Bar -->
    <div class="reading-progress">
        <div class="reading-progress-bar" id="readingProgressBar"></div>
    </div>

    <!-- Header -->
    <header>
        <div class="container">
            <div class="header-content">
                <a href="index.html" class="logo">
                    <i class="fas fa-book-open"></i>
                    <span>IStories</span>
                </a>
                <div class="header-actions">
                    <button class="theme-toggle" id="themeToggle">
                        <i class="fas fa-moon"></i>
                    </button>
                </div>
            </div>
        </div>
    </header>

    <!-- Main Content -->
    <main class="main-content">
        <div class="container">
            <!-- Navigation Tabs -->
            <div class="nav-tabs">
                <button class="nav-tab active" data-page="story">Read Story</button>
                <button class="nav-tab" data-page="vocabulary">Vocabulary</button>
            </div>

            <!-- Story Reading Page -->
            <div id="storyPage" class="page active">
                <div class="story-header">
                    <button class="back-button" id="backToHome">
                        <i class="fas fa-arrow-left"></i> Back to Stories
                    </button>
                    <h2 id="storyTitle">Loading Story...</h2><span id="lvl">hello</span>
                </div>

                <div class="reading-controls">
                    <button class="control-btn" id="fontSmaller"><i class="fas fa-minus"></i> <span>A-</span></button>
                    <button class="control-btn active" id="fontNormal"><i class="fas fa-text-height"></i> <span>A</span></button>
                    <button class="control-btn" id="fontLarger"><i class="fas fa-plus"></i> <span>A+</span></button>
                    <button class="control-btn" id="lineSpacing"><i class="fas fa-arrows-alt-v"></i> <span>Spacing</span></button>
             <audio controls id="sound" src="" controls></audio>


                </div>

                <div class="story-text-container">
                    <div class="story-text" id="storyText">Loading story content...</div>
                </div>
            </div>

            <!-- Vocabulary Page -->
            <div id="vocabularyPage" class="page">
                <div class="vocabulary-header">
                    <h2>My Vocabulary</h2>
                    <button class="btn btn-primary" id="exportVocabulary">
                        <i class="fas fa-download"></i> Export CSV
                    </button>
                </div>

                <div class="vocabulary-stats">
                    <div class="stat-card">
                        <div class="stat-number" id="totalWords">0</div>
                        <div class="stat-label">Total Words</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number" id="masteredWords">0</div>
                        <div class="stat-label">Mastered</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number" id="practiceDue">0</div>
                        <div class="stat-label">Due for Practice</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number" id="readingStreak">0</div>
                        <div class="stat-label">Day Streak</div>
                    </div>
                </div>

                <div class="vocabulary-list" id="vocabularyList"></div>
            </div>
        </div>
    </main>

    <!-- Dictionary Popup -->
    <div class="dictionary-popup" id="dictionaryPopup">
        <div class="dictionary-header">
            <div class="dictionary-word" style="margin-right: 10px;" id="popupWord">Word</div>
            <button class="close-popup" id="closePopup">
                <i class="fas fa-times"></i>
            </button>
        </div>
        <div class="dictionary-pos" style="display: none;" id="popupPos">noun</div>
        <div class="dictionary-definition" style="display: none;" id="popupDefinition">Definition here</div>
        <div class="dictionary-example" style="display: none;" id="popupExample">Example here</div>
        <div class="dictionary-translation" style="font-size: 20px;" id="popupTranslation">Translation here</div>
        <div class="dictionary-actions">
            <button class="save-word" id="saveWordBtn">
                <i class="fas fa-bookmark"></i> Save Word
            </button>
        </div>
    </div>
`);
