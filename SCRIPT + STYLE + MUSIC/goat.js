"use strict";

const GOAT =
{
    navbarScrollThreshold: 40,
    backToTopThreshold: 500,
    revealThreshold: 0.12,
    revealRootMargin: "0px 0px -60px 0px",
    highlightDuration: 1200,
    defaultMusicVolume: 0.72,
    languageStorageKey: "goatSiteLanguage",
   
    musicStorageKeys:
    {
        muted: "goatMusicMuted",
        volume: "goatMusicVolume",
        paused: "goatMusicPaused"
    }
};

/* UTILITIES */
function goatReadStorage(key)
{
    try
    {
        return window.localStorage.getItem(key);
    }
       
    catch (_)
    {
        return null;
    }
}

function goatWriteStorage(key, value)
{
    try
    {
        window.localStorage.setItem(key, String(value));
    }
    catch (_)
    {
    }
}

function goatClamp(value, min, max)
{
    return Math.min(Math.max(value, min), max);
}

function prefersReducedMotion()
{
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/* NAVBAR E NAVIGAZIONE */
function initNavbar()
{
    const navbar = document.querySelector(".navbar");
   
    if (!navbar)
    {
       return;
    }

    const update = () =>
    {
        navbar.classList.toggle("navbar-scrolled", window.scrollY > GOAT.navbarScrollThreshold);
    };

    update();
   
    window.addEventListener("scroll", update,
        {
            passive: true
        });
}

function initSmoothAnchors()
{
    document.querySelectorAll('a[href^="#"]').forEach(link =>
    {
        link.addEventListener("click", event =>
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
               
            catch (_)
            {
                return;
            }

            if (!target)
            {
               return;
            }

            event.preventDefault();
            const navbarHeight = document.querySelector(".navbar")?.offsetHeight || 0;
            const top = target.getBoundingClientRect().top + window.scrollY - navbarHeight - 20;

            window.scrollTo(
            { 
               top: Math.max(0, top),
               behavior: prefersReducedMotion() ? "auto" : "smooth"
            });
        });
    });
}

function initScrollReveal()
{
    const selectors = 
       [".ideas-panel", ".ideas-divider", ".legal-intro-card", ".legal-index a", ".legal-clause", ".legal-important-card", ".legal-doc-card",
        ".team-path-card", ".team-role-card", ".team-empty-state", ".team-member-card", ".collaboration-card", ".project-card", ".project-end-inner",
        ".footer-brand", ".footer-social"];

    const elements = document.querySelectorAll(selectors.join(","));
    
    if (!elements.length)
    {
       return;
    }

    if (prefersReducedMotion() || !("IntersectionObserver" in window))
    {
        elements.forEach(element => element.classList.add("goats-visible"));
        return;
    }

    elements.forEach((element, index) =>
    {
        element.classList.add("goats-reveal");
        element.style.setProperty("--goats-delay", `${(index % 4) * 80}ms`);
    });

    const observer = new IntersectionObserver(entries =>
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
            threshold: GOAT.revealThreshold,
            rootMargin: GOAT.revealRootMargin
        });

    elements.forEach(element => observer.observe(element));
}

