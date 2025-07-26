// public/script.js

document.addEventListener('DOMContentLoaded', () => {
    // Get references to all the HTML elements
    const chapterSelect = document.getElementById('chapter-select');
    const topicSelect = document.getElementById('topic-select');
    const yearSelect = document.getElementById('year-select');
    const showButton = document.getElementById('show-button'); // Assuming your button has this ID
    const loader = document.getElementById('loader');
    const displayArea = document.getElementById('question-display-area');

    let metadata = {}; // We will store the fetched metadata here

    // --- 1. INITIALIZATION: Fetch metadata from the SECURE function ---
    async function initializeApp() {
        try {
            // WRONG WAY: fetch('/data/metadata.json');
            // RIGHT WAY: Fetch from the serverless function endpoint
            const response = await fetch('/.netlify/functions/getMetadata');
            
            if (!response.ok) {
                // If the function fails, throw an error
                throw new Error('Network response from getMetadata was not ok');
            }

            metadata = await response.json();
            
            // Populate the Chapter dropdown
            populateDropdown(chapterSelect, Object.keys(metadata.chapters), (key) => metadata.chapters[key].displayName);

            // Populate the Year dropdown
            const years = ["All Years", ...metadata.years];
            populateDropdown(yearSelect, years);

            // Add event listener to update Topics when a Chapter is chosen
            chapterSelect.addEventListener('change', updateTopicDropdown);
            updateTopicDropdown(); // Call it once to populate for the default chapter

        } catch (error) {
            console.error('Initialization Error:', error);
            displayArea.innerHTML = '<p class="error-message">Failed to load metadata. Please try again later.</p>';
        }
    }

    // --- 2. THE CORE LOGIC: Fetch questions from the SECURE function ---
    async function handleShowQuestions() {
        const selectedChapter = chapterSelect.value;
        if (!selectedChapter) {
            alert('Please select a chapter first.');
            return;
        }

        loader.style.display = 'block';
        displayArea.innerHTML = '';

        try {
            // WRONG WAY: fetch(`/data/questions/${selectedChapter}_all.json`);
            // RIGHT WAY: Fetch from the serverless function with a query parameter
            const response = await fetch(`/.netlify/functions/getQuestions?chapter=${selectedChapter}`);
            
            if (!response.ok) {
                throw new Error('Could not find questions for this chapter.');
            }
            
            const allQuestions = await response.json();
            filterAndDisplayQuestions(allQuestions);

        } catch (error) {
            console.error('Fetch Questions Error:', error);
            displayArea.innerHTML = `<p class="error-message">${error.message}</p>`;
        } finally {
            loader.style.display = 'none';
        }
    }

    // --- 3. HELPER FUNCTIONS ---
    function updateTopicDropdown() {
        const selectedChapterKey = chapterSelect.value;
        const topics = ["All Topics", ...(metadata.chapters[selectedChapterKey]?.topics || [])];
        populateDropdown(topicSelect, topics);
    }

    function populateDropdown(selectElement, items, getDisplayName = item => item) {
        selectElement.innerHTML = '';
        items.forEach(item => {
            const option = document.createElement('option');
            // For chapters, the value is the key (e.g., 'calculus')
            // For topics/years, the value is the display name itself.
            option.value = item === metadata.chapters[item]?.displayName ? item : item;
            option.textContent = getDisplayName(item);
            selectElement.appendChild(option);
        });
    }

    function filterAndDisplayQuestions(questions) {
        const selectedTopic = topicSelect.value;
        const selectedYear = yearSelect.value;

        const filteredQuestions = questions.filter(q => {
            const topicMatch = (selectedTopic === 'All Topics') || (q.topic === selectedTopic);
            const yearMatch = (selectedYear === 'All Years') || (q.year == selectedYear);
            return topicMatch && yearMatch;
        });

        if (filteredQuestions.length === 0) {
            displayArea.innerHTML = '<p>No questions match your filter criteria.</p>';
            return;
        }

        filteredQuestions.forEach(renderQuestion);
        if (window.MathJax) {
            MathJax.typesetPromise();
        }
    }

    function renderQuestion(question) {
        // ... (Your existing function to create the HTML for a question card)
        // This part is likely correct already.
        const card = document.createElement('div');
        card.className = 'question-card';
        card.innerHTML = `
            <div class="question-meta">
                <span>Chapter: ${question.chapter}</span>
                <span>Topic: ${question.topic}</span>
                <span>Year: ${question.year}</span>
            </div>
            <div class="question-body">
                <p>${question.questionText || ''}</p>
                ${question.latexCode ? `<div>$$${question.latexCode}$$</div>` : ''}
            </div>
            <div class="answer-container">
                <div class="answer-header">Click to reveal answer</div>
                <div class="answer-content">${question.answer}</div>
            </div>
        `;
        card.querySelector('.answer-container').addEventListener('click', (e) => {
            e.currentTarget.classList.toggle('visible');
        });
        displayArea.appendChild(card);
    }

    // --- 4. EVENT LISTENERS ---
    showButton.addEventListener('click', handleShowQuestions);

    // --- START THE APP ---
    initializeApp();
});
