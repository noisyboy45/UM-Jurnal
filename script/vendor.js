

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

// ============================================================
// 🔧 PENGATURAN SWIPER (JS) — EDIT DI SINI SAJA
// ------------------------------------------------------------
// Kalau tampilan/perilaku swiper masih berantakan, cek 2 tempat
// ini dulu SEBELUM ubah kode lain:
//   1) SWIPER_CONFIG di bawah ini -> jumlah kartu per "halaman"
//      swipe & breakpoint mobile/desktop-nya.
//   2) variabel --swiper-scale-* di styles/swiper-fix.css -> ukuran
//      (scale) kartu per breakpoint.
// Semua bagian lain (native scroll, pagination, hover, dsb) baca
// dari sini, jadi cukup ubah angkanya saja, tidak perlu ubah logic.
// ============================================================
const SWIPER_CONFIG = {
    breakpoint: 992,   // di bawah lebar ini (px) dianggap "mobile"
    slidesMobile: 2,   // jumlah kartu per halaman swipe di mobile
    slidesDesktop: 4,  // jumlah kartu per halaman swipe di desktop
};

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
// dipanggil berkali-kali: pagination dibersihkan, scroll di-reset,
// listener panah tidak dobel karena tombolnya di-clone, dan listener
// scroll tidak dobel karena dilepas dulu lewat referensi tersimpan.
//
// Catatan migrasi: versi lama menggeser ".swiper-track" pakai
// transform: translateX(...) yang dihitung dari offsetWidth kartu,
// sementara tracknya sendiri masih punya "left: -256px" + "scale(.75)"
// bawaan Tailwind. Begitu jumlah/lebar kartu hasil fetch API beda dari
// kartu placeholder saat halaman pertama dibuka, hitungan translateX
// itu meleset dan kartu jadi kepotong/ketutupan (persis seperti di
// screenshot). Sekarang swiper pakai native horizontal scroll
// (".swiper-viewport" + scroll-snap di styles/swiper-fix.css) supaya
// panah kiri/kanan tinggal scroll ke posisi kartu yang sebenarnya,
// tidak ada lagi rumus transform manual yang gampang meleset.
function initSwiper(swiperEl) {
    if (!swiperEl) return;

    let viewport = swiperEl.querySelector(".swiper-viewport");
    const track = swiperEl.querySelector(".swiper-track");
    const pagination = swiperEl.querySelector(".pagination");
    let btnSliderLeft = swiperEl.querySelector(".btn-slider-left");
    let btnSliderRight = swiperEl.querySelector(".btn-slider-right");

    if (pagination) pagination.innerHTML = '';

    const cards = track ? track.querySelectorAll(".document-card") : [];

    // Tidak ada kartu sama sekali (belum ada data) -> sembunyikan
    // navigasi supaya tidak ada tombol/dot yang "nyasar" dan error.
    if (!viewport || !track || cards.length === 0) {
        btnSliderLeft?.classList.add('hidden');
        btnSliderRight?.classList.add('hidden');
        return;
    }

    // NB: viewport TIDAK di-clone (beda dari tombol panah di bawah),
    // karena kartu di dalamnya sudah dipasangi listener hover oleh
    // initDocumentCardHover() sebelum initSwiper() ini dipanggil -
    // clone akan membuang listener itu. Listener 'scroll' lama cukup
    // dilepas manual lewat referensi yang disimpan di elemennya sendiri.
    if (viewport.__swiperScrollHandler) {
        viewport.removeEventListener('scroll', viewport.__swiperScrollHandler);
        viewport.__swiperScrollHandler = null;
    }
    viewport.scrollLeft = 0;

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

    const liveCards = viewport.querySelectorAll(".document-card");

    // Dihitung langsung tiap dibutuhkan (bukan lewat listener 'resize' yang
    // ditumpuk setiap initSwiper dipanggil ulang) supaya tidak ada listener
    // "hantu" yang menumpuk saat swiper di-refresh berkali-kali.
    function getSlidePerView() {
        return window.innerWidth <= SWIPER_CONFIG.breakpoint ? SWIPER_CONFIG.slidesMobile : SWIPER_CONFIG.slidesDesktop;
    }

    // Jarak (px, dalam koordinat layout asli viewport, tidak terpengaruh
    // transform/scale nenek moyangnya) dari awal satu kartu ke kartu
    // berikutnya. Dipakai sebagai satu "langkah" scroll.
    function getStep() {
        if (liveCards.length > 1) {
            const step = liveCards[1].offsetLeft - liveCards[0].offsetLeft;
            if (step > 0) return step;
        }
        return liveCards[0].offsetWidth || 1;
    }

    function maxScrollLeft() {
        return Math.max(0, viewport.scrollWidth - viewport.clientWidth);
    }

    function currentIndex() {
        const step = getStep();
        return step ? Math.round(viewport.scrollLeft / step) : 0;
    }

    function updateArrows() {
        const max = maxScrollLeft();
        btnSliderLeft.classList.toggle("hidden", viewport.scrollLeft <= 1);
        btnSliderRight.classList.toggle("hidden", max <= 1 || viewport.scrollLeft >= max - 1);
    }

    function dotCount() {
        const slidePerView = getSlidePerView();
        return liveCards.length > slidePerView ? (liveCards.length - slidePerView + 1) : 1;
    }

    function paginationUpdate() {
        if (!pagination) return;
        const dots = pagination.querySelectorAll("svg circle");
        if (!dots.length) return;
        const idx = Math.min(dots.length - 1, Math.max(0, currentIndex()));
        dots.forEach(dot => { dot.style.fill = '#B8B8B8'; });
        if (dots[idx]) dots[idx].style.fill = '#3E9EC6';
    }

    function scrollToIndex(idx) {
        const step = getStep();
        const max = maxScrollLeft();
        const target = Math.min(Math.max(idx * step, 0), max);
        viewport.scrollTo({ left: target, behavior: 'smooth' });
    }

    btnSliderRight.addEventListener('click', () => {
        scrollToIndex(currentIndex() + 1);
    });

    btnSliderLeft.addEventListener('click', () => {
        scrollToIndex(currentIndex() - 1);
    });

    // Update panah langsung tiap scroll (drag/trackpad/tombol), dan
    // pagination sedikit di-debounce supaya tidak dihitung ratusan kali
    // selagi animasi scroll masih berjalan.
    let scrollDebounce;
    function onScroll() {
        updateArrows();
        clearTimeout(scrollDebounce);
        scrollDebounce = setTimeout(paginationUpdate, 80);
    }
    viewport.addEventListener('scroll', onScroll, { passive: true });
    viewport.__swiperScrollHandler = onScroll;

    // pagination dots
    if (pagination) {
        const count = dotCount();
        for (let i = 0; i < count; i++) {
            pagination.innerHTML += `
                    <svg class="mx-2 mb-10" xmlns="http://www.w3.org/2000/svg" width="27" height="27" viewBox="0 0 27 27"
                        fill="none">
                        <circle cx="13.5" cy="13.5" r="13.5" fill="#3E9EC6"/>
                    </svg>`;
        }
    }
    updateArrows();
    paginationUpdate();
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

