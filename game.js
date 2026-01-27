class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');

        // Full screen setup
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;

        this.width = this.canvas.width;
        this.height = this.canvas.height;

        this.score = 0;
        this.timeLeft = 90;
        this.isPlaying = false;
        this.items = [];
        this.flyingItems = []; // Items currently animating to cauldron
        this.currentRecipe = null;
        this.foundIngredients = [];
        this.lastTime = 0;
        this.wizardSpeech = { text: "", timeLeft: 0 };

        // NEW: Cauldron & Customer
        this.cauldron = {
            x: this.width - 150,
            y: this.height - 120,
            width: 120,
            height: 100,
            emoji: "🥘", // Placeholder emoji for cauldron
            animTime: 0 // For animation
        };

        this.customer = {
            x: 50,
            y: this.height - 150,
            size: 100,
            emoji: "🧙‍♂️", // Placeholder emoji for wizard
            animTime: 0 // For animation
        };

        // Owl that flies across the screen
        this.owl = {
            x: -100,
            y: 100,
            speed: 150, // pixels per second
            emoji: "🦉",
            size: 60,
            animTime: 0,
            flapSpeed: 8 // wing flapping speed
        };

        // Harry Potter flying on broomstick
        this.harry = {
            x: this.width + 100,
            y: 150,
            speed: 200, // pixels per second (flying right to left)
            emoji: "🧙",
            broomstick: "🧹",
            size: 70,
            animTime: 0,
            active: true
        };

        // Recipes Database
        this.recipes = [
            { name: "Sopa de Legumes", ingredients: ["🥕", "🥔", "🧅", "🥦"], icon: "🍲" },
            { name: "Salada Tropical", ingredients: ["🥬", "🍅", "🥥", "🥭"], icon: "🥗" },
            { name: "Pizza Mágica", ingredients: ["🍞", "🍅", "🧀", "🍄"], icon: "🍕" },
            { name: "Bolo de Chocolate", ingredients: ["🍫", "🥚", "🥛", "🌾"], icon: "🎂" },
            { name: "Poção da Verdade", ingredients: ["🧪", "🌿", "💧", "🌙"], icon: "✨" },
            { name: "Hambúrguer", ingredients: ["🍞", "🥩", "🧀", "🥬"], icon: "🍔" }
        ];

        this.allIngredients = [
            "🥕", "🥔", "🧅", "🥦", "🥬", "🍅", "🥥", "🥭",
            "🍞", "🧀", "🍄", "🍫", "🥚", "🥛", "🌾",
            "🧪", "🌿", "💧", "🌙", "🥩", "🍗", "🍎",
            "🍌", "🍇", "🍉", "🍒", "🍓", "🍍", "🍆",
            "🌽", "🌶️", "🥒", "🥐", "🥖", "🥨", "🥞"
        ];

        // Wizard random phrases
        this.wizardPhrases = [
            "Abracadabra! ✨",
            "Estou com fome! 🍽️",
            "Magia está no ar! 🌟",
            "Você é rápido! ⚡",
            "Hmm... delicioso! 😋",
            "Preciso de mais! 🧙‍♂️",
            "Fantástico! 🎩",
            "Continue assim! 👍",
            "Que maravilha! 🌈",
            "Excelente trabalho! 🏆"
        ];

        // Assets
        this.bgImage = new Image();
        this.bgImage.src = 'assets/background.png';

        // Bindings
        this.startBtn = document.getElementById('start-btn');
        this.restartBtn = document.getElementById('restart-btn');
        this.startScreen = document.getElementById('start-screen');
        this.gameOverScreen = document.getElementById('game-over-screen');
        this.hud = document.getElementById('hud');

        this.scoreDisplay = document.getElementById('score');
        this.timerDisplay = document.getElementById('timer');
        this.targetDisplay = document.getElementById('current-target');
        this.finalScoreDisplay = document.getElementById('final-score');
        this.soundBtn = document.getElementById('sound-btn');

        // NEW: Auth Bindings
        this.authScreen = document.getElementById('auth-screen');
        this.authUser = document.getElementById('auth-user');
        this.authPass = document.getElementById('auth-pass');
        this.loginBtn = document.getElementById('login-btn');
        this.registerBtn = document.getElementById('register-btn');
        this.welcomeUser = document.getElementById('welcome-user');
        this.hudUser = document.getElementById('hud-user');
        this.logoutBtn = document.getElementById('logout-btn');

        // Audio State
        this.isSoundEnabled = true;
        this.loggedInUser = null;

        // Audio Setup
        this.music = new Audio();
        // Trying a more direct and reliable mirror from Archive.org
        this.music.src = 'musica.mp3';
        this.music.loop = true;
        this.music.volume = 1.0; // Set to maximum volume

        this.music.load();

        this.effects = []; // Temporary visual effects

        this.sfx = {
            collect: new Audio('https://www.soundjay.com/magic/magic-chime-01.mp3'),
            wrong: new Audio('https://www.soundjay.com/button/button-10.mp3'),
            complete: new Audio('https://www.soundjay.com/magic/magic-chime-03.mp3'),
            gameOver: new Audio('https://www.soundjay.com/button/button-11.mp3')
        };

        // Event Listeners
        this.startBtn.addEventListener('click', () => {
            console.log("Botão Iniciar clicado - tentando tocar música.");
            this.music.play()
                .then(() => console.log("Música iniciada via Iniciar!"))
                .catch(e => console.warn("Música ainda bloqueada, use o botão de volume."));
            this.start();
        });
        this.restartBtn.addEventListener('click', () => {
            this.music.play().catch(e => { });
            this.start();
        });

        // NEW: Auth Listeners
        this.loginBtn.addEventListener('click', () => this.handleAuth('login'));
        this.registerBtn.addEventListener('click', () => this.handleAuth('register'));
        this.logoutBtn.addEventListener('click', () => this.logout());

        if (this.soundBtn) {
            this.soundBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleSound();
            });
        }
        this.canvas.addEventListener('mousedown', (e) => this.handleClick(e));

        // Game Loop
        this.loop = this.loop.bind(this);
        console.log("Magic Kitchen: Iniciado com sucesso!");
    }

    start() {
        this.score = 0;
        this.timeLeft = 180; // More time as requested
        this.isPlaying = true;
        this.startNewRecipe();

        this.startScreen.classList.add('hidden');
        this.startScreen.classList.remove('active');
        this.gameOverScreen.classList.add('hidden');
        this.gameOverScreen.classList.remove('active');
        this.hud.classList.remove('hidden');
        this.hud.classList.add('active');
        console.log("Jogo começando...");

        // Force UI update
        this.updateUI();

        this.lastTime = performance.now();

        // Music attempt handled in the click listener above

        requestAnimationFrame(this.loop);
    }

    toggleSound() {
        this.isSoundEnabled = !this.isSoundEnabled;
        console.log("Som alterado para:", this.isSoundEnabled);

        if (this.isSoundEnabled) {
            this.music.play().catch(e => console.error("Falha ao tocar música no toggle:", e));
        } else {
            this.music.pause();
        }
        this.updateSoundButtonUI();
    }

    updateSoundButtonUI() {
        this.soundBtn.textContent = this.isSoundEnabled ? "🔊 Som: ON" : "🔇 Som: OFF";
        this.soundBtn.style.opacity = this.isSoundEnabled ? "1" : "0.5";
    }

    async handleAuth(type) {
        const username = this.authUser.value.trim();
        const password = this.authPass.value.trim();

        if (!username || !password) {
            alert("Preencha usuário e senha!");
            return;
        }

        try {
            const response = await fetch(`http://localhost:3000/api/${type}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();
            if (response.ok) {
                this.loggedInUser = data.username;
                this.welcomeUser.textContent = data.username;
                this.hudUser.textContent = data.username;
                this.authScreen.classList.add('hidden');
                this.authScreen.classList.remove('active');
                this.startScreen.classList.remove('hidden');
                this.startScreen.classList.add('active');
                alert(type === 'login' ? `Bem-vindo de volta, ${data.username}!` : "Cadastro realizado! Bem-vindo!");
            } else {
                alert(data.error || "Erro na autenticação.");
            }
        } catch (e) {
            console.error(e);
            alert("Erro ao conectar ao servidor. O backend está rodando?");
        }
    }

    logout() {
        if (confirm("Deseja mesmo sair? O progresso da rodada atual será perdido.")) {
            this.isPlaying = false;
            this.loggedInUser = null;
            this.music.pause();
            this.music.currentTime = 0;

            // Hide all game/start screens
            this.hud.classList.add('hidden');
            this.hud.classList.remove('active');
            this.startScreen.classList.add('hidden');
            this.startScreen.classList.remove('active');
            this.gameOverScreen.classList.add('hidden');
            this.gameOverScreen.classList.remove('active');

            // Show auth screen
            this.authScreen.classList.remove('hidden');
            this.authScreen.classList.add('active');

            // Clear inputs
            this.authUser.value = "";
            this.authPass.value = "";

            console.log("Usuário deslogado.");
        }
    }

    startNewRecipe() {
        const randomIndex = Math.floor(Math.random() * this.recipes.length);
        this.currentRecipe = this.recipes[randomIndex];
        this.foundIngredients = [];
        this.items = this.generateItemsForRecipe(this.currentRecipe);
        this.updateUI();
        this.setWizardSpeech(`Quero ${this.currentRecipe.name}!`, 3000);
    }
    gameOver() {
        this.isPlaying = false;
        this.startScreen.classList.add('hidden');
        this.hud.classList.add('hidden');
        this.gameOverScreen.classList.remove('hidden');
        this.gameOverScreen.classList.add('active');
        this.finalScoreDisplay.textContent = this.score;
        this.music.pause();
        this.music.currentTime = 0;
        this.playSound('gameOver');

        // Backend Integration: Save score automatically
        if (this.loggedInUser) {
            this.saveScore(this.loggedInUser, this.score);
        }
    }

    async saveScore(name, score) {
        console.log(`Tentando salvar score para ${name}: ${score}`);
        try {
            const response = await fetch('http://localhost:3000/api/scores', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name, score })
            });
            if (response.ok) {
                const data = await response.json();
                console.log('Score salvo com sucesso no servidor!', data);
                alert(`${name}, sua pontuação de ${score} foi salva!`);
            } else {
                console.error('Falha ao salvar score no servidor.');
            }
        } catch (error) {
            console.error('Erro de rede ao tentar conectar ao backend:', error);
            console.warn('Certifique-se de que o servidor Node.js está rodando (node server.js)');
        }
    }

    showEffect(emoji, x, y) {
        this.effects.push({
            emoji: emoji,
            x: x,
            y: y,
            life: 1.0,
            vy: -2
        });
    }

    playSound(sound) {
        if (this.isSoundEnabled && this.sfx[sound]) {
            try {
                player.volume = 1.0; // Set to maximum volume
                player.play()
                    .catch(e => {
                        // Silent fail for SFX to avoid console spam
                    });
            } catch (e) {
                console.error(`Erro ao processar som ${sound}:`, e);
            }
        }
    }

    generateItemsForRecipe(recipe) {
        const items = [];
        const needed = [...recipe.ingredients];
        const minDistance = 50; // Much closer items

        // Helper to check distance
        const isTooClose = (x, y) => {
            return items.some(item => {
                const dist = Math.hypot(x - item.x, y - item.y);
                return dist < minDistance;
            });
        };

        const tryCreateItem = (emoji, isTarget) => {
            let item;
            let attempts = 0;
            do {
                item = this.createItem(emoji, isTarget);
                attempts++;
            } while (isTooClose(item.x, item.y) && attempts < 50);
            return item;
        };

        // Add needed ingredients
        needed.forEach(emoji => {
            items.push(tryCreateItem(emoji, true));
        });

        // Add distractors (total items = 15)
        const totalItems = 15;
        const distractorsNeeded = totalItems - needed.length;

        for (let i = 0; i < distractorsNeeded; i++) {
            let distractor;
            do {
                distractor = this.allIngredients[Math.floor(Math.random() * this.allIngredients.length)];
            } while (needed.includes(distractor));

            items.push(tryCreateItem(distractor, false));
        }

        return items;
    }

    createItem(emoji, isTarget) {
        return {
            x: 200 + Math.random() * (this.width - 500),
            y: 200 + Math.random() * (this.height - 400),
            size: 40,
            emoji: emoji,
            isTarget: isTarget,
            rotation: (Math.random() - 0.5) * 0.5,
            scale: 1,
            shake: 0 // For feedback
        };
    }

    update(deltaTime) {
        if (!this.isPlaying) return;

        if (this.wizardSpeech.timeLeft > 0) {
            this.wizardSpeech.timeLeft -= deltaTime;
        }

        this.timeLeft -= deltaTime / 1000;
        if (this.timeLeft <= 0) {
            this.timeLeft = 0;
            this.gameOver();
        }

        // Animate cauldron, wizard, and owl
        this.cauldron.animTime += deltaTime / 1000;
        this.customer.animTime += deltaTime / 1000;
        this.owl.animTime += deltaTime / 1000;

        // Move owl across screen
        this.owl.x += this.owl.speed * (deltaTime / 1000);

        // Reset owl when it goes off screen
        if (this.owl.x > this.width + 100) {
            this.owl.x = -100;
            this.owl.y = 50 + Math.random() * (this.height / 2); // Random height in upper half
        }

        // Update Flying Items
        for (let i = this.flyingItems.length - 1; i >= 0; i--) {
            const item = this.flyingItems[i];

            // Move towards cauldron center
            const dx = (this.cauldron.x + this.cauldron.width / 2) - item.startX;
            const dy = (this.cauldron.y + this.cauldron.height / 2) - item.startY;

            item.progress += deltaTime / 1000 * 2; // Speed

            if (item.progress >= 1) {
                // Arrived!
                this.flyingItems.splice(i, 1);
                this.handleItemArrival(item);
            } else {
                // Lerp
                item.x = item.startX + dx * item.progress;
                item.y = item.startY + dy * item.progress + Math.sin(item.progress * Math.PI) * -100; // Arc
                item.rotation += 0.2;
                item.scale = 1 - (item.progress * 0.5); // Shrink a bit
            }
        }

        // Update Effects
        for (let i = this.effects.length - 1; i >= 0; i--) {
            const effect = this.effects[i];
            effect.life -= deltaTime / 1000;
            effect.y += effect.vy;
            if (effect.life <= 0) {
                this.effects.splice(i, 1);
            }
        }
    }

    handleItemArrival(item) {
        if (item.isTarget) {
            this.score += 50;
            this.foundIngredients.push(item.emoji);
            this.showFlyingText("+50!", this.cauldron.x, this.cauldron.y - 50, 1000, "gold");

            if (this.foundIngredients.length === this.currentRecipe.ingredients.length) {
                this.score += 200;
                this.setWizardSpeech("Delicioso! Obrigado! 😋", 2000);
                this.playSound('complete');
                setTimeout(() => this.startNewRecipe(), 2000);
            } else {
                this.playSound('collect');
                this.updateUI();
            }
        }
        // No penalty here, penalty applied on click for wrong items
    }

    updateUI() {
        this.scoreDisplay.textContent = this.score;

        const minutes = Math.floor(Math.ceil(this.timeLeft) / 60);
        const seconds = Math.ceil(this.timeLeft) % 60;
        this.timerDisplay.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;

        if (this.currentRecipe) {
            let html = `<strong>${this.currentRecipe.icon} ${this.currentRecipe.name}</strong><br>`;
            html += `<div style="font-size: 0.8em; margin-top: 5px;">`;

            this.currentRecipe.ingredients.forEach(ing => {
                const found = this.foundIngredients.includes(ing);
                const style = found ? 'opacity: 0.3; filter: grayscale(100%);' : '';
                const check = found ? '✅' : '';
                html += `<span style="margin: 0 5px; ${style}">${ing} ${check}</span>`;
            });

            html += `</div>`;
            this.targetDisplay.innerHTML = html;
        }
    }

    draw() {
        // Clear
        this.ctx.clearRect(0, 0, this.width, this.height);

        // Draw Background
        if (this.bgImage.complete) {
            this.ctx.drawImage(this.bgImage, 0, 0, this.width, this.height);
        } else {
            this.ctx.fillStyle = '#2b1d2b';
            this.ctx.fillRect(0, 0, this.width, this.height);
        }

        // Draw Wizard/Customer with floating animation
        this.ctx.save();
        const floatOffset = Math.sin(this.customer.animTime * 1.5) * 10; // Floating up and down
        const sway = Math.sin(this.customer.animTime * 2) * 0.08; // Gentle swaying
        const scale = 1 + Math.sin(this.customer.animTime * 2.5) * 0.05; // Slight breathing effect

        this.ctx.translate(this.customer.x + 50, this.customer.y + 100 + floatOffset);
        this.ctx.rotate(sway);
        this.ctx.scale(scale, scale);

        // Draw wizard robe/body (using a dark shape)
        this.ctx.fillStyle = "#4a2c6d"; // Purple robe color
        this.ctx.shadowColor = "rgba(138, 43, 226, 0.5)";
        this.ctx.shadowBlur = 15;
        this.ctx.beginPath();
        this.ctx.ellipse(0, 30, 35, 50, 0, 0, Math.PI * 2); // Robe body
        this.ctx.fill();

        // Draw legs/feet
        this.ctx.fillStyle = "#2a1a3d"; // Darker purple for legs
        this.ctx.beginPath();
        this.ctx.ellipse(-15, 75, 12, 20, 0, 0, Math.PI * 2); // Left leg
        this.ctx.fill();
        this.ctx.beginPath();
        this.ctx.ellipse(15, 75, 12, 20, 0, 0, Math.PI * 2); // Right leg
        this.ctx.fill();

        // Draw wizard head/face
        this.ctx.font = "80px Arial";
        this.ctx.textAlign = "center";
        this.ctx.textBaseline = "middle";
        this.ctx.shadowColor = "rgba(138, 43, 226, 0.8)"; // Purple glow
        this.ctx.shadowBlur = 20;
        this.ctx.fillText(this.customer.emoji, 0, -20); // Moved up to sit on body
        this.ctx.restore();

        // Draw Wizard Speech Bubble
        if (this.wizardSpeech.timeLeft > 0) {
            this.ctx.font = "bold 20px 'MedievalSharp'"; // Set font FIRST due to measurement bug
            this.ctx.textBaseline = "middle";
            const text = this.wizardSpeech.text;
            const textWidth = this.ctx.measureText(text).width;

            // Bubble box
            const bx = this.customer.x + 100;
            const by = this.customer.y - 30;
            const bw = textWidth + 60; // Extra generous padding
            const bh = 60;

            this.ctx.fillStyle = "white";
            this.ctx.shadowBlur = 0;
            this.ctx.beginPath();
            this.ctx.roundRect(bx, by - bh / 2, bw, bh, 15);
            this.ctx.fill();
            this.ctx.strokeStyle = "black";
            this.ctx.lineWidth = 3;
            this.ctx.stroke();

            // Text
            this.ctx.fillStyle = "black";
            this.ctx.fillText(text, bx + 30, by);
        }

        // Draw Flying Owl
        this.ctx.save();
        const owlFlap = Math.sin(this.owl.animTime * this.owl.flapSpeed) * 0.1; // Wing flapping
        const owlBob = Math.sin(this.owl.animTime * 4) * 5; // Bobbing while flying

        this.ctx.translate(this.owl.x, this.owl.y + owlBob);
        this.ctx.scale(1 + owlFlap, 1 - owlFlap * 0.5); // Simulate wing movement

        this.ctx.shadowColor = "rgba(255, 255, 255, 0.8)";
        this.ctx.shadowBlur = 20;
        this.ctx.font = `${this.owl.size}px Arial`;
        this.ctx.textAlign = "center";
        this.ctx.textBaseline = "middle";

        // CSS Filter to make the emoji appear white (Snowy Owl / Hedwig)
        this.ctx.filter = "brightness(2) grayscale(100%)";
        this.ctx.fillText(this.owl.emoji, 0, 0);
        this.ctx.filter = "none"; // Reset filter
        this.ctx.restore();

        // Draw Cauldron with bobbing animation
        this.ctx.save();
        const bobOffset = Math.sin(this.cauldron.animTime * 2) * 8; // Bobbing up and down
        const wobble = Math.sin(this.cauldron.animTime * 3) * 0.05; // Slight rotation wobble

        this.ctx.translate(this.cauldron.x + 60, this.cauldron.y + 80 + bobOffset);
        this.ctx.rotate(wobble);

        this.ctx.shadowColor = "rgba(255, 140, 0, 0.9)"; // Orange glow
        this.ctx.shadowBlur = 25;
        this.ctx.font = "100px Arial";
        this.ctx.textAlign = "center";
        this.ctx.textBaseline = "middle";
        this.ctx.fillText(this.cauldron.emoji, 0, 0);
        this.ctx.restore();

        // Draw Items on table
        this.ctx.textBaseline = "middle";
        this.ctx.textAlign = "center"; // Be explicit
        this.items.forEach((item, index) => {
            if (item.shake > 0) item.shake -= 1; // Decrease shake over time

            this.ctx.save();
            const shakeX = Math.random() * item.shake - item.shake / 2;
            this.ctx.translate(item.x + shakeX, item.y);
            this.ctx.rotate(item.rotation);

            // Setting font size dynamically
            this.ctx.font = `${item.size}px Arial`;

            // Pulsating glow effect
            const pulseTime = performance.now() / 1000 + index * 0.3;
            const pulseIntensity = 0.5 + Math.sin(pulseTime * 3) * 0.5;

            if (item.isTarget) {
                const glowStrength = 20 + pulseIntensity * 15;
                this.ctx.shadowColor = `rgba(255, 215, 0, ${0.6 + pulseIntensity * 0.4})`;
                this.ctx.shadowBlur = glowStrength;
            } else {
                this.ctx.shadowColor = `rgba(255, 255, 255, ${0.3 + pulseIntensity * 0.2})`;
                this.ctx.shadowBlur = 10 + pulseIntensity * 5;
            }

            this.ctx.shadowOffsetX = 0;
            this.ctx.shadowOffsetY = 0;

            this.ctx.fillText(item.emoji, 0, 0);
            this.ctx.restore();
        });

        // Draw Flying Items
        this.flyingItems.forEach(item => {
            this.ctx.save();
            this.ctx.translate(item.x, item.y);
            this.ctx.scale(item.scale, item.scale);
            this.ctx.rotate(item.rotation);
            this.ctx.fillText(item.emoji, 0, 0);
            this.ctx.restore();
        });

        // Draw flying text
        if (this.flyingText && this.flyingText.life > 0) {
            this.ctx.font = "bold 30px 'MedievalSharp'";
            this.ctx.fillStyle = this.flyingText.color;
            this.ctx.shadowBlur = 4;
            this.ctx.fillText(this.flyingText.text, this.flyingText.x, this.flyingText.y);
            this.flyingText.y -= 1;
            this.flyingText.life -= 16;
            this.flyingText.alpha -= 0.01;
        }

        // Draw Effects (Green Arrow)
        this.ctx.save();
        this.ctx.font = "40px Arial";
        this.ctx.textAlign = "center";
        this.ctx.textBaseline = "middle";
        this.effects.forEach(effect => {
            this.ctx.globalAlpha = effect.life;
            this.ctx.strokeText(effect.emoji, effect.x, effect.y); // Add outline for visibility
            this.ctx.fillText(effect.emoji, effect.x, effect.y);
        });
        this.ctx.restore();
    }

    handleClick(e) {
        if (!this.isPlaying) return;

        const rect = this.canvas.getBoundingClientRect();
        // Adjust click coordinates for canvas scaling/DPI
        const clickX = (e.clientX - rect.left) * (this.canvas.width / rect.width);
        const clickY = (e.clientY - rect.top) * (this.canvas.height / rect.height);

        console.log(`Click: ${clickX}, ${clickY}`); // For debugging

        // Check if clicked on wizard
        const wizardDist = Math.hypot(clickX - (this.customer.x + 50), clickY - (this.customer.y + 50));
        if (wizardDist < 80) {
            // Wizard clicked! Say random phrase
            const randomPhrase = this.wizardPhrases[Math.floor(Math.random() * this.wizardPhrases.length)];
            this.setWizardSpeech(randomPhrase, 2500);
            return; // Don't check items if wizard was clicked
        }

        // Check collision backwards
        for (let i = this.items.length - 1; i >= 0; i--) {
            const item = this.items[i];
            const dist = Math.hypot(clickX - item.x, clickY - item.y);

            // Increased hit area slightly (from 30 to item.size) to be more forgiving
            if (dist < item.size) {
                if (item.isTarget) {
                    // Start Animation
                    this.flyingItems.push({
                        ...item,
                        startX: item.x,
                        startY: item.y,
                        progress: 0
                    });
                    this.items.splice(i, 1);
                    this.setWizardSpeech("É isso!", 1000);
                    this.showEffect("✅", item.x, item.y); // Green arrow effect
                } else {
                    // Wrong!
                    this.timeLeft -= 5;
                    this.showFlyingText("-5s", item.x, item.y, "red");
                    this.setWizardSpeech("Isso não! 🤢", 1000);
                    this.playSound('wrong');
                    item.shake = 15; // Visual feedback
                }
                break;
            }
        }
    }

    setWizardSpeech(text, duration) {
        this.wizardSpeech = { text: text, timeLeft: duration };
    }

    showFlyingText(text, x, y, life = 1000, color = "white") {
        this.flyingText = {
            text: text,
            x: x,
            y: y,
            life: life,
            color: color
        };
    }

    loop(timestamp) {
        if (!this.isPlaying) return;

        const deltaTime = timestamp - this.lastTime;
        this.lastTime = timestamp;

        this.update(deltaTime);
        this.draw();

        requestAnimationFrame(this.loop);
    }
}

// Init game when window loads
window.onload = () => {
    const game = new Game();
};
