



// docu-card-hover

const documentCard = document.querySelectorAll(".document-card");

documentCard.forEach(card => {
    const deskripsiCard = card.querySelector(".deskripsi-card");

    deskripsiCard.style.transition = 'bottom 0.3s ease';
    deskripsiCard.classList.remove('top-130')
    deskripsiCard.style.bottom = '-17.5rem';

    card.addEventListener('mouseenter', () => {
        deskripsiCard.style.bottom = '0.8rem';
    });

    card.addEventListener('mouseleave', () => {
        deskripsiCard.style.bottom = '-17.5rem';
    });

});



document.addEventListener('DOMContentLoaded', () => {
    const btnSliderRight = document.querySelectorAll(".btn-slider-right");
    const btnSliderLeft = document.querySelectorAll(".btn-slider-left");
    const arrowBtnSlider = [...btnSliderLeft, ...btnSliderRight];



    // arrow efect

    arrowBtnSlider.forEach(arrow => {
        const circle = arrow.querySelector("svg circle");
        const path = arrow.querySelector("svg path");

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

    });



    //  swiper

    const swiperDocument = document.querySelectorAll(".swiper-document");

    swiperDocument.forEach(swiper => {

        const track = swiper.querySelector(".swiper-track");
        const card = swiper.querySelectorAll(".document-card");

        const btnSliderLeft = swiper.querySelector(".btn-slider-left");
        const btnSliderRight = swiper.querySelector(".btn-slider-right");

        const gap = 40;
        const cardWidth = card[0].offsetWidth + gap;
        let currentIndex = 0;

        let slidePerView;


        function updateSliderPerView() {
            if (window.innerWidth <= 992) {
                slidePerView = 2
            } else {
                slidePerView = 4;
            }
        }
        updateSliderPerView();
        window.addEventListener('resize', updateSliderPerView);

        track.style.transition = 'all 0.5s ease';

        hiddenArrow(currentIndex);

        btnSliderRight.addEventListener('click', () => {
            updateSliderPerView();
            if (currentIndex < card.length - slidePerView) {
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


        // pagination

        const pagination = swiper.querySelector(".pagination");


        if (card.length > slidePerView) {
            for (i = 0; i < card.length - slidePerView + 1; i++) {
                pagination.innerHTML += `
                    <svg class="mx-2 mb-10" xmlns="http://www.w3.org/2000/svg" width="27" height="27" viewBox="0 0 27 27"
                        fill="none">
                        <circle cx="13.5" cy="13.5" r="13.5" fill="#3E9EC6"/>
                    </svg>`;
                paginationUpdate(currentIndex);

            }
        } else {
            pagination.innerHTML += `
                    <svg class="mx-2 mb-10" xmlns="http://www.w3.org/2000/svg" width="27" height="27" viewBox="0 0 27 27"
                        fill="none">
                        <circle cx="13.5" cy="13.5" r="13.5" fill="#3E9EC6"/>
                    </svg>`;
        }

        function paginationUpdate(currentIndex) {
            const pagination = swiper.querySelector(".pagination");
            const dot = pagination.querySelectorAll("svg circle");


            dot.forEach(dot => {
                dot.style.fill = '#B8B8B8';
            });

            dot[currentIndex].style = '#3E9EC6';
        }

        function hiddenArrow(currentIndex) {
            if (currentIndex == 0) {
                btnSliderLeft.classList.add("hidden");
            } else {
                btnSliderLeft.classList.remove("hidden");
            }
            if (currentIndex == card.length - slidePerView || card.length < slidePerView) {
                btnSliderRight.classList.add("hidden");
            } else {
                btnSliderRight.classList.remove("hidden");
            }


        }


    });


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



