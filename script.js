//  words for the typing test
const commonWords = [
    "the", "be", "to", "of", "and", "a", "in", "that", "have", "it", "for", "not", "on", "with", "he", "as", 
    "you", "do", "at", "this", "but", "his", "by", "from", "they", "we", "say", "her", "she", "or", "an", "will", 
    "my", "one", "all", "would", "there", "their", "what", "so", "up", "out", "if", "about", "who", "get", "which", 
    "go", "me", "when", "make", "can", "like", "time", "no", "just", "him", "know", "take", "people", "into", "year", 
    "your", "good", "some", "could", "them", "see", "other", "than", "then", "now", "look", "only", "come", "its", 
    "over", "think", "also", "back", "after", "use", "two", "how", "our", "work", "first", "well", "way", "even", 
    "new", "want", "because", "any", "these", "give", "day", "most", "us"
];


const wordsDisplay = document.getElementById('words-display');
const typingInput = document.getElementById('typing-input');
const wpmDisplay = document.getElementById('wpm');
const accuracyDisplay = document.getElementById('accuracy');
const timerDisplay = document.getElementById('timer');
const restartButton = document.getElementById('restart-button');
const timeOptions = document.querySelectorAll('.time-option');
const resultsContainer = document.getElementById('results-container');
const wpmChartCanvas = document.getElementById('wpm-chart');


// ------------------------------------------------------------------------------------

// all variables

let words = [];
let wordIndex = 0;
let letterIndex = 0;
let startTime;
let timerIntervals;  
let testTime = 30; // default time
let timerRunning = false;
let correctCharacters = 0;
let totalTypedCharacters = 0;
let totalWords = 0;
let spacePressedTrack = false;
let wpmHistory = [];
let accuracyHistory = [];
let dataPointInterval = 2; // collect data every 2 seconds
let wpmChart = null;


// ------------------------------------------------------------------------------------

// Generate random words
function generateWords(count = 100) {
    const selectedWords = [];
    for (let i = 0; i < count; i++) {
        const randomIndex = Math.floor(Math.random() * commonWords.length);
        selectedWords.push(commonWords[randomIndex]);
    }
    return selectedWords;
}

// ------------------------------------------------------------------------------------


function renderWords() {
    wordsDisplay.innerHTML = '';
    words.forEach((word, index) => {
        const wordSpan = document.createElement('span');
        wordSpan.classList.add('word');
        
        if (index === wordIndex) {
            wordSpan.classList.add('current');
        }
        
        for (let i = 0; i < word.length; i++) {
            const letterSpan = document.createElement('span');
            letterSpan.classList.add('letter');
            letterSpan.textContent = word[i];
            
            if (index === wordIndex && i < letterIndex) {
                const typedLetter = typingInput.value[i];
                if (typedLetter === word[i]) {
                    letterSpan.classList.add('correct');
                } else {
                    letterSpan.classList.add('incorrect');
                }
            }
            
            wordSpan.appendChild(letterSpan);
        }
        
        wordsDisplay.appendChild(wordSpan);
    });
}

// ------------------------------------------------------------------------------------

// Start the timer
function startTimer() {
    startTime = new Date();
    timerRunning = true;
    wpmHistory = [];
    accuracyHistory = [];
    
   
    resultsContainer.classList.add('hidden');
    
    timerIntervals = setInterval(() => {    
        const currentTime = new Date();
        const elapsedTime = Math.floor((currentTime - startTime) / 1000);
        const remainingTime = testTime - elapsedTime;
        
        if (remainingTime <= 0) {
            endTest();
            return;
        }
        
        timerDisplay.textContent = remainingTime + 's';
        
        // Update WPM in real-time
        updateWpm(elapsedTime);
        
       
        if (elapsedTime % dataPointInterval === 0) {
            const wpm = calculateWpm(elapsedTime);
            const accuracy = calculateAccuracy();
            
            wpmHistory.push({
                time: elapsedTime,
                wpm: wpm
            });
            
            accuracyHistory.push({
                time: elapsedTime,
                accuracy: accuracy
            });
        }
    }, 1000);
}

// ------------------------------------------------------------------------------------

// Calculate and update WPM display
function updateWpm(elapsedTimeInSeconds) {
    if (elapsedTimeInSeconds === 0) return;
    
    const wpm = calculateWpm(elapsedTimeInSeconds);
    const accuracy = calculateAccuracy();
    
    wpmDisplay.textContent = wpm;
    accuracyDisplay.textContent = accuracy + '%';
}

// ------------------------------------------------------------------------------------

// Calculate WPM
function calculateWpm(elapsedTimeInSeconds) {
    
    const minutes = elapsedTimeInSeconds / 60;
    
    const wordsTyped = totalWords;

    return minutes > 0 ? Math.round(wordsTyped / minutes) : 0;
}

// ------------------------------------------------------------------------------------

// Calculate accuracy

function calculateAccuracy() {
    // Avoid division by zero
    if (totalTypedCharacters === 0) return 0;
    
    return Math.round((correctCharacters / totalTypedCharacters) * 100);
}


// ------------------------------------------------------------------------------------

