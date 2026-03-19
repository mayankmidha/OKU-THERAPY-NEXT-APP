"use client";

import { useEffect } from "react";

type WpRuntimeProps = {
  bodyClass: string;
};

type JsonObject = Record<string, unknown>;

function parseJson(input: string | null): JsonObject | null {
  if (!input) {
    return null;
  }

  try {
    return JSON.parse(input) as JsonObject;
  } catch {
    return null;
  }
}

function normalizePopupSettingsBase64(raw: string): string {
  const normalized = raw.replace(/-/g, "+").replace(/_/g, "/");
  const padding = normalized.length % 4;
  if (padding === 0) {
    return normalized;
  }
  return `${normalized}${"=".repeat(4 - padding)}`;
}

function extractPopupIdFromHash(hash: string): string | null {
  if (!hash || !hash.startsWith("#elementor-action")) {
    return null;
  }

  try {
    const decoded = decodeURIComponent(hash.slice(1));
    const query = decoded.startsWith("elementor-action:")
      ? decoded.slice("elementor-action:".length)
      : decoded;
    const params = new URLSearchParams(query);

    if (params.get("action") !== "popup:open") {
      return null;
    }

    const encodedSettings = params.get("settings");
    if (!encodedSettings) {
      return null;
    }

    const settings = JSON.parse(
      atob(normalizePopupSettingsBase64(encodedSettings)),
    ) as { id?: string | number };
    if (!settings.id) {
      return null;
    }
    return String(settings.id);
  } catch {
    return null;
  }
}

function extractYouTubeId(videoUrl: string): string | null {
  try {
    const url = new URL(videoUrl);
    if (url.hostname.includes("youtu.be")) {
      return url.pathname.replace(/^\/+/, "") || null;
    }
    const videoId = url.searchParams.get("v");
    if (videoId) {
      return videoId;
    }
    const match = url.pathname.match(/\/embed\/([^/?]+)/);
    return match?.[1] ?? null;
  } catch {
    return null;
  }
}

function setElementorHostedBackgroundVideos(): void {
  const videos = document.querySelectorAll<HTMLVideoElement>(
    "video.elementor-background-video-hosted",
  );

  videos.forEach((video) => {
    const host = video.closest<HTMLElement>("[data-settings]");
    const settings = parseJson(host?.getAttribute("data-settings") ?? null);
    const videoUrl = settings?.background_video_link;
    if (typeof videoUrl !== "string" || !videoUrl) {
      return;
    }

    if (video.getAttribute("src") !== videoUrl) {
      video.src = videoUrl;
    }

    video.muted = true;
    video.autoplay = true;
    video.loop = true;
    video.playsInline = true;

    const maybePromise = video.play();
    if (maybePromise && typeof maybePromise.catch === "function") {
      void maybePromise.catch(() => {
        // Ignore autoplay failures on restricted browsers.
      });
    }
  });
}

function setElementorYouTubeEmbeds(): void {
  const widgets = document.querySelectorAll<HTMLElement>(
    ".elementor-widget-video[data-settings]",
  );

  widgets.forEach((widget) => {
    const settings = parseJson(widget.getAttribute("data-settings"));
    if (!settings || settings.video_type !== "youtube") {
      return;
    }

    const videoTarget = widget.querySelector<HTMLElement>(".elementor-video");
    if (!videoTarget || videoTarget.children.length > 0) {
      return;
    }

    const youtubeUrl = settings.youtube_url;
    if (typeof youtubeUrl !== "string" || !youtubeUrl) {
      return;
    }

    const videoId = extractYouTubeId(youtubeUrl);
    if (!videoId) {
      return;
    }

    const autoplay = settings.autoplay === "yes" ? "1" : "0";
    const mute = settings.mute === "yes" ? "1" : "0";
    const loop = settings.loop === "yes" ? "1" : "0";
    const playsInline = settings.play_on_mobile === "yes" ? "1" : "0";
    const embedUrl =
      `https://www.youtube.com/embed/${videoId}` +
      `?autoplay=${autoplay}&mute=${mute}&controls=0&rel=0&modestbranding=1` +
      `&playsinline=${playsInline}&loop=${loop}&playlist=${videoId}`;

    const iframe = document.createElement("iframe");
    iframe.src = embedUrl;
    iframe.title = "Video player";
    iframe.allow = "autoplay; encrypted-media; picture-in-picture";
    iframe.allowFullscreen = true;
    iframe.referrerPolicy = "strict-origin-when-cross-origin";
    iframe.loading = "lazy";

    videoTarget.appendChild(iframe);
  });
}

