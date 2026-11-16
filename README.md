# Arriba Jump

Jogo de corrida e pulo em pixel art, feito só com HTML, CSS e JavaScript (sem frameworks). O personagem, de poncho verde e sombrero, atravessa São Paulo pulando os obstáculos de cada lugar.

**Jogar:** https://arriba-jump.jm.dev.br/

| :placard: Vitrine.Dev |     |
| -------------  | --- |
| :sparkles: Nome        | **Arriba Jump**
| :label: Tecnologias | javascript, html, css
| :rocket: URL         | [Jogar Arriba Jump](https://arriba-jump.jm.dev.br/)
| :fire: Desafio     | [Manual do Dev - Jogo Simples usando JavaScript e HTML](https://www.youtube.com/watch?v=r9buAwVBDhA)

<!-- Inserir imagem com a #vitrinedev ao final do link -->
![Arriba Jump na Avenida Paulista](./images/capa.png#vitrinedev)

## Como jogar

- **Pular:** Espaço, ↑, W, clique ou toque na tela.
- **Altura do pulo:** toque rápido dá um pulo curto; segurar dá o pulo alto.
- **Vidas:** são três. A cada batida você perde uma e fica piscando por um instante, sem poder ser atingido.
- **Pontos:** um por obstáculo pulado. O recorde fica salvo no navegador.
- **Idiomas:** Português, English, Español e Français, escolhidos no menu.
- **Pausa:** P, Esc ou o botão de engrenagem. Sair da aba também pausa.

## Configurações

O botão de engrenagem, no canto da tela, abre as configurações a partir do menu:

- **Som:** efeitos sonoros ligados ou desligados.
- **Dificuldade crescente:** quando ligada, o jogo acelera aos poucos conforme a pontuação, até 45% mais rápido.
- **Modo de jogo:** Campanha (termina nos créditos) ou Infinito (os cenários se repetem e o jogo só acaba quando as vidas acabam). Cada modo tem o seu recorde.

Durante a partida, a engrenagem pausa o jogo; ali só o som pode ser alterado.

## Personagens

Antes de cada partida o jogador escolhe o personagem: Arriba, Ariel, Amaury Caldeira, Ana Caroline ou Milena. Cada um tem a sua própria animação de corrida, pulo e comemoração, e o seu próprio final na praia. Ananias aparece como inativo.

Há também um sétimo espaço, marcado com "?": é o chefe secreto, que por enquanto fica sempre bloqueado.

As regras de cada personagem (status, se já é jogável) ficam na lista `CHARACTERS`, no começo de `js/characters.js`.

## Cenários

O cenário muda a cada 10 obstáculos pulados. No modo Campanha, ao superar os 60 obstáculos dos seis cenários, o jogador vence: vêm os créditos e a cena final na praia, com o Jonathan descansando na rede.

| Cenário | Obstáculos |
| --- | --- |
| Avenida Paulista | cone |
| Metrô | mochila |
| Trânsito | cone, buraco |
| Paraisópolis | caixas, buraco |
| Faria Lima | patinete |
| The Office | impressora, caixas |

## Estrutura do projeto

```
index.html
css/style.css
js/
  config.js      números ajustáveis (pulo, velocidade, vidas...)
  i18n.js        textos da interface em cada idioma
  settings.js    escolhas do jogador (som, dificuldade, modo)
  audio.js       efeitos sonoros gerados por código
  input.js       teclado, mouse e toque
  sprite.js      quadros da folha de sprites do personagem
  player.js      física do pulo e animação
  obstacles.js   tipos de obstáculo e movimento
  collision.js   detecção de colisão
  scenes.js      lista de cenários e rolagem do fundo
  ending.js      créditos e cena final da praia
  characters.js  elenco, desbloqueios e tela de seleção de personagens
  game.js        estados do jogo, placar, laço principal e desenho
images/
  cenarios/      fundos de cada lugar
  obstaculos/    objetos a pular
  characters/    folha de sprites do Arriba
    portraits/   retratos da seleção (normal | selecionado) e manifest.json
    animations/  folhas de animação dos colegas (5 colunas × 4 linhas)
  menu/          wallpaper da tela de seleção
  ending/        cenário, rede e ondas da cena final
```

Para rodar no computador, basta abrir o `index.html` no navegador. Acrescentar `?debug` ao endereço mostra as caixas de colisão.

Os nomes dos créditos ficam na lista `CREDITS`, no começo de `js/ending.js`. A quantidade de obstáculos para vencer é `campaign.obstaclesToWin`, em `js/config.js`.

Para adicionar um cenário, coloque a imagem em `images/cenarios/` e acrescente uma linha em `js/scenes.js`. Para adicionar um obstáculo, coloque a imagem em `images/obstaculos/` e acrescente uma linha em `js/obstacles.js`.

## Detalhes do projeto

O projeto começou como o desafio "Mario Jump" da [Alura](https://www.alura.com.br/) e evoluiu para um jogo próprio, com personagem, cenários e obstáculos originais.

Depois de algum tempo empacado em um projeto pessoal fiquei bastante desanimado e não conseguia fazer mais nada e esse desafio da Alura me ajudou a destravar.

- Saber ler corretamente as medidas do projeto no figma e entender que as propriedades que ali estavam nem todas deveriam ser usadas.
- Tive muita dificuldade com a responsividade, pois usei propriedades desnecessárias na construção do layout como width e height.