// Create chart to visualize WPM and accuracy
function createResultsChart() {
    if (wpmChart) {
        wpmChart.destroy();
    }
    
    const labels = wpmHistory.map(dataPoint => dataPoint.time + 's');
    
    // Create the chart
    wpmChart = new Chart(wpmChartCanvas, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'WPM',
                    data: wpmHistory.map(dataPoint => dataPoint.wpm),
                    borderColor: '#e2b714',
                    backgroundColor: 'rgba(226, 183, 20, 0.1)',
                    tension: 0.3,
                    fill: true
                },
                {
                    label: 'Accuracy (%)',
                    data: accuracyHistory.map(dataPoint => dataPoint.accuracy),
                    borderColor: '#4caf50',
                    backgroundColor: 'rgba(76, 175, 80, 0.1)',
                    tension: 0.3,
                    fill: true
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        color: '#d1d0c5'
                    }
                },
                title: {
                    display: true,
                    text: 'WPM and Accuracy Over Time',
                    color: '#e2b714'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(100, 102, 105, 0.2)'
                    },
                    ticks: {
                        color: '#d1d0c5'
                    }
                },
                x: {
                    grid: {
                        color: 'rgba(100, 102, 105, 0.2)'
                    },
                    ticks: {
                        color: '#d1d0c5'
                    }
                }
            }
        }
    });
}

// ------------------------------------------------------------------------------------

// End the typing test
function endTest() {
    clearInterval(timerIntervals); 
    timerRunning = false;
    typingInput.disabled = true;
    
    // Calculate final WPM and accuracy
    const elapsedMinutes = (new Date() - startTime) / 60000;
    
   
    const wpm = elapsedMinutes > 0 ? Math.round(totalWords / elapsedMinutes) : 0;
    const accuracy = calculateAccuracy();
    
    wpmDisplay.textContent = wpm;
    accuracyDisplay.textContent = accuracy + '%';
    timerDisplay.textContent = '0s';
    
    
    resultsContainer.classList.remove('hidden');
    createResultsChart();
}

// ------------------------------------------------------------------------------------

// Initialize the test
function initTest() {
    words = generateWords();
    wordIndex = 0;
    letterIndex = 0;
    correctCharacters = 0;
    totalTypedCharacters = 0;
    totalWords = 0;
    timerRunning = false;
    
    wpmDisplay.textContent = '0';
    accuracyDisplay.textContent = '0%';
    timerDisplay.textContent = testTime + 's';
    
    typingInput.disabled = false;
    typingInput.value = '';
    typingInput.focus();
    
    clearInterval(timerIntervals); 
    resultsContainer.classList.add('hidden');
    renderWords();
}

// ------------------------------------------------------------------------------------

// Handle backspace functionality
function handleBackspace() {
    if (letterIndex > 0) {
        letterIndex--;
        
        renderWords();
    }
}

// ------------------------------------------------------------------------------------

// Event listeners --------------------------
typingInput.addEventListener('input', (e) => {
    const inputValue = e.target.value;
    
    if (inputValue.length < letterIndex) {
        handleBackspace();
        return;
    }
    
    if (!timerRunning && inputValue.length > 0) {
        startTimer();
    }
    
    const currentWord = words[wordIndex];
    
    
    if (inputValue.endsWith(' ')) {
        // Check if the word is correct
        const typedWord = inputValue.trim();
        
        
        for (let i = 0; i < typedWord.length; i++) {
            totalTypedCharacters++;
            
            if (i < currentWord.length && typedWord[i] === currentWord[i]) {
                correctCharacters++;
            }
        }
        
        
        totalTypedCharacters++;
        
        
        if (typedWord === currentWord) {
            totalWords++;
        } else {
           
            if (typedWord.length > 0) {
                
                const matchLength = Math.min(typedWord.length, currentWord.length);
                let correctChars = 0;
                
                for (let i = 0; i < matchLength; i++) {
                    if (typedWord[i] === currentWord[i]) {
                        correctChars++;
                    }
                }
                
               
                const partialWordValue = correctChars / currentWord.length;
                totalWords += partialWordValue;
            }
        }
        
        wordIndex++;
        letterIndex = 0;
        
      
        e.target.value = '';
        
        
        if (wordIndex >= words.length) {
            words = words.concat(generateWords());
        }
        
        renderWords();
    } else {
        
        if (letterIndex < inputValue.length) {
            const newChar = inputValue[inputValue.length - 1];
            totalTypedCharacters++;
            
            if (letterIndex < currentWord.length && newChar === currentWord[letterIndex]) {
                correctCharacters++;
            }
            
            letterIndex = inputValue.length;
            renderWords();
        }
    }
});

// ----------------------------------------------------------------------------------


timeOptions.forEach(option => {
    option.addEventListener('click', () => {
        timeOptions.forEach(btn => btn.classList.remove('selected'));
        option.classList.add('selected');
        testTime = parseInt(option.getAttribute('data-time'));
        timerDisplay.textContent = testTime + 's';
        
        if (!timerRunning) {
            initTest();
        }
    });
});

// ------------------------------------------------------------------------------------

// Restart button
restartButton.addEventListener('click', () => {
    initTest();
});

// ------------------------------------------------------------------------------------

// Keyboard shortcut for restart (Space + Enter)
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        spacePressedTrack = true;
    }
    
    if (e.code === 'Enter' && spacePressedTrack) {
        e.preventDefault();
        initTest();
    }
});

document.addEventListener('keyup', (e) => {
    if (e.code === 'Space') {
        spacePressedTrack = false;
    }
});

// ------------------------------------------------------------------------------------

// Initialize the test on page load
window.addEventListener('load', () => {
    initTest();
});