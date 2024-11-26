document.addEventListener('DOMContentLoaded', () => {
    const columns = document.querySelectorAll('.column');
    const syllableBoxes = document.querySelectorAll('.syllable-box');
    let timeElapsed = 0;
    let gameRunning = true;
    const timerElement = document.getElementById('time');
    const scoreElement = document.getElementById('score');
    let score = 0;
    const matchedWordsSet = new Set();

    // Submit button creation and styling
    const submitButton = document.createElement('button');
    submitButton.id = 'submit-button';
    submitButton.textContent = 'Submit';
    document.body.appendChild(submitButton);

    // Submit button styling
    submitButton.style.padding = '10px 20px';
    submitButton.style.marginTop = '10px';
    submitButton.style.border = '2px solid #28a745';
    submitButton.style.borderRadius = '5px';
    submitButton.style.fontSize = '16px';
    submitButton.style.backgroundColor = '#28a745';
    submitButton.style.color = 'white';
    submitButton.style.cursor = 'pointer';

    // Timer update function
    const updateTimer = () => {
        const minutes = Math.floor(timeElapsed / 60);
        const seconds = timeElapsed % 60;
        timerElement.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    // Start and control the timer
    let countdownInterval = setInterval(() => {
        if (gameRunning) {
            timeElapsed++;
            updateTimer();
        }
    }, 1000);

    submitButton.addEventListener('click', () => {
        if (gameRunning) {
            const allMatched = checkCompletion();
            gameRunning = false;
            submitButton.disabled = true;

            // Show appropriate pop-up
            if (allMatched) {
                showPopUp(`Congratulations! Score: ${score}. You have matched all words correctly.`, false);
            } else {
                showPopUp(`Your current Score is ${score}`, true);
            }
        }
    });

    // Shuffle syllables within each column
    function shuffleColumn(column) {
        const boxes = Array.from(column.children);
        for (let i = boxes.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            column.appendChild(boxes[j]);
        }
    }

    columns.forEach(column => {
        shuffleColumn(column);

        column.addEventListener('dragover', (event) => {
            event.preventDefault();
        });

        column.addEventListener('drop', (event) => {
            event.preventDefault();
            if (!gameRunning) return;

            const draggedBox = document.querySelector('.dragging');
            if (draggedBox && column === draggedBox.parentElement) {
                const dropTarget = document.elementFromPoint(event.clientX, event.clientY);
                const dropBox = dropTarget ? dropTarget.closest('.syllable-box') : null;

                if (dropBox && dropBox !== draggedBox) {
                    const draggedIndex = Array.from(column.children).indexOf(draggedBox);
                    const dropIndex = Array.from(column.children).indexOf(dropBox);

                    if (draggedIndex < dropIndex) {
                        column.insertBefore(draggedBox, dropBox.nextSibling);
                        column.insertBefore(dropBox, column.children[draggedIndex]);
                    } else {
                        column.insertBefore(draggedBox, dropBox);
                        column.insertBefore(dropBox, column.children[draggedIndex + 1]);
                    }
                }
                checkCompletion();
            }
        });

        // Touch events for mobile compatibility
        column.addEventListener('touchmove', (event) => {
            event.preventDefault(); // Prevent scrolling while dragging
        });

        column.addEventListener('touchend', (event) => {
            const touch = event.changedTouches[0];
            const dropTarget = document.elementFromPoint(touch.clientX, touch.clientY);
            handleDrop(dropTarget);
        });
    });

    syllableBoxes.forEach(box => {
        box.setAttribute('draggable', 'true');

        box.addEventListener('dragstart', () => {
            if (!gameRunning) return;
            box.classList.add('dragging');
        });

        box.addEventListener('dragend', () => {
            box.classList.remove('dragging');
        });

        // Touch events for mobile compatibility
        box.addEventListener('touchstart', (event) => {
            if (!gameRunning) return;
            box.classList.add('dragging');
            event.preventDefault(); 
        });

        box.addEventListener('touchend', (event) => {
            box.classList.remove('dragging');
            const touch = event.changedTouches[0];
            const dropTarget = document.elementFromPoint(touch.clientX, touch.clientY);
            handleDrop(dropTarget);
        });
    });

    function handleDrop(dropTarget) {
        if (!gameRunning) return;

        const draggedBox = document.querySelector('.dragging');
        if (draggedBox && dropTarget) {
            const dropBox = dropTarget.closest('.syllable-box');
            if (dropBox && dropBox !== draggedBox) {
                const draggedIndex = Array.from(draggedBox.parentElement.children).indexOf(draggedBox);
                const dropIndex = Array.from(dropBox.parentElement.children).indexOf(dropBox);

                // Swap the boxes
                if (draggedIndex < dropIndex) {
                    dropBox.parentElement.insertBefore(draggedBox, dropBox.nextSibling);
                    dropBox.parentElement.insertBefore(dropBox, dropBox.parentElement.children[draggedIndex]);
                } else {
                    dropBox.parentElement.insertBefore(draggedBox, dropBox);
                    dropBox.parentElement.insertBefore(dropBox, dropBox.parentElement.children[draggedIndex + 1]);
                }
            }
            checkCompletion();
        }
    }

    function checkCompletion() {
        const correctWords = [
            ["af", "ter", "noon"],
            ["any", "thing", "blank"],
            ["news", "pa", "per"],
            ["pic", "nic", "blank"],
            ["Sa", "tur", "day"],
            ["to", "ge", "ther"],
            ["trou", "ble", "blank"]
        ];

        let matchedCount = 0;

        correctWords.forEach((correctWord) => {
            let wordMatched = false;

            for (let i = 0; i < correctWords.length; i++) {
                const currentWord = Array.from(columns).map(column => {
                    const text = column.children[i]?.textContent.trim();
                    return text === "" ? "blank" : text;
                });

                if (
                    correctWord[0] === currentWord[0] &&
                    correctWord[1] === currentWord[1] &&
                    correctWord[2] === currentWord[2] &&
                    !matchedWordsSet.has(correctWord.join('-'))
                ) {
                    wordMatched = true;
                    matchedWordsSet.add(correctWord.join('-'));
                    score += 1;
                    matchedCount += 1;
                    break;
                }
            }
        });

        // When score reaches 7, show pop-up
        if (score === 7) {
            clearInterval(countdownInterval);
            showPopUp(`Congratulations! All words matched successfully! Score: ${score}`, false);
            gameRunning = false;
        }

        scoreElement.textContent = `Score: ${score}`;
        return score === 7;
    }

    // Function to show a pop-up message with appropriate buttons
    function showPopUp(message, showContinue) {
        const existingPopUp = document.querySelector('.popup');
        if (existingPopUp) {
            existingPopUp.remove();
        }

        const popUp = document.createElement('div');
        popUp.classList.add('popup');
        popUp.innerHTML = `
            <div class="popup-content">
                <p>${message}</p>
                <button id="start-again" style="padding: 10px 20px; margin: 5px; border: 2px solid #007bff; border-radius: 5px; background-color: #007bff; color: white; font-size: 14px; cursor: pointer;">Start Again</button>
                ${!showContinue ? '' : `<button id="continue-game" style="padding: 10px 20px; margin: 5px; border: 2px solid #ffc107; border-radius: 5px; background-color: #ffc107; color: white; font-size: 14px; cursor: pointer;">Continue Game</button>`}
            </div>
        `;
        document.body.appendChild(popUp);

        document.getElementById('start-again').addEventListener('click', () => {
            location.reload();
        });

        if (showContinue) {
            document.getElementById('continue-game').addEventListener('click', () => {
                gameRunning = true;
                popUp.style.display = 'none';
                submitButton.disabled = false;
                submitButton.textContent = 'Submit';
            });
        }
    }

    updateTimer();
    scoreElement.textContent = `Score: ${score}`;
});
