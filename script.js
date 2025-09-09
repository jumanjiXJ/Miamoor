document.addEventListener('DOMContentLoaded', () => {

    const lockScreen = document.querySelector('.lock-screen');
    const letterView = document.querySelector('.letter-view');
    const lockContainer = document.querySelector('.lock-container');
    const unlockButton = document.getElementById('unlock-button');
    const correctCode = "2025"; // Pon aquí la fecha correcta
    let currentCombination = [0, 0, 0, 0];

    const scratchCard = document.querySelector('.scratch-card');
    const canvas = document.getElementById('scratch-canvas');
    const ctx = canvas.getContext('2d');

    const tumblers = document.querySelectorAll('.tumbler');
    const digitHeight = 40; 

    document.querySelectorAll('.digit-spinner').forEach((spinner, index) => {
        const upButton = spinner.querySelector('.up');
        const downButton = spinner.querySelector('.down');

        upButton.addEventListener('click', () => {
            currentCombination[index] = (currentCombination[index] + 1) % 10;
            updateTumblerPosition(index);
        });

        downButton.addEventListener('click', () => {
            currentCombination[index] = (currentCombination[index] - 1 + 10) % 10;
            updateTumblerPosition(index);
        });
    });

    function updateTumblerPosition(index) {
        const tumbler = tumblers[index];
        const newY = -currentCombination[index] * digitHeight;
        tumbler.style.transform = `translateY(${newY}px)`;
    }

    unlockButton.addEventListener('click', () => {
        const enteredCode = currentCombination.join('');
        if (enteredCode === correctCode) {
            unlockSuccess();
        } else {
            unlockFail();
        }
    });
    
    function unlockSuccess() {
        lockScreen.style.opacity = '0';
        setTimeout(() => {
            lockScreen.style.visibility = 'hidden';
            letterView.classList.add('visible');
            initializeScratchCard();
        }, 500);
    }

    function unlockFail() {
        lockContainer.classList.add('error');
        setTimeout(() => lockContainer.classList.remove('error'), 500);
    }
    
    let isDrawing = false;
    
    function initializeScratchCard() {
        const rect = scratchCard.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
        
        const goldLayer = new Image();
        goldLayer.src = '7.png';
        goldLayer.onload = () => {
            ctx.drawImage(goldLayer, 0, 0, canvas.width, canvas.height);
            setupScratchEvents();
        };
        goldLayer.onerror = () => {
            console.error("No se pudo cargar la imagen '6.png'. Usando color de respaldo.");
            ctx.fillStyle = '#D4AF37'; 
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            setupScratchEvents();
        };
    }

    function setupScratchEvents() {
        ctx.globalCompositeOperation = 'destination-out';
        
        const startScratching = (e) => {
            isDrawing = true;
            scratch(e); 
        };
        
        const stopScratching = () => {
            if (!isDrawing) return;
            isDrawing = false;
            checkReveal(); 
        };
        
        const scratch = (e) => {
            if (!isDrawing) return;
            e.preventDefault(); 

            scratchCard.classList.add('scratched'); 

            const rect = canvas.getBoundingClientRect();
            const x = (e.clientX || e.touches[0].clientX) - rect.left;
            const y = (e.clientY || e.touches[0].clientY) - rect.top;

            ctx.beginPath();
            ctx.arc(x, y, 12, 0, Math.PI * 2); 
            ctx.fill();
        };

        canvas.addEventListener('mousedown', startScratching);
        canvas.addEventListener('mousemove', scratch);
        canvas.addEventListener('touchstart', startScratching, { passive: false });
        canvas.addEventListener('touchmove', scratch, { passive: false });

        window.addEventListener('mouseup', stopScratching);
        window.addEventListener('touchend', stopScratching);
    }

    function checkReveal() {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const pixels = imageData.data;
        let transparentPixels = 0;
        
        for (let i = 3; i < pixels.length; i += 4) {
            if (pixels[i] === 0) {
                transparentPixels++;
            }
        }
        
        const revealedPercentage = transparentPixels / (canvas.width * canvas.height);
        
        if (revealedPercentage > 0.7) {
            canvas.style.transition = 'opacity 0.8s ease-out';
            canvas.style.opacity = '0';
            setTimeout(() => {
                canvas.style.display = 'none';
            }, 800);
        }
    }
    
    currentCombination.forEach((_, index) => updateTumblerPosition(index));
    lockScreen.classList.add('visible');
});