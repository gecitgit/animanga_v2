document.addEventListener("DOMContentLoaded", () => {

    // START OF GLOBAL VARIABLES
    const animeSearchToggle = document.getElementById('search-anime');
    const mangaSearchToggle = document.getElementById('search-manga');
    animeSearchToggle.classList.add('active-search-toggle');
    mangaSearchToggle.classList.add('inactive-search-toggle');

    const formSearch = document.getElementById('search-form');

    let limit = 10;
    let currentPage = 1;
    let lastVisiblePage = 1;
    let urlQuery = '';
    let userQuery = '';

    const resultsHolder = document.getElementById('search-results');

    const paginationHolder = document.getElementById('pagination-holder');
    const displayNumberText = document.getElementById('display-number-text');
    const pageNumber = document.getElementById('page-number');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const resetFormBtn = document.getElementById('clear-search-button');

    const myListUl = document.getElementById('myListItems');

    const appTitle = document.getElementById('app-title');

    // END OF GLOBAL VARIABLES

    window.onload = function() {
    
        function resizeTitle() {
            if (window.innerWidth <= 600) {
                appTitle.innerText = 'ASP';
            } else {
                appTitle.innerText = 'Animanga Search Pal';
            }
        }
    
        window.onresize = resizeTitle;
        resizeTitle();
    };

    resetFormBtn.addEventListener('click', resetFormHandler);
    function resetFormHandler() {
        const text = "Press a button!\nEither OK or Cancel.";
        if (confirm(text)) {
            formSearch.reset();
            paginationHolder.style.display = "none";
            const searchResetMsg = document.createElement('p');
            searchResetMsg.classList.add('search-reset-msg');
            searchResetMsg.textContent = 'Search cleared. Ready for a new search!';
            resultsHolder.textContent = '';
            resultsHolder.appendChild(searchResetMsg);
        }
    }

    //handle sidebar toggling
    const toggleList = document.getElementById('toggle-list');
    const listDiv = document.getElementById('myList');
    toggleList.addEventListener('click', toggleListHandler);

    function toggleListHandler() {
        listDiv.classList.remove("hidden");
        toggleList.style.display = "none";
    }

    const closeOverlayBtn = document.getElementById('myList-closeBtn');
    closeOverlayBtn.addEventListener('click', closeOverlayHandler);

    function closeOverlayHandler() {
        listDiv.classList.add("hidden");
        toggleList.style.display = "block";
    }
    //end of sidebar toggling


    //handle which search category toggling
    animeSearchToggle.addEventListener('click', animeSearchHandler);
    function animeSearchHandler() {
        mangaSearchToggle.classList.remove('active-search-toggle');
        mangaSearchToggle.classList.add('inactive-search-toggle');

        animeSearchToggle.classList.remove('inactive-search-toggle');
        animeSearchToggle.classList.add('active-search-toggle');
    }

    mangaSearchToggle.addEventListener('click', mangaSearchHandler);
    function mangaSearchHandler() {
        animeSearchToggle.classList.remove('active-search-toggle');
        animeSearchToggle.classList.add('inactive-search-toggle');

        mangaSearchToggle.classList.remove('inactive-search-toggle');
        mangaSearchToggle.classList.add('active-search-toggle');
    }
    //end of search category toggling


    //handle form submission
    formSearch.addEventListener('submit', formSubmitHandler);

    function formSubmitHandler(event) {
        event.preventDefault();

        currentPage = 1;

        userQuery = event.target[0].value;

        if (animeSearchToggle.classList.contains('active-search-toggle')) {
            urlQuery = buildUrlQuery(userQuery, 'anime', currentPage, limit);
        } else if (mangaSearchToggle.classList.contains('active-search-toggle')) {
            urlQuery = buildUrlQuery(userQuery, 'manga', currentPage, limit);
        }
        handleQuery(urlQuery);
    }
    //end of form submission handling

    // START URL QUERY BUILDER
    function buildUrlQuery(query, type, page, limit) {
        return `https://api.jikan.moe/v4/${type}?q=${query}&page=${page}&limit=${limit}&order_by=score&sort=desc&min_score=5&sfw`
    }
    // END URL QUERY BUILDER

    
    // START TO HANDLE REQUEST
    function handleQuery(urlQuery) {
        fetch(urlQuery)
            .then(handleErrors)
            .then(processResponse)
            .catch(error => console.log(error));
    }
    // END OF HANDLING REQUESTS


    // START TO PROCESS RESPONSE
    // this function is responsible for taking the response from the request and creating an array of all of the results. Also responsible for triggering the resultsRenderer function AND the paginationRenderer function
    function processResponse(response) {
        if (response.data.length === 0) {
            const searchErrorMsg = document.createElement('p');
            searchErrorMsg.classList.add('search-error-msg');
            searchErrorMsg.textContent = 'No results found. Please try a different search query.';
            resultsHolder.appendChild(searchErrorMsg);
            paginationHolder.style.display = "none";
            return;
        }
        const paginationData = response.pagination
        const dataResponseList = response.data.map(item => {
            let creator;
            if (animeSearchToggle.classList.contains('active-search-toggle')) {
                creator = item?.studios[0]?.name || "Studio unknown";
            } else if (mangaSearchToggle.classList.contains('active-search-toggle')) {
                creator = item?.authors[0]?.name || "Author unknown";
            }

            return {
                title: item.title,
                picture: item.images.jpg.image_url,
                creator: creator,
                blurb : item?.synopsis || "No synopsis was provided.",
                score: item?.score || "No score was found.",
                status: item?.status || "Status unclear.",
                link: item.url
            }
        });

        resultsRenderer(dataResponseList);
        paginationRenderer(paginationData);
    }

    // END OF PROCESSING RESPONSE


    // START TO RENDER RESULTS
    // this function is responsible for creating a div for each result and then appending that list of divs to the resultsHolder div
    function resultsRenderer(dataResponseList) {
        const resultsDivList = dataResponseList.map(item => {
            const animangaCard = document.createElement('div');
            animangaCard.classList.add('animanga-card');
    
            const animangaHeader = document.createElement('div');
            animangaHeader.classList.add('animanga-header');
            animangaCard.appendChild(animangaHeader);
            const animangaTitle = document.createElement('span');
            animangaTitle.classList.add('animanga-title');
            animangaTitle.innerText = item.title;
            animangaHeader.appendChild(animangaTitle);

            //creates animangaBody with a separate div for pic and info
            const animangaBody = document.createElement('div');
            animangaBody.classList.add('animanga-body');
            const animangaPicDiv = document.createElement('div');
            animangaPicDiv.classList.add('animanga-pic-div');
            const animangaInfoDiv = document.createElement('div');
            animangaInfoDiv.classList.add('animanga-info-div');
            animangaBody.appendChild(animangaPicDiv);
            animangaBody.appendChild(animangaInfoDiv);
            animangaCard.appendChild(animangaBody);

            const animangaPic = document.createElement('img');
            animangaPic.classList.add('animanga-pic');
            animangaPic.src = item.picture;
            animangaPicDiv.appendChild(animangaPic);

            const animangaSummary = document.createElement('p');
            animangaSummary.classList.add('animanga-summary');
            
            const animangaSummaryText = document.createElement('span');
            
            if (item.blurb.length > 200 ) {
                animangaSummaryText.innerHTML = "<strong>Summary: </strong>" + item.blurb.slice(0, 200) + "...";
            
                const readMoreButton = document.createElement('button');
                readMoreButton.innerHTML = "[Read More]";
                readMoreButton.addEventListener('click', () => {
                    if (readMoreButton.innerHTML === "[Read More]") {
                        animangaSummaryText.innerHTML = "<strong>Summary: </strong>" + item.blurb;
                        readMoreButton.innerHTML = "[Read Less]";
                    } else {
                        animangaSummaryText.innerHTML = "<strong>Summary: </strong>" + item.blurb.slice(0, 200) + "...";
                        readMoreButton.innerHTML = "[Read More]";
                    }
                });
            
                animangaSummary.appendChild(animangaSummaryText);
                animangaSummary.appendChild(readMoreButton);
                animangaInfoDiv.appendChild(animangaSummary);
            } else {
                animangaSummaryText.innerHTML = "<strong>Summary: </strong>" + item.blurb;
                animangaSummary.appendChild(animangaSummaryText);
                animangaInfoDiv.appendChild(animangaSummary);
            }
            

            const animangaCreator = document.createElement('p');
            animangaCreator.classList.add('animanga-creator');
            animangaCreator.innerHTML = "<strong>Creator: </strong>"+item.creator;
            animangaInfoDiv.appendChild(animangaCreator);

            const animangaScore = document.createElement('p');
            animangaScore.classList.add('animanga-score');
            animangaScore.innerHTML = "<strong>Score: </strong>"+item.score;
            animangaInfoDiv.appendChild(animangaScore);

            const animangaStatus = document.createElement('p');
            animangaStatus.classList.add('animanga-status');
            animangaStatus.innerHTML = "<strong>Status: </strong>"+item.status;
            animangaInfoDiv.appendChild(animangaStatus);

            const animangaFooter = document.createElement('div');
            animangaFooter.classList.add('animanga-footer');
            animangaCard.appendChild(animangaFooter);

            const addToListBttn = document.createElement('button');
            addToListBttn.classList.add('add-to-list-bttn');
            addToListBttn.innerHTML = "Add to List";
            addToListBttn.addEventListener('click', () => {
                const myListLi = document.createElement('li');
                myListLi.innerHTML = item.title;
                myListLi.classList.add('my-list-item');
                myListUl.appendChild(myListLi);

                const notification = document.getElementById('notification');
                const notificationText = document.getElementById('notification-text');
                notificationText.innerHTML = `<strong>${item.title}</strong> has been added to your list!`;
                notification.classList.remove('hidden');
                setTimeout(() => {
                    notification.classList.add('hidden');
                }, 3000);
                const removeFromListBttn = document.createElement('button');
                removeFromListBttn.classList.add('remove-from-list-bttn');
                removeFromListBttn.innerHTML = "X";
                removeFromListBttn.addEventListener('click', () => {
                    myListLi.remove();
                })
                myListLi.appendChild(removeFromListBttn);
            })
            //adds the actual 'add to list button' to the animanga card
            animangaFooter.appendChild(addToListBttn);

            const animangaLink = document.createElement('button');
            animangaLink.classList.add('animanga-link');
            animangaLink.innerHTML = "View on MyAnimeList";
            animangaLink.addEventListener('click', () => {
                window.open(item.link, target="_blank");
            })
            animangaFooter.appendChild(animangaLink);

            return animangaCard;
        });

        resultsHolder.innerHTML = '';
        resultsDivList.forEach(item => {
            resultsHolder.appendChild(item);
        })
    }
    // END OF RENDERING RESULTS



    // START TO RENDER PAGINATION
    function paginationRenderer(paginationData) {

        const firstItem = ((paginationData.current_page - 1) * limit) + 1;
        let lastItem = paginationData.current_page * limit;
        
        // If last item index exceeds the total number of items
        if (lastItem > paginationData.items.total) {
            lastItem = paginationData.items.total;
        }
        
        displayNumberText.innerHTML = `Showing results <strong>${firstItem}-${lastItem}</strong> of <strong>${paginationData.items.total}</strong>.`;
        pageNumber.innerHTML = `Page <strong>${paginationData.current_page}</strong> of <strong>${paginationData.last_visible_page}</strong>`;
        

        
        if (paginationData.items.total >= 1) {
            paginationHolder.style.display = "block";
        } else {
            paginationHolder.style.display = "none";
        }

        if (paginationData.current_page <= 1) {
            prevBtn.disabled = true;
        } else {
            prevBtn.disabled = false;
        }

        if (paginationData.current_page >= paginationData.last_visible_page) {
            nextBtn.disabled = true;
        } else {
            nextBtn.disabled = false;
        }
    }

    //this will add functionality to the nextButton
    nextBtn.addEventListener('click', nextBtnHandler);
    function nextBtnHandler() {
        currentPage++;
        if (animeSearchToggle.classList.contains('active-search-toggle')) {
            urlQuery = buildUrlQuery(userQuery, 'anime', currentPage, limit);
        } else if (mangaSearchToggle.classList.contains('active-search-toggle')) {
            urlQuery = buildUrlQuery(userQuery, 'manga', currentPage, limit);
        }
        handleQuery(urlQuery);
    }

    //this will add functionality to the previousButton
    prevBtn.addEventListener('click', prevBtnHandler);
    function prevBtnHandler() {
        currentPage--;
        if (animeSearchToggle.classList.contains('active-search-toggle')) {
            urlQuery = buildUrlQuery(userQuery, 'anime', currentPage, limit);
        } else if (mangaSearchToggle.classList.contains('active-search-toggle')) {
            urlQuery = buildUrlQuery(userQuery, 'manga', currentPage, limit);
        }
        handleQuery(urlQuery);
    }

    // END OF RENDERING PAGINATION

    // START TO HANDLE REQUEST ERRORS
    function handleErrors(response) {
        if (!response.ok) {
            switch (response.status) {
                case 400: throw new Error("You've made an invalid request. Please recheck the documentation.");
                case 404: throw new Error("The resource was not found or MyAnimeList responded with a 404.");
                case 405: throw new Error("Requested Method is not supported for resource. Only GET requests are allowed.");
                case 429: throw new Error("You are being rate limited by Jikan or MyAnimeList is rate-limiting our servers.");
                case 500: throw new Error("Something is not working on our end. Please report the issue.");
                case 503: throw new Error("The service is unavailable.");
                default: throw new Error("An error occurred.");
            }
        }
        return response.json();
    }
    // END TO HANDLE REQUEST ERRORS

    //scroll to top btn
    const scrollToTopBtn = document.getElementById('scrollBtn');
    window.onscroll = function() {scrollToTopFunction()};

    function scrollToTopFunction() {
        if (document.body.scrollTop > 500 || document.documentElement.scrollTop > 500) {
            scrollToTopBtn.style.display = "block";
        } else {
            scrollToTopBtn.style.display = "none";
        }
    }

    function topFunction() {
        document.body.scrollTop = 0;
        document.documentElement.scrollTop = 0;
    }
    scrollToTopBtn.addEventListener('click', topFunction);
    //scroll to top btn done
});