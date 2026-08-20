

// ============================================================
// docu-card-hover + swiper
// ------------------------------------------------------------
// Dulu logic ini cuma jalan sekali saat halaman dimuat, memakai
// kartu placeholder statis yang ada di HTML. Begitu halaman
// artikel/buku/karya-ilmiah/index mengambil data asli dari API
// dan mengganti isi .swiper-track, kartu barunya tidak pernah
// "di-init" lagi -> hover mati, panah/pagination salah hitung,
// dan tombol "Cek Selengkapnya" jadi tidak bisa diklik.
//
// Sekarang semua logic dibungkus jadi fungsi yang bisa dipanggil
// ulang kapan saja (window.initDocumentCardHover / window.initSwiper /
// window.initAllSwipers), termasuk setelah fetch selesai mengisi
// kartu asli.
// ============================================================

function initDocumentCardHover(scope) {
    const root = scope || document;
    const documentCard = root.querySelectorAll(".document-card");

    documentCard.forEach(card => {
        if (card.dataset.hoverInit === '1') return;
        const deskripsiCard = card.querySelector(".deskripsi-card");
        if (!deskripsiCard) return;

        deskripsiCard.style.transition = 'bottom 0.3s ease';
        deskripsiCard.classList.remove('top-130');
        deskripsiCard.style.bottom = '-17.5rem';

        card.addEventListener('mouseenter', () => {
            deskripsiCard.style.bottom = '0.8rem';
        });

        card.addEventListener('mouseleave', () => {
            deskripsiCard.style.bottom = '-17.5rem';
        });

        card.dataset.hoverInit = '1';
    });
}

function initArrowEffect(scope) {
    const root = scope || document;
    const btnSliderRight = root.querySelectorAll(".btn-slider-right");
    const btnSliderLeft = root.querySelectorAll(".btn-slider-left");
    const arrowBtnSlider = [...btnSliderLeft, ...btnSliderRight];

    arrowBtnSlider.forEach(arrow => {
        if (arrow.dataset.arrowInit === '1') return;
        const circle = arrow.querySelector("svg circle");
        const path = arrow.querySelector("svg path");
        if (!circle || !path) return;

        circle.style.fill = "white";
        path.style.fill = "#00923F";

        arrow.addEventListener('mousedown', () => {
            circle.style.fill = "#00923F";
            path.style.fill = "white";
        });
        arrow.addEventListener('mouseup', () => {
            circle.style.fill = "white";
            path.style.fill = "#00923F";
        });

        arrow.dataset.arrowInit = '1';
    });
}

// Inisialisasi ulang SATU swiper (elemen .swiper-document). Aman
// dipanggil berkali-kali: pagination dibersihkan, transform di-reset,
// dan listener panah tidak dobel karena tombolnya di-clone dulu.
function initSwiper(swiperEl) {
    if (!swiperEl) return;

    const track = swiperEl.querySelector(".swiper-track");
    const cards = swiperEl.querySelectorAll(".document-card");
    const pagination = swiperEl.querySelector(".pagination");
    let btnSliderLeft = swiperEl.querySelector(".btn-slider-left");
    let btnSliderRight = swiperEl.querySelector(".btn-slider-right");

    if (track) {
        track.style.transition = 'all 0.5s ease';
        track.style.transform = 'translateX(0px)';
    }
    if (pagination) pagination.innerHTML = '';

    // Tidak ada kartu sama sekali (belum ada data) -> sembunyikan
    // navigasi supaya tidak ada tombol/dot yang "nyasar" dan error.
    if (!track || cards.length === 0) {
        btnSliderLeft?.classList.add('hidden');
        btnSliderRight?.classList.add('hidden');
        return;
    }

    // Clone tombol panah supaya listener lama (yang terikat ke
    // render sebelumnya) tidak menumpuk saat init dipanggil ulang.
    if (btnSliderRight) {
        const fresh = btnSliderRight.cloneNode(true);
        fresh.removeAttribute('data-arrow-init');
        btnSliderRight.replaceWith(fresh);
        btnSliderRight = fresh;
    }
    if (btnSliderLeft) {
        const fresh = btnSliderLeft.cloneNode(true);
        fresh.removeAttribute('data-arrow-init');
        btnSliderLeft.replaceWith(fresh);
        btnSliderLeft = fresh;
    }
    initArrowEffect(swiperEl);

    if (!btnSliderLeft || !btnSliderRight) return;

    const gap = 40;
    const cardWidth = cards[0].offsetWidth + gap;
    let currentIndex = 0;

    // Dihitung langsung tiap dibutuhkan (bukan lewat listener 'resize' yang
    // ditumpuk setiap initSwiper dipanggil ulang) supaya tidak ada listener
    // "hantu" yang menumpuk saat swiper di-refresh berkali-kali (mis. setelah
    // data API masuk menggantikan kartu placeholder).
    function getSlidePerView() {
        return window.innerWidth <= 992 ? 2 : 4;
    }

    function hiddenArrow(idx) {
        const slidePerView = getSlidePerView();
        btnSliderLeft.classList.toggle("hidden", idx === 0);
        btnSliderRight.classList.toggle("hidden", idx === cards.length - slidePerView || cards.length < slidePerView);
    }

    function paginationUpdate(idx) {
        if (!pagination) return;
        const dots = pagination.querySelectorAll("svg circle");
        dots.forEach(dot => { dot.style.fill = '#B8B8B8'; });
        if (dots[idx]) dots[idx].style.fill = '#3E9EC6';
    }

    hiddenArrow(currentIndex);

    btnSliderRight.addEventListener('click', () => {
        const slidePerView = getSlidePerView();
        if (currentIndex < cards.length - slidePerView) {
            currentIndex++;
            track.style.transform = `translateX(-${cardWidth * currentIndex}px)`;
            paginationUpdate(currentIndex);
            hiddenArrow(currentIndex);
        }
    });

    btnSliderLeft.addEventListener('click', () => {
        if (currentIndex > 0) {
            currentIndex--;
            track.style.transform = `translateX(-${cardWidth * currentIndex}px)`;
            paginationUpdate(currentIndex);
            hiddenArrow(currentIndex);
        }
    });

    // pagination dots
    if (pagination) {
        const slidePerView = getSlidePerView();
        const dotCount = cards.length > slidePerView ? (cards.length - slidePerView + 1) : 1;
        for (let i = 0; i < dotCount; i++) {
            pagination.innerHTML += `
                    <svg class="mx-2 mb-10" xmlns="http://www.w3.org/2000/svg" width="27" height="27" viewBox="0 0 27 27"
                        fill="none">
                        <circle cx="13.5" cy="13.5" r="13.5" fill="#3E9EC6"/>
                    </svg>`;
        }
        paginationUpdate(currentIndex);
    }
}

