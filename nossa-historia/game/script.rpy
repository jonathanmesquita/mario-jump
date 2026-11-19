# =====================================================================
#  NOSSA HISTÓRIA - visual novel feita com Ren'Py
#  Procure por "TROQUE" para saber o que personalizar.
# =====================================================================

# --- Personagens --------------------------------------------------------
# TROQUE: os nomes e as cores dos nomes
define voce = Character("Você", color="#6fa8dc")          # o jogador (ela)
define eu   = Character("NOME_DELE", color="#e06666")      # você
define narr = Character(None)                              # narrador

# --- Imagens ------------------------------------------------------------
# Coloque fotos em game/images/ e troque os "Solid" abaixo.
# Exemplo: image bg primeiro_encontro = "primeiro_encontro.jpg"
image bg preto            = Solid("#000000")
image bg primeiro_encontro = Solid("#3d2c4f")
image bg viagem            = Solid("#2c4f4a")
image bg futuro            = Solid("#4f3b2c")
image bg pedido            = Solid("#4f2c3b")

# --- Pontos de carinho (mudam o final) ----------------------------------
default carinho = 0

label start:

    scene bg preto
    with fade

    narr "Todo jogo começa com um primeiro contato..."
    narr "Este é sobre duas pessoas. Você sabe quem são."

    $ nome = renpy.input("Antes de começar, como você quer ser chamada hoje?", length=20).strip()
    if not nome:
        $ nome = "Amor"
    $ voce = Character(nome, color="#6fa8dc")

    # ================= CAPÍTULO 1 =================
    scene bg primeiro_encontro
    with dissolve

    narr "Capítulo 1 - O começo"
    # TROQUE: conte como vocês se conheceram
    eu "Lembra de quando a gente se viu pela primeira vez?"
    voce "Claro que lembro!"

    menu:
        eu "O que eu estava fazendo mesmo?"

        "Tentando parecer descolado":
            $ carinho += 1
            voce "Tentando parecer descolado. E falhando adoravelmente."
            eu "Eu tava nervoso, tá?"

        "Falando sem parar":
            $ carinho += 1
            voce "Falando sem parar. Eu só ouvia e achava graça."

        "Não lembro":
            voce "Não lembro..."
            eu "Ai, essa doeu. Mas eu te perdoo."

    # ================= CAPÍTULO 2 =================
    scene bg viagem
    with fade

    narr "Capítulo 2 - Nossas aventuras"
    # TROQUE: uma viagem, um passeio ou uma piada interna de vocês
    eu "Teve aquela vez em que a gente se perdeu... e foi o melhor dia."

    menu:
        voce "O que mais marcou naquele dia?"

        "A comida":
            $ carinho += 1
            voce "A comida, sem dúvida. Ainda sonho com aquilo."

        "A companhia":
            $ carinho += 2
            voce "Você. Qualquer lugar fica bom com você."
            eu "..."
            eu "Para. Vou chorar."

        "O perrengue":
            $ carinho += 1
            voce "O perrengue! Rimos por horas depois."

    # ================= CAPÍTULO 3 =================
    scene bg futuro
    with fade

    narr "Capítulo 3 - O que vem pela frente"
    # TROQUE: sonhos de vocês, a casa, a viagem dos sonhos, os planos
    eu "Eu imagino a gente daqui a alguns anos..."
    eu "Uma casa nossa, café pela manhã, e a gente rindo à toa."

    menu:
        eu "E você, o que sonha para a gente?"

        "Viajar o mundo":
            $ carinho += 1
            voce "Conhecer o mundo todo, de mãos dadas."

        "Uma casa cheia de vida":
            $ carinho += 2
            voce "Uma casa cheia de vida, de bagunça e de amor."

        "Tudo isso e mais":
            $ carinho += 2
            voce "Tudo isso e mais. Contanto que seja com você."

    # ================= FINAL =================
    scene bg pedido
    with fade

    narr "Capítulo final"

    if carinho >= 6:
        jump final_especial
    else:
        jump final_normal


label final_normal:
    eu "Eu quis contar a nossa história do meu jeito."
    eu "Porque você é a melhor parte dela."
    narr "FIM"
    return


label final_especial:
    eu "Eu quis contar a nossa história do meu jeito."
    eu "Porque você é a melhor parte dela."
    eu "E ainda falta o último capítulo..."
    # TROQUE: a surpresa final (pedido, presente, convite para jantar etc.)
    narr "Fim deste capítulo. O próximo, a gente escreve juntos."
    narr "FIM"
    return
