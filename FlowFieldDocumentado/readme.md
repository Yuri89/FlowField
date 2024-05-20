Explicação do Código:
Canvas Setup:

O canvas é configurado para ocupar toda a largura e altura da janela.
O contexto 2D é obtido para desenhar no canvas.
Estilos de preenchimento e contorno são definidos.

Classe Particle:

Representa cada partícula.
Cada partícula tem uma posição inicial aleatória, velocidade aleatória e cor.
Desenha a trilha da partícula.
Atualiza a posição da partícula com base no campo de fluxo.

Classe Effect:

Representa o efeito geral do campo de fluxo.
Configura o campo de fluxo e as partículas.
Desenha a grade do campo de fluxo no modo de depuração.
Redimensiona o canvas quando a janela é redimensionada.

Função animate:

Limpa o canvas.
Renderiza o efeito.
Solicita o próximo frame de animação.