function setMarketingCtas(): void {
  const ctas = document.querySelectorAll<HTMLAnchorElement>(
    "a.dynamic-button[href*='wa.me/919953879928']",
  );

  ctas.forEach((primaryCta) => {
    const parent = primaryCta.parentElement;
    if (!parent) {
      return;
    }

    let stack = parent.querySelector<HTMLElement>(".oku-cta-stack");
    if (!stack) {
      stack = document.createElement("div");
      stack.className = "oku-cta-stack";
      parent.insertBefore(stack, primaryCta);
      stack.appendChild(primaryCta);
    }

    primaryCta.href = "/auth/signup";
    primaryCta.textContent = "Start a confidential consultation";

    const ensureActionLink = (className: string, href: string, label: string) => {
      let link = stack?.querySelector<HTMLAnchorElement>(`.${className}`);
      if (!link) {
        link = document.createElement("a");
        link.className = `dynamic-button ${className}`;
        stack?.appendChild(link);
      }

      link.href = href;
      link.textContent = label;
    };

    ensureActionLink("oku-secondary-cta", "/auth/login", "Client login");
    ensureActionLink("oku-tertiary-cta", "/auth/signup", "Take a 5-minute PHQ-9 check-in");
  });

  if (!document.getElementById("oku-cta-runtime-styles")) {
    const style = document.createElement("style");
    style.id = "oku-cta-runtime-styles";
    style.textContent = `
      .oku-cta-stack {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
        align-items: center;
      }

      .oku-cta-stack .dynamic-button {
        margin: 0;
      }

      .oku-cta-stack .oku-secondary-cta,
      .oku-cta-stack .oku-tertiary-cta {
        color: #2d2d2d;
        border-color: rgba(45, 45, 45, 0.25);
      }

      .oku-cta-stack .oku-secondary-cta::before,
      .oku-cta-stack .oku-tertiary-cta::before {
        background-color: rgba(255, 255, 255, 0.75);
      }

      .oku-cta-stack .oku-secondary-cta::after,
      .oku-cta-stack .oku-tertiary-cta::after {
        background-color: #2d2d2d;
      }
    `;
    document.head.appendChild(style);
  }
}