function initBackToTop()
{
    const button = document.querySelector(".footer-top-btn");
    
    if (!button)
    {
       return;
    }

    const update = () =>
    {
        const show = window.scrollY > GOAT.backToTopThreshold;
        button.classList.toggle("goats-top-visible", show);
        button.classList.toggle("goats-top-hidden", !show);
    };

    update();
   
    window.addEventListener("scroll", update,
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

function initLegalNavigation()
{
    document.querySelectorAll(".legal-index a").forEach(link =>
    {
        link.addEventListener("click", () =>
        {
            let clause;
           
            try
            {
                clause = document.querySelector(link.getAttribute("href"));
            }
            
            catch (_)
            {
                return;
            }

            if (!clause)
            {
               return;
            }

            window.setTimeout(() =>
            {
                clause.classList.add("legal-highlight");
                window.setTimeout(() => clause.classList.remove("legal-highlight"), GOAT.highlightDuration);
            }, prefersReducedMotion() ? 0 : 450);
        });
    });
}

function initDynamicYear()
{
    const year = new Date().getFullYear();
   
    document.querySelectorAll("[data-current-year]").forEach(element =>
    {
        element.textContent = year;
    });
}

function secureExternalLinks()
{
    document.querySelectorAll('a[target="_blank"]').forEach(link =>
    {
        const values = new Set((link.getAttribute("rel") || "").split(/\s+/).filter(Boolean));
        values.add("noopener");
        link.setAttribute("rel", [...values].join(" "));
    });
}

/* SELETTORE LINGUA IT + EN*/
function goatCurrentLanguage()
{
    return goatReadStorage(GOAT.languageStorageKey) === "en" ? "en" : "it";
}

function goatSetLanguage(language)
{
    const chosen = language === "en" ? "en" : "it";
    document.documentElement.lang = chosen;
    document.documentElement.dataset.goatLanguage = chosen;
    const picker = document.querySelector(".goat-language-picker");
    
    if (picker)
    {
        const select = picker.querySelector(".goat-language-select");
        const flag = picker.querySelector(".goat-language-flag");
       
        if (select)
        {
            select.value = chosen;
            select.setAttribute("aria-label", chosen === "en" ? "Website language" : "Lingua del sito");
        }

        if (flag)
        {
           flag.textContent = chosen === "en" ? "🇺🇸" : "🇮🇹";
        }
    }

    const standaloneSelect = document.querySelector(".stripe-return-language-select");
   
    if (standaloneSelect)
    {
        standaloneSelect.value = chosen;
        standaloneSelect.setAttribute("aria-label", chosen === "en" ? "Website language" : "Lingua del sito");
    }

    goatUpdateMusicAria();
   
    document.dispatchEvent(new CustomEvent("goat:languagechange",
    {
       detail:
       {
          language: chosen
       }
    }));
}

function initLanguageSelector()
{
    const returnPage = document.querySelector(".stripe-return-page");
   
    if (returnPage)
    {
        if (!returnPage.querySelector(".stripe-return-language-select"))
        {
            const wrapper = document.createElement("div");
            wrapper.className = "stripe-return-language";
            const select = document.createElement("select");
            select.className = "stripe-return-language-select";
            select.id = "stripe-return-language-select";
            select.setAttribute("aria-label", "Lingua del sito");
            select.add(new Option("🇮🇹 Italiano", "it"));
            select.add(new Option("🇺🇸 English", "en"));
           
            select.addEventListener("change", () =>
            {
                const language = select.value === "en" ? "en" : "it";
                goatWriteStorage(GOAT.languageStorageKey, language);
                goatSetLanguage(language);
            });

            wrapper.appendChild(select);
            returnPage.insertBefore(wrapper, returnPage.firstChild);
        }

        goatSetLanguage(goatCurrentLanguage());
        return;
    }

    const navbar = document.querySelector(".navbar");

    if (navbar && !navbar.querySelector(".goat-language-picker"))
    {
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
       
        select.addEventListener("change", () =>
        {
            const language = select.value === "en" ? "en" : "it";
            goatWriteStorage(GOAT.languageStorageKey, language);
            goatSetLanguage(language);
        });

        wrapper.append(flag, select);
        navbar.appendChild(wrapper);
    }

    goatSetLanguage(goatCurrentLanguage());
}

/* GOAT FM — CONTROLLO NELLA NAVBAR  */
function goatMountMusicControl(container)
{
    const navbar = document.querySelector(".navbar");
   
    if (!navbar)
    {
        document.body.appendChild(container);
        return;
    }

    let slot = navbar.querySelector(".goat-navbar-audio-slot");
   
    if (!slot)
    {
        slot = document.createElement("div");
        slot.className = "goat-navbar-audio-slot";
        slot.setAttribute("role", "group");
        slot.setAttribute("aria-label", "GOAT FM");
    }

    const navLinks = navbar.querySelector(".gh-nav-right");
    const languagePicker = navbar.querySelector(".goat-language-picker");

    if (navLinks && navLinks.parentElement === navbar)
    {
        navbar.insertBefore(slot, navLinks);
    }
       
    else if (languagePicker && languagePicker.parentElement === navbar)
    {
        navbar.insertBefore(slot, languagePicker);
    }
       
    else
    {
        navbar.appendChild(slot);
    }

    slot.appendChild(container);
    navbar.classList.add("goat-fm-inline");
}

function goatUpdateRange(slider, ratio)
{
    slider.style.setProperty("--goat-volume", `${goatClamp(ratio, 0, 1) * 100}%`);
}

function goatUpdateMusicAria()
{
    const container = document.querySelector(".goat-music-control");
   
    if (!container)
    {
       return;
    }

    const english = document.documentElement.lang === "en";
    const mute = container.querySelector(".goat-music-mute");
    const play = container.querySelector(".goat-music-play");
    const volume = container.querySelector(".goat-music-volume:not(.goat-music-seek)");
    const seek = container.querySelector(".goat-music-seek");

    if (mute)
    {
        const muted = container.classList.contains("goat-music-muted");
        mute.setAttribute("aria-label", english ? (muted ? "Unmute music" : "Mute music") : (muted ? "Attiva musica" : "Disattiva musica"));
    }

    if (play)
    {
        const playing = container.classList.contains("goat-music-playing");
        play.setAttribute("aria-label", english ? (playing ? "Pause music" : "Play music") : (playing ? "Metti in pausa la musica" : "Riproduci musica"));
    }

    if (volume)
    {
       volume.setAttribute("aria-label", english ? "Music volume" : "Volume musica");
    }
   
    if (seek)
    {
       seek.setAttribute("aria-label", english ? "Track position" : "Posizione della canzone");
    }
}

function initGoatMusic()
{
    if (document.getElementById("introScreen") || document.getElementById("carouselMusic"))
    {
       return;
    }

    const source = document.body?.dataset.musicSrc;
   
    if (!source)
    {
       return;
    }

    const parsedPageVolume = Number(document.body.dataset.musicVolume);
    const pageVolume = document.body.dataset.musicVolume && Number.isFinite(parsedPageVolume) ? goatClamp(parsedPageVolume, 0, 1) : GOAT.defaultMusicVolume;
    const savedVolume = goatReadStorage(GOAT.musicStorageKeys.volume);
    const parsedSavedVolume = savedVolume === null ? NaN : Number(savedVolume);
    const volume = Number.isFinite(parsedSavedVolume) ? goatClamp(parsedSavedVolume, 0, 1) : pageVolume;
    let userPaused = goatReadStorage(GOAT.musicStorageKeys.paused) === "true";
    const music = new Audio();
    music.src = source;
    music.loop = true;
    music.preload = "auto";
    music.volume = volume;
    music.muted = goatReadStorage(GOAT.musicStorageKeys.muted) === "true";
    const container = document.createElement("div");
    container.className = "goat-music-control";
    container.setAttribute("aria-label", "Controlli musica GoatS RevengE");
    const playButton = document.createElement("button");
    playButton.type = "button";
    playButton.className = "goat-music-play goat-fm-play-button";
    const playIcon = document.createElement("i");
    playIcon.className = "fa-solid fa-play";
    playButton.appendChild(playIcon);
    const muteButton = document.createElement("button");
    muteButton.type = "button";
    muteButton.className = "goat-music-mute goat-fm-mute-button";
    const muteIcon = document.createElement("i");
    muteButton.appendChild(muteIcon);
    const label = document.createElement("span");
    label.className = "goat-music-label";
    label.textContent = (document.body.dataset.musicTitle || "").trim() || "GOAT FM";
    label.title = label.textContent;
    const seekSlider = document.createElement("input");
    seekSlider.type = "range";
    seekSlider.className = "goat-music-seek goat-music-volume";
    seekSlider.min = "0";
    seekSlider.max = "1";
    seekSlider.step = "0.01";
    seekSlider.value = "0";
    seekSlider.disabled = true;
    const volumeSlider = document.createElement("input");
    volumeSlider.type = "range";
    volumeSlider.className = "goat-music-volume";
    volumeSlider.min = "0";
    volumeSlider.max = "1";
    volumeSlider.step = "0.01";
    volumeSlider.value = String(volume);
    container.append(playButton, muteButton, label, seekSlider, volumeSlider);
    goatMountMusicControl(container);
    goatUpdateRange(volumeSlider, volume);
    goatUpdateRange(seekSlider, 0);

    /* STATO E ICONE */
    const updateMute = () =>
    {
        muteIcon.className = music.muted ? "fa-solid fa-volume-xmark" : "fa-solid fa-volume-high";
        container.classList.toggle("goat-music-muted", music.muted);
        goatUpdateMusicAria();
    };

    const updatePlayback = () =>
    {
        const playing = !music.paused;
        playIcon.className = playing ? "fa-solid fa-pause" : "fa-solid fa-play";
        playButton.setAttribute("aria-pressed", String(playing));
        container.classList.toggle("goat-music-playing", playing);
        container.classList.toggle("goat-music-paused", !playing);
       
        if (playing) 
        {
           container.classList.remove("goat-music-waiting");
        }
       
        goatUpdateMusicAria();
    };

    /* METADATI, SPOSTAMENTO, AVANZAMNETO */
    const updateSeek = () =>
    {
        const duration = music.duration;
       
        if (!Number.isFinite(duration) || duration <= 0)
        {
            seekSlider.disabled = true;
            seekSlider.max = "1";
            seekSlider.value = "0";
            goatUpdateRange(seekSlider, 0);
            return;
        }

        seekSlider.disabled = false;
        seekSlider.max = String(duration);
        seekSlider.value = String(goatClamp(music.currentTime, 0, duration));
        goatUpdateRange(seekSlider, goatClamp(music.currentTime / duration, 0, 1));
    };

    seekSlider.addEventListener("input", () =>
    {
        if (!Number.isFinite(music.duration) || music.duration <= 0) 
        {
           return;
        }
       
        music.currentTime = goatClamp(Number(seekSlider.value), 0, music.duration);
        updateSeek();
    });

    let seekFrame = null;
   
    const stopSeekAnimation = () =>
    {
        if (seekFrame !== null)
        {
           cancelAnimationFrame(seekFrame);
        }
       
        seekFrame = null;
        updateSeek();
    };

    const animateSeek = () =>
    {
        updateSeek();
       
        if (!music.paused) 
        {
           seekFrame = requestAnimationFrame(animateSeek);
        }
           
        else 
        {
           seekFrame = null;
        }
    };

    const startSeekAnimation = () =>
    {
        if (seekFrame !== null)
        {
           cancelAnimationFrame(seekFrame);
        }
       
        seekFrame = requestAnimationFrame(animateSeek);
    };

    music.addEventListener("loadedmetadata", updateSeek);
    music.addEventListener("durationchange", updateSeek);
    music.addEventListener("timeupdate", updateSeek);
   
    music.addEventListener("play", () =>
    {
        removeFallback();
        updatePlayback();
        startSeekAnimation();
    });

    music.addEventListener("pause", () =>
    {
        updatePlayback();
        stopSeekAnimation();
    });

    music.addEventListener("ended", () =>
    {
        updatePlayback();
        stopSeekAnimation();
    });

    music.addEventListener("error", () =>
    {
        container.classList.add("goat-music-error");
        console.error("GOAT FM: errore durante il caricamento della musica", music.error);
    });

    /* AUTOPLAY CON FALLBACK (alla 1° interazione) */
    let fallbackArmed = false;
   
    function removeFallback()
    {
        if (!fallbackArmed)
        {
           return;
        }
       
        fallbackArmed = false;
        document.removeEventListener("pointerdown", onFirstInteraction, true);
        document.removeEventListener("keydown", onFirstInteraction, true);
        document.removeEventListener("touchstart", onFirstInteraction, true);
    }

    function armFallback()
    {
        if (fallbackArmed || userPaused)
        {
           return;
        }
       
        fallbackArmed = true;
       
        document.addEventListener("pointerdown", onFirstInteraction,
        {
           capture: true
        });

        document.addEventListener("keydown", onFirstInteraction,
        {
            capture: true
        });

        document.addEventListener("touchstart", onFirstInteraction,
        {
           capture: true, passive: true
        });
    }

    function onFirstInteraction(event)
    {
        if (event.target?.closest?.(".goat-music-control")) 
        {
           return;
        }
       
        removeFallback();
       
        if (!userPaused)
        {
           attemptPlay();
        }
    }

    function attemptPlay()
    {
        if (!music.paused) 
        {
           return;
        }
       
        try
        {
            const result = music.play();
           
            if (result && typeof result.catch === "function")
            {
                result.catch(() =>
                {
                    container.classList.add("goat-music-waiting");
                    armFallback();
                });
            }
        }
           
        catch (_)
        {
            container.classList.add("goat-music-waiting");
            armFallback();
        }
    }

    playButton.addEventListener("click", event =>
    {
        event.stopPropagation();
        removeFallback();
       
        if (music.paused)
        {
            userPaused = false;
            goatWriteStorage(GOAT.musicStorageKeys.paused, false);
            attemptPlay();
        }
           
        else
        {
            music.pause();
            userPaused = true;
            goatWriteStorage(GOAT.musicStorageKeys.paused, true);
        }
    });

    muteButton.addEventListener("click", event =>
    {
        event.stopPropagation();
        music.muted = !music.muted;
        goatWriteStorage(GOAT.musicStorageKeys.muted, music.muted);
        updateMute();
    });

    volumeSlider.addEventListener("input", () =>
    {
        const next = goatClamp(Number(volumeSlider.value), 0, 1);
        music.volume = next;
        goatWriteStorage(GOAT.musicStorageKeys.volume, next);
        goatUpdateRange(volumeSlider, next);
       
        if (next > 0 && music.muted)
        {
            music.muted = false;
            goatWriteStorage(GOAT.musicStorageKeys.muted, false);
        }

        updateMute();
       
        if (music.paused && !userPaused) 
        {
           attemptPlay();
        }
    });

    updateMute();
    updatePlayback();
    updateSeek();
   
    if (!userPaused) 
    {
       attemptPlay();
    }
}

/* AVVIO UNICO */
function initGoatSite()
{
    initNavbar();
    initSmoothAnchors();
    initScrollReveal();
    initBackToTop();
    initLegalNavigation();
    initDynamicYear();
    secureExternalLinks();
    initLanguageSelector();
    initGoatMusic();
}

if (document.readyState === "loading")
{
    document.addEventListener("DOMContentLoaded", initGoatSite,
    {
       once: true
    });
}
   
else
{
    initGoatSite();
}




/* ------------------ DIZIONARIO — CHIAVI: data-i18n ------------------------ */
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




/* ------------------ DIZIONARIO - TRADUZIONI LETTERALI DELLE PAGINE ------------------------ */
const GOAT_PAGE_TEXT_EN =
{
    "TEAM.HTML":
    {
        "Collaborazioni, Creatività e Persone che contribuiscono alla crescita del Goat.": "Collaborations, creativity and people helping the GOAT grow.",
        "Collabora": "Collaborate",
        "Entra nel Team": "Join the team",
        "🫱🏼‍🫲🏼 Collabora con Franzzinho": "🫱🏼‍🫲🏼 Collaborate with Franzzinho",
        "Hai un'idea per creare qualcosa insieme? Video, TikTok, Stream, Gaming o altri progetti creativi?": "Have an idea for something we could create together? Videos, TikToks, streams, gaming or other creative projects?",
        "Spiega che progetto vuoi realizzare.": "Explain the project you want to create.",
        "Specifica i social coinvolti.": "Specify which social platforms are involved.",
        "Inserisci tutte le informazioni utili per valutare la proposta.": "Include all the information needed to evaluate your proposal.",
        "Proponi una Collaborazione": "Pitch a collaboration",
        "🧠 Entra nel Team": "🧠 Join the team",
        "Vuoi contribuire direttamente alla crescita del Brand di Franzzinho? Presentati e racconta cosa sai fare e perchè ti dovremmo scegliere!": "Want to help grow Franzzinho's brand? Introduce yourself, tell us what you can do and why we should choose you!",
        "Indica il ruolo o la mansione per cui vuoi candidarti.": "Specify the role or position you're applying for.",
        "Specifica esperienza, capacità e competenze rilevanti.": "Describe your relevant experience, skills and expertise.",
        "Inserisci portfolio, link, lavori precedenti e prove concrete.": "Include your portfolio, links, previous work and concrete examples.",
        "Indica la tua disponibilità.": "State your availability.",
        "Invia la tua Candidatura": "Submit your application",
        "🔧 Dove puoi portare valore?": "🔧 Where can you make an impact?",
        "Franzzinho può crescere grazie a persone con competenze diverse. Queste sono le principali aree in cui puoi essere di grande aiuto.": "Franzzinho can grow thanks to people with different skills. These are the main areas where you can make a difference.",
        "Strategia e crescita del brand.": "Brand strategy and growth.",
        "Transformare un'idea in un contenuto UNICO.": "Turn an idea into something UNIQUE.",
        "Organizzazione, community e gestione operativa dietro le quinte.": "Organization, community and behind-the-scenes operations.",
        "🐐 Il Nostro Team": "🐐 Our team",
        "Le persone che contribuiscono direttamente alla costruzione e alla crescita del Brand di Franzzinho.": "The people directly involved in building and growing Franzzinho's brand.",
        "Nome": "Name",
        "Mansione": "Role",
        "Descrizione": "Description",
        "🫱🏼‍🫲🏼 Le Nostre Collaborazioni": "🫱🏼‍🫲🏼 Our collaborations",
        "Creator, artisti e brand con cui Franzzinho ha collaborato.": "Creators, artists and brands Franzzinho has worked with.",
        "L'universo di Franzzinho tra: Video, Streaming, Social e Gaming.": "Franzzinho's universe of video, streaming, social media and gaming.",
        "Termini": "Terms",
        "Nome del membro": "Member's name",
        "Nome collaboratore": "Collaborator's name",
        "Torna in alto": "Back to top"
    },

    "PROJECT_1.HTML":
    {
        "Trasforma live e video in clip verticali in pochi passaggi ed ottieni risultati sorprendenti.": "Turn live streams and videos into vertical clips in just a few steps and get impressive results.",
        "Un software Windows progettato per Streamer e Content Creator che vogliono trasformare VOD Twitch e video registrati in contenuti verticali pronti per Youtube Shorts, Instagram Reels e TikTok.": "Windows software for streamers and content creators who want to turn Twitch VODs and recorded videos into vertical content ready for YouTube Shorts, Instagram Reels and TikTok.",
        "Prodotto digitale": "Digital product",
        "Nessun abbonamento": "No subscription",
        "Scopri come funziona": "See how it works",
        "Acquista": "Buy now",
        "Visualizza Immagine Prodotto": "View product image",
        "Guarda un video creato tramite il software": "Watch a video made with the software",
        "Guarda GOAT Clip - Bot in azione prima dell'acquisto.": "See GOAT Clip - Bot in action before you buy.",
        "Video Locali": "Local videos",
        "Verticale 9:16": "Vertical 9:16",
        "Sottotitoli Automatici": "Automatic subtitles",
        "Pubblicazione Manuale": "Manual publishing",
        "Cosa fa GOAT Clip - Bot?": "What does GOAT Clip - Bot do?",
        "Analisi Automatica": "Automatic analysis",
        "Analizza il contenuto e individua automaticamente momenti potenzialmente interessanti da trasformare in clip.": "Analyzes content and automatically identifies potentially interesting moments to turn into clips.",
        "VOD, Intervalli e Video Locali": "VODs, selected segments and local videos",
        "Lavora su una VOD completa, soltanto su un intervallo specifico oppure direttamente su un video locale.": "Process a full VOD, a specific segment or a local video directly.",
        "Output Verticale 9:16": "9:16 vertical output",
        "Genera clip pensate per: YouTube Shorts, Instagram Reels e TikTok nel formato verticale: 9:16.": "Creates clips for YouTube Shorts, Instagram Reels and TikTok in vertical 9:16 format.",
        "Sottotitoli Dinamici": "Dynamic subtitles",
        "Genera automaticamente i sottotitoli ed evidenzia progressivamente la parola pronunciata (con colore deciso dall'utente).": "Automatically generates subtitles and progressively highlights each spoken word (using a color chosen by the user).",
        "Webcam Configurabile": "Configurable webcam",
        "Gestisce il layout della webcam (posizionata a sinistra o a destra) e del gameplay.": "Manages the webcam layout (left or right) and gameplay.",
        "Modifica e Rigenera": "Edit and regenerate",
        "Correggi testo e sincronizzazione, lavora sulle clip candidate e rigenera una singola clip senza ripartire da zero.": "Correct text and timing, work with candidate clips and regenerate a single clip without starting over.",
        "Come funziona GOAT Clip - Bot?": "How does GOAT Clip - Bot work?",
        "Scegli la sorgente": "Choose a source",
        "VOD Twitch, intervallo della live oppure file video presente sul Pc.": "A Twitch VOD, a live-stream segment or a video file on your PC.",
        "Analizza": "Analyze",
        "GOAT Clip - Bot ricerca automaticamente i momenti migliori": "GOAT Clip - Bot automatically looks for the best moments.",
        "Genera": "Generate",
        "Crea clip verticali con webcam e sottotitoli progressivi.": "Create vertical clips with webcam and progressively highlighted subtitles.",
        "Controlla": "Review",
        "Verifica il risultato, modifica ciò che serve e pubblica manualmente.": "Check the result, make any changes you need and publish manually.",
        "Cosa ricevi con l'acquisto di GOAT Clip - Bot?": "What do you get when you buy GOAT Clip - Bot?",
        "Software GOAT Clip - Bot": "GOAT Clip - Bot software",
        "File per la: Creazione automatica di clip": "File for automatic clip creation",
        "File per la: Modalità VOD intere e personalizzate": "File for full and custom VOD modes",
        "Licenza per uso personale": "Personal-use license",
        "File per la: Generazione di sottotitoli": "File for subtitle generation",
        "File per la: Modalità video locali": "File for local-video mode",
        "Procedura d'installazione": "Installation instructions",
        "File per la: Modifica dei sottotitoli finali": "File for editing final subtitles",
        "File per la: Modifica di clip candidate": "File for editing candidate clips",
        "Guida rapida": "Quick-start guide",
        "File di: Configurazione webcam": "Webcam configuration file",
        "File di: Configurazione generale": "General configuration file",
        "Informazioni Tecniche": "Technical information",
        "Tutto ciò che conviene controllare e sapere prima dell'acquisto.": "Everything you should check and know before buying.",
        "Requisiti": "Requirements",
        "GOAT Clip - Bot è progettato principalmente per Windows 11 a 64 bit.": "GOAT Clip - Bot is primarily designed for 64-bit Windows 11.",
        "Sistema": "Operating system",
        "Software": "Software",
        "CPU": "CPU",
        "Intel o AMD moderno": "Modern Intel or AMD",
        "RAM consigliata": "Recommended RAM",
        "32 GB per elaborazioni lunghe": "32 GB for longer processing jobs",
        "RAM minima consigliata": "Minimum recommended RAM",
        "GPU": "GPU",
        "NVIDIA opzionale ma consigliata": "NVIDIA optional but recommended",
        "È necessario inoltre disporre di spazio libero sufficiente per VOD, file temporanei e clip generate.": "You also need enough free storage for VODs, temporary files and generated clips.",
        "IL DOWNLOAD DI VOD COMPLETI O DI DURATA PERSONALIZZATA RICHIEDE UNA CONNESSIONE INTERNET.": "DOWNLOADING COMPLETE OR CUSTOM-LENGTH VODS REQUIRES AN INTERNET CONNECTION.",
        "Compatibilità": "Compatibility",
        "Input": "Input",
        "• VOD Twitch completi": "• Complete Twitch VODs",
        "• Intervalli specifici di VOD": "• Specific VOD segments",
        "• Video locali (MP4 - MKV - MOV - AVI - WEBM - M4V)": "• Local videos (MP4 - MKV - MOV - AVI - WEBM - M4V)",
        "Output": "Output",
        "• Verticale 9:16": "• Vertical 9:16",
        "• Sottotitoli incorporati": "• Embedded subtitles",
        "Il sistema è progettato principalmente per contenuti di proporzioni: 1920px × 1080px e con layout della webcam stabile. Configurazioni molto differenti possono richiedere una personalizzazione delle coordinate dei vari layout.": "The system is primarily designed for 1920 × 1080 content with a stable webcam layout. Very different configurations may require customized layout coordinates.",
        "MacOS e Linux non sono attualmente indicati come sistemi operativi ufficialmente supportati. Non sono escluse però possibilità di funzionamento.": "macOS and Linux are not currently listed as officially supported operating systems, although they may still work.",
        "Aggiornamenti": "Updates",
        "Gli aggiornamenti correttivi della versione acquistata saranno forniti gratuitamente quando disponibili.": "Corrective updates for the purchased version will be supplied free of charge when available.",
        "Correzioni di bug, piccoli miglioramenti e interventi necessari al corretto funzionamento della versione acquistata possono essere inclusi.": "Bug fixes, minor improvements and changes needed for the purchased version to work properly may be included.",
        "Future versioni principali, grandi funzionalità, eventuali edizioni Pro o nuovi servizi potrebbero essere distribuiti separatamente.": "Future major versions, substantial new features, Pro editions or new services may be sold separately.",
        "Supporto": "Support",
        "Con l'acquisto è previsto supporto di base relativo all'installazione e al corretto funzionamento del software.": "Your purchase includes basic support for installation and correct operation of the software.",
        "Supporto Incluso Relativo a": "Support includes",
        "• Problemi di installazione": "• Installation issues",
        "• Errori del programma": "• Software errors",
        "• Funzioni principali": "• Main features",
        "• Segnalazione bug": "• Bug reports",
        "Supporto Non incluso Relativo a": "Support does not include",
        "• Overlay personalizzati": "• Custom overlays",
        "• Modifiche individuali al codice": "• Individual code changes",
        "• Installazione remota": "• Remote installation",
        "• Assistenza individuale illimitata": "• Unlimited individual assistance",
        "• Montaggio delle clip": "• Editing clips for you",
        "IMPORTANTE": "IMPORTANT",
        "Il controllo finale rimane al creator.": "The creator has the final say.",
        "GOAT Clip - Bot utilizza sistemi automatici per individuare momenti potenzialmente interessanti.": "GOAT Clip - Bot uses automated systems to identify potentially interesting moments.",
        "La selezione automatica non garantisce che ogni clip generata sia adatta alla pubblicazione.": "Automatic selection does not guarantee that every generated clip is suitable for publishing.",
        "È sempre consigliato controllare i contenuti prima di pubblicarli.": "Always review your content before publishing it.",
        "Porta GOAT Clip - Bot sul tuo Pc!": "Get GOAT Clip - Bot on your PC!",
        "Un singolo pagamento. Nessun abbonamento mensile.": "One payment. No monthly subscription.",
        "Licenza personale": "Personal license",
        "Download digitale": "Digital download",
        "Guida di installazione": "Installation guide",
        "Supporto di base": "Basic support",
        "pagamento una tantum": "One-time payment",
        "Acquista GOAT Clip - Bot": "Buy GOAT Clip - Bot",
        "Pagamento gestito da Stripe": "Payment processed by Stripe",
        "Prodotto esclusivamente digitale.": "Digital product only.",
        "Nessuna spedizione fisica.": "No physical delivery.",
        "Dopo la conferma del pagamento riceverai il link per scaricare GOAT Clip - Bot e la relativa guida di installazione.": "After your payment is confirmed, you will receive a link to download GOAT Clip - Bot and its installation guide.",
        "L'universo di Franzzinho tra: Video, Streaming, Social e Gaming.": "Franzzinho's universe of video, streaming, social media and gaming.",
        "Termini": "Terms",
        "GOAT ClipBot trasforma VOD Twitch e video locali in clip verticali per YouTube Shorts, Instagram Reels e TikTok.": "GOAT ClipBot turns Twitch VODs and local videos into vertical clips for YouTube Shorts, Instagram Reels and TikTok.",
        "Interfaccia di GOAT ClipBot": "GOAT ClipBot interface",
        "Esempio di clip verticale generata da GOAT ClipBot": "Example of a vertical clip generated by GOAT ClipBot",
        "Video dimostrativo di GOAT ClipBot": "GOAT ClipBot demo video",
        "Torna in alto": "Back to top"
    },

    "PROJECT_2.HTML":
    {
        "GOATS SOFTWARE / ANDROID app + WINDOWS program": "GOATS SOFTWARE / ANDROID app + WINDOWS program",
        "Gestisci le offerte dal telefono. Organizza le pubblicazioni con il backend Windows.": "Manage offers from your phone. Organize publishing through the Windows backend.",
        "Un sistema composto da un'app Android e un programma backend per Windows. Consente di creare e amministrare offerte, consultare bozze e pubblicazioni, configurare canali Telegram e impostare automazioni e orari.": "A system consisting of an Android app and a Windows backend program. Create and manage offers, review drafts and published posts, configure Telegram channels, and set up automations and schedules.",
        "App Android": "Android app",
        "Backend Windows": "Windows backend",
        "Canali Telegram": "Telegram channels",
        "Esplora le funzioni": "Explore features",
        "Guarda le anteprime": "View previews",
        "Due componenti, un unico flusso di gestione.": "Two components, one management workflow.",
        "Crea e modifica": "Create and edit",
        "Bozze e pubblicate": "Drafts and published",
        "Programmazione": "Scheduling",
        "Regole e categorie": "Rules and categories",
        "CONTROLLO E AUTOMAZIONE": "CONTROL AND AUTOMATION",
        "Le funzioni di Affiliate Manager": "Affiliate Manager features",
        "Dalla preparazione delle offerte alla gestione delle pubblicazioni.": "From preparing offers to managing publishing.",
        "Offerte pubblicate e bozze": "Published offers and drafts",
        "Visualizza le offerte già pubblicate e quelle ancora in stato di bozza.": "View offers that have already been published and those still saved as drafts.",
        "Gestione completa delle offerte": "Full offer management",
        "Crea nuove offerte, modifica i dati esistenti ed elimina quelle non più necessarie.": "Create new offers, edit existing details and delete offers you no longer need.",
        "Orari di pubblicazione": "Publishing schedules",
        "Gestisci la pianificazione delle pubblicazioni destinate ai canali Telegram configurati.": "Manage scheduled posts to your configured Telegram channels.",
        "Imposta categorie e criteri per la ricerca automatizzata delle offerte, secondo le integrazioni autorizzate disponibili.": "Set categories and criteria for automated offer searches, subject to the available authorized integrations.",
        "Canali e bot Telegram": "Telegram channels and bots",
        "Configura gli identificativi dei canali e le impostazioni di collegamento con il bot di pubblicazione.": "Configure channel IDs and the connection settings for your publishing bot.",
        "Connessione al backend": "Backend connection",
        "Gestisci indirizzo IP, porta e bind address del servizio Windows per collegare app e backend.": "Manage the Windows service's IP address, port and bind address to connect the app and backend.",
        "UN SISTEMA, DUE COMPONENTI": "ONE SYSTEM, TWO COMPONENTS",
        "Come funziona": "How it works",
        "L'app Android è l'interfaccia di gestione; il backend Windows esegue i processi configurati.": "The Android app provides the management interface; the Windows backend runs the configured processes.",
        "Avvia il backend": "Start the backend",
        "Configura ed esegui il servizio su un PC Windows.": "Configure and run the service on a Windows PC.",
        "Collega Android": "Connect Android",
        "Imposta la connessione di rete tra smartphone e backend.": "Set up the network connection between your smartphone and the backend.",
        "Definisci le regole": "Set your rules",
        "Gestisci offerte, categorie, canali e fasce di pubblicazione.": "Manage offers, categories, channels and publishing time slots.",
        "Monitora": "Monitor",
        "Consulta bozze e offerte pubblicate dall'app Android.": "Review drafts and published offers in the Android app.",
        "CONTENUTO DEL PACCHETTO": "PACKAGE CONTENTS",
        "Cosa ricevi": "What you get",
        "Applicazione Android": "Android application",
        "Programma backend Windows": "Windows backend program",
        "Gestione offerte e bozze": "Offer and draft management",
        "Programmazione pubblicazioni": "Publishing scheduler",
        "Configurazione regole e categorie": "Rules and category settings",
        "Impostazioni bot e canali": "Bot and channel settings",
        "Impostazioni di rete": "Network settings",
        "File di configurazione": "Configuration files",
        "Istruzioni d'installazione": "Installation instructions",
        "Guida rapida": "Quick-start guide",
        "Licenza personale": "Personal-use license",
        "Supporto di base": "Basic support",
        "PRIMA DI INSTALLARE": "BEFORE INSTALLING",
        "Requisiti e informazioni": "Requirements and information",
        "Un'app Android e un backend Windows hanno prerequisiti distinti.": "An Android app and a Windows backend have different requirements.",
        "Windows e Android": "Windows and Android",
        "PC backend": "Backend PC",
        "Windows 11 a 64 bit": "64-bit Windows 11",
        "Smartphone": "Smartphone",
        "Android; versione minima da confermare": "Android; minimum version to be confirmed",
        "Processore": "Processor",
        "Intel o AMD moderno, lato PC": "Modern Intel or AMD CPU on the PC",
        "RAM PC": "PC RAM",
        "16 GB consigliati; specifiche finali da verificare": "16 GB recommended; final specifications to be verified",
        "Rete": "Network",
        "Connettività tra app Android e backend Windows": "Connectivity between the Android app and Windows backend",
        "Servizi esterni": "External services",
        "Telegram e accessi autorizzati ai servizi Amazon pertinenti": "Telegram and authorized access to relevant Amazon services",
        "Configurazione e sicurezza": "Configuration and security",
        "Il backend deve essere raggiungibile dall'app Android tramite l'indirizzo e la porta configurati. Le impostazioni di bind address regolano le interfacce sulle quali il servizio resta in ascolto.": "The Android app must be able to reach the backend at the configured address and port. Bind-address settings determine which network interfaces the service listens on.",
        "Per pubblicare su un canale Telegram, il bot deve disporre delle autorizzazioni necessarie.": "To publish in a Telegram channel, the bot needs the necessary permissions.",
        "Il token segreto del bot non è il suo ID:": "The bot's secret token is not its ID:",
        "deve essere protetto e non pubblicato in NESSUNA piattaforma.": "it must be protected and NEVER published on any platform.",
        "Non esporre direttamente il backend su Internet senza autenticazione, protezione della connessione e misure adeguate di sicurezza.": "Do not expose the backend directly to the Internet without authentication, connection protection and appropriate security measures.",
        "Licenza, aggiornamenti e supporto": "License, updates and support",
        "Il pacchetto è destinato all'uso personale dell'acquirente, salvo diversa indicazione nella licenza.": "The package is intended for the purchaser's personal use, unless the license states otherwise.",
        "Sono previsti supporto di base per installazione e problemi di funzionamento e possibili aggiornamenti correttivi della versione acquistata. Non sono promessi aggiornamenti gratuiti a vita, configurazioni individuali o assistenza illimitata.": "Basic support for installation and operational problems is provided, and corrective updates for the purchased version may be released. Free lifetime updates, individual configuration services and unlimited assistance are not promised.",
        "INFORMAZIONE IMPORTANTE": "IMPORTANT INFORMATION",
        "Automazione e piattaforme di terze parti": "Automation and third-party platforms",
        "Affiliate Manager è un software indipendente e non è presentato come prodotto ufficiale di Amazon o Telegram. La disponibilità di dati, funzioni di ricerca e pubblicazione dipende dai permessi, dalle integrazioni consentite e dalle regole dei servizi utilizzati. L'utente deve verificare che canali e attività di affiliazione siano autorizzati e comunicare chiaramente la natura promozionale dei link.": "Affiliate Manager is independent software, not an official Amazon or Telegram product. Data availability, search and publishing features depend on permissions, authorized integrations and third-party service rules. Users must verify that their channels and affiliate activities are permitted and clearly disclose the promotional nature of affiliate links.",
        "Un punto di controllo per offerte e pubblicazioni.": "A control center for offers and publishing.",
        "Pacchetto digitale con app Android, backend Windows e istruzioni.": "Digital package with an Android app, Windows backend and instructions.",
        "Guida inclusa": "Guide included",
        "DISPONIBILITÀ": "AVAILABILITY",
        "Prezzo da definire": "Price to be determined",
        "Richiedi informazioni": "Request information",
        "Non viene effettuato alcun pagamento da questa pagina.": "No payments are collected on this page.",
        "L'universo di Franzzinho tra: Video, Streaming, Social e Gaming.": "Franzzinho's universe of video, streaming, social media and gaming.",
        "Termini": "Terms",
        "Affiliate Manager: app Android e backend Windows per gestire offerte, bozze, programmazioni e pubblicazioni su canali Telegram.": "Affiliate Manager: Android app and Windows backend for managing offers, drafts, schedules and publishing to Telegram channels.",
        "Anteprime di Affiliate Manager": "Affiliate Manager previews",
        "Schermata reale dell'app Affiliate Manager su Android": "Actual screenshot of the Affiliate Manager Android app",
        "Schermata reale del backend Windows Affiliate Manager": "Actual screenshot of the Affiliate Manager Windows backend",
        "Caratteristiche principali": "Main features",
        "Torna in alto": "Back to top"
    },

    "CONDIZIONI_VENDITA.HTML":
    {
        "html": "Terms of Sale",
        "Condizioni Vendita": "Terms of Sale",
        "Condizioni di Vendita": "Terms of Sale",
        "Informazioni e regole per l’acquisto online dei prodotti digitali disponibili su GoatS RevengE.": "Information and rules for online purchases of digital products offered on GoatS RevengE.",
        "Ultimo aggiornamento: 8 Novembre 2026": "Last updated: November 8, 2026",
        "Indice": "Contents",
        "01. Identità del venditore": "01. Seller's identity",
        "02. Prodotti, caratteristiche e limiti": "02. Products, features and limitations",
        "03. Prezzi, imposte e ordine": "03. Prices, taxes and orders",
        "04. Pagamento e conferma": "04. Payment and confirmation",
        "05. Consegna digitale": "05. Digital delivery",
        "06. Licenza e utilizzo del software": "06. Software license and use",
        "07. Diritto di recesso e contenuto digitale": "07. Right of withdrawal and digital content",
        "08. Conformità, aggiornamenti e rimedi": "08. Conformity, updates and remedies",
        "09. Assistenza e limitazioni": "09. Support and limitations",
        "10. Legge applicabile e controversie": "10. Applicable law and disputes",
        "I prodotti digitali presentati sul sito GoatS RevengE saranno offerti da:": "Digital products presented on the GoatS RevengE website will be offered by:",
        "[DA COMPLETARE: nome completo / ragione sociale del venditore]": "[TO BE COMPLETED: full name / legal business name of the seller]",
        ", con sede in": ", with registered address at",
        "[DA COMPLETARE: indirizzo legale e dati obbligatori]": "[TO BE COMPLETED: legal address and mandatory information]",
        ", identificativi fiscali": ", tax identifiers",
        "[DA COMPLETARE: P.IVA o altri dati fiscali applicabili]": "[TO BE COMPLETED: VAT number or other applicable tax details]",
        ", contatto commerciale": ", sales contact",
        "[DA COMPLETARE: email assistenza vendite]": "[TO BE COMPLETED: sales support email]",
        "Le pagine prodotto descrivono le funzionalità, la compatibilità, i requisiti minimi o consigliati, la licenza, i contenuti inclusi, la versione e le eventuali limitazioni tecniche. Tali informazioni devono essere verificate rispetto ai programmi consegnati.": "Product pages describe features, compatibility, minimum or recommended requirements, the license, included materials, version and any technical limitations. This information must be checked against the software actually delivered.",
        "GOAT ClipBot :": "GOAT ClipBot:",
        "software Windows per generare e modificare clip verticali e sottotitoli, con controllo finale e pubblicazione manuale.": "Windows software for generating and editing vertical clips and subtitles, with final review and manual publishing.",
        "Affiliate Manager :": "Affiliate Manager:",
        "app Android e backend Windows per gestione di offerte, bozze e programmazioni Telegram. L’uso di dati, link e strumenti di affiliazione è soggetto alle regole dei servizi terzi e alle autorizzazioni necessarie. Non viene garantita una compatibilità illimitata con Amazon o Telegram.": "Android app and Windows backend for managing offers, drafts and Telegram publishing schedules. The use of affiliate data, links and tools is subject to third-party service rules and required authorizations. Unlimited compatibility with Amazon or Telegram is not guaranteed.",
        "Ogni scheda prodotto indica il prezzo finale applicabile prima dell’ordine, le imposte e le eventuali commissioni dovute quando previste.": "Each product page states the applicable total price before the order, including taxes and any applicable fees.",
        "[DA COMPLETARE: regime IVA applicabile, indicazione al consumatore di prezzo completo e impostazioni Stripe corrispondenti]": "[TO BE COMPLETED: applicable VAT treatment, display of the full consumer price and corresponding Stripe settings]",
        "I metodi concretamente disponibili saranno mostrati al momento dell’acquisto.": "The payment methods actually available will be shown at checkout.",
        "L’ordine sarà considerato ricevuto e gestito secondo il processo di conferma comunicato nel checkout. Il cliente riceverà la conferma contrattuale via email, con le informazioni richieste dalla legge.": "The order will be received and processed according to the confirmation process described at checkout. The customer will receive contractual confirmation by email, with the information required by law.",
        "I prodotti sono distribuiti esclusivamente in formato digitale, senza spedizioni fisiche. Dopo la verifica del pagamento, il compratore riceverà il metodo di accesso al download e le istruzioni previste dalla scheda prodotto.": "Products are supplied exclusively in digital form, without physical shipping. Once payment is verified, the purchaser will receive download access instructions as described on the product page.",
        "[DA COMPLETARE: canale esatto di invio: email, area protetta, fornitore delivery; tempi concreti; durata disponibilità link; gestione smarrimento accesso]": "[TO BE COMPLETED: exact delivery channel (email, protected area or delivery provider); actual times; link availability period; lost-access procedure]",
        "Salvo diversa indicazione nella relativa scheda e nel contratto di licenza consegnato, il prodotto viene fornito con una licenza d’uso personale, non come trasferimento della titolarità di tutti i diritti sul software.": "Unless otherwise stated on the product page and in the license agreement supplied, the product is provided under a personal-use license rather than a transfer of all software ownership rights.",
        "Il cliente deve rispettare le condizioni specifiche allegate al prodotto e i diritti di terzi; restano salvi i diritti inderogabili riconosciuti dalla legge.": "The customer must comply with the specific conditions supplied with the product and with third-party rights; mandatory statutory rights remain unaffected.",
        "Il consumatore che acquista, dispone (in via generale) di": "In general, consumers making a purchase have",
        "14 giorni dalla conclusione del contratto": "14 days from the conclusion of the contract",
        "per esercitare il recesso, salvo eccezioni previste dalla legge.": "to exercise their right of withdrawal, subject to exceptions provided by law.",
        "Per richieste di recesso: {(recapito per recesso e procedura / modulo tipo, da definire e allegare)}.": "For withdrawal requests: {(withdrawal contact and procedure / standard form to be defined and attached)}.",
        "I programmi devono corrispondere alle caratteristiche dichiarate. Restano applicabili le garanzie legali e i rimedi obbligatori per i contenuti digitali, compresi quelli relativi a difetti di conformità, ove applicabili.": "The programs must match their advertised features. Statutory guarantees and mandatory remedies for digital content, including those related to lack of conformity, remain applicable where relevant.",
        "Correzioni e aggiornamenti necessari per mantenere la conformità, inclusi quelli di sicurezza richiesti dalla legge, non possono essere esclusi da una formula come «aggiornamenti solo quando disponibili».": "Fixes and updates required to maintain conformity, including security updates required by law, cannot be excluded by a statement such as \"updates only when available\".",
        "Funzionalità del tutto nuove, nuove edizioni commerciali e versioni principali possono invece essere offerte separatamente, nel rispetto degli obblighi già assunti e della normativa applicabile.": "Entirely new features, new commercial editions and major versions may be offered separately, without prejudice to existing obligations and applicable law.",
        "Il supporto di base può comprendere chiarimenti su installazione, utilizzo delle funzionalità documentate e segnalazioni di problemi. Salvo diverso accordo, non sono inclusi progetti su misura, configurazioni personalizzate di overlay o bot, accesso remoto e consulenza continuativa.": "Basic support may include installation guidance, use of documented features and problem reports. Unless otherwise agreed, custom projects, personalized overlay or bot setups, remote access and ongoing consulting are not included.",
        "Si applica la legge italiana, fatte salve le disposizioni inderogabili eventualmente spettanti al consumatore, anche nel contesto di vendite internazionali. La competenza per le controversie è determinata dalle norme applicabili e non viene imposta una deroga al foro del consumatore.": "Italian law applies, without prejudice to mandatory consumer protections that may apply, including in international sales. Jurisdiction is determined by applicable law and does not override the consumer's competent court.",
        "Per assistenza e reclami:": "For support and complaints:",
        "[DA COMPLETARE: email commerciale e procedura di risposta]": "[TO BE COMPLETED: sales email and response procedure]",
        "Altri documenti del sito": "Other website documents",
        "Termini del sito": "Website terms",
        "Torna alla Home": "Back to Home",
        "Informazioni e regole per l’acquisto online dei prodotti digitali GoatS RevengE.": "Information and rules for online purchases of GoatS RevengE digital products.",
        "Navigazione principale": "Main navigation",
        "Indice del documento": "Document contents",
        "Vai alla sezione": "Go to section",
        "Documenti correlati": "Related documents"
    },

    "PRIVACY.HTML":
    {
        "Informazioni sul trattamento dei dati personali quando utilizzi il sito, invii richieste o acquisti prodotti digitali.": "Information on how personal data is processed when you use the site, send requests or purchase digital products.",
        "Ultimo aggiornamento: 11 Novembre 2026": "Last updated: November 11, 2026",
        "Indice": "Contents",
        "01. Titolare del trattamento": "01. Data controller",
        "02. Quali dati possono essere trattati": "02. What data may be processed",
        "03. Finalità e basi giuridiche": "03. Purposes and legal bases",
        "04. Fornitori e destinatari": "04. Service providers and recipients",
        "05. Trasferimenti fuori dallo SEE": "05. Transfers outside the EEA",
        "06. Tempi di conservazione": "06. Retention periods",
        "07. Diritti dell’interessato": "07. Data subject rights",
        "08. Conferimento dei dati e servizi facoltativi": "08. Providing data and optional services",
        "09. Sicurezza, minori e aggiornamenti": "09. Security, minors and updates",
        "Il sito GoatS RevengE è gestito da": "The GoatS RevengE website is managed by",
        "[DA COMPLETARE: nome e cognome o ragione sociale del titolare]": "[TO BE COMPLETED: data controller's full name or legal business name]",
        ". Contatto privacy:": ". Privacy contact:",
        "[DA COMPLETARE: indirizzo email dedicato]": "[TO BE COMPLETED: dedicated email address]",
        ". Sede o recapito:": ". Registered office or contact address:",
        "[DA COMPLETARE: indirizzo / sede legale, secondo i dati obbligatori per l’attività]": "[TO BE COMPLETED: address / registered office, according to the business's mandatory disclosure requirements]",
        "Le categorie di dati dipendono dalle operazioni effettivamente attive sul sito:": "The categories of personal data depend on the activities actually enabled on the website:",
        "Contatti e candidature:": "Contacts and applications:",
        "indirizzo email, nome o nickname e informazioni volontariamente inviate, inclusi portfolio e allegati.": "email address, name or nickname, and information voluntarily provided, including portfolios and attachments.",
        "Acquisti digitali:": "Digital purchases:",
        "identificativi dell’ordine, contatti di consegna e informazioni amministrative necessarie alla transazione. I dati della carta vengono gestiti dal fornitore di pagamento secondo il relativo flusso.": "order identifiers, delivery contact details and administrative information needed for transactions. Card data is handled by the payment provider according to its process.",
        "Navigazione:": "Browsing:",
        "dati tecnici e log generati dai sistemi di hosting e sicurezza, secondo le configurazioni effettive da verificare.": "technical data and logs generated by hosting and security systems, subject to verification of their actual configuration.",
        "Preferenze sul dispositivo:": "On-device preferences:",
        "preferenza del volume e del muto nella memoria locale del browser, tramite": "music volume and mute preferences stored locally in the browser through",
        "Servizi integrati:": "Integrated services:",
        "la visita di pagine con moduli Google, fogli incorporati o altri contenuti di terzi può comportare richieste ai rispettivi provider.": "visiting pages with embedded Google Forms, spreadsheets or other third-party content may involve requests to the respective providers.",
        "Finalità": "Purpose",
        "Base giuridica da applicare secondo il caso": "Legal basis to apply depending on the situation",
        "Rispondere alle richieste e valutare proposte di collaborazione": "Responding to inquiries and reviewing collaboration proposals",
        "Misure precontrattuali richieste dall’interessato, quando pertinenti, oppure legittimo interesse alla gestione dei contatti, previa verifica.": "Pre-contractual measures requested by the individual, when relevant, or legitimate interests in handling contacts, subject to assessment.",
        "Gestire acquisti, consegna digitale e assistenza": "Managing purchases, digital delivery and support",
        "Esecuzione del contratto e obblighi di legge per gli adempimenti amministrativi.": "Performance of a contract and legal obligations for administrative compliance.",
        "Sicurezza e funzionamento tecnico del sito": "Website security and technical operation",
        "Legittimo interesse, ove appropriato e bilanciato, o altra base prevista dalla legge.": "Legitimate interests, where appropriate and balanced, or another lawful basis.",
        "Statistiche facoltative, marketing o profilazione, solo se installati": "Optional analytics, marketing or profiling, if installed",
        "Consenso, ove richiesto; tali strumenti non sono dichiarati attivi in questa bozza.": "Consent, where required; such tools are not declared active in this draft.",
        "Possono intervenire, nei limiti della loro effettiva integrazione, il provider di hosting": "Depending on actual integration, service providers may include the hosting provider",
        "[DA COMPLETARE: nome provider]": "[TO BE COMPLETED: provider name]",
        "[DA COMPLETARE: verificare se hosting, Google, Stripe e gli altri fornitori comportano trasferimenti extra-SEE e indicare paesi, basi e garanzie applicabili]": "[TO BE COMPLETED: check whether hosting, Google, Stripe and other suppliers involve transfers outside the EEA; state countries, legal bases and applicable safeguards]",
        "I dati vengono conservati per il periodo strettamente necessario alle finalità dichiarate, nel rispetto degli obblighi di legge. Occorre definire prima della pubblicazione i criteri effettivi:": "Data is retained only as long as necessary for the stated purposes, in compliance with legal obligations. The actual criteria must be established before publication:",
        "Richieste, messaggi e candidature:": "Inquiries, messages and applications:",
        "[DA COMPLETARE: periodo oppure criterio e ciclo di cancellazione]": "[TO BE COMPLETED: period or retention criterion and deletion schedule]",
        "Ordini e documentazione fiscale:": "Orders and tax documentation:",
        "[DA COMPLETARE: termini effettivi in base agli obblighi applicabili]": "[TO BE COMPLETED: actual retention periods under applicable obligations]",
        "Log tecnici:": "Technical logs:",
        "[DA COMPLETARE: periodo scelto dal provider e finalità]": "[TO BE COMPLETED: period chosen by the provider and purposes]",
        "Preferenze musicali nel browser: restano fino alla rimozione dell’archiviazione locale o a eventuali modifiche dello script.": "Browser music preferences: stored until local storage is cleared or the script is changed.",
        "Nei casi previsti dal GDPR, puoi chiedere accesso ai tuoi dati, rettifica, cancellazione, limitazione, portabilità e opposizione; puoi revocare un consenso senza pregiudicare la liceità del trattamento precedente alla revoca.": "Where provided for by the GDPR, you may request access, rectification, erasure, restriction, portability and objection; you may withdraw consent without affecting the lawfulness of processing carried out before withdrawal.",
        "Per esercitare tali diritti:": "To exercise these rights:",
        "[DA COMPLETARE: email privacy]": "[TO BE COMPLETED: privacy email]",
        ". Puoi inoltre proporre reclamo al": ". You may also lodge a complaint with the",
        "Garante per la protezione dei dati personali": "Italian Data Protection Authority (Garante per la protezione dei dati personali)",
        "I dati indispensabili per una richiesta, un ordine o la relativa consegna sono necessari per fornire il servizio richiesto. Le informazioni aggiuntive fornite spontaneamente restano facoltative, salvo siano indispensabili per gestire la specifica richiesta.": "Data required for an inquiry, order or delivery is necessary to provide the requested service. Additional information supplied voluntarily is optional unless needed to handle the specific request.",
        "L’eventuale consenso per finalità non necessarie deve essere libero e separato; la navigazione sul sito non equivale, da sola, a consenso.": "Any consent for non-essential purposes must be freely given and separate; simply browsing the website does not, in itself, amount to consent.",
        "Saranno adottate misure ragionevoli di protezione in relazione al rischio, ai sistemi e ai fornitori effettivamente utilizzati. Le informazioni possono essere aggiornate quando cambiano servizi o modalità di trattamento.": "Reasonable security measures will be adopted according to the risks, systems and providers actually used. This information may be updated if services or processing methods change.",
        "Altri documenti del sito": "Other website documents",
        "Condizioni vendita": "Terms of Sale",
        "Termini del sito": "Website terms",
        "Torna alla Home": "Back to Home",
        "Navigazione principale": "Main navigation",
        "Indice del documento": "Document contents",
        "Vai alla sezione": "Go to section",
        "Documenti correlati": "Related documents"
    },

    "TERMINI.HTML":
    {
        "Termini": "Terms",
        "📜 Termini & Condizioni 📜": "📜 Terms & Conditions 📜",
        "Regole, diritti e condizioni per l'utilizzo del sito web GoatS RevengE.": "Rules, rights and conditions for using the GoatS RevengE website.",
        "Ultimo aggiornamento: 3 Settembre 2026": "Last updated: September 3, 2026",
        "Versione: italiana": "Version: Italian original (English translation)",
        "PRIMA DI INIZIARE": "BEFORE YOU BEGIN",
        "Benvenuto nel Legal Center": "Welcome to the Legal Center",
        "• I presenti Termini e Condizioni disciplinano l'accesso e l'utilizzo del sito web GoatS RevengE.": "• These Terms and Conditions govern access to and use of the GoatS RevengE website.",
        "• Utilizzando il sito, l'utente è tenuto a rispettare le condizioni qui descritte e la normativa applicabile.": "• By using the website, visitors must comply with the conditions described here and applicable laws.",
        "Indice": "Contents",
        "Seleziona una sezione per raggiungerla direttamente.": "Select a section to jump directly to it.",
        "Finalità del sito web": "Purpose of the website",
        "Utilizzo del sito web": "Use of the website",
        "Responsabilità": "Liability",
        "Proprietà intellettuale": "Intellectual property",
        "Modifiche": "Changes",
        "Legge applicabile": "Applicable law",
        "01 • FINALITÀ": "01 • PURPOSE",
        "🎯 Finalità del Sito Web": "🎯 Purpose of the Website",
        "• GoatS RevengE è un sito web dedicato alla presentazione, promozione e diffusione delle attività creative, artistiche e professionali di Franzzinho.": "• GoatS RevengE is a website dedicated to presenting, promoting and sharing Franzzinho's creative, artistic and professional activities.",
        "• Il sito web può includere contenuti relativi a: video, streaming, gaming, social media, collaborazioni, progetti creativi e comunicazioni rivolte alla community.": "• The website may include videos, streaming, gaming, social media, collaborations, creative projects and communications for the community.",
        "02 • UTILIZZO": "02 • USE",
        "🛡️ Utilizzo del Sito Web": "🛡️ Use of the Website",
        "L'utente è tenuto a utilizzare il sito web in maniera lecita, corretta e rispettosa dei diritti altrui.": "Visitors must use the website lawfully, responsibly and with respect for the rights of others.",
        "È consentita la normale consultazione e fruizione dei contenuti pubblicamente disponibili sul sito.": "Normal browsing and viewing of publicly available content on the website is permitted.",
        "È vietato utilizzare il sito per web finalità fraudolente, illecite, diffamatorie, abusive o lesive nei confronti dei diritti di Franzzinho o di terzi.": "Using the website for fraudulent, unlawful, defamatory, abusive purposes or to infringe the rights of Franzzinho or third parties is prohibited.",
        "È vietato tentare di compromettere la sicurezza, il funzionamento o l'integrità del sito web e dei relativi servizi.": "Attempts to compromise the security, operation or integrity of the website and its services are prohibited.",
        "Ove tecnicamente e giuridicamente applicabile, potranno essere adottate misure volte a limitare comportamenti abusivi o utilizzi impropri dei servizi disponibili sul sito web.": "Where technically and legally permitted, measures may be taken to limit abusive behavior or improper use of the services available on the website.",
        "©️ Proprietà Intellettuale": "©️ Intellectual Property",
        "• Salvo diversa indicazione, i contenuti presenti sul sito web, inclusi: testi, grafiche, loghi, immagini, video, contenuti audiovisivi, elementi creativi e materiali digitali, appartengono ai rispettivi titolari dei diritti.": "• Unless otherwise stated, website content, including text, graphics, logos, images, videos, audiovisual material, creative elements and digital materials, belongs to the respective rights holders.",
        "• Eventuali contenuti appartenenti a terzi rimangono di proprietà dei rispettivi titolari e sono utilizzati nel rispetto delle condizioni, licenze o autorizzazioni applicabili.": "• Content belonging to third parties remains their property and is used in accordance with applicable terms, licenses or permissions.",
        "Utilizzo dei contenuti": "Use of content",
        "Salvo espressa autorizzazione o diversa licenza indicata sul sito web, non è consentito ripubblicare, distribuire, vendere, modificare o utilizzare commercialmente i contenuti protetti.": "Unless expressly authorized or covered by a different license stated on the website, protected content may not be republished, distributed, sold, modified or used commercially.",
        "🔐 Privacy & Cookie": "🔐 Privacy & Cookies",
        "• Il trattamento degli eventuali dati personali raccolti tramite il sito web è disciplinato dall'apposita Privacy Policy.": "• Processing of any personal data collected through the website is governed by the dedicated Privacy Policy.",
        "• L'utilizzo di cookie e di eventuali altri strumenti di tracciamento è disciplinato separatamente dalla Cookie Policy e, quando previsto, dalle preferenze espresse dall'utente attraverso gli strumenti di gestione del consenso.": "• The use of cookies and other possible tracking tools is governed separately by the Cookie Policy and, where required, the user's preferences expressed through consent-management tools.",
        "Documenti separati": "Separate documents",
        "Privacy Policy e Cookie Policy costituiscono documenti dedicati e non vengono sostituiti dai presenti Termini e Condizioni.": "The Privacy Policy and Cookie Policy are separate documents and are not replaced by these Terms and Conditions.",
        "⚠️ Responsabilità": "⚠️ Liability",
        "• I contenuti presenti sul sito web hanno principalmente finalità informative, creative e promozionali, salvo quando venga espressamente indicato diversamente.": "• Website content is mainly informational, creative and promotional, except where expressly indicated otherwise.",
        "• Sebbene venga prestata attenzione al corretto funzionamento del sito web, non può essere garantita l'assenza assoluta di errori, indisponibilità temporanee o problemi tecnici.": "• Although care is taken to keep the website working properly, the complete absence of errors, temporary downtime or technical issues cannot be guaranteed.",
        "• Eventuali collegamenti a piattaforme, siti o servizi di terze parti conducono a risorse gestite autonomamente dai rispettivi fornitori.": "• Links to third-party platforms, websites or services lead to resources independently managed by their respective providers.",
        "• Restano in ogni caso fermi i diritti e le responsabilità inderogabili previsti dalla normativa applicabile.": "• Mandatory rights and responsibilities under applicable law remain unaffected.",
        "✏️ Modifiche ai Termini": "✏️ Changes to the Terms",
        "• I presenti Termini possono essere modificati o aggiornati per riflettere cambiamenti del sito web, dei servizi offerti o della normativa applicabile.": "• These Terms may be amended or updated to reflect changes to the website, the services provided or applicable law.",
        "• La versione pubblicata su questa pagina indica la data dell'ultimo aggiornamento (visualizzabile all'inizio di questa sezione).": "• The version published on this page displays the last update date (shown at the beginning of this section).",
        "• Eventuali modifiche si applicano secondo quanto previsto dalla normativa vigente e, ove necessario, saranno comunicate con modalità appropriate.": "• Any changes apply in accordance with applicable law and, where necessary, will be communicated appropriately.",
        "07 • LEGGE": "07 • LAW",
        "⚖️ Legge Applicabile": "⚖️ Applicable Law",
        "• I presenti Termini sono disciplinati dalla legge italiana, fatti salvi gli eventuali diritti inderogabili riconosciuti agli utenti dalla normativa applicabile.": "• These Terms are governed by Italian law, without prejudice to any mandatory rights granted to users by applicable legislation.",
        "• Per eventuali controversie sarà competente l'autorità giudiziaria individuata secondo le norme applicabili al caso concreto.": "• Any dispute will be heard by the competent court determined under the rules applicable to the particular case.",
        "• Quando l'utente agisce in qualità di consumatore, restano ferme le specifiche tutele previste dalla normativa a sua protezione.": "• Where the user acts as a consumer, specific statutory consumer protections remain in force.",
        "Un documento per ogni funzione.": "One document for each purpose.",
        "I Termini disciplinano l'utilizzo generale del sito web. Privacy, Cookie e vendite digitali hanno documenti dedicati.": "These Terms cover general use of the website. Privacy, cookies and digital sales have dedicated documents.",
        "Documenti Legali": "Legal documents",
        "Tutta la documentazione di GoatS RevengE, organizzata in un unico punto.": "All GoatS RevengE documents, organized in one place.",
        "STAI LEGGENDO": "YOU ARE READING",
        "📜 Termini 📜": "📜 Terms 📜",
        "Regole generali per l'utilizzo di GoatS RevengE.": "General rules for using GoatS RevengE.",
        "LEGGI": "READ",
        "🔐 Privacy 🔐": "🔐 Privacy 🔐",
        "Informazioni relative al trattamento dei dati personali.": "Information about how personal data is processed.",
        "🍪 Cookie 🍪": "🍪 Cookies 🍪",
        "Informazioni sull'utilizzo di cookie e strumenti di tracciamento.": "Information on cookies and tracking tools.",
        "LEGGI LE CONDIZIONI DELLO STORE": "READ THE STORE TERMS",
        "🛒 Vendite Digitali 🛒": "🛒 Digital Sales 🛒",
        "Condizioni che disciplinano l'acquisto dei prodotti digitali.": "Terms governing purchases of digital products.",
        "Indice dei Termini": "Terms contents"
    },

    "ABOUT.HTML":
    {
        "🐐 SCOPRI LO SWAG DI FRANZZINHO 🐐": "🐐 DISCOVER FRANZZINHO'S SWAG 🐐",
        "Entra nel Goat Verse": "Enter the Goat Verse",
        "Navigazione principale": "Main navigation"
    },

    "COOKIE.HTML":
    {
        "Cookie, memorie del browser e strumenti di terze parti: cosa sono e come vengono gestiti.": "Cookies, browser storage and third-party tools: what they are and how they are managed.",
        "Ultimo aggiornamento: 8 Novembre 2026": "Last updated: November 8, 2026",
        "Indice": "Contents",
        "01. Cookie e archiviazione locale": "01. Cookies and local storage",
        "02. Preferenze musicali attualmente previste": "02. Currently supported music preferences",
        "03. Strumenti tecnici e facoltativi": "03. Essential and optional tools",
        "04. Contenuti incorporati e terze parti": "04. Embedded content and third parties",
        "05. Elenco cookie verificato": "05. Verified cookie inventory",
        "06. Gestione e revoca delle preferenze": "06. Managing and withdrawing preferences",
        "07. Titolare e informazioni aggiuntive": "07. Controller and additional information",
        "I cookie sono informazioni che un sito o servizi terzi possono memorizzare nel browser. Il sito può inoltre usare": "Cookies are pieces of information that a website or third-party services may store in your browser. The website may also use",
        "per ricordare alcune preferenze: non è un cookie HTTP, ma è comunque una forma di memorizzazione sul dispositivo.": "to remember certain preferences: it is not an HTTP cookie, but it still stores information on your device.",
        "Il file": "The file",
        "prevede i seguenti valori nella memoria locale del browser:": "uses the following values in the browser's local storage:",
        "Chiave": "Key",
        "Finalità": "Purpose",
        "Tipo": "Type",
        "Ricordare se la musica è stata disattivata.": "Remember whether the music has been muted.",
        "Ricordare il volume scelto.": "Remember the selected volume.",
        "Queste preferenze vengono conservate dal browser finché non vengono cancellate.": "These preferences remain in the browser until they are deleted.",
        "Gli strumenti strettamente necessari al servizio espressamente richiesto possono, nei casi previsti, non richiedere consenso preventivo, ma devono essere descritti nell’informativa.": "Tools strictly necessary to provide a service expressly requested by the user may, where permitted, not require prior consent, but they must still be described in the notice.",
        "Alcune pagine di GoatS RevengE hanno utilizzato moduli Google e visualizzazioni di fogli Google incorporati; i link a YouTube, Twitch, Instagram, Tik Tok, Discord e Lnk.bio possono invece aprire servizi esterni.": "Some GoatS RevengE pages have used embedded Google Forms and Google Sheets; links to YouTube, Twitch, Instagram, TikTok, Discord and Lnk.bio may open external services.",
        "[DA COMPLETARE: audit tecnico di cookie, localStorage, iframe, analitiche, script esterni, nome, fornitore, durata, finalità e categoria]": "[TO BE COMPLETED: technical audit of cookies, localStorage, iframes, analytics, external scripts, names, providers, duration, purpose and category]",
        "Puoi modificare il volume o disattivare la musica mediante il controllo presente nelle pagine che lo utilizzano. Puoi eliminare i dati locali anche dalle impostazioni del browser.": "You can adjust the volume or mute the music using the control on pages where it is available. You can also clear locally stored data through your browser settings.",
        "Se saranno attivati strumenti facoltativi soggetti a consenso, verrà messo a disposizione un sistema per rifiutarli o accettarli prima del loro caricamento e per modificare successivamente la scelta.": "If optional tools requiring consent are activated, a system will be provided to accept or reject them before they load and to change that choice later.",
        "Per i dati personali collegati alla navigazione, consulta la": "For personal data related to browsing, see the",
        "Titolare e recapiti:": "Controller and contact details:",
        "[DA COMPLETARE: stessi dati identificativi e contatto della Privacy Policy]": "[TO BE COMPLETED: the same identifying and contact information as in the Privacy Policy]",
        "Altri documenti del sito": "Other website documents",
        "Condizioni vendita": "Terms of Sale",
        "Termini del sito": "Website terms",
        "Torna alla Home": "Back to Home",
        "Navigazione principale": "Main navigation",
        "Indice del documento": "Document contents",
        "Vai alla sezione": "Go to section",
        "Documenti correlati": "Related documents"
    },

    "VIDEO_IDEAS.HTML":
    {
        "Hai un'idea folle? Proponila. Potrebbe diventare uno dei prossimi contenuti di Franzzinho.": "Got a wild idea? Suggest it. It could become one of Franzzinho's next videos.",
        "Idee Insane": "Insane Ideas",
        "Proponi la tua idea": "Suggest your idea",
        "💡 Proponi un Nuovo Contenuto": "💡 Suggest New Content",
        "Hai qualcosa che secondo te sarebbe perfetto per Franzzinho? Scrivilo qui sotto. Più dettagli dai, meglio è.": "Got something you think would be perfect for Franzzinho? Write it below. The more details, the better.",
        "👀 Idee Ricevute": "👀 Ideas Submitted",
        "Dai un'occhiata alle proposte inviate dalla community. Magari qualcuno ha già avuto la tua stessa idea!": "Check out the suggestions submitted by the community. Someone might already have had the same idea as you!",
        "Proponi una nuova idea per un contenuto": "Suggest a new video idea",
        "Idee ricevute dalla community": "Ideas submitted by the community",
        "L'universo di Franzzinho tra: Video, Streaming, Social e Gaming.": "Franzzinho's universe of video, streaming, social media and gaming.",
        "Termini": "Terms",
        "Torna in alto": "Back to top"
    }
};




/* TRADUTTORE UNICO — IT / EN
   - data-i18n per componenti a chiave
   - Dizionario testuale per le 12 sezioni
   - data-it / data-en per la Home
   - Attributi accessibili, meta e titolo pagina */
(() =>
{
    "use strict";

    const originals = new WeakMap();
    const originalAttrs = new WeakMap();
    const keyedOriginals = new WeakMap();
    const ghOriginals = new WeakMap();
    const IGNORED = new Set(["SCRIPT", "STYLE", "NOSCRIPT", "TEMPLATE", "CODE", "TEXTAREA"]);
    const ATTRIBUTES = ["alt", "aria-label", "title", "placeholder"];
   
    const I18N_FIELDS = [["data-i18n", "textContent"], ["data-i18n-alt", "alt"], ["data-i18n-title", "title"],
        ["data-i18n-placeholder", "placeholder"], ["data-i18n-aria-label", "aria-label"], ["data-i18n-content", "content"]];
   
    const I18N_SELECTOR = I18N_FIELDS.map(([key]) => `[${key}]`).join(",");
    const HOME_RULES = [["data-gh-alt-en", "alt"], ["data-gh-aria-en", "aria-label"], ["data-gh-content-en", "content"]];
    const normalize = value => value.replace(/\s+/g, " ").trim();
    const basename = (decodeURIComponent(location.pathname.split("/").pop() || "index.html")).toUpperCase();
    const page = basename === "DOPO-ACQUISTO.HTML" ? "DOPO_ACQUISTO.HTML" : basename;
   
    const dictionary = GOAT_PAGE_TEXT_EN[page] ||
    {
    };

    let originalTitle = null;

    function cached(element, field, store)
    {
        let record = store.get(element);
       
        if (!record)
        {
            record =
            {
            }; store.set(element, record);
        }

        if (!(field in record)) 
        {
           record[field] = field === "textContent" ? element.textContent : element.getAttribute(field);
        }
       
        return record[field];
    }

    function translateKeys(english)
    {
        document.querySelectorAll(I18N_SELECTOR).forEach(element =>
        {
            I18N_FIELDS.forEach(([marker, field]) =>
            {
                if (!element.hasAttribute(marker))
                {
                   return;
                }
               
                if (field === "textContent" && element.children.length)
                {
                   return;
                }
               
                const key = element.getAttribute(marker);
                const original = cached(element, field, keyedOriginals);
                const translated = english ? GOAT_I18N_EN[key] : null;
                const value = typeof translated === "string" ? translated : original;
               
                if (field === "textContent")
                {
                   element.textContent = value;
                }
                   
                else if (value === null) 
                {
                   element.removeAttribute(field);
                }
                   
                else 
                {
                   element.setAttribute(field, value);
                }
            });
        });
    }

    function translatePageText(english)
    {
        if (!document.body || !Object.keys(dictionary).length) 
        {
           return;
        }
       
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
        let node;
       
        while ((node = walker.nextNode()))
        {
            const parent = node.parentElement;
           
            if (!parent || IGNORED.has(parent.tagName)) 
            {
               continue;
            }
           
            if (parent.closest(".goat-language-picker, .stripe-return-language, .goat-music-control, [data-i18n], .gh-root"))
            {
               continue;
            }
           
            if (!originals.has(node))
            {
               originals.set(node, node.nodeValue);
            }
           
            const raw = originals.get(node);
            const translated = dictionary[normalize(raw)];
           
            if (typeof translated !== "string") 
            {
               continue;
            }
           
            const leading = (raw.match(/^\s*/) || [""])[0];
            const trailing = (raw.match(/\s*$/) || [""])[0];
            node.nodeValue = english ? leading + translated + trailing : raw;
        }

        document.querySelectorAll("[alt], [aria-label], [title], [placeholder], meta[name='description']").forEach(element =>
        {
            if (element.closest(".goat-language-picker, .stripe-return-language, .goat-music-control, .gh-root")) 
            {
               return;
            }
           
            const fields = element.matches("meta[name='description']") ? ["content"] : ATTRIBUTES;
           
            fields.forEach(field =>
            {
                if (!element.hasAttribute(field))
                {
                   return;
                }
               
                const original = cached(element, field, originalAttrs);
                const translated = dictionary[normalize(original || "")];
               
                if (english && typeof translated === "string") 
                {
                   element.setAttribute(field, translated);
                }
                   
                else if (original === null)
                {
                   element.removeAttribute(field);
                }
                   
                else 
                {
                   element.setAttribute(field, original);
                }
            });
        });

        const title = document.querySelector("head > title");
       
        if (title)
        {
            if (originalTitle === null) 
            {
               originalTitle = title.textContent;
            }
           
            const translated = dictionary[normalize(originalTitle)];
            title.textContent = english && typeof translated === "string" ? translated : originalTitle;
        }
    }

    function translateHome(english)
    {
        const root = document.querySelector(".gh-root");
       
        if (!root) 
        {
           return;
        }
       
        root.querySelectorAll("[data-it][data-en]").forEach(element =>
        {
            const target = element.getAttribute(english ? "data-en" : "data-it");
            
            if (target !== null && element.innerHTML !== target) 
            {
               element.innerHTML = target;
            }
        });

        document.querySelectorAll(".gh-root [data-gh-alt-en], .gh-root [data-gh-aria-en], meta[data-gh-content-en]").forEach(element =>
        {
            HOME_RULES.forEach(([marker, field]) =>
            {
                if (!element.hasAttribute(marker))
                {
                   return;
                }
               
                const original = cached(element, field, ghOriginals);
                const translated = english ? element.getAttribute(marker) : original;
               
                if (translated === null) 
                {
                   element.removeAttribute(field);
                }
                   
                else 
                {
                   element.setAttribute(field, translated);
                }
            });
        });
    }

    function initHomeImages()
    {
        document.querySelectorAll(".gh-root .gh-portrait-img, .gh-root .gh-evidence-photo").forEach(img =>
        {
            const mark = () =>
            {
                if (img.naturalWidth > 0) 
                {
                   img.parentElement?.classList.add("gh-image-loaded");
                }
            };

            if (img.complete) 
            {
               mark();
            }
               
            else img.addEventListener("load", mark,
            {
               once: true
            });
        });
    }

    function translate(language)
    {
        const english = language === "en";
        document.documentElement.lang = english ? "en" : "it";
        document.documentElement.dataset.goatLanguage = english ? "en" : "it";
        translateKeys(english);
        translatePageText(english);
        translateHome(english);
    }

    document.addEventListener("goat:languagechange", event =>
    {
        translate(event.detail?.language === "en" ? "en" : "it");
    });

    window.addEventListener("storage", event =>
    {
        if (event.key === "goatSiteLanguage")
        {
           goatSetLanguage(goatCurrentLanguage());
        }
    });

    function start()
    {
        initHomeImages();
        translate(goatCurrentLanguage());
    }

    if (document.readyState === "loading")
    {
        document.addEventListener("DOMContentLoaded", start,
        {
           once: true
        });
    }
       
    else
    {
        start();
    }
})();

/* DOPO_ACQUISTO: lingua IT / EN autonoma */
(() =>
{
    "use strict";

    const STORAGE_KEY = "goatSiteLanguage";
   
    const TEXT =
    {
        "Grazie per il tuo ordine": "Thank you for your order",
        "Riceverai presto la conferma all'indirizzo email utilizzato durante l'acquisto.": "You will soon receive confirmation at the email address used for your purchase.",
        "Come riceverai il prodotto": "How will you receive your product",
        "Quando il pagamento risulterà confermato, il sistema di consegna digitale ti invierà una email contenente le istruzioni per ottenere il software acquistato.": "Once your payment is confirmed, the digital delivery system will email you instructions for accessing the software you purchased.",
        "Il pagamento e l'accesso al download vengono verificati separatamente:": "Payment and download access are verified separately:",
        "questa pagina non costituisce prova di pagamento né abilita un download (per proteggere ed evitare truffe verso il venditore).": "this page does not constitute proof of payment or grant download access (to protect the seller and prevent fraud).",
        "Assistenza acquisti": "Purchase support",
        "Condizioni di Vendita": "Terms of Sale"
    };

    const TO_ITALIAN = new Map(Object.entries(TEXT).map(([it, en]) => [en, it]));
    const normalize = (str) => str.replace(/\s+/g, " ").trim();

    function getLanguage()
    {
        try
        {
            return localStorage.getItem(STORAGE_KEY) === "en" ? "en" : "it";
        }
           
        catch (_)
        {
            return document.documentElement.lang === "en" ? "en" : "it";
        }
    }

    function setLanguage(language)
    {
        try
        {
            localStorage.setItem(STORAGE_KEY, language);
        }
           
        catch (_)
        {
        }
    }

    function translatePage(language)
    {
        const isEnglish = language === "en";
        document.documentElement.lang = language;
        const panel = document.querySelector(".stripe-return-page");
       
        if (!panel)
        {
           return;
        }

        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
        let node;
       
        while ((node = walker.nextNode()))
        {
            const parent = node.parentElement;
           
            if (!parent || parent.closest(".stripe-return-language") || ["SCRIPT", "STYLE", "NOSCRIPT", "CODE", "TEXTAREA"].includes(parent.tagName))
            {
               continue;
            }

            const raw = node.nodeValue;
            const current = normalize(raw);
            const italian = Object.prototype.hasOwnProperty.call(TEXT, current) ? current : TO_ITALIAN.get(current);
           
            if (!italian) 
            {
               continue;
            }

            const leading = (raw.match(/^\s*/) || [""])[0];
            const trailing = (raw.match(/\s*$/) || [""])[0];
            node.nodeValue = leading + (isEnglish ? TEXT[italian] : italian) + trailing;
        }

        document.title = isEnglish ? "Thank you for your order" : "Grazie per il tuo ordine";
        const description = document.querySelector('meta[name="description"]');
       
        if (description) 
        {
           description.setAttribute("content", isEnglish ? "Information following the purchase of a GoatS RevengE digital product." : "Informazioni successive all'acquisto di un prodotto digitale GoatS RevengE.");
        }

        const select = document.getElementById("stripe-return-language-select");
       
        if (select)
        {
            select.value = language;
            select.setAttribute("aria-label", isEnglish ? "Website language" : "Lingua del sito");
        }
    }

    function start()
    {
        const main = document.querySelector(".stripe-return-page");
       
        if (!main || document.getElementById("stripe-return-language-select"))
        {
           return;
        }

        const container = document.createElement("div");
        container.className = "stripe-return-language";
        const select = document.createElement("select");
        select.id = "stripe-return-language-select";
        select.className = "stripe-return-language-select";
        select.innerHTML = '<option value="it">🇮🇹 Italiano</option><option value="en">🇺🇸 English</option>';
        container.appendChild(select);
        main.insertBefore(container, main.firstChild);

        select.addEventListener("change", () =>
        {
            const language = select.value === "en" ? "en" : "it";
            setLanguage(language);
           
            document.dispatchEvent(new CustomEvent("goat:languagechange",
            {
               detail:
               {
                  language
               }
            }));

            translatePage(language);
        });

        translatePage(getLanguage());
    }

    document.addEventListener("goat:languagechange", event =>
    {
        if (document.querySelector(".stripe-return-page"))
        {
            translatePage(event.detail?.language === "en" ? "en" : "it");
        }
    });

    if (document.readyState === "loading")
    {
        document.addEventListener("DOMContentLoaded", start,
        {
           once: true
        });
    }
       
    else
    {
        start();
    }
})();
