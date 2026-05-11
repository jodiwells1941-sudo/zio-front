/* ==============
 ========= js documentation ==========================

 * template name: Zio Lottery
 * version: 1.0
 * description: Online Crypto Gaming & Lottery HTML5 Template
 * author: wowtheme7
 * author-url: https://ziolottery.com/

    ==================================================

     01. preloader
     -------------------------------------------------
     02. background image
     -------------------------------------------------
     03. custom cursor
     -------------------------------------------------
     04. scroll to top with progress
     -------------------------------------------------
     05. add active class to the current navbar item
     -------------------------------------------------
     06. open search box
     -------------------------------------------------
     07. nice select and language select
     -------------------------------------------------
     08. mobile menu
     -------------------------------------------------
     09. fixed header on scroll
     -------------------------------------------------
     10. game slider
     -------------------------------------------------
     11. masonry filter
     -------------------------------------------------
     12. result filter two
     -------------------------------------------------
     13. draw countdown
     -------------------------------------------------
     14. select lottery type
     -------------------------------------------------
     15. select lottery number
     -------------------------------------------------
     16. lottery type slider
     -------------------------------------------------
     17. faq tab
     -------------------------------------------------
     18. winner tab
     -------------------------------------------------
     19. sponsor slider
     -------------------------------------------------
     20. testimonial slider
     -------------------------------------------------
     21. blog two slider
     -------------------------------------------------
     22. blog three slider
     -------------------------------------------------
     23. comment reply
     -------------------------------------------------
     24. toggle password
     -------------------------------------------------
     25. privacy sidebar
     -------------------------------------------------
     26. coming soon
     -------------------------------------------------
     27. footer copyright year
     -------------------------------------------------
     28. odometer counter
     -------------------------------------------------
     29. vanilla tilt animation
     -------------------------------------------------
     30. aos initialization
     -------------------------------------------------
     31. template options
     -------------------------------------------------
     32. register gsap
     -------------------------------------------------
     33. gsap null config
     -------------------------------------------------
     34. target section with gsap
     -------------------------------------------------
     35. progress bar
     -------------------------------------------------
     36. parallax image with gsap
     -------------------------------------------------
     37. title animation

    ==================================================
============== */

