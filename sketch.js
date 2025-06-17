// Variáveis globais
let tamanhosTulipas = [];
let chuvaAtiva = false;
let quantidadeTulipas = 5;
let caminhao;
let aviao;
let nuvens = []; // Array para as nuvens
let gotasDeChuva = []; // Array para as gotas de chuva
let passarinho; // Variável para o passarinho
let passarinhoPousado = false; // Flag para controlar se o passarinho está pousado
let tulipaAlvoIndex = -1; // Índice da tulipa onde o passarinho está pousado
let tempoPousoPassarinho = 0; // Contador de tempo para o passarinho pousado
const DURACAO_POUSO = 180; // Duração que o passarinho fica pousado (em frames, 180 frames = 3 segundos a 60fps)

function setup() {
  createCanvas(600, 400);

  for (let i = 0; i < quantidadeTulipas; i++) {
    tamanhosTulipas[i] = 0.5;
  }

  caminhao = new Caminhao(600, height - 60);
  aviao = new Aviao(width + 50, 50);

  // Criar algumas nuvens
  for (let i = 0; i < 3; i++) {
    nuvens.push(new Nuvem(random(width), random(50, 150)));
  }

  // Inicializar o passarinho em uma posição de voo aleatória
  passarinho = new Passarinho(random(width), random(50, 150));
}

function draw() {
  background(135, 206, 235); // Céu azul

  // Mostrar cidade (emoji único à esquerda e mais para baixo)
  mostrarCidade();

  // Sol (aparece se não estiver chovendo)
  if (!chuvaAtiva) {
    fill(255, 255, 0); // Amarelo para o sol
    ellipse(width - 80, 80, 80, 80);
  }

  // Nuvens
  for (let nuvem of nuvens) {
    nuvem.atualizar();
    nuvem.mostrar();
  }

  // Avião (só aparece se estiver chovendo)
  if (chuvaAtiva) {
    aviao.atualizar();
    aviao.mostrar();

    // Gerar novas gotas de chuva (a cada frame, mas com uma probabilidade)
    if (random(1) < 0.8) { // Ajuste esse valor para mais ou menos chuva
      gotasDeChuva.push(new GotaDeChuva());
    }

    // Atualizar e mostrar cada gota
    for (let i = gotasDeChuva.length - 1; i >= 0; i--) {
      gotasDeChuva[i].atualizar();
      gotasDeChuva[i].mostrar();

      // Remover gotas que atingiram o chão
      if (gotasDeChuva[i].atingiuChao()) {
        gotasDeChuva.splice(i, 1);
      }
    }

    // Crescimento das tulipas
    for (let i = 0; i < quantidadeTulipas; i++) {
      tamanhosTulipas[i] += 0.01;
      if (tamanhosTulipas[i] > 1) {
        tamanhosTulipas[i] = 1;
      }
    }
  }

  // Campo
  noStroke();
  fill(34, 139, 34);
  rect(0, height - 50, width, 50);

  // Tulipas
  textAlign(CENTER);
  fill(0);
  for (let i = 0; i < quantidadeTulipas; i++) {
    textSize(32 * tamanhosTulipas[i]);
    text("🌷", (width / quantidadeTulipas) * (i + 0.5), height - 50);
  }

  // Caminhão
  caminhao.atualizar();
  caminhao.mostrar();

  // --- Lógica do Passarinho ---
  if (!passarinhoPousado) {
    passarinho.atualizar(); // Atualiza a posição de voo
    // Tentativa de pousar
    if (random(1) < 0.001 && !chuvaAtiva) { // Pequena chance de pousar se não estiver chovendo
      tulipaAlvoIndex = floor(random(quantidadeTulipas));
      const tulipaX = (width / quantidadeTulipas) * (tulipaAlvoIndex + 0.5);
      const tulipaY = height - 50; // Posição Y da tulipa
      passarinho.pousar(tulipaX, tulipaY - 40); // Ajusta a altura para pousar acima da tulipa
      passarinhoPousado = true;
      tempoPousoPassarinho = 0; // Reinicia o contador de tempo
    }
  } else {
    // Passarinho está pousado, mantém a posição e conta o tempo
    passarinho.x = (width / quantidadeTulipas) * (tulipaAlvoIndex + 0.5);
    passarinho.y = height - 90; // Mantém a altura acima da tulipa
    tempoPousoPassarinho++;
    if (tempoPousoPassarinho > DURACAO_POUSO) {
      passarinho.levantar(); // Faz o passarinho levantar voo
      passarinhoPousado = false;
      tulipaAlvoIndex = -1; // Reseta o índice da tulipa alvo
    }
  }
  passarinho.mostrar(); // Mostra o passarinho
  // --- Fim da Lógica do Passarinho ---
}