export function WpRuntime({ bodyClass }: WpRuntimeProps) {
  useEffect(() => {
    document.body.className = bodyClass;

    const cleanups: Array<() => void> = [];
    const siteHeader = document.getElementById("site-header");

    if (siteHeader) {
      const syncStickyHeader = () => {
        siteHeader.classList.toggle("wp-site-header-sticky", window.scrollY > 12);
      };

      window.addEventListener("scroll", syncStickyHeader, { passive: true });
      syncStickyHeader();

      cleanups.push(() => {
        window.removeEventListener("scroll", syncStickyHeader);
        siteHeader.classList.remove("wp-site-header-sticky");
      });
    }

    const textRotationTarget = document.querySelector<HTMLElement>(
      "#change .elementor-heading-title",
    );
    if (textRotationTarget) {
      const textArray = ["grief", "longing", "quiet", "becoming", "anger", "story"];
      let currentIndex = 1;
      textRotationTarget.textContent = textArray[currentIndex];
      const intervalId = window.setInterval(() => {
        currentIndex = (currentIndex + 1) % textArray.length;
        textRotationTarget.textContent = textArray[currentIndex];
      }, 2000);
      cleanups.push(() => {
        window.clearInterval(intervalId);
      });
    }

    const summaContainers = Array.from(
      document.querySelectorAll<HTMLElement>(".summa"),
    );
    if (summaContainers.length > 0) {
      const listeners = summaContainers.map((container) => {
        const onMouseEnter = () => {
          if (window.innerWidth <= 768) {
            return;
          }
          summaContainers.forEach((node) => node.classList.remove("active"));
          container.classList.add("active");
        };
        container.addEventListener("mouseenter", onMouseEnter);
        return () => {
          container.removeEventListener("mouseenter", onMouseEnter);
        };
      });
      cleanups.push(() => {
        listeners.forEach((cleanup) => cleanup());
      });
    }

    const navWidgets = document.querySelectorAll<HTMLElement>(
      ".elementor-widget-nav-menu",
    );
    if (navWidgets.length > 0) {
      const widgetCleanups = Array.from(navWidgets).map((widget) => {
        const toggle = widget.querySelector<HTMLElement>(".elementor-menu-toggle");
        const dropdown = widget.querySelector<HTMLElement>(
          ".elementor-nav-menu--dropdown",
        );
        if (!toggle || !dropdown) {
          return () => {};
        }

        const dropdownLinks = Array.from(dropdown.querySelectorAll<HTMLAnchorElement>("a"));

        const setLinkTabIndexes = (isOpen: boolean) => {
          dropdownLinks.forEach((link) => {
            link.tabIndex = isOpen ? 0 : -1;
          });
        };

        const clearMobileDropdownGeometry = () => {
          dropdown.style.removeProperty("left");
          dropdown.style.removeProperty("right");
          dropdown.style.removeProperty("top");
          dropdown.style.removeProperty("width");
        };

        const applyMobileDropdownGeometry = () => {
          if (window.innerWidth > 1024) {
            clearMobileDropdownGeometry();
            return;
          }

          const widgetRect = widget.getBoundingClientRect();
          const toggleRect = toggle.getBoundingClientRect();

          dropdown.style.left = `${Math.round(-widgetRect.left)}px`;
          dropdown.style.right = `${Math.round(widgetRect.right - window.innerWidth)}px`;
          dropdown.style.top = `${Math.round(toggleRect.height)}px`;
          dropdown.style.width = `${Math.round(window.innerWidth)}px`;
        };

        const closeMenu = () => {
          toggle.classList.remove("elementor-active");
          toggle.setAttribute("aria-expanded", "false");
          dropdown.setAttribute("aria-hidden", "true");
          dropdown.classList.remove("wp-dropdown-open");
          clearMobileDropdownGeometry();
          setLinkTabIndexes(false);
        };

        const openMenu = () => {
          toggle.classList.add("elementor-active");
          toggle.setAttribute("aria-expanded", "true");
          dropdown.setAttribute("aria-hidden", "false");
          dropdown.classList.add("wp-dropdown-open");
          applyMobileDropdownGeometry();
          setLinkTabIndexes(true);
        };

        const onToggle = () => {
          if (toggle.classList.contains("elementor-active")) {
            closeMenu();
          } else {
            openMenu();
          }
        };

        const onKeyDown = (event: KeyboardEvent) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onToggle();
          }
        };

        const onDropdownLinkClick = () => {
          closeMenu();
        };

        const onDocumentClick = (event: MouseEvent) => {
          const target = event.target as Node | null;
          if (!target) {
            return;
          }
          if (!widget.contains(target)) {
            closeMenu();
          }
        };

        const onEscapeKey = (event: KeyboardEvent) => {
          if (event.key === "Escape") {
            closeMenu();
          }
        };

        const onResize = () => {
          if (toggle.classList.contains("elementor-active")) {
            applyMobileDropdownGeometry();
          }
          if (window.innerWidth > 1024) {
            closeMenu();
          }
        };

        toggle.addEventListener("click", onToggle);
        toggle.addEventListener("keydown", onKeyDown);
        dropdownLinks.forEach((link) => {
          link.addEventListener("click", onDropdownLinkClick);
        });
        document.addEventListener("click", onDocumentClick);
        document.addEventListener("keydown", onEscapeKey);
        window.addEventListener("resize", onResize);

        closeMenu();

        return () => {
          toggle.removeEventListener("click", onToggle);
          toggle.removeEventListener("keydown", onKeyDown);
          dropdownLinks.forEach((link) => {
            link.removeEventListener("click", onDropdownLinkClick);
          });
          document.removeEventListener("click", onDocumentClick);
          document.removeEventListener("keydown", onEscapeKey);
          window.removeEventListener("resize", onResize);
        };
      });

      cleanups.push(() => {
        widgetCleanups.forEach((cleanup) => cleanup());
      });
    }

    const closeAllPopups = () => {
      const modals = document.querySelectorAll<HTMLElement>(".elementor-popup-modal");
      modals.forEach((modal) => {
        modal.setAttribute("hidden", "hidden");
        modal.setAttribute("aria-hidden", "true");
      });
      document.body.classList.remove("wp-popup-open");
    };

    const openPopup = (id: string) => {
      const modal = document.getElementById(`elementor-popup-modal-${id}`);
      if (!modal) {
        return;
      }
      closeAllPopups();
      modal.removeAttribute("hidden");
      modal.setAttribute("aria-hidden", "false");
      document.body.classList.add("wp-popup-open");
    };

    const onDocumentClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target) {
        return;
      }

      const popupTrigger = target.closest<HTMLAnchorElement>(
        "a[href^='#elementor-action']",
      );
      if (popupTrigger) {
        const popupId = extractPopupIdFromHash(popupTrigger.getAttribute("href") ?? "");
        if (popupId) {
          event.preventDefault();
          openPopup(popupId);
          return;
        }
      }

      const closeButton = target.closest(".dialog-close-button");
      if (closeButton) {
        event.preventDefault();
        closeAllPopups();
        return;
      }

      const modal = target.closest<HTMLElement>(".elementor-popup-modal");
      if (modal && target === modal) {
        closeAllPopups();
      }
    };

    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeAllPopups();
      }
    };

    document.addEventListener("click", onDocumentClick);
    document.addEventListener("keydown", onEscape);
    cleanups.push(() => {
      document.removeEventListener("click", onDocumentClick);
      document.removeEventListener("keydown", onEscape);
    });

    const scrollTopButton = document.getElementById("scroll-top") as
      | HTMLAnchorElement
      | null;
    if (scrollTopButton) {
      const onScroll = () => {
        const isVisible = window.scrollY > 300;
        scrollTopButton.style.display = isVisible ? "block" : "none";
        scrollTopButton.style.opacity = isVisible ? "1" : "0";
      };

      const onScrollTopClick = (event: MouseEvent) => {
        event.preventDefault();
        window.scrollTo({ behavior: "smooth", top: 0 });
      };

      window.addEventListener("scroll", onScroll, { passive: true });
      scrollTopButton.addEventListener("click", onScrollTopClick);
      onScroll();

      cleanups.push(() => {
        window.removeEventListener("scroll", onScroll);
        scrollTopButton.removeEventListener("click", onScrollTopClick);
      });
    }

    const forms = document.querySelectorAll<HTMLFormElement>("form.elementor-form");
    if (forms.length > 0) {
      const formCleanups = Array.from(forms).map((form) => {
        const onSubmit = async (event: SubmitEvent) => {
          event.preventDefault();

          const submitButton = form.querySelector<HTMLButtonElement>(
            "button[type='submit']",
          );
          const submitText = submitButton?.querySelector<HTMLElement>(
            ".elementor-button-text",
          );
          const originalText = submitText?.textContent ?? "";

          form
            .querySelectorAll(".elementor-message")
            .forEach((messageNode) => messageNode.remove());

          if (submitButton) {
            submitButton.disabled = true;
          }
          if (submitText) {
            submitText.textContent = "Sending...";
          }

          try {
            const formData = new FormData(form);
            const response = await fetch("/api/form", {
              body: formData,
              method: "POST",
            });
            const payload = (await response.json()) as { message?: string };

            if (!response.ok) {
              throw new Error(payload.message ?? "Form submission failed.");
            }

            const successMessage = document.createElement("div");
            successMessage.className = "elementor-message elementor-message-success";
            successMessage.textContent =
              payload.message ?? "Thanks, we received your details.";

            const fieldWrapper = form.querySelector(".elementor-form-fields-wrapper");
            fieldWrapper?.appendChild(successMessage);
            form.reset();
          } catch {
            const errorMessage = document.createElement("div");
            errorMessage.className = "elementor-message elementor-message-danger";
            errorMessage.textContent =
              "Something went wrong while sending the form. Please try again.";

            const fieldWrapper = form.querySelector(".elementor-form-fields-wrapper");
            fieldWrapper?.appendChild(errorMessage);
          } finally {
            if (submitButton) {
              submitButton.disabled = false;
            }
            if (submitText) {
              submitText.textContent = originalText || "Submit";
            }
          }
        };

        form.addEventListener("submit", onSubmit);
        return () => {
          form.removeEventListener("submit", onSubmit);
        };
      });

      cleanups.push(() => {
        formCleanups.forEach((cleanup) => cleanup());
      });
    }

    setElementorHostedBackgroundVideos();
    setElementorYouTubeEmbeds();
    setMarketingCtas();

    return () => {
      cleanups.forEach((cleanup) => cleanup());
      document.body.classList.remove("wp-popup-open");
    };
  }, [bodyClass]);

  return null;
}
