document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById("conteudo-container");
    const links = document.querySelectorAll("a[data-page]");
    const menuToggle = document.getElementById("menu-toggle");
    const sidebarMenu = document.getElementById("sidebar-menu");

    // Abre/fecha menu no celular
    menuToggle.addEventListener("click", () => {
        sidebarMenu.classList.toggle("open");
    });

    // Função que carrega o HTML interno na área principal (como o antigo <frame>)
    async function loadPage(url, activeLink) {
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error("Erro ao carregar página");

            const htmlText = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(htmlText, "text/html");

            // Pega o conteúdo de dentro do <body> da página alvo
            container.innerHTML = `<div class="page-wrapper">${doc.body.innerHTML}</div>`;
            container.scrollTop = 0;
            window.scrollTo(0, 0);

            // Atualiza link ativo no menu
            links.forEach(link => link.classList.remove("active"));
            if (activeLink) activeLink.classList.add("active");

            // Fecha o menu no mobile após clicar
            sidebarMenu.classList.remove("open");

            // Configura players de áudio da discografia para não tocarem juntos
            setupAudioPlayers();
        } catch (error) {
            container.innerHTML = `
                <div class="page-wrapper">
                    <h2>Ops! Não foi possível carregar esta página.</h2>
                    <p>Se você abriu o arquivo direto pelo duplo clique (protocolo <code>file://</code>), use a extensão <strong>Live Server</strong> no VS Code ou hospede no GitHub Pages para a navegação funcionar.</p>
                </div>
            `;
            console.error(error);
        }
    }

    // Garante que apenas uma música toque por vez na página Discografia
    function setupAudioPlayers() {
        const audios = container.querySelectorAll("audio");
        audios.forEach(audio => {
            audio.addEventListener("play", () => {
                audios.forEach(other => {
                    if (other !== audio) other.pause();
                });
            });
        });
    }

    // Intercepta os cliques do menu
    links.forEach(link => {
        link.addEventListener("click", (e) => {
            e.preventDefault();
            const url = link.getAttribute("href");
            loadPage(url, link);
        });
    });

    // Carrega a página inicial por padrão
    const initialLink = document.querySelector('a[href="conteudo.html"]');
    loadPage("conteudo.html", initialLink);
});