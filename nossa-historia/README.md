# Nossa História (visual novel em Ren'Py)

## Como rodar
1. Baixe o Ren'Py em https://www.renpy.org/ (gratuito).
2. Abra o launcher, clique em **Preferences > Projects Directory** e escolha a pasta que contém `nossa-historia`
   (ou clique em **Add Existing Project** se a sua versão tiver).
3. Selecione **nossa-historia** e clique em **Launch Project**.
4. Para gerar o jogo para Windows/Mac/Linux/Android: **Build Distributions**.

## Como personalizar
- Edite `game/script.rpy` e procure por `TROQUE`.
- Coloque fotos em `game/images/` e troque as linhas `image bg ... = Solid(...)`
  por `image bg nome = "arquivo.jpg"`.
- Coloque músicas em `game/audio/` e use `play music "audio/arquivo.mp3"`.
- O final especial aparece se ela tiver juntado pontos de carinho suficientes
  (variável `carinho`).