(function ($) {
  "use strict";

  /**
   * ======================================
   * 01. preloader
   * ======================================
   */
  $(window).on("load", function () {
    if ($(".preloader").length) {
      $(".preloader").delay(300).fadeOut();
    }
  });

  jQuery(function () {
    let initialScroll = $(window).scrollTop();

    /**
     * ======================================
     * 02. background image
     * ======================================
     */
    $("[data-background]").each(function () {
      var backgroundImages = $(this).attr("data-background").split(",");
      var cssValue = backgroundImages
        .map(function (image) {
          return 'url("' + image.trim() + '")';
        })
        .join(",");

      $(this).css("background-image", cssValue);
    });

    /**
     * ======================================
     * 03. custom cursor
     * ======================================
     */
    if ($(".mouseCursor").length > 0) {
      function itCursor() {
        var myCursor = jQuery(".mouseCursor");
        if (myCursor.length) {
          if ($("body")) {
            const e = document.querySelector(".cursor-inner"),
              t = document.querySelector(".cursor-outer");
            let n,
              i = 0,
              o = !1;
            (window.onmousemove = function (s) {
              o ||
                (t.style.transform =
                  "translate(" + s.clientX + "px, " + s.clientY + "px)"),
                (e.style.transform =
                  "translate(" + s.clientX + "px, " + s.clientY + "px)"),
                (n = s.clientY),
                (i = s.clientX);
            }),
              $("body").on(
                "mouseenter",
                "button:not(.not-cursor), a:not(.not-cursor), .cursor-pointer",
                function () {
                  e.classList.add("cursor-hover"),
                    t.classList.add("cursor-hover");
                }
              ),
              $("body").on(
                "mouseleave",
                "button, a, .cursor-pointer",
                function () {
                  ($(this).is("a", "button") &&
                    $(this).closest(".cursor-pointer").length) ||
                    (e.classList.remove("cursor-hover"),
                    t.classList.remove("cursor-hover"));
                }
              ),
              (e.style.visibility = "visible"),
              (t.style.visibility = "visible");

            // text view cursor
            $("h1, h2, h3, h4, h5, h6, .cursor-lg").on(
              "mouseenter",
              function () {
                $(".mouseCursor").addClass("cursor-big");
              }
            );

            $("h1, h2, h3, h4, h5, h6, .cursor-lg").on(
              "mouseleave",
              function () {
                $(".mouseCursor").removeClass("cursor-big");
              }
            );

            // drag cursor
            $(".draggable-cursor").on("mouseenter", function () {
              $(".mouseCursor").addClass("drag-cursor");
            });

            $(".draggable-cursor").on("mouseleave", function () {
              $(".mouseCursor").removeClass("drag-cursor");
            });

            // view cursor
            $(".viewable-cursor").on("mouseenter", function () {
              $(".mouseCursor").addClass("view-cursor");
            });

            $(".viewable-cursor").on("mouseleave", function () {
              $(".mouseCursor").removeClass("view-cursor");
            });

            // no cursor
            $(".not-cursor").on("mouseenter", function () {
              $(".mouseCursor").addClass("not-cursor-outer");
            });

            $(".not-cursor").on("mouseleave", function () {
              $(".mouseCursor").removeClass("not-cursor-outer");
            });
          }
        }
      }
      itCursor();
    }

    /**
     * ======================================
     * 04. scroll to top with progress
     * ======================================
     */
    if ($(".progress-wrap").length) {
      const progressPath = document.querySelector(".progress-wrap path");
      const pathLength = progressPath.getTotalLength();

      progressPath.style.transition = progressPath.style.WebkitTransition =
        "none";
      progressPath.style.strokeDasharray = pathLength + " " + pathLength;
      progressPath.style.strokeDashoffset = pathLength;
      progressPath.getBoundingClientRect();
      progressPath.style.transition = progressPath.style.WebkitTransition =
        "stroke-dashoffset 10ms linear";

      const updateProgress = () => {
        const scroll = $(window).scrollTop();
        const height = $(document).height() - $(window).height();
        progressPath.style.strokeDashoffset =
          pathLength - (scroll * pathLength) / height;
      };

      updateProgress();
      $(window).on("scroll", updateProgress);

      $(window).on("scroll", () => {
        $(".progress-wrap").toggleClass(
          "active-progress",
          $(this).scrollTop() > 50
        );
      });

      $(".progress-wrap").on("click", (event) => {
        event.preventDefault();
        $("html, body")
          .stop()
          .css("scroll-behavior", "auto")
          .animate(
            { scrollTop: 0 },
            {
              duration: 1500,
              easing: "swing",
              complete: () => $("html, body").css("scroll-behavior", "smooth"),
            }
          );
      });

      if ($(window).scrollTop() >= 50) {
        $(".progress-wrap").addClass("active-progress");
      }
    }

    /**
     * ======================================
     * 05. add active class to the current navbar item
     * ======================================
     */
    function dynamicCurrentMenuClass(selector) {
      const fileName = window.location.href.split("/").pop();

      selector.find("li").removeClass("active");
      selector
        .find(".navbar__dropdown-label")
        .removeClass("navbar__item-active");

      selector.find("li").each(function () {
        const anchor = $(this).find("a");
        if (
          anchor.attr("href") === fileName ||
          (fileName === "" && anchor.attr("href") === "index.html")
        ) {
          $(this).addClass("active");
        }
      });

      const activeDropdownItem = selector
        .find(".navbar__sub-menu .active")
        .parents("li");
      if (activeDropdownItem.length) activeDropdownItem.addClass("active");
    }

    if ($("header").length) {
      dynamicCurrentMenuClass($("header"));
    }

    /**
     * ======================================
     * 06. open search box
     * ======================================
     */
    if ($(".search-popup").length > 0) {
      $(".open-search").on("click", function () {
        $("body").addClass("search-active");
      });

      $(".close-search").on("click", function () {
        $("body").removeClass("search-active");
      });
    }

    /**
     * ======================================
     * 06. open search box
     * ======================================
     */

    /**
     * ======================================
     * 07. nice select and language select
     * ======================================
     */
    // $("select").niceSelect();

    // language select
    if ($(".language-box").length > 0) {
      $(".language-box .language-select").on("click", function () {
        $(this).toggleClass("active");
        $(this).next("ul").toggleClass("language-select-active");
      });
      $(".language-box ul li").on("click", function () {
        $(".language-box .language-select").removeClass("active");
        $(".language-box ul").removeClass("language-select-active");
      });
    }

    $(document).on("click", function (e) {
      if ($(e.target).closest(".language-box").length === 0) {
        $(this).find("ul").removeClass("language-select-active");
        $(this).find(".language-select").removeClass("active");
      }
    });

    /**
     * ======================================
     * 08. mobile menu
     * ======================================
     */
    if ($(".mobile-menu").length > 0) {
      var mobileMenuContent = $(".navbar__menu").html();
      $(".mobile-menu__list").append(mobileMenuContent);

      $(".mobile-menu .navbar__dropdown-label").on("click", function () {
        $(this).parent().siblings().find(".navbar__sub-menu").slideUp(500);
        $(this)
          .parent()
          .siblings()
          .find(".navbar__dropdown-label")
          .removeClass("navbar__item-active");
        $(this).siblings(".navbar__sub-menu").slideToggle(500);
        $(this).toggleClass("navbar__item-active");
      });
    }

    $(".open-offcanvas-nav").on("click", function () {
      $(this).addClass("open-offcanvas-nav-active");
      $(".mobile-menu__backdrop").addClass("mobile-menu__backdrop-active");

      $(".mobile-menu").addClass("show-menu");
    });

    $(".close-mobile-menu, .mobile-menu__backdrop").on("click", function () {
      $(".open-offcanvas-nav").removeClass("open-offcanvas-nav-active");
      $(".mobile-menu").removeClass("show-menu");
      $(".mobile-menu__backdrop").removeClass("mobile-menu__backdrop-active");
      $(".mobile-menu .navbar__dropdown-label").removeClass(
        "navbar__item-active"
      );
      $(".mobile-menu .navbar__sub-menu").slideUp(0);
    });

    $(".navbar__item.navbar__item--has-children > a").on("click", function (e) {
      e.preventDefault();
    });

    $(window).on("resize", function () {
      // sidebar info
      $(".off-canvas").removeClass("off-canvas-active");
      $(".off-canvas-backdrop").removeClass("off-canvas-backdrop-active");

      // mobile menu
      $(".mobile-menu").removeClass("show-menu");
      $(".mobile-menu__backdrop").removeClass("mobile-menu__backdrop-active");
      $(".mobile-menu .navbar__dropdown-label").removeClass(
        "navbar__item-active"
      );
      $(".mobile-menu .navbar__sub-menu").slideUp(0);
      $(".open-offcanvas-nav").removeClass("open-offcanvas-nav-active");
    });

    /**
     * ======================================
     * 09. fixed header on scroll
     * ======================================
     */
    // $(window).on("scroll", function () {
    //   var scroll = $(window).scrollTop();
    //   if (scroll < 45) {
    //     $(".header").removeClass("sticky-header");
    //   } else {
    //     $(".header").addClass("sticky-header");
    //   }
    // });

    // if (initialScroll >= 45) {
    //   $(".header").addClass("sticky-header");
    // }

    /**
     * ======================================
     * 10. game slider
     * ======================================
     */
    var gameSlider = new Swiper(".game-slider", {
      loop: true,
      speed: 1000,
      slidesPerView: 1,
      slidesPerGroup: 1,
      spaceBetween: 24,
      freeMode: true,
      autoplay: {
        delay: 2000,
        disableOnInteraction: false,
        pauseOnMouseEnter: true,
      },
      pagination: {
        el: ".game-pagination",
        clickable: true,
      },
      breakpoints: {
        992: {
          slidesPerView: 2,
        },
        1400: {
          slidesPerView: 3,
        },
      },
    });

    /**
     * ======================================
     * 11. masonry filter
     * ======================================
     */

    function masonryMain() {
      if ($(".filter-wrapper").length) {
        var $grid = $(".filter-wrapper").isotope({
          itemSelector: ".filter-item",
          layoutMode: "fitRows",
        });

        var filterFns = {
          all: function () {
            return true;
          },
        };

        // Bind filter button click
        $(".result__tab-btns ul").on("click", "button", function () {
          var filterValue = $(this).attr("data-filter");
          filterValue = filterFns[filterValue] || filterValue;
          $grid.isotope({ filter: filterValue });
        });

        // Change active class on buttons
        $(".result__tab-btns ul").each(function (i, buttonGroup) {
          var $buttonGroup = $(buttonGroup);
          $buttonGroup.on("click", "button", function () {
            $buttonGroup.find(".active").removeClass("active");
            $(this).addClass("active");
          });
        });

        $grid.isotope({
          transitionDuration: "1200ms",
        });
      }
    }

    masonryMain();

    /**
     * ======================================
     * 12. result filter two
     * ======================================
     */

    function masonryMainTwo() {
      if ($(".filter-wrapper-two").length) {
        var $gridTwo = $(".filter-wrapper-two").isotope({
          itemSelector: ".filter-item-two",
          layoutMode: "fitRows",
        });

        var filterFnsTwo = {
          all: function () {
            return true;
          },
        };

        // Bind filter button click
        $(".result__tab-btns-alt ul").on("click", "button", function () {
          var filterValueTwo = $(this).attr("data-filter");
          filterValueTwo = filterFnsTwo[filterValueTwo] || filterValueTwo;
          $gridTwo.isotope({ filter: filterValueTwo });
        });

        // Change active class on buttons
        $(".result__tab-btns-alt ul").each(function (i, buttonGroupTwo) {
          var $buttonGroupTwo = $(buttonGroupTwo);
          $buttonGroupTwo.on("click", "button", function () {
            $buttonGroupTwo.find(".active").removeClass("active");
            $(this).addClass("active");
          });
        });

        $gridTwo.isotope({
          transitionDuration: "1200ms",
        });
      }
    }

    masonryMainTwo();

    /**
     * ======================================
     * 13. draw countdown
     * ======================================
     */
    if ($(".draw-timer").length) {
      var countDownDate = new Date("Jan 5, 2026 15:37:25").getTime();

      var x = setInterval(function () {
        var now = new Date().getTime();

        var distance = countDownDate - now;

        var days = Math.floor(distance / (1000 * 60 * 60 * 24));
        var hours = Math.floor(
          (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        );
        var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        var seconds = Math.floor((distance % (1000 * 60)) / 1000);

        $(".draw-timer").html(
          days + "d " + hours + "h " + minutes + "m " + seconds + "s"
        );

        if (distance < 0) {
          clearInterval(x);
          $(".draw-timer").html("EXPIRED");
        }
      }, 1000);
    }

    /**
     * ======================================
     * 15. select lottery number
     * ======================================
     */

    let selectedQuickPickNumbers = [];
    let selectedPowerPickNumber = null;

    function updateTicketNumbers() {
      const activeTicketNumber = $(".quick-pick-list .active");
      const ticketNumberFix = $(".ticket__numbers");

      activeTicketNumber.each(function (index) {
        ticketNumberFix.eq(index).html($(this).text() || "00");
      });

      if (activeTicketNumber.length === 5) {
        $(".quick-pick-list li").addClass("deactive");
        $(".quick-pick-list .active").removeClass("deactive");
      } else {
        $(".quick-pick-list li").removeClass("deactive");
        $(".quick-pick-list .active").removeClass("deactive");
      }
    }

    $(".quick-pick-list li").on("click", function () {
      $(this).toggleClass("active");

      const active = $(".quick-pick-list .active");
      if (active.length > 5) {
        $(this).removeClass("active");
        return;
      }

      updateTicketNumbers();
    });

    $(".quick-pick").on("click", function () {
      const quickPickItems = $(".quick-pick-list li");
      const randomQuickPickNumbers = [];

      while (randomQuickPickNumbers.length < 5) {
        const randomIndex = Math.floor(Math.random() * 40);
        if (!randomQuickPickNumbers.includes(randomIndex)) {
          randomQuickPickNumbers.push(randomIndex);
        }
      }

      quickPickItems.removeClass("active");
      randomQuickPickNumbers.forEach(function (index) {
        quickPickItems.eq(index).addClass("active");
      });

      selectedQuickPickNumbers = randomQuickPickNumbers;

      const powerPickItems = $(".power-pick-list li");
      const randomPowerIndex = Math.floor(Math.random() * 30);

      powerPickItems.removeClass("active deactive");
      powerPickItems.eq(randomPowerIndex).addClass("active");

      selectedPowerPickNumber = randomPowerIndex;

      updateTicketNumbers();
    });

    $(".clear-all").on("click", function () {
      $(".quick-pick-list li").removeClass("active deactive");
      $(".power-pick-list li").removeClass("active deactive");
      $(".ticket__numbers").html("00");
      $(".lucky-number").text("00").removeClass("active");
      $(".lucky-power-number").text("00").removeClass("active");
      selectedQuickPickNumbers = [];
      selectedPowerPickNumber = null;
      updateTicketNumbers();
    });

    $(".add-numbers").on("click", function () {
      const selectedQuickItems = $(".quick-pick-list li.active");
      const selectedPowerItem = $(".power-pick-list li.active");

      if (selectedQuickItems.length !== 5 || selectedPowerItem.length !== 1) {
        alert("Please select exactly 5 quick numbers and 1 power number.");
        return;
      }

      selectedQuickItems.each(function (index) {
        $(".lucky-number").eq(index).text($(this).text()).addClass("active");
      });

      $(".lucky-power-number")
        .text(selectedPowerItem.text())
        .addClass("active");

      $(".quick-pick-list li").removeClass("active deactive");
      $(".power-pick-list li").removeClass("active deactive");
      $(".ticket__numbers").html("00");

      selectedQuickPickNumbers = [];
      selectedPowerPickNumber = null;
    });

    $(".power-pick-list li").on("click", function () {
      if ($(this).hasClass("active")) {
        $(this).removeClass("active");
        selectedPowerPickNumber = null;
      } else {
        $(".power-pick-list li").removeClass("active deactive");
        $(this).addClass("active");
        selectedPowerPickNumber = $(this).index();
      }

      $(".power-pick-list li").not(".active").addClass("deactive");
    });

    $(".dlt").on("click", function () {
      $(".lucky-number").text("00").removeClass("active");
      $(".lucky-power-number").text("00").removeClass("active");

      selectedQuickPickNumbers = [];
      selectedPowerPickNumber = null;
    });

    /**
     * ======================================
     * 16. lottery type slider
     * ======================================
     */
    var lotterySlider = new Swiper(".lottery__type-slider", {
      loop: true,
      speed: 1000,
      slidesPerView: 1,
      slidesPerGroup: 1,
      spaceBetween: 24,
      freeMode: true,
      centeredSlides: true,
      autoplay: {
        delay: 2000,
        disableOnInteraction: false,
        pauseOnMouseEnter: true,
      },
      navigation: {
        nextEl: ".next-lottery",
        prevEl: ".prev-lottery",
      },
      breakpoints: {
        576: {
          slidesPerView: 2,
        },
        992: {
          slidesPerView: 3,
        },
      },
    });

    /**
     * ======================================
     * 17. faq tab
     * ======================================
     */

    $(".faq__tab-single").hide();
    $(".faq__tab-single:first").show();

    $(".faq-tab-btn").on("click", function () {
      $(".faq-tab-btn").removeClass("active");
      $(this).addClass("active");
      $(".faq__tab-single").hide();
      var target = $(this).data("target");
      $(target).fadeIn(500);
      return false;
    });

    /**
     * ======================================
     * 18. winner tab
     * ======================================
     */

    $(".ch-list__single").hide();
    $(".ch-list__single:first").show();

    $(".ch-tab-btn").on("click", function () {
      $(".ch-tab-btn").removeClass("active");
      $(this).addClass("active");
      $(".ch-list__single").hide();
      var targetCH = $(this).data("target");
      $(targetCH).fadeIn(500);
      return false;
    });

    /**
     * ======================================
     * 19. sponsor slider
     * ======================================
     */
    var sponsors = new Swiper(".sponsor__slider", {
      loop: true,
      speed: 1000,
      slidesPerView: 1,
      slidesPerGroup: 1,
      spaceBetween: 24,
      freeMode: true,
      centeredSlides: true,
      autoplay: {
        delay: 2000,
        disableOnInteraction: false,
        pauseOnMouseEnter: true,
      },
      breakpoints: {
        420: {
          slidesPerView: 2,
        },
        576: {
          slidesPerView: 3,
        },
        992: {
          slidesPerView: 5,
        },
        1400: {
          slidesPerView: 7,
        },
      },
    });

    /**
     * ======================================
     * 20. testimonial slider
     * ======================================
     */
    var testimonial = new Swiper(".testimonial__slider", {
      loop: true,
      speed: 2000,
      slidesPerView: 1,
      slidesPerGroup: 1,
      spaceBetween: 30,
      effect: "fade",
      fadeEffect: {
        crossFade: true,
      },
      autoplay: {
        delay: 6000,
        disableOnInteraction: false,
        pauseOnMouseEnter: true,
      },
      navigation: {
        nextEl: ".next-testimonial",
        prevEl: ".prev-testimonial",
      },
    });

    /**
     * ======================================
     * 21. blog two slider
     * ======================================
     */
    var blogTwoSlider = new Swiper(".blog-two__slider", {
      loop: true,
      speed: 1000,
      slidesPerView: 1,
      slidesPerGroup: 1,
      spaceBetween: 24,
      freeMode: true,
      autoplay: {
        delay: 2000,
        disableOnInteraction: false,
        pauseOnMouseEnter: true,
      },
      pagination: {
        el: ".blog-two-pagination",
        clickable: true,
      },
      breakpoints: {
        992: {
          slidesPerView: 2,
        },
        1400: {
          slidesPerView: 3,
        },
      },
    });

    /**
     * ======================================
     * 22. blog three slider
     * ======================================
     */
    var blogThreeSlider = new Swiper(".blog-three-slider", {
      loop: true,
      speed: 1000,
      slidesPerView: 1,
      slidesPerGroup: 1,
      spaceBetween: 24,
      freeMode: true,
      autoplay: {
        delay: 2000,
        disableOnInteraction: false,
        pauseOnMouseEnter: true,
      },
      pagination: {
        el: ".blog-pagination",
        clickable: true,
      },
      breakpoints: {
        768: {
          slidesPerView: 2,
        },
      },
    });

    /**
     * ======================================
     * 23. comment reply
     * ======================================
     */
    $(".comment__single").each(function () {
      $(this)
        .find(".reply-button button")
        .on("click", function () {
          var $currentComment = $(this).closest(".comment__single");
          $(".comment__single .reply__comment")
            .not($currentComment.find(".reply__comment"))
            .slideUp();
          $currentComment.find(".reply__comment").slideToggle();
          $(".comment__single .reply-button button")
            .not(this)
            .removeClass("active");
          $(this).toggleClass("active");
        });
    });

    /**
     * ======================================
     * 24. toggle password
     * ======================================
     */
    $(".show-pass").each(function () {
      $(this).on("click", function () {
        var passwordField = $(this).prev("input");
        if (passwordField.attr("type") === "password") {
          passwordField.attr("type", "text");
          $(this).removeClass("ti-eye-off").addClass("ti-eye");
        } else {
          passwordField.attr("type", "password");
          $(this).removeClass("ti-eye").addClass("ti-eye-off");
        }
      });
    });

    /**
     * ======================================
     * 25. privacy sidebar
     * ======================================
     */
    $(".privacy-btn").on("click", function () {
      $(".privacy-btn").removeClass("active");
      $(this).addClass("active");
    });

    /**
     * ======================================
     * 26. coming soon
     * ======================================
     */
    if ($(".clock").length > 0) {
      const hourMarkersContainer = document.querySelector(".hour-markers");
      for (let i = 0; i < 12; i++) {
        const marker = document.createElement("div");
        marker.classList.add("hour-marker");
        const rotation = i * 30;
        marker.style.transform = `rotate(${rotation}deg) translateY(-216.25px)`;

        const hourText = document.createElement("span");
        hourText.textContent = i === 0 ? "12" : i;
        hourText.style.transform = `rotate(-${rotation}deg)`;
        marker.appendChild(hourText);

        hourMarkersContainer.appendChild(marker);
      }

      const hourHand = document.querySelector(".hour-hand");
      const minuteHand = document.querySelector(".minute-hand");
      const secondHand = document.querySelector(".second-hand");

      function setClock() {
        const now = new Date();
        const seconds = now.getSeconds() + now.getMilliseconds() / 1000;
        const minutes = now.getMinutes() + seconds / 60;
        const hours = (now.getHours() % 12) + minutes / 60;

        const secondsDeg = (seconds / 60) * 360;
        const minutesDeg = (minutes / 60) * 360;
        const hoursDeg = (hours / 12) * 360;

        hourHand.style.transform = `rotate(${hoursDeg}deg)`;
        minuteHand.style.transform = `rotate(${minutesDeg}deg)`;
        secondHand.style.transform = `rotate(${secondsDeg}deg)`;
      }

      setInterval(setClock, 50);
      setClock();

      const countdownElement = document.querySelector(".time-countdown");
      const dayElement = countdownElement.querySelector(".day");
      const hourElement = countdownElement.querySelector(".hour");
      const minuteElement = countdownElement.querySelector(".minute");
      const secondElement = countdownElement.querySelector(".second");

      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 100);

      function updateCountdown() {
        const now = new Date();
        const timeRemaining = endDate - now;

        if (timeRemaining <= 0) {
          endDate.setDate(endDate.getDate() + 100);
        }

        const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
        const hours = Math.floor(
          (timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        );
        const minutes = Math.floor(
          (timeRemaining % (1000 * 60 * 60)) / (1000 * 60)
        );
        const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);

        dayElement.textContent = days;
        hourElement.textContent = hours < 10 ? `0${hours}` : hours;
        minuteElement.textContent = minutes < 10 ? `0${minutes}` : minutes;
        secondElement.textContent = seconds < 10 ? `0${seconds}` : seconds;
      }

      setInterval(updateCountdown, 1000);
      updateCountdown();
    }

    /**
     * ======================================
     * 27. footer copyright year
     * ======================================
     */
    if ($("#copyrightYear").length > 0) {
      $("#copyrightYear").text(new Date().getFullYear());
    }

    /**
     * ======================================
     * 28. odometer counter
     * ======================================
     */
    $(".odometer").each(function () {
      $(this).isInViewport(function (status) {
        if (status === "entered") {
          for (
            var i = 0;
            i < document.querySelectorAll(".odometer").length;
            i++
          ) {
            var el = document.querySelectorAll(".odometer")[i];
            el.innerHTML = el.getAttribute("data-odometer-final");
          }
        }
      });
    });

    /**
     * ======================================
     * 29. vanilla tilt animation
     * ======================================
     */

    let Vantilt = document.querySelectorAll(".tilt");

    if (Vantilt) {
      VanillaTilt.init(document.querySelectorAll(".tilt"), {
        max: 5,
        speed: 3000,
      });
    }

    /**
     * ======================================
     * 30. aos initialization
     * ======================================
     */
    AOS.init({
      once: true,
    });

    /**
     * ======================================
     * 31. template options
     * ======================================
     */
    $(".open-color").on("click", function () {
      $(this).hide();
      $(".close-color").show();
      $(".color-icon").css("right", "280px");
      $(".color-palate-inner").css({
        right: "0",
      });
    });

    $(".close-color").on("click", function () {
      $(this).hide();
      $(".open-color").show();
      $(".color-icon").css("right", "0px");
      $(".color-palate-inner").css({
        right: "-280px",
      });
    });

    $(".cursor-version li, .rtl-version li").on("click", function () {
      $("li").removeClass("active");
      $(this).addClass("active");
    });

    $(".animated-cursor").on("click", function () {
      $(".page-wrapper").addClass("a-cursor");
    });

    $(".default-cursor").on("click", function () {
      $(".page-wrapper").removeClass("a-cursor");
    });

    $(".ltr-yes").on("click", function () {
      $(".page-wrapper").removeClass("rtl");
    });

    $(".ltr-no").on("click", function () {
      $(".page-wrapper").addClass("rtl");
    });

    /**
     * ======================================
     * 32. register gsap
     * ======================================
     */
    gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

    /**
     * ======================================
     * 33. gsap null config
     * ======================================
     */
    gsap.config({
      nullTargetWarn: false,
    });

    /**
     * ======================================
     * 34. target section with gsap
     * ======================================
     */
    $('a[href^="#"]:not([href="#"])').on("click", function (event) {
      event.preventDefault();

      var target = $(this).attr("href");

      gsap.to(window, {
        scrollTo: {
          y: target,
          offsetY: 100,
        },
        duration: 1,
        ease: "power3.inOut",
      });
    });

    /**
     * ======================================
     * 35. progress bar
     * ======================================
     */

    if ($(".pg-single").length > 0) {
      $(".pg-single").each(function () {
        const percentValue = $(this)
          .find(".progress-bar-wrapper")
          .attr("data-percent");
        const percentValueNumber = parseInt(percentValue, 10);

        $(this).find(".progress-bar-percent").css("width", percentValue);

        $(this).find(".percent-value").text(percentValue);
      });

      const ax_progress_bar = document.querySelectorAll(".pg-single");

      ax_progress_bar.forEach((element) => {
        const w = element.querySelector(".progress-bar-percent");
        const p = element.querySelector(".percent-value");

        const target = parseInt(p.textContent, 10);

        const ax_bartl = gsap.timeline({
          defaults: {
            duration: 2,
          },
          scrollTrigger: {
            trigger: element,
            start: "top 80%",
            end: "bottom 20%",
            toggleActions: "play none none none",
          },
        });

        ax_bartl.fromTo(
          w,
          {
            width: 0,
          },
          {
            width: target + "%",
          }
        );

        ax_bartl.from(
          p,
          {
            textContent: 0 + "%",
            snap: {
              textContent: 5,
            },
          },
          "<"
        );
      });
    }

    /**
     * ======================================
     * 36. parallax image with gsap
     * ======================================
     */
    var imageParallax = document.querySelectorAll(".parallax-image");
    if (imageParallax.length > 0) {
      $(".parallax-image").each(function () {
        $(this).wrap(
          '<div class="parallax-image-wrap"><div class="parallax-image-inner"></div></div>'
        );
        $(".parallax-image-wrap").css({
          overflow: "hidden",
        });

        var $animImageParallax = $(this);
        var $aipWrap = $animImageParallax.parents(".parallax-image-wrap");
        var $aipInner = $aipWrap.find(".parallax-image-inner");

        let tl_ImageParallax = gsap.timeline({
          scrollTrigger: {
            trigger: $aipWrap,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
            onEnter: () => animImgParallaxRefresh(),
          },
        });
        tl_ImageParallax.to($animImageParallax, {
          yPercent: 80,
          ease: "none",
        });

        function animImgParallaxRefresh() {
          tl_ImageParallax.scrollTrigger.refresh();
        }

        let tl_aipZoomIn = gsap.timeline({
          scrollTrigger: {
            trigger: $aipWrap,
            start: "top 99%",
          },
        });
        tl_aipZoomIn.from($aipInner, {
          duration: 1.5,
          autoAlpha: 0,
          scale: 1.3,
          ease: Power2.easeOut,
          clearProps: "all",
        });
      });
    }

    /**
     * ======================================
     * 37. title animation
     * ======================================
     */
    if ($(".title-animation").length > 0) {
      let char_come = gsap.utils.toArray(".title-animation");
      char_come.forEach((char_come) => {
        let split_char = new SplitText(char_come, {
          type: "chars, words",
          lineThreshold: 0.5,
        });
        const tl2 = gsap.timeline({
          scrollTrigger: {
            trigger: char_come,
            start: "top 90%",
            end: "bottom 60%",
            scrub: false,
            markers: false,
            toggleActions: "play none none none",
          },
        });
        tl2.from(split_char.chars, {
          duration: 0.8,
          x: 40,
          autoAlpha: 0,
          stagger: 0.05,
          ease: "back.out",
        });
      });
    }
  });
})(jQuery);
