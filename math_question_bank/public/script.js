document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const chapterSelect = document.getElementById('chapter-select');
    const topicSelect = document.getElementById('topic-select');
    const yearSelect = document.getElementById('year-select');
    const showBtn = document.getElementById('show-btn');
    const loader = document.getElementById('loader');
    const questionDisplayArea = document.getElementById('question-display-area');
    
    // Initialize the application
    initializeApp();
    
    // Event Listeners
    chapterSelect.addEventListener('change', updateTopicDropdown);
    showBtn.addEventListener('click', handleShowQuestions);
    
    // Initialize the app by loading metadata
    async function initializeApp() {
        try {
            const response = await fetch('./data/metadata.json');
            const metadata = await response.json();
            
            populateChapterDropdown(metadata.chapters);
            populateYearDropdown(metadata.years);
        } catch (error) {
            console.error('Error initializing app:', error);
            questionDisplayArea.innerHTML = '<p class="error">Failed to load metadata. Please try again later.</p>';
        }
    }
    
    // Populate chapter dropdown
    function populateChapterDropdown(chapters) {
        chapterSelect.innerHTML = '<option value="">Select Chapter</option>';
        
        Object.keys(chapters).forEach(key => {
            const option = document.createElement('option');
            option.value = key;
            option.textContent = chapters[key].displayName;
            chapterSelect.appendChild(option);
        });
    }
    
    // Populate year dropdown
    function populateYearDropdown(years) {
        yearSelect.innerHTML = '<option value="">All Years</option>';
        
        years.forEach(year => {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            yearSelect.appendChild(option);
        });
    }
    
    // Update topic dropdown based on selected chapter
    function updateTopicDropdown() {
        const selectedChapter = chapterSelect.value;
        
        // Reset topic dropdown
        topicSelect.innerHTML = '<option value="">All Topics</option>';
        
        if (!selectedChapter) return;
        
        // Fetch metadata to get topics for selected chapter
        fetch('math_question_bank/data/metadata.json')
            .then(response => response.json())
            .then(metadata => {
                const chapterData = metadata.chapters[selectedChapter];
                if (chapterData && chapterData.topics) {
                    chapterData.topics.forEach(topic => {
                        const option = document.createElement('option');
                        option.value = topic;
                        option.textContent = topic;
                        topicSelect.appendChild(option);
                    });
                }
            })
            .catch(error => {
                console.error('Error loading topics:', error);
            });
    }
    
    // Handle "Show Questions" button click
async function handleShowQuestions(event) {
    event.preventDefault();
    
    const selectedChapter = chapterSelect.value;
    const selectedTopic = topicSelect.value;
    const selectedYear = yearSelect.value;
    
    if (!selectedChapter) {
        alert('Please select a chapter');
        return;
    }
    
    // Show loader and clear previous results
    loader.classList.remove('hidden');
    questionDisplayArea.innerHTML = '';
    
    try {
        // Fetch questions from Netlify function
        const response = await fetch(`/.netlify/functions/getQuestions?chapter=${selectedChapter}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const questions = await response.json();
        
        // Filter questions based on selected topic and year
        const filteredQuestions = filterQuestions(questions, selectedTopic, selectedYear);
        
        // Display filtered questions
        displayQuestions(filteredQuestions);
    } catch (error) {
        console.error('Error fetching questions:', error);
        questionDisplayArea.innerHTML = '<p class="error">Failed to load questions. Please try again later.</p>';
    } finally {
        loader.classList.add('hidden');
    }
}
    
    // Filter questions based on topic and year
    function filterQuestions(questions, topic, year) {
        return questions.filter(question => {
            const topicMatch = !topic || question.topic === topic;
            const yearMatch = !year || question.year.toString() === year;
            return topicMatch && yearMatch;
        });
    }
    
    // Display questions in the UI
    function displayQuestions(questions) {
        if (questions.length === 0) {
            questionDisplayArea.innerHTML = '<p class="no-results">No questions found matching your criteria.</p>';
            return;
        }
        
        questionDisplayArea.innerHTML = '';
        
        questions.forEach(question => {
            const questionCard = createQuestionCard(question);
            questionDisplayArea.appendChild(questionCard);
        });
        
        // Re-render MathJax for new content
        if (typeof MathJax !== 'undefined') {
            MathJax.typesetPromise([questionDisplayArea]);
        }
    }
    
    // Create a question card element
    function createQuestionCard(question) {
        const card = document.createElement('div');
        card.className = 'question-card';
        
        // Format LaTeX if present
        const latexContent = question.latexCode ? 
            `<div class="latex-display">$$${question.latexCode}$$</div>` : '';
        
        card.innerHTML = `
            <div class="question-header">
                <span>${question.chapter}</span>
                <span>${question.topic}</span>
                <span>${question.year}</span>
            </div>
            <div class="question-content">
                <div class="question-text">${question.questionText}</div>
                ${latexContent}
                <div class="answer-container">
                    <div class="answer-header">Show Answer</div>
                    <div class="answer-content">
                        <div class="answer-text">$$${question.answer}$$</div>
                    </div>
                </div>
            </div>
        `;
        
        // Add click event to toggle answer visibility
        const answerHeader = card.querySelector('.answer-header');
        answerHeader.addEventListener('click', () => {
            card.classList.toggle('expanded');
        });
        
        return card;
    }
});
