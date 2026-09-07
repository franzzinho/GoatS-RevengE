"use strict";

/* GLOBAL CONFIG */
const GOAT = 
{
    /* NAVBAR */
    navbarScrollThreshold: 40,

    /* BACK TO TOP */
    backToTopThreshold: 500,

    /* SCROLL REVEAL */
    revealThreshold: 0.12,
    revealRootMargin: "0px 0px -60px 0px",

    /* LEGAL */
    highlightDuration: 1200,

    /* MUSIC */
    defaultMusicVolume: 0.72,

    musicStorageKeys: 
    {
        muted: "goatMusicMuted",
        volume: "goatMusicVolume",
        paused: "goatMusicPaused"
    }
};

let pausedByUser = localStorage.getItem(GOAT.musicStorageKeys.paused) === "true";

/* DOM READY */
document.addEventListener("DOMContentLoaded", () => 
{
    initNavbar();
    initSmoothAnchors();
    initScrollReveal();
    initBackToTop();
    initLegalNavigation();
    initDynamicYear();
    secureExternalLinks();
    initGoatMusic();
});

/* NAVBAR */
function initNavbar()
{
    const navbar = document.querySelector(".navbar");

    if (!navbar)
    {
        return;
    }

    function updateNavbar()
    {
        const scrolled = window.scrollY > GOAT.navbarScrollThreshold;
        navbar.classList.toggle("navbar-scrolled", scrolled);
    }

    updateNavbar();
    window.addEventListener("scroll", updateNavbar,
    {
      passive: true
    });
}

/* SMOOTH ANCHOR LINKS */
function initSmoothAnchors()
{
    const anchorLinks = document.querySelectorAll('a[href^="#"]');

    if (!anchorLinks.length)
    {
        return;
    }

    anchorLinks.forEach(link =>
    {
        link.addEventListener("click",event =>
        {
          const href = link.getAttribute("href");

          if (!href || href === "#")
          {
            return;
          }

          let target;

          try
          {
            target = document.querySelector(href);
          }

         catch
         {
           return;
         }

          if (!target)
          {
            return;
          }

          event.preventDefault();
          const navbar = document.querySelector(".navbar");
          const navbarHeight = navbar ? navbar.offsetHeight: 0;   
          const targetPosition = target.getBoundingClientRect().top + window.scrollY - navbarHeight - 20;
                
          window.scrollTo(
          {  
            top: Math.max(0, targetPosition), behavior:prefersReducedMotion() ? "auto" : "smooth"});
            });
    });
}

/* SCROLL REVEAL */
function initScrollReveal()
{
    const selectors =
    [
        /* HOME */
        ".overview-card",
        ".goats-action-card",

        /* VIDEO IDEAS */
        ".ideas-panel",
        ".ideas-divider",

        /* LEGAL */
        ".legal-intro-card",
        ".legal-index a",
        ".legal-clause",
        ".legal-important-card",
        ".legal-doc-card",

        /* TEAM */
        ".team-path-card",
        ".team-role-card",
        ".team-empty-state",
        ".team-member-card",
        ".collaboration-card",

        /* PROJECT */
        ".project-card",
        ".project-end-inner",

        /* FOOTER */
        ".footer-brand",
        ".footer-social"
    ];

    const elements = document.querySelectorAll(selectors.join(","));

    if (!elements.length)
    {
        return;
    }

    /* ACCESSIBILITÀ: */
    if (prefersReducedMotion())
    {
        elements.forEach(element =>
        {
            element.classList.add("goats-visible");
        });
        return;
    }

    /* PREPARA GLI ELEMENTI */
    elements.forEach(
        (element, index) =>
        {
            element.classList.add("goats-reveal");
            const delay = (index % 4) * 80;
            element.style.setProperty("--goats-delay",`${delay}ms`);
        });

    /* INTERSECTION OBSERVER*/
    const observer =
        new IntersectionObserver(entries =>
        {
          entries.forEach(entry =>
          {
            if (!entry.isIntersecting)
            {
              return;
            }

            entry.target.classList.add("goats-visible");
            observer.unobserve(entry.target);
          });
      },
      { 
        threshold: GOAT.revealThreshold, rootMargin:GOAT.revealRootMargin
      });

    elements.forEach(element =>
    {
        observer.observe(element);
    });
}