// Cari & init ulang SEMUA swiper yang ada di halaman ini.
function initAllSwipers() {
    document.querySelectorAll(".swiper-document").forEach(initSwiper);
}

// Init hover + swiper untuk satu blok tertentu sekaligus. Dipanggil
// dari halaman-halaman yang mengisi kartu dari API (artikel.html,
// buku.html, karya-ilmiah.html, index.html) tepat setelah kartu
// asli selesai dirender ke dalam .swiper-track.
function refreshSwiperCards(swiperEl) {
    if (!swiperEl) return;
    initDocumentCardHover(swiperEl);
    initSwiper(swiperEl);
}

window.initDocumentCardHover = initDocumentCardHover;
window.initArrowEffect = initArrowEffect;
window.initSwiper = initSwiper;
window.initAllSwipers = initAllSwipers;
window.refreshSwiperCards = refreshSwiperCards;

document.addEventListener('DOMContentLoaded', () => {

    // arrow effect + hover untuk kartu statis yang mungkin masih
    // ada di halaman (mis. sebelum data API selesai dimuat)
    initArrowEffect();
    initDocumentCardHover();
    initAllSwipers();

    // form new submision toggler

    const newSubmisionForm = document.querySelector(".new-submision-form");
    const newSubmisionBtn = document.querySelector(".new-submision-btn");


    newSubmisionBtn?.addEventListener('click', () => {
        const caret = newSubmisionBtn.querySelector(".caret");
        newSubmisionForm.classList.toggle("hidden");
        caret.classList.toggle("rotate-90");

    });

    // add author

    const maxAuthor = 7;
    const addAuthorBtn = document.querySelector(".add-author-btn");
    addAuthorBtn?.addEventListener('click', () => {
        const allAuthor = document.querySelectorAll('[name="author"]');

        if (allAuthor.length <= maxAuthor) {
            const newAuthor = document.createElement("input");
            newAuthor.classList.add("primary-input", "mb-2", "author");
            newAuthor.type = "text";
            newAuthor.name = "author";
            addAuthorBtn.before(newAuthor);
        }
    });

    const collapseBtn = document.querySelector(".collapse-btn");
    const sidebar = document.querySelector(".primary-sidebar");

    const collapsed = localStorage.getItem("sidebarCollapsed") === "true";
    setSidebar(collapsed);

    collapseBtn?.addEventListener("click", () => {
        const isCollapsed = !sidebar.classList.contains("w-18");

        setSidebar(isCollapsed);

        localStorage.setItem("sidebarCollapsed", isCollapsed);
    });

    function setSidebar(collapsed) {
        sidebar.classList.toggle("w-80", !collapsed);
        sidebar.classList.toggle("w-18", collapsed);

        collapseBtn.querySelector("svg.bi-arrow-bar-right").classList.toggle("hidden", !collapsed);
        collapseBtn.querySelector("svg.bi-arrow-bar-left").classList.toggle("hidden", collapsed);

        const logo = sidebar.querySelector("div div.overflow-hidden");
        logo.classList.toggle("w-20", !collapsed);
        logo.classList.toggle("h-20", !collapsed);
        logo.classList.toggle("w-10", collapsed);
        logo.classList.toggle("h-10", collapsed);

        sidebar.querySelector("div span")?.classList.toggle("hidden", collapsed);

        sidebar.querySelectorAll("a div").forEach(div => {
            div.classList.toggle("px-8", !collapsed);
            div.classList.toggle("justify-center", collapsed);
        });

        sidebar.querySelectorAll("a div span").forEach(span => {
            span.classList.toggle("hidden", collapsed);
        });
    }



});

