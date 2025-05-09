# Jogo de Xadrez - GΞΞK CΦDΞ

Este é um jogo de xadrez implementado em HTML, CSS e JavaScript. Ele oferece um tabuleiro interativo onde você pode jogar contra um oponente de computador (IA).

## Funcionalidades

* **Jogabilidade Clássica de Xadrez:** Implementa as regras fundamentais do xadrez.
* **Oponente de IA:** Jogue contra um oponente de computador com diferentes níveis de dificuldade (Fácil, Médio, Difícil).
* **Interface Interativa:** Selecione peças, veja movimentos válidos destacados e realize jogadas facilmente.
* **Design Responsivo:** A interface se adapta bem a diferentes tamanhos de tela.
* **Validação de Movimentos:** O jogo garante que apenas movimentos válidos de xadrez sejam permitidos.
* **Detecção de Xeque:** O jogo verifica se o rei está em xeque após cada movimento.

## Tecnologias Utilizadas

* HTML5
* CSS3
* JavaScript

## Como Jogar / Utilização

1.  **Clone o Repositório:**
    ```bash
    git clone [url_do_repositório]  # Substitua [url_do_repositório] pela URL do seu repositório
    cd nome-do-diretorio-do-projeto
    ```
2.  **Abra o arquivo `index.html` no seu navegador:** Você pode abrir o arquivo diretamente ou usar a opção "Abrir com...".
3.  **Comece a Jogar:**
    * Mova as peças brancas clicando nelas e depois clicando na casa de destino.
    * O computador jogará as peças pretas.
    * Use os botões para reiniciar o jogo ou alterar a dificuldade.

## Estrutura do Projeto

/
├── index.html       # HTML principal do jogo
├── style.css        # Estilos CSS para o jogo
├── script.js        # Lógica do jogo (JavaScript)
└── /images/        # (Diretório para imagens, se houver)


## Explicação dos Arquivos

* `index.html`: Contém a estrutura da página, incluindo o tabuleiro, a área de status e os botões.
* `style.css`: Define a aparência do jogo, como cores, fontes e layout.
* `script.js`: Implementa a lógica do jogo, incluindo o movimento das peças, a IA do oponente e a atualização da interface.

## Níveis de Dificuldade da IA

O jogo oferece os seguintes níveis de dificuldade:

* **Fácil:** A IA faz movimentos mais aleatórios e superficiais.
* **Médio:** A IA considera alguns movimentos à frente para tomar decisões melhores. (Padrão)
* **Difícil:** A IA analisa mais profundamente as possíveis jogadas, tornando-a mais desafiadora.

## Créditos

* Desenvolvido por: GΞΞK CΦDΞ