/* BACK TO TOP */
function initBackToTop()
{
    const button = document.querySelector(".footer-top-btn");

    if (!button)
    {
        return;
    }

    button.classList.add("goats-top-hidden");

    function updateButton()
    {
        const shouldShow = window.scrollY > GOAT.backToTopThreshold;
        button.classList.toggle("goats-top-visible", shouldShow);
        button.classList.toggle("goats-top-hidden", !shouldShow);
    }

    updateButton();

    window.addEventListener("scroll", updateButton,
    {
        passive: true
    });

    button.addEventListener("click", event =>
    {
        event.preventDefault();
        window.scrollTo(
        {
            top: 0,
            behavior: prefersReducedMotion() ? "auto" : "smooth"
        });
    });
}

/* LEGAL CENTER NAVIGATION */
function initLegalNavigation()
{
    const legalLinks = document.querySelectorAll(".legal-index a");

    if (!legalLinks.length)
    {
        return;
    }

    legalLinks.forEach(link =>
    {
        link.addEventListener("click", () =>
        {
            const href = link.getAttribute("href");

            if (!href)
            {
                return;
            }

            let clause;

            try
            {
                clause = document.querySelector(href);
            }

            catch
            {
                return;
            }

            if (!clause)
            {
                return;
            }

            /* FA RISALTARE LA CLAUSOLA DOPO LA NAVIGAZIONE */
            window.setTimeout(() =>
            {
                clause.classList.add("legal-highlight");

                window.setTimeout(() =>
                {
                    clause.classList.remove("legal-highlight");
                },
                GOAT.highlightDuration);
            },
            prefersReducedMotion() ? 0 : 450);
        });
    });
}

/* DYNAMIC YEAR */
function initDynamicYear()
{
    const yearElements = document.querySelectorAll("[data-current-year]");

    if (!yearElements.length)
    {
        return;
    }

    const currentYear = new Date().getFullYear();

    yearElements.forEach(element =>
    {
        element.textContent = currentYear;
    });
}

/* EXTERNAL LINK SECURITY */
function secureExternalLinks()
{
    const links = document.querySelectorAll('a[target="_blank"]');

    if (!links.length)
    {
        return;
    }

    links.forEach(link =>
    {
        const currentRel = link.getAttribute("rel") || "";
        const relValues = new Set(currentRel.split(/\s+/).filter(Boolean));

        /* EVITA CHE LA NUOVA PAGINA POSSA CONTROLLARE window.opener */
        relValues.add("noopener");
        link.setAttribute("rel", [...relValues].join(" "));
    });
}

