document.addEventListener("DOMContentLoaded", () => {
    console.log("the DOM has loaded yo");

    // Handles sidebar toggle
    const toggleList = document.getElementById('toggle-list');
    const listDiv = document.getElementById('myList');
    toggleList.addEventListener('click', () => {
        console.log('toggle list button pressed');
        if (listDiv.classList.contains("hidden")) {
            listDiv.classList.remove("hidden");
            toggleList.innerText = "Hide My List";
        } else {
            listDiv.classList.add("hidden");
            toggleList.innerText = "Show my List";
        }
    });

    const closeOverlayBtn = document.getElementById('myList-closeBtn');
    closeOverlayBtn.addEventListener('click', () => {
        listDiv.classList.add("hidden");
        toggleList.innerText = "Show my List";
    });

    //handles deciding what list to search
    const animeSearchToggle = document.getElementById('search-anime');
    const mangaSearchToggle = document.getElementById('search-manga');
    animeSearchToggle.classList.add('active-search-toggle');
    mangaSearchToggle.classList.add('inactive-search-toggle');

    animeSearchToggle.addEventListener('click', function () {
        mangaSearchToggle.classList.remove('active-search-toggle');
        mangaSearchToggle.classList.add('inactive-search-toggle');

        animeSearchToggle.classList.remove('inactive-search-toggle');
        animeSearchToggle.classList.add('active-search-toggle');
    });

    mangaSearchToggle.addEventListener('click', function () {
        animeSearchToggle.classList.remove('active-search-toggle');
        animeSearchToggle.classList.add('inactive-search-toggle');

        mangaSearchToggle.classList.remove('inactive-search-toggle');
        mangaSearchToggle.classList.add('active-search-toggle');
    });

    const formSearch = document.getElementById('search-form');
    formSearch.addEventListener('submit', (event) => {
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

        prevBtn.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                fetchData();
            }
        });

        nextBtn.addEventListener('click', () => {
            if (currentPage < lastVisiblePage) {
                currentPage++;
                fetchData();
            }
        });

        fetch(urlQuery)
            .then(response => {
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
            })
            .then(response => {
                console.log(response);
                const paginationHolders = document.getElementsByClassName("pagination-holder");
                for(let i = 0; i < paginationHolders.length; i++){
                    paginationHolders[i].style.display = 'flex';
                }
    
                // Update the text in the pagination holder
                const totalResults = response.pagination.items.total; 
                lastVisiblePage = response.pagination.last_visible_page;
                currentPage = response.pagination.current_page;
                const perPage = response.pagination.items.per_page;
    
                const pageNumberElements = document.getElementsByClassName('page-number');
                for(let i = 0; i < pageNumberElements.length; i++){
                    pageNumberElements[i].innerText = `${currentPage}/${lastVisiblePage}`;
                }
    
                const displayNumberTextElements = document.getElementsByClassName('display-number-text');
                for(let i = 0; i < displayNumberTextElements.length; i++){
                    displayNumberTextElements[i].innerText = `Showing ${perPage} of ${totalResults} results`;
                }
    
                // Enable or disable 'prev' and 'next' buttons as necessary
                prevBtn.disabled = currentPage === 1;
                nextBtn.disabled = currentPage === lastVisiblePage;

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
                        creator: creator || "The author was not listed.",
                        blurb : item?.synopsis || "No synopsis was provided.",
                        score: item?.score || "No score was found.",
                        status: item?.status || "Status unclear.",
                        link: item.url
                    }
                }
                )
                console.log('this is what we got for the search result obj: ', dataResponseList);

                if (dataResponseList.length < 1) {
                    console.log('no results bro try again')
                }
                // handle data here
                const resultsDivList = dataResponseList.map(item => {
                    //creates an animanga card per item from search query
                    const animangaCard = document.createElement('div');
                    animangaCard.classList.add('animanga-card');


                    //adds header div -- holds title only
                    const animangaHeader = document.createElement('div');
                    animangaHeader.classList.add('animanga-header');
                    animangaCard.appendChild(animangaHeader);
                    const animangaTitle = document.createElement('span');
                    animangaTitle.classList.add('animanga-title');
                    animangaTitle.innerHTML = item.title;
                    animangaHeader.appendChild(animangaTitle);


                    //adds body div -- pic and info divs separatedly
                    const animangaBody = document.createElement('div');
                    animangaBody.classList.add('animanga-body');
                    const animangaPicDiv = document.createElement('div');
                    animangaPicDiv.classList.add('animanga-pic-div');
                    const animangaInfoDiv = document.createElement('div');
                    animangaInfoDiv.classList.add('animanga-info-div');
                    animangaBody.appendChild(animangaPicDiv);
                    animangaBody.appendChild(animangaInfoDiv);
                    animangaCard.appendChild(animangaBody);


                    //adds footer div -- button holder
                    const animangaFooter = document.createElement('div');
                    animangaFooter.classList.add('animanga-footer');
                    animangaCard.appendChild(animangaFooter);


                    //targets the unordered list in 'mylist'
                    const myListUl = document.getElementById('myListItems');

                    //creates the animanga picture and appends it to the animanga pic div
                    const animangaPicture = document.createElement('img');
                    animangaPicture.classList.add('animanga-picture');
                    animangaPicture.src = item.picture;
                    animangaPicDiv.appendChild(animangaPicture);


                    //creates the animanga summary text block
                    const animangaSummary = document.createElement('p');
                    animangaSummary.classList.add('animanga-summary');
                    animangaSummary.innerHTML = "<strong>Summary: </strong>"+item.blurb;
                    animangaInfoDiv.appendChild(animangaSummary);

                    //creates the animanga creator text
                    const animangaCreator = document.createElement('p');
                    animangaCreator.classList.add('animanga-creator');
                    animangaCreator.innerHTML = "<strong>Creator: </strong>"+item.creator;
                    animangaInfoDiv.appendChild(animangaCreator);

                    //creates the animanga score text
                    const animangaScore = document.createElement('p');
                    animangaScore.classList.add('animanga-score');
                    animangaScore.innerHTML = "<strong>Score: </strong>"+item.score;
                    animangaInfoDiv.appendChild(animangaScore);

                    //creates the animanga status text
                    const animangaStatus = document.createElement('p');
                    animangaStatus.classList.add('animanga-status');
                    animangaStatus.innerHTML = "<strong>Status: </strong>"+item.status;
                    animangaInfoDiv.appendChild(animangaStatus);


                    //adds the 'add to list' button to animanga footer -- also holds the functionality for adding to list and removing from list
                    const addToListBttn = document.createElement('button');
                    addToListBttn.classList.add('add-to-list-bttn');
                    addToListBttn.innerHTML = "Add to List";
                    addToListBttn.addEventListener('click', () => {
                        console.log('add to list button pressed');
                        const myListLi = document.createElement('li');
                        myListLi.innerHTML = item.title;
                        myListLi.classList.add('my-list-item');
                        myListUl.appendChild(myListLi);

                        const notification = document.getElementById('notification');
                        const notificationText = document.getElementById('notification-text');
                        notificationText.innerText = `${item.title} has been added to your list!`;
                        notification.classList.remove('hidden');
                        setTimeout(() => {
                            notification.classList.add('hidden');
                        }, 3000);
                        const removeFromListBttn = document.createElement('button');
                        removeFromListBttn.classList.add('remove-from-list-bttn');
                        removeFromListBttn.innerHTML = "X";
                        removeFromListBttn.addEventListener('click', () => {
                            console.log('remove from list button pressed');
                            myListLi.remove();
                        })
                        myListLi.appendChild(removeFromListBttn);
                    })
                    //adds the actual 'add to list button' to the animanga card
                    animangaFooter.appendChild(addToListBttn);

                    //responsible for creating the 'read more' button in footer
                    const animangaReadMore = document.createElement('button');
                    animangaReadMore.classList.add('animanga-read-more');
                    animangaReadMore.innerText = "Visit the MyAnimeList page!";
                    animangaReadMore.addEventListener('click', () => {
                        console.log('read more button pressed');
                        window.open(item.link, '_blank')

                    });
                    animangaFooter.appendChild(animangaReadMore);


               
                    //returns each animanga card
                    return animangaCard
                })
                //targets =search=results= div and clears it
                const resultsHolder = document.getElementById('search-results');
                resultsHolder.innerText = '';
                //adds an animanga card to results div per result
                resultsDivList.forEach(element => {
                    resultsHolder.appendChild(element);
                })
            })
            .catch(error => console.error('Error:', error.message));
    })

})