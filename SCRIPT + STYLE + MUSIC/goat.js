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

/* GOATS REVENGE | BILINGUAL LANGUAGE ENGINE */
(() => 
{
  "use strict";

  const STORAGE_KEY = "goatSiteLanguage";
  const SUPPORTED_LANGUAGES = new Set(["it", "en"]);
  const GOAT_I18N_EN = 
  {
      "am.001": "Manage offers from your phone. Organize publishing through the Windows backend.",
    
      "am.002": "An Android app paired with a Windows backend. Create and manage offers, review drafts and published posts, configure Telegram channels, and set up automation and publishing schedules.",
    
      "am.003": "Android app",
    
      "am.004": "Windows backend",
    
      "am.005": "Telegram channels",
    
      "am.006": "Explore features",
    
      "am.007": "View previews",
    
      "am.008": "Insert an actual screenshot",
    
      "am.009": "Two components, one connected workflow.",
    
      "am.010": "Create and edit",
    
      "am.011": "Drafts and published",
    
      "am.012": "Scheduling",
    
      "am.013": "Rules and categories",
    
      "am.014": "CONTROL AND AUTOMATION",
    
      "am.015": "Affiliate Manager features",
    
      "am.016": "From preparing offers to managing publishing.",
    
      "am.017": "Published offers and drafts",
    
      "am.018": "Browse offers that have already been published and those still in draft.",
    
      "am.019": "Full offer management",
    
      "am.020": "Create new offers, edit existing information, and delete offers you no longer need.",
    
      "am.021": "Publishing schedules",
    
      "am.022": "Schedule posts for your configured Telegram channels.",
    
      "am.023": "Set categories and criteria for automated offer searches, subject to available authorized integrations.",
    
      "am.024": "Telegram channels and bots",
    
      "am.025": "Configure channel identifiers and connection settings for the publishing bot.",
    
      "am.026": "Backend connection",
    
      "am.027": "Manage the IP address, port and bind address of the Windows service to connect the app to its backend.",
    
      "am.028": "ONE SYSTEM, TWO COMPONENTS",
    
      "am.029": "How it works",
    
      "am.030": "The Android app provides the control interface; the Windows backend runs the configured processes.",
    
      "am.031": "Start the backend",
    
      "am.032": "Configure and run the service on a Windows PC.",
    
      "am.033": "Connect Android",
    
      "am.034": "Set up the network connection between your phone and the backend.",
    
      "am.035": "Set your rules",
    
      "am.036": "Manage offers, categories, channels and publishing time windows.",
    
      "am.037": "Monitor",
    
      "am.038": "Review drafts and published offers from the Android app.",
    
      "am.039": "PACKAGE CONTENTS",
    
      "am.040": "What you get",
    
      "am.041": "Android application",
    
      "am.042": "Windows backend program",
    
      "am.043": "Offer and draft management",
    
      "am.044": "Publishing scheduler",
    
      "am.045": "Rules and category settings",
    
      "am.046": "Bot and channel settings",
    
      "am.047": "Network settings",
    
      "am.048": "Configuration files",
    
      "am.049": "Installation instructions",
    
      "am.050": "Quick-start guide",
    
      "am.051": "Personal-use license",
    
      "am.052": "Basic support",
    
      "am.053": "BEFORE INSTALLING",
    
      "am.054": "Requirements and details",
    
      "am.055": "An Android app and a Windows backend have different requirements.",
    
      "am.056": "Windows and Android",
    
      "am.057": "Backend PC",
    
      "am.058": "Windows 11, 64-bit",
    
      "am.059": "Smartphone",
    
      "am.060": "Android; minimum version to be confirmed",
    
      "am.061": "Processor",
    
      "am.062": "Modern Intel or AMD CPU on the PC",
    
      "am.063": "PC RAM",
    
      "am.064": "16 GB recommended; final specifications to be verified",
    
      "am.065": "Network",
    
      "am.066": "Network connectivity between the Android app and the Windows backend",
    
      "am.067": "External services",
    
      "am.068": "Telegram and authorized access to the relevant Amazon services",
    
      "am.069": "Python, FFmpeg and other dependencies are not listed as required until they have been verified against the actual Affiliate Manager build.",
    
      "am.070": "Configuration and security",
    
      "am.071": "The Android app must be able to reach the backend at the configured address and port. Bind-address settings determine which network interfaces the service listens on.",
    
      "am.072": "To publish in a Telegram channel, the bot needs the appropriate permissions.",
    
      "am.073": "The bot secret token is not the same as its ID:",
    
      "am.074": "it must be protected and never published in screenshots, client-side code or web pages.",
    
      "am.075": "Do not expose the backend directly to the Internet without authentication, connection protection and appropriate security safeguards.",
    
      "am.076": "License, updates and support",
    
      "am.077": "The package is intended for the purchaser’s personal use unless the license states otherwise.",
    
      "am.078": "Basic support covers installation and operational issues, and corrective updates for the purchased version may be supplied when available. Free lifetime updates, individual configurations and unlimited support are not promised.",
    
      "am.079": "IMPORTANT INFORMATION",
    
      "am.080": "Automation and third-party platforms",
    
      "am.081": "Affiliate Manager is independent software and is not an official Amazon or Telegram product. Data availability, search and publishing features depend on permissions, approved integrations and the rules of the services used. Users must verify that their channels and affiliate activities are authorized and clearly disclose the promotional nature of affiliate links.",
    
      "am.082": "AFFILIATE MANAGER",
    
      "am.083": "A control center for offers and publishing.",
    
      "am.084": "A digital package comprising the Android app, Windows backend and instructions. Pricing, release version and delivery method will be confirmed before sales open.",
    
      "am.085": "Guide included",
    
      "am.086": "AVAILABILITY",
    
      "am.087": "Price to be determined",
    
      "am.088": "Sales are not yet open.",
    
      "am.089": "Request information",
    
      "am.090": "No payment is taken on this page.",
    
      "am.meta.title": "Affiliate Manager • GoatS RevengE",
    
      "am.meta.description": "Affiliate Manager: Android app and Windows backend for managing offers, drafts, publishing schedules and Telegram channel posts.",
    
      "am.aria.92": "Affiliate Manager previews",
    
      "am.aria.93": "Key features",
    
      "after.001": "GOATS REVENGE / DIGITAL PRODUCTS",
    
      "after.002": "Thank you for your order.",
    
      "after.003": "If you have successfully completed your payment, a confirmation will be sent to the email address used at checkout.",
    
      "after.004": "How you will receive your product",
    
      "after.005": "Once payment is confirmed, the digital delivery system will send instructions for accessing the software you purchased. Please also check your Spam or Promotions folder.",
    
      "after.006": "Payment and download access are verified separately:",
    
      "after.007": "this page does not prove that payment was completed and does not grant download access.",
    
      "after.008": "Back to projects",
    
      "after.009": "Purchase support",
    
      "after.010": "Important: publish this page only after the download delivery system has been configured and tested.",
    
      "after.011": "Terms of Sale",
    
      "after.meta.title": "Thank you for your order • GoatS RevengE",
    
      "after.meta.description": "Information following the purchase of a GoatS RevengE digital product.",
    
      "after.aria.107": "Main navigation",
    
      "project2.001": "ANDROID + WINDOWS • DIGITAL SOFTWARE",
    
      "project2.002": "Manage offers, drafts, schedules and Telegram automation from the Android app, powered by a dedicated Windows backend.",
    
      "project2.003": "Offer and draft management",
    
      "project2.004": "Publishing rules and schedules",
    
      "project2.005": "Android app + Windows backend",
    
      "project2.006": "Explore the project",
    
      "project2.aria.114": "Explore Affiliate Manager",
    
      "project2.alt.115": "Affiliate Manager: Android app and Windows backend",
    
      "shared.nav.home": "Home",
    
      "shared.cta.discover": "Explore",
    
      "shared.cta.buy": "Buy now",
    
      "shared.nav.projects": "Projects",
    
      "shared.lang.label": "Website language"
};

  const originals = new WeakMap();
    
  const ATTRIBUTES = 
  [
    ["data-i18n", "textContent"],
    ["data-i18n-alt", "alt"],
    ["data-i18n-title", "title"],
    ["data-i18n-placeholder", "placeholder"],
    ["data-i18n-aria-label", "aria-label"],
    ["data-i18n-content", "content"]
  ];
    
  const ALL_SELECTORS = ATTRIBUTES.map(([key]) => `[${key}]`).join(",");
  let currentLanguage = "it";
  let chooser = null;

  function readLanguage() 
  {
    try 
    {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      
        if (SUPPORTED_LANGUAGES.has(saved))
        {
            return saved;
        }
    }
    
    catch (error) 
    {
    }
      
    return "it";
  }

  function saveLanguage(language) 
  {
    try 
    { 
        window.localStorage.setItem(STORAGE_KEY, language); 
    }
        
    catch (error) 
    {
    }
  }

  function rememberOriginal(element, attributeName) 
  {
    let record = originals.get(element);
      
    if (!record) 
    {
      record = {};
      originals.set(element, record);
    }
      
    if (!(attributeName in record)) 
    {
      record[attributeName] = attributeName === "textContent" ? element.textContent : element.getAttribute(attributeName);
    }
      
    return record[attributeName];
  }

  function applyTranslations(language) 
  {
    currentLanguage = SUPPORTED_LANGUAGES.has(language) ? language : "it";
    document.documentElement.lang = currentLanguage;
    document.documentElement.dataset.goatLanguage = currentLanguage;

    document.querySelectorAll(ALL_SELECTORS).forEach(element => 
    {
        for (const [marker, attribute] of ATTRIBUTES) 
      {
          if (!element.hasAttribute(marker))
          {
              continue;
          }
        
          const key = element.getAttribute(marker);
          const original = rememberOriginal(element, attribute);
        
          if (attribute === "textContent" && element.children.length > 0) 
          {
              console.warn("GOAT i18n: put data-i18n on a child <span>, not on a parent containing icons/markup:", key);
              continue;
          }
          
          const translated = currentLanguage === "en" ? GOAT_I18N_EN[key] : null;
          const value = typeof translated === "string" ? translated : original;
        
          if (attribute === "textContent")
          {
              element.textContent = value;
          }
        
          else if (value === null) 
          {
              element.removeAttribute(attribute);
          }    
        
          else
          {
              element.setAttribute(attribute, value);
          }
      }
    });

    translateMusicControlLabels();

    if (chooser) 
    {
      chooser.select.value = currentLanguage;
      chooser.flag.textContent = currentLanguage === "it" ? "🇮🇹" : "🇺🇸";
      chooser.select.setAttribute("aria-label", currentLanguage === "it" ? "Lingua del sito" : "Website language");
    }
      
    document.dispatchEvent(new CustomEvent("goat:languagechange", 
    {
      detail: { language: currentLanguage }
    }));
  }

  function translateMusicControlLabels() 
  {
      const slider = document.querySelector(".goat-music-volume");
    
      if (slider) 
      {
          slider.setAttribute("aria-label", currentLanguage === "en" ? "Music volume" : "Volume musica");
      }
    
      const muteButton = document.querySelector(".goat-music-mute");
    
      if (!muteButton)
      {
          return;
      }
    
      const muted = muteButton.closest(".goat-music-control")?.classList.contains("goat-music-muted");
      muteButton.setAttribute("aria-label", currentLanguage === "en"? (muted ? "Enable music" : "Mute music"): (muted ? "Attiva musica" : "Disattiva musica"));
  }

  function injectLanguageSelector() 
  {
      const navbar = document.querySelector(".navbar");
    
      if (!navbar || navbar.querySelector(".goat-language-picker"))
      {
          return;
      }

      const wrapper = document.createElement("div");
      wrapper.className = "goat-language-picker";
      const flag = document.createElement("span");
      flag.className = "goat-language-flag";
      flag.setAttribute("aria-hidden", "true");
      const select = document.createElement("select");
      select.className = "goat-language-select";
      select.id = "goat-language-select";
      select.setAttribute("aria-label", "Lingua del sito");
      select.add(new Option("🇮🇹 Italiano", "it"));
      select.add(new Option("🇺🇸 English", "en"));
      wrapper.append(flag, select);
      navbar.appendChild(wrapper);
      chooser = { select, flag };
      
      select.addEventListener("change", () => 
      {
          const language = select.value;
      
          if (!SUPPORTED_LANGUAGES.has(language))
          {
              return;
          }
      
          saveLanguage(language);
          applyTranslations(language);
      });
  }

  function init() 
  {
      injectLanguageSelector();
      applyTranslations(readLanguage());

      document.addEventListener("click", event => 
      {
          if (event.target.closest?.(".goat-music-mute")) 
          {
              queueMicrotask(translateMusicControlLabels);
          }
      });
    
      document.addEventListener("input", event => 
      {
          if (event.target.closest?.(".goat-music-volume")) 
          {
              queueMicrotask(translateMusicControlLabels);
          }
      });
  }

  if (document.readyState === "loading") 
  {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } 
  
  else 
  {
    init();
  }
})();



















































