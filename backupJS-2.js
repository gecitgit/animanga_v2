document.addEventListener("DOMContentLoaded", () => {
    console.log("the DOM has loaded yo");

    // Handles sidebar toggle
    const toggleList = document.getElementById('toggle-list');
    const listDiv = document.getElementById('myList');
    toggleList.addEventListener('click', toggleListHandler);

    function toggleListHandler() {
        console.log('toggle list button pressed');
        if (listDiv.classList.contains("hidden")) {
            listDiv.classList.remove("hidden");
            toggleList.innerText = "Hide My List";
        } else {
            listDiv.classList.add("hidden");
            toggleList.innerText = "Show my List";
        }
    }

    const closeOverlayBtn = document.getElementById('myList-closeBtn');
    closeOverlayBtn.addEventListener('click', closeOverlayHandler);

    function closeOverlayHandler() {
        listDiv.classList.add("hidden");
        toggleList.innerText = "Show my List";
    }

    //handles deciding what list to search
    const animeSearchToggle = document.getElementById('search-anime');
    const mangaSearchToggle = document.getElementById('search-manga');
    animeSearchToggle.classList.add('active-search-toggle');
    mangaSearchToggle.classList.add('inactive-search-toggle');

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

    const formSearch = document.getElementById('search-form');
    formSearch.addEventListener('submit', formSubmitHandler);

    function formSubmitHandler(event) {
        event.preventDefault();

        const userQuery = event.target[0].value;
        console.log('this is what you are searching for: ', userQuery);

        let limit = 10;
        let currentPage = 1;
        let lastVisiblePage = 1;
        let urlQuery = '';

        if (animeSearchToggle.classList.contains('active-search-toggle')) {
            urlQuery = `https://api.jikan.moe/v4/anime?q=${userQuery}&page=${currentPage}&limit=${limit}&order_by=score&sort=desc&min_score=5&sfw`
        } else if (mangaSearchToggle.classList.contains('active-search-toggle')) {
            urlQuery = `https://api.jikan.moe/v4/manga?q=${userQuery}&page=${currentPage}&limit=${limit}&order_by=score&sort=desc&min_score=5&sfw`
        }

        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');

        prevBtn.addEventListener('click', prevBtnHandler);

        function prevBtnHandler() {
            console.log('prev button pressed')
            if (currentPage > 1) {
                currentPage--;
                fetchData();
            }
        }

        nextBtn.addEventListener('click', nextBtnHandler);

        function nextBtnHandler() {
            console.log('next button pressed')
            if (currentPage < lastVisiblePage) {
                currentPage++;
                fetchData();
            }
        }

        fetch(urlQuery)
            .then(handleErrors)
            .then(processResponse)
            .catch(error => console.error('Error:', error.message));
    }

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

    function processResponse(response) {
        console.log('response was a success and here it is: ', response);
        const dataResponseList = response.data.map(item => {
            let creator;
            if (animeSearchToggle.classList.contains('active-search-toggle')) {
                creator = item?.studios[0]?.name || "The studio was not listed.";
            } else if (mangaSearchToggle.classList.contains('active-search-toggle')) {
                creator = item?.authors[0]?.name || "The author was not listed.";
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
    
        const resultsDivList = dataResponseList.map(item => {
            const animangaCard = document.createElement('div');
            animangaCard.classList.add('animanga-card');
    
            const animangaHeader = document.createElement('div');
            animangaHeader.classList.add('animanga-header');
            animangaCard.appendChild(animangaHeader);
            const animangaTitle = document.createElement('span');
            animangaTitle.classList.add('animanga-title');
            animangaTitle.innerHTML = item.title;
            animangaHeader.appendChild(animangaTitle);
            return animangaCard;
        });
    
        const resultsHolder = document.getElementById('search-results');
        resultsHolder.innerText = '';
        resultsDivList.forEach(element => {
            resultsHolder.appendChild(element);
        });
    
        // Pagination Handling
        const paginationHolder = document.getElementById('pagination-holder');
        const displayNumberText = document.getElementById('display-number-text');
        const pageNumber = document.getElementById('page-number');
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
    
        const paginationData = response.pagination;
        console.log("this is the pagination specific data: ", paginationData);
    
        displayNumberText.textContent = `Showing ${response.data.length} of ${paginationData.items.total} results`;
        pageNumber.textContent = `Page ${paginationData.current_page} of ${paginationData.last_visible_page}`;
    
        // Shows paginationHolder once there is more than one response.  Adds 
        if (paginationData.items.total >= 1) {
            paginationHolder.style.display = 'flex';
        } else {
            paginationHolder.style.display = 'none';
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
    
    
    
})