function mousePressed() {
  chuvaAtiva = !chuvaAtiva;

  if (chuvaAtiva) {
    aviao.x = width + 50;
    // Se começar a chover e o passarinho estiver pousado, faz ele voar
    if (passarinhoPousado) {
      passarinho.levantar();
      passarinhoPousado = false;
      tulipaAlvoIndex = -1;
    }
  }
}

// ---------- CLASSES ----------

class Caminhao {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.tamanho = 60;
    this.velocidade = 2;
  }

  mostrar() {
    textSize(this.tamanho);
    text("🚚", this.x, this.y);
  }

  atualizar() {
    if (chuvaAtiva && this.x > 0) {
      this.x -= this.velocidade;
    }
  }
}

class Aviao {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.tamanho = 40;
    this.velocidade = 2;
  }

  mostrar() {
    textSize(this.tamanho);
    text("🚁", this.x, this.y);
  }

  atualizar() {
    this.x -= this.velocidade;
    if (this.x < -50) {
      this.x = width + 50;
    }
  }
}

class Nuvem {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.velocidade = random(0.5, 1.5);
  }

  mostrar() {
    fill(255, 255, 255, 200); // Branco translúcido
    ellipse(this.x, this.y, 70, 50);
    ellipse(this.x + 30, this.y, 60, 40);
    ellipse(this.x - 30, this.y, 50, 30);
  }

  atualizar() {
    this.x += this.velocidade;
    if (this.x > width + 50) {
      this.x = -50;
      this.y = random(50, 150); // Reposicionar na altura
    }
  }
}

class GotaDeChuva {
  constructor() {
    this.x = random(width); // Posição X aleatória
    this.y = random(-200, 0); // Começa acima da tela
    this.velocidade = random(3, 8); // Velocidade de queda
    this.comprimento = random(10, 20); // Comprimento da gota
  }

  mostrar() {
    stroke(0, 0, 255, 150); // Azul com alguma transparência
    strokeWeight(1.5);
    line(this.x, this.y, this.x, this.y + this.comprimento);
  }

  atualizar() {
    this.y += this.velocidade; // Faz a gota cair
  }

  // Verifica se a gota atingiu o chão
  atingiuChao() {
    return this.y > height - 50; // Ajuste para a altura do campo
  }
}

class Passarinho {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.tamanho = 30; // Tamanho do emoji do passarinho
    this.velocidade = random(1, 3); // Velocidade de voo
    this.pousado = false; // Estado inicial: voando
  }

  mostrar() {
    textSize(this.tamanho);
    text("🐦", this.x, this.y);
  }

  atualizar() {
    if (!this.pousado) {
      this.x += this.velocidade; // Voa para a direita
      if (this.x > width + 50) { // Se sair da tela, reposiciona
        this.x = -50;
        this.y = random(50, 150); // Altura de voo aleatória
        this.velocidade = random(1, 3); // Nova velocidade
      }
    }
    // Se estiver pousado, a posição será definida externamente em draw()
  }

  pousar(tulipaX, tulipaY) {
    this.x = tulipaX;
    this.y = tulipaY;
    this.pousado = true;
  }

  levantar() {
    this.pousado = false;
    this.velocidade = random(1, 3); // Redefine velocidade para voo
  }
}

// ---------- CIDADE (emoji mais para baixo) ----------

function mostrarCidade() {
  textAlign(LEFT);
  textSize(120); // Aumentado o tamanho da cidade
  fill(0);
  text("🏙️", 10, height - 30); // Posição ajustada para a cidade maior
}