/* ACCESSIBILITY */
function prefersReducedMotion()
{
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/* GOATS MUSIC */
function initGoatMusic()
{
    const aboutCustomMusic = document.getElementById("carouselMusic");
    const aboutIntro = document.getElementById("introScreen");

    if (aboutCustomMusic || aboutIntro)
    {
        console.log("🐐 ABOUT CUSTOM EXPERIENCE: GLOBAL MUSIC DISABLED");
        return;
    }

    /* TRACK DELLA PAGINA */
    const musicSource = document.body.dataset.musicSrc;

    if (!musicSource)
    {
        return;
    }

    /* CONFIGURAZIONE VOLUME */
    const pageVolume = parseMusicVolume(document.body.dataset.musicVolume);
    const storedVolume = readStoredVolume();
    let currentVolume = storedVolume !== null ? storedVolume : pageVolume;
    /* STATO MUTE */
    let muted = localStorage.getItem(GOAT.musicStorageKeys.muted) === "true";
    /* CREA AUDIO */
    const music = new Audio();
    music.src = musicSource;
    music.loop = true;
    music.preload = "auto";
    music.volume = currentVolume;
    music.muted = muted;
    /* CREA CONTROLLO AUDIO */
    const controls = createMusicControls(music, currentVolume, muted);
    /* PLAY + PAUSE + BARRA CANZONE + TITOLO */
    enhanceGoatMusicControls(controls, music);
    /* AGGRESSIVE AUTOPLAY ATTEMPT */
    let musicStarted = false;
    let interactionFallbackActive = false;

    async function tryStartMusic()
    {
        /* SE È GIÀ PARTITA, NON FACCIAMO NULLA */
        if (musicStarted)
        {
            return true;
        }

        try
        {
            await music.play();
            musicStarted = true;
            controls.container.classList.add("goat-music-playing");
            controls.container.classList.remove("goat-music-waiting");
            removeInteractionFallback();
            console.log("🐐🧠 GOATS REVENGE MUSIC ONLINE 🐐🧠");
            return true;
        }

        catch (error)
        {
            controls.container.classList.add("goat-music-waiting");
            armInteractionFallback();
            console.log("🐐 Autoplay bloccato: musica armata sulla prima interazione.");
            return false;
        }
    }

    /* FIRST INTERACTION FALLBACK */
    function armInteractionFallback()
    {
        if (interactionFallbackActive)
        {
            return;
        }

        interactionFallbackActive = true;

        document.addEventListener("pointerdown", startFromInteraction,
        {
            once: true,
            capture: true
        });

        document.addEventListener("keydown", startFromInteraction,
        {
            once: true,
            capture: true
        });

        document.addEventListener("touchstart", startFromInteraction,
        {
            once: true,
            capture: true,
            passive: true
        });
    }

    function removeInteractionFallback()
    {
        if (!interactionFallbackActive)
        {
            return;
        }

        interactionFallbackActive = false;
        document.removeEventListener("pointerdown", startFromInteraction, true);
        document.removeEventListener("keydown", startFromInteraction, true);
        document.removeEventListener("touchstart", startFromInteraction, true);
    }

    function startFromInteraction()
    {
        interactionFallbackActive = false;
        tryStartMusic();
    }

    /* AUTOPLAY (solo se l'utente non aveva messo in pausa) */
    if (!pausedByUser)
    {
        tryStartMusic();
    }

    /* MUTE BUTTON */
    controls.muteButton.addEventListener("click", event =>
    {
        /* EVITA CHE IL CLICK SUL CONTROLLO VENGA INTERPRETATO MALE DA ALTRI COMPONENTI */
        event.stopPropagation();
        muted = !music.muted;
        music.muted = muted;
        localStorage.setItem(GOAT.musicStorageKeys.muted, String(muted));
        updateMusicMuteUI(controls, muted);

        if (!musicStarted && !pausedByUser)
        {
            tryStartMusic();
        }
    });

    /* VOLUME SLIDER */
    controls.volumeSlider.addEventListener("input", event =>
    {
        const newVolume = Number(event.target.value);
        currentVolume = clamp(newVolume, 0, 1);
        music.volume = currentVolume;
        localStorage.setItem(GOAT.musicStorageKeys.volume,String(currentVolume));

        /* SE SI ALZA IL VOLUME DA ZERO, RIATTIVIAMO AUTOMATICAMENTE L'AUDIO */
        if (currentVolume > 0 && music.muted)
        {
            muted = false;
            music.muted = false;
            localStorage.setItem(GOAT.musicStorageKeys.muted,"false");
        }

        updateMusicMuteUI(controls, music.muted);
        updateVolumeVisual(controls.volumeSlider, currentVolume);

        if (!musicStarted && !pausedByUser)
        {
            tryStartMusic();
        }
    });

    /* MEDIA EVENTS */
    music.addEventListener("play", () =>
    {
        controls.container.classList.add("goat-music-playing");
        controls.container.classList.remove("goat-music-waiting");
    });

    music.addEventListener("pause", () =>
    {
        controls.container.classList.remove("goat-music-playing");
    });

    music.addEventListener("error", () =>
    {
        console.error("❌ MUSIC ERROR ❌:", music.error);
        controls.container.classList.add("goat-music-error");
    });
}

/* MUSIC CONTROL CREATOR */
function createMusicControls(music, volume, muted)
{
    const container = document.createElement("div");
    container.className = "goat-music-control";
    container.setAttribute("aria-label", "Controlli musica GoatS RevengE");
    /* ICON MUTE */
    const muteButton = document.createElement("button");
    muteButton.type = "button";
    muteButton.className = "goat-music-mute";
    muteButton.setAttribute("aria-label", muted ? "Attiva musica" : "Disattiva musica");
    const icon = document.createElement("i");
    muteButton.appendChild(icon);
    /* VOLUME */
    const volumeSlider = document.createElement("input");
    volumeSlider.type = "range";
    volumeSlider.className = "goat-music-volume";
    volumeSlider.min = "0";
    volumeSlider.max = "1";
    volumeSlider.step = "0.01";
    volumeSlider.value = String(volume);
    volumeSlider.setAttribute("aria-label", "Volume musica");
    /* LABEL */
    const label = document.createElement("span");
    label.className = "goat-music-label";
    label.textContent = "GOAT FM";
    /* BUILD */
    container.appendChild(muteButton);
    container.appendChild(label);
    container.appendChild(volumeSlider);
    
    const navbar = document.querySelector(".navbar");

    if (navbar)
    {
        navbar.appendChild(container);
    }
        
    else
    {
        document.body.appendChild(container);
    }

    const controls =
    {
        container,
        muteButton,
        icon,
        volumeSlider,
        label
    };

    updateMusicMuteUI(controls, muted);
    updateVolumeVisual(volumeSlider, volume);
    return controls;
}

/* GOATS MUSIC - PLAY + PAUSE + SEEK + TRACK TITLE */
function enhanceGoatMusicControls(controls, music) 
{
    /* TITOLO CANZONE PRESO DALL'HTML */
    const musicTitle = (document.body.dataset.musicTitle || "").trim();

    if (musicTitle) 
    {
        controls.label.textContent = musicTitle;
        controls.label.setAttribute("title", musicTitle);
    }

    /* PULSANTE PLAY + PAUSE */
    const playButton = document.createElement("button");
    playButton.type = "button";
    playButton.className = "goat-music-play";
    const playIcon = document.createElement("i");
    playIcon.className = "fa-solid fa-play";
    playButton.appendChild(playIcon);
    playButton.setAttribute("aria-label", "Riproduci musica");
    playButton.setAttribute("aria-pressed", "false");
    /* A SINISTRA DEL PULSANTE MUTE */
    controls.container.insertBefore(playButton, controls.muteButton);
    controls.playButton = playButton;
    controls.playIcon = playIcon;
    /* BARRA AVANZAMENTO CANZONE */
    const seekSlider = document.createElement("input");
    seekSlider.type = "range";
    seekSlider.className = "goat-music-seek goat-music-volume";
    seekSlider.min = "0";
    seekSlider.max = "1";
    seekSlider.step = "0.01";
    seekSlider.value = "0";
    seekSlider.setAttribute("aria-label", "Posizione della canzone");
    seekSlider.disabled = true;
    /* INSERISCE LA BARRA PRIMA DEL VOLUME */
    controls.container.insertBefore(seekSlider, controls.volumeSlider);
    controls.seekSlider = seekSlider;
    /* STATO INIZIALE SEEK */
    updateGoatMusicSeek();
    /* GESTIONE CLICK PLAY + PAUSE */
    let pausedBeforePointer = null;

    function rememberPlaybackState(event) 
    {
        if (event.target === playButton || playButton.contains(event.target)) 
        {
            pausedBeforePointer = music.paused;
        }
    }

    document.addEventListener("pointerdown", rememberPlaybackState, true);

    playButton.addEventListener("click", async event => 
    {
        event.stopPropagation();
        const shouldPlay = pausedBeforePointer !== null ? pausedBeforePointer: music.paused;
        pausedBeforePointer = null;

        if (shouldPlay) 
        {
            try 
            {
                await music.play();
                pausedByUser = false;
                localStorage.setItem(GOAT.musicStorageKeys.paused, "false");
            } catch (error) 
            {
                console.log("❌ Riproduzione musica bloccata ❌:", error);
            }
        } 
        else 
        {
            music.pause();
            pausedByUser = true;
            localStorage.setItem(GOAT.musicStorageKeys.paused, "true");
        }
    });

    /* SPOSTAMENTO AVANTI + INDIETRO NELLA CANZONE */
    seekSlider.addEventListener("input", event => 
    {
        const duration = music.duration;

        if (!Number.isFinite(duration) || duration <= 0) 
        {
            return;
        }

        const requestedTime = clamp(Number(event.target.value), 0, duration);
        music.currentTime = requestedTime;
        updateGoatMusicSeek();
    });

    /* AGGIORNA DURATA QUANDO L'MP3 È PRONTO */
    function updateSeekDuration() 
    {
        const duration = music.duration;

        if (!Number.isFinite(duration) || duration <= 0) 
        {
            seekSlider.disabled = true;
            seekSlider.max = "1";
            seekSlider.value = "0";
            updateVolumeVisual(seekSlider, 0);
            return;
        }

        seekSlider.disabled = false;
        seekSlider.max = String(duration);
        updateGoatMusicSeek();
    }

    /* AGGIORNA VISIVAMENTE LA BARRA */
    function updateGoatMusicSeek() 
    {
        const duration = music.duration;

        if (!Number.isFinite(duration) || duration <= 0) 
        {
            seekSlider.value = "0";
            updateVolumeVisual(seekSlider, 0);
            return;
        }

        const currentTime = clamp(music.currentTime, 0, duration);
        const progress = currentTime / duration;
        seekSlider.value = String(currentTime);
        updateVolumeVisual(seekSlider, progress);
    }

    /* AGGIORNAMENTO FLUIDO DELLA BARRA */
    let seekAnimationFrame = null;

    function animateSeek() 
    {
        updateGoatMusicSeek();

        if (!music.paused) 
        {
            seekAnimationFrame = requestAnimationFrame(animateSeek);
        }
    }

    function startSeekAnimation() 
    {
        if (seekAnimationFrame !== null) 
        {
            cancelAnimationFrame(seekAnimationFrame);
        }

        seekAnimationFrame = requestAnimationFrame(animateSeek);
    }

    function stopSeekAnimation() 
    {
        if (seekAnimationFrame !== null) 
        {
            cancelAnimationFrame(seekAnimationFrame);
            seekAnimationFrame = null;
        }

        updateGoatMusicSeek();
    }

    /* STATO PLAY + PAUSE */
    function updatePlayButton() 
    {
        const playing = !music.paused;
        controls.playIcon.className = playing ? "fa-solid fa-pause" : "fa-solid fa-play";
        playButton.setAttribute("aria-label", playing ? "Metti in pausa la musica" : "Riproduci musica");
        playButton.setAttribute("aria-pressed", String(playing));
        controls.container.classList.toggle("goat-music-paused", !playing);
    }

    /* EVENTI AUDIO */
    music.addEventListener("loadedmetadata", updateSeekDuration);
    music.addEventListener("durationchange", updateSeekDuration);
    music.addEventListener("timeupdate", updateGoatMusicSeek);
    music.addEventListener("play", () => 
    {
        updatePlayButton();
        startSeekAnimation();
    });

    music.addEventListener("pause", () => 
    {
        updatePlayButton();
        stopSeekAnimation();
    });

    music.addEventListener("ended", () => 
    {
        updatePlayButton();
        updateGoatMusicSeek();
    });

    updatePlayButton();
}

/* UPDATE MUTE UI */
function updateMusicMuteUI(controls,muted)
{
    controls.icon.className = muted ? "fa-solid fa-volume-xmark" : "fa-solid fa-volume-high";
    controls.muteButton.setAttribute("aria-label", muted ? "Attiva musica" : "Disattiva musica");
    controls.container.classList.toggle("goat-music-muted", muted);
}

/* VOLUME VISUAL */
function updateVolumeVisual(slider,volume)
{
    slider.style.setProperty("--goat-volume", `${volume * 100}%`);
}

/* MUSIC VOLUME PARSER */
function parseMusicVolume(value)
{
    if (value === undefined || value === null || value === "")
    {
        return GOAT.defaultMusicVolume;
    }

    const number = Number(value);

    if (Number.isNaN(number))
    {
        return GOAT.defaultMusicVolume;
    }

    return clamp(number, 0, 1);
}

/* STORED VOLUME */
function readStoredVolume()
{
    const stored = localStorage.getItem(GOAT.musicStorageKeys.volume);

    if (stored === null)
    {
        return null;
    }

    const number = Number(stored);

    if (Number.isNaN(number))
    {
        return null;
    }

    return clamp(number, 0, 1);
}

/* NUMBER CLAMP */
function clamp(value, min,max)
{
    return Math.min(Math.max(value, min),max);
}
