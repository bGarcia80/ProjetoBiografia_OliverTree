document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("conteudo-container");
  const links = document.querySelectorAll("a[data-page]");
  const menuToggle = document.getElementById("menu-toggle");
  const sidebarMenu = document.getElementById("sidebar-menu");

  menuToggle.addEventListener("click", () => {
    sidebarMenu.classList.toggle("open");
  });

  function formatTime(seconds) {
    if (isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  }

  function setupCustomAudioPlayers() {
    const audios = container.querySelectorAll("audio");
    const themes = [
      "🛴 Turbo Mode",
      "👽 Alien Boy Vibes",
      "🤠🔫 Cowboy Tears",
      "🛸 Tree Era",
      "🛴🔥 Scooter Pro",
    ];

    audios.forEach((audio, index) => {
      audio.style.display = "none";
      const themeLabel = themes[index % themes.length];

      const playerWrapper = document.createElement("div");
      playerWrapper.className = "custom-audio-player";
      playerWrapper.innerHTML = `
                <div class="player-controls">
                    <button type="button" class="play-btn" aria-label="Tocar ou Pausar">▶</button>
                    <div class="progress-area">
                        <div class="progress-bar-bg">
                            <div class="progress-bar-fill"></div>
                        </div>
                        <div class="time-display">
                            <span class="current-time">0:00</span>
                            <span class="duration-time">0:00</span>
                        </div>
                    </div>
                </div>
                <div class="player-badge">
                    <span>${themeLabel}</span>
                    <span class="status-emoji">🎧 Pausado</span>
                </div>
            `;

      audio.parentNode.insertBefore(playerWrapper, audio);

      const playBtn = playerWrapper.querySelector(".play-btn");
      const progressBg = playerWrapper.querySelector(".progress-bar-bg");
      const progressFill = playerWrapper.querySelector(".progress-bar-fill");
      const currentTimeEl = playerWrapper.querySelector(".current-time");
      const durationTimeEl = playerWrapper.querySelector(".duration-time");
      const statusEmoji = playerWrapper.querySelector(".status-emoji");

      audio.addEventListener("loadedmetadata", () => {
        durationTimeEl.textContent = formatTime(audio.duration);
      });

      if (audio.readyState >= 1) {
        durationTimeEl.textContent = formatTime(audio.duration);
      }

      playBtn.addEventListener("click", () => {
        if (audio.paused) {
          audios.forEach((other) => {
            if (other !== audio) other.pause();
          });
          audio.play();
        } else {
          audio.pause();
        }
      });

      audio.addEventListener("play", () => {
        playBtn.textContent = "⏸";
        statusEmoji.textContent = "🔊 Tocando... 🛴💨";
      });

      audio.addEventListener("pause", () => {
        playBtn.textContent = "▶";
        statusEmoji.textContent = "🎧 Pausado";
      });

      audio.addEventListener("timeupdate", () => {
        if (audio.duration) {
          const percent = (audio.currentTime / audio.duration) * 100;
          progressFill.style.width = `${percent}%`;
          currentTimeEl.textContent = formatTime(audio.currentTime);
        }
      });

      audio.addEventListener("ended", () => {
        playBtn.textContent = "▶";
        progressFill.style.width = "0%";
        currentTimeEl.textContent = "0:00";
        statusEmoji.textContent = "🎧 Finalizado";
      });

      progressBg.addEventListener("click", (e) => {
        const rect = progressBg.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const width = rect.width;
        if (audio.duration) {
          audio.currentTime = (clickX / width) * audio.duration;
        }
      });
    });
  }

  async function loadPage(url, activeLink) {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error("Erro ao carregar página");

      const htmlText = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlText, "text/html");

      container.innerHTML = `<div class="page-wrapper">${doc.body.innerHTML}</div>`;
      container.scrollTop = 0;
      window.scrollTo(0, 0);

      links.forEach((link) => link.classList.remove("active"));
      if (activeLink) activeLink.classList.add("active");

      sidebarMenu.classList.remove("open");

      setupCustomAudioPlayers();
    } catch (error) {
      container.innerHTML = `
                <div class="page-wrapper">
                    <h2>Ops! Não foi possível carregar esta página.</h2>
                    <p>Use a extensão <strong>Live Server</strong> no VS Code ou abra pelo GitHub Pages para que a navegação funcione.</p>
                </div>
            `;
      console.error(error);
    }
  }

  links.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const url = link.getAttribute("href");
      loadPage(url, link);
    });
  });

  const initialLink = document.querySelector('a[href="conteudo.html"]');
  loadPage("conteudo.html", initialLink);
});