/* GOATS HOME | Additional editorial copy IT/EN.
   goat.js keeps control of the language selector and localStorage.
   This module only translates NEW copy from the redesigned Home. */
(() => {
  'use strict';
  const textNodes = [...document.querySelectorAll('.gh-root [data-it][data-en]')];
  const attrNodes = [...document.querySelectorAll('.gh-root [data-gh-alt-en], .gh-root [data-gh-aria-en], meta[data-gh-content-en]')];
  const originalAttributes = new WeakMap();
  const lang = () => {
    try { return localStorage.getItem('goatSiteLanguage') === 'en' ? 'en' : 'it'; }
    catch (_) { return document.documentElement.lang === 'en' ? 'en' : 'it'; }
  };
  function apply(current) {
    const key = current === 'en' ? 'en' : 'it';
    // Only site-authored static strings are used; no external/user input is inserted.
    textNodes.forEach(el => { el.innerHTML = el.getAttribute('data-'+key); });
    const rules = [['data-gh-alt-en','alt'],['data-gh-aria-en','aria-label'],['data-gh-content-en','content']];
    attrNodes.forEach(el => {
      if (!originalAttributes.has(el)) originalAttributes.set(el, {});
      const originals = originalAttributes.get(el);
      rules.forEach(([source, target]) => {
        if (!el.hasAttribute(source)) return;
        if (!(target in originals)) originals[target] = el.getAttribute(target);
        const val = key === 'en' ? el.getAttribute(source) : originals[target];
        if (val == null) el.removeAttribute(target); else el.setAttribute(target,val);
      });
    });
  }
  function init() {
    const imgs = document.querySelectorAll('.gh-root .gh-portrait-img,.gh-root .gh-evidence-photo');
    imgs.forEach(img => {
      const mark = () => { if(img.naturalWidth > 0) img.parentElement.classList.add('gh-image-loaded'); };
      if (img.complete) mark();
      else img.addEventListener('load', mark, {once:true});
    });
    apply(lang());
    document.addEventListener('goat:languagechange', e => {
      apply(e.detail?.language === 'en' ? 'en' : 'it');
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, {once:true});
  else init();
})();
