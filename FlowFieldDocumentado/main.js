// Obtém a referência do elemento canvas e define suas dimensões para cobrir toda a janela
const canvas = document.getElementById('canva');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Obtém o contexto 2D do canvas
const ctx = canvas.getContext("2d");
console.log(ctx);

// Define o estilo de preenchimento e de contorno para o contexto
ctx.fillStyle = 'white';
ctx.strokeStyle = 'white';
ctx.lineWidth = 1;

// Classe Particle para representar cada partícula no efeito
class Particle {
    constructor(effect) {
        this.effect = effect; // Referência ao objeto Effect
        this.x = Math.floor(Math.random() * this.effect.width); // Posição inicial aleatória no eixo X
        this.y = Math.floor(Math.random() * this.effect.height); // Posição inicial aleatória no eixo Y
        this.speedX = 0; // Velocidade no eixo X
        this.speedY = 0; // Velocidade no eixo Y
        this.speedModifier = Math.floor(Math.random() * 5 + 1); // Modificador de velocidade aleatório

        this.history = [{ x: this.x, y: this.y }]; // Histórico das posições da partícula
        this.maxLenght = Math.floor(Math.random() * 200 + 10); // Comprimento máximo do histórico
        this.angle = 0; // Ângulo de movimento da partícula
        this.timer = this.maxLenght * 2; // Temporizador para controlar a duração do movimento
        this.colors = ['#48f','#40f','#39f','#1df','#69f']; // Cores possíveis para as partículas
        this.color = this.colors[Math.floor(Math.random() * this.colors.length)]; // Cor aleatória para a partícula
    }
    draw(context) {
        // Desenha a trilha da partícula
        context.beginPath();
        context.moveTo(this.history[0].x, this.history[0].y);
        for (let i = 0; i < this.history.length; i++) {
            context.lineTo(this.history[i].x, this.history[i].y);
        }
        context.strokeStyle = this.color; // Define a cor do contorno
        context.stroke(); // Desenha o contorno
    }
    update() {
        this.timer--; // Diminui o temporizador a cada frame
        if (this.timer >= 1) {
            // Calcula o índice da célula no campo de fluxo
            let x = Math.floor(this.x / this.effect.cellSize);
            let y = Math.floor(this.y / this.effect.cellSize);
            let index = y * this.effect.cols + x;
            this.angle = this.effect.flowField[index]; // Obtém o ângulo do campo de fluxo

            // Calcula a velocidade com base no ângulo
            this.speedX = Math.cos(this.angle);
            this.speedY = Math.sin(this.angle);
            this.x += this.speedX * this.speedModifier; // Atualiza a posição X
            this.y += this.speedY * this.speedModifier; // Atualiza a posição Y

            this.history.push({ x: this.x, y: this.y }); // Adiciona a nova posição ao histórico
            if (this.history.length > this.maxLenght) {
                this.history.shift(); // Remove a posição mais antiga se o histórico exceder o comprimento máximo
            }
        } else if(this.history.length > 1){
            this.history.shift(); // Continua removendo posições antigas após o temporizador expirar
        } else {
            this.reset(); // Reinicia a partícula quando o histórico estiver vazio
        }
    }
    reset() {
        // Reinicia a posição e o histórico da partícula
        this.x = Math.floor(Math.random() * this.effect.width);
        this.y = Math.floor(Math.random() * this.effect.height);
        this.history = [{ x: this.x, y: this.y }];
        this.timer = this.maxLenght * 2; // Reinicia o temporizador
    }
}

// Classe Effect para representar o efeito geral do campo de fluxo
class Effect {
    constructor(canvas) {
        this.canvas = canvas;
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.particles = []; // Array para armazenar as partículas
        this.numberOfParticles = 2000; // Número total de partículas
        this.cellSize = 10; // Tamanho de cada célula no campo de fluxo
        this.rows; // Número de linhas no campo de fluxo
        this.cols; // Número de colunas no campo de fluxo
        this.flowField = []; // Array para armazenar o campo de fluxo
        this.curve = 1; // Curvatura do campo de fluxo
        this.zoom = 0.05; // Fator de zoom do campo de fluxo
        this.debug = true; // Modo de depuração para desenhar a grade
        this.init(); // Inicializa o efeito

        // Event listener para alternar o modo de depuração
        window.addEventListener('keydown', e =>{
            if (e.key === 'd') this.debug = !this.debug;
        });
        // Event listener para redimensionar o canvas quando a janela for redimensionada
        window.addEventListener('resize', e =>{
            this.resize(e.target.innerWidth, e.target.innerHeight);
        });
    }
    init() {
        // Calcula o número de linhas e colunas no campo de fluxo
        this.rows = Math.floor(this.height / this.cellSize);
        this.cols = Math.floor(this.width / this.cellSize);
        this.flowField = [];
        for (let y = 0; y < this.rows; y++) {
            for (let x = 0; x < this.cols; x++) {
                // Calcula o ângulo do campo de fluxo para cada célula
                let angle = (Math.cos(x * this.zoom) + Math.sin(y * this.zoom)) * this.curve;
                this.flowField.push(angle);
            }
        }

        // Cria as partículas
        this.particles = [];
        for (let i = 0; i < this.numberOfParticles; i++) {
            this.particles.push(new Particle(this));
        }
    }
    drawGrid(context) {
        // Desenha a grade do campo de fluxo
        context.save();
        context.strokeStyle = 'green';
        context.lineWidth = 0.3;
        for (let c = 0; c < this.cols; c++) {
            context.beginPath();
            context.moveTo(this.cellSize * c, 0);
            context.lineTo(this.cellSize * c, this.height);
            context.stroke();
        }
        for (let r = 0; r < this.rows; r++) {
            context.beginPath();
            context.moveTo(0, this.cellSize * r);
            context.lineTo(this.width, this.cellSize * r);
            context.stroke();
        }
        context.restore();
    }
    resize(width, height) {
        // Redimensiona o canvas e reinicializa o efeito
        this.canvas.width = width;
        this.canvas.height = height;
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.init();
    }
    render(context) {
        // Renderiza o efeito
        if (this.debug) 
            this.drawGrid(context); // Desenha a grade se o modo de depuração estiver ativado
        this.particles.forEach(particle => {
            particle.draw(context); // Desenha cada partícula
            particle.update(); // Atualiza a posição de cada partícula
        });
    }
}

// Cria uma nova instância do efeito
const effect = new Effect(canvas);

function animate() {
    // Função de animação
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Limpa o canvas
    effect.render(ctx); // Renderiza o efeito
    requestAnimationFrame(animate); // Chama a função de animação novamente
}

animate(); // Inicia a animação
