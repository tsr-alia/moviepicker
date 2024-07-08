// DOM Elements
let contentMoviePicker = document.querySelector("#moviePicker");
let formMoviePicker = document.querySelector("#moviePickerForm");
let btNext = document.querySelectorAll("#moviePickerForm .btNext");
let btBack = document.querySelectorAll("#moviePickerForm .btBack");
let btSendMovieForm = document.querySelector("#btSendMovieForm");
let elRestartButton = document.querySelector("#elRestartButton");
let labelFieldsMoviePicker = document.querySelectorAll("#moviePickerForm label");
let inputFieldsMoviePicker = document.querySelectorAll("#moviePickerForm input");
let elMovieModal = document.querySelector("#movieModal");
// global variables
let currentYear = new Date().getFullYear();
let urlShows = "http://localhost:3000/shows";
// let urlTags = "http://localhost:3000/tags";
// text to be shown for different tags, tbd: incorporate this in the database
let tagsToText = {
    alone: "Alone",
    friends: "With Friends",
    withFamily: "With Relatives",
    withChildren: "With young Children",
    date: "On a Date",
    happy: "in a happy mood",
    neutral: "in a neutral mood",
    sad: "in a sad mood",
    book: "based on a book",
    christmas: "Christmas",
    italoWestern: "Italo Western",
    legalDrama: "Courtroom Drama",
    superhero: "Superhero",
    trueStory: "based on a true story",
    franchise: "part of a franchise",
    fantasy: "Fantasy"
}

// MOVIE PICKER FORM
// show "next" buttons and change style of checked input fields in form
// tbd: treat the "Any Genre" button like radio button
function styleCheckedInputFields() {
    if (this.getAttribute("type") === "radio") {
        let idSection = this.getAttribute("data-id");
        let radioButtons = formMoviePicker.querySelectorAll(`[data-id-section="${idSection}"] input`);
        for (let radioButton of radioButtons) {
            if (!radioButton.checked) {
                document.querySelector(`label[for="${radioButton.id}"`).classList.remove("checked");
            } else {
                document.querySelector(`label[for="${radioButton.id}"`).classList.add("checked");
            }
        }
    }
    if (this.getAttribute("type") === "checkbox") {
        document.querySelector(`label[for="${this.id}"`).classList.toggle("checked");
    }
}

function showNextButton() {
    let id = this.getAttribute("data-id");
    let button = document.querySelector(`.btNext#${id}`);
    let inputFields = formMoviePicker.querySelectorAll(`[data-id-section="${id}"] input`);
    let fieldStatus;
    for (let field of inputFields) {
        if (field.checked) {
            fieldStatus = "checked";
            break;
        }
    }
    if (fieldStatus === "checked" && button.classList.contains("hide")) {
        button.classList.remove("hide");
    } else if (fieldStatus !== "checked") {
        button.classList.add("hide");
    }
}

function showSection() {
    let idShow = this.getAttribute("data-id-show");
    document.querySelector(`#${idShow}`).classList.remove("hide");
    let idHide = this.getAttribute("data-id-hide");
    document.querySelector(`#${idHide}`).classList.add("hide");
}

// MOVIE RECOMMANDATION MODAL
function closeModal() {
    elMovieModal.classList.add("hide");
    document.querySelector("header nav").classList.remove("hide");
    elRestartButton.classList.remove("hide");
}

// MOVIE PICKER FUNCTIONALITY
// fetch data from API
async function getData(url, action) {
    try {
        const response = await fetch(url);
        if (response.status!==200) {
            throw Error('There was a problem connecting to the API.');
        }
        const data = await response.json();
        return await action(data);
    } catch (error) {
        alert("The following error has occured###: " + error)
    }
}

// get genres of movies and dynamically populate input fields in movie picker form, tbd: dynamically populate input fields for all questions in movie picker form
async function populateGenres(data) {
    let genres = [];
    for (let item of data) {
        for (let genre of item.genres) {
            if (!genres.find(e => e.id === genre.id)) {
                genres.push(genre);
            }
        }        
    }
    genres.sort((a,b) => {
        if (a.name > b.name) {
            return 1;
            }
            if (a.name < b.name) {
            return -1;
            }
            return 0;
        });
    let elGenreList = document.querySelector("#genreList");
    let content = `<label for="anyGenre"><input type="checkbox" id="anyGenre" name="genre" value="anyGenre" data-id="genres">Any Genre!</label>`;
    for (let genre of genres) {
        content += 
        `<label for="${genre.id}"><input type="checkbox" id="${genre.id}" name="genre" value="${genre.id}" data-id="genres">
        ${genre.name}</label>`;
    }
    elGenreList.innerHTML = content;
    for (let inputfield of document.querySelectorAll("#genreList input")) {
        inputfield.addEventListener("click", showNextButton);
        inputfield.addEventListener("click", styleCheckedInputFields);
    }
}

// MOVIE PICKER
async function pickAMovie() {
    let formData = grabFormData();
    // console.log("Form Data inside moviePicker: " + JSON.stringify(formData));
    let queryURL = createQueryString(formData);
    // console.log("queryURL inside moviePicker: " + queryURL);
    let movie = await getData(queryURL, async (data) => {
        return filterMovies(data, formData)});
    // console.log("movie inside moviePicker befor shwoing: ");
    // console.log(movie);
    showMovie(movie, formData);
}
// grabFormData
function grabFormData() {
    let mood = formMoviePicker.querySelector('input[name="mood"]:checked').value;
    let occasion = formMoviePicker.querySelector('input[name="occasion"]:checked').value;
    let genres = [];
    for (let genre of formMoviePicker.querySelectorAll('input[name="genre"]:checked')) {
        genres.push(genre.value);
    };
    let releaseYear = formMoviePicker.querySelector('input[name="releaseYear"]:checked').value;
    let streaming = [];
    for (let service of formMoviePicker.querySelectorAll('input[name="streaming"]:checked')) {
        streaming.push(service.value);
    };
    let additionalTags = [];
    for (let tag of formMoviePicker.querySelectorAll('input[name="tag"]:checked')) {
        additionalTags.push(tag.value);
    }; 
    let formData = {
        streaming: [...streaming],
        mood: mood,
        occasion: occasion,
        genres: [...genres],
        releaseYear: releaseYear,
        additionalTags: additionalTags 
    };
    return formData;
}

// create query string to fetch a selection of movies
function createQueryString(formData) {
    // tbd dynamically set streaming location
    let streamingLocation = "de";
    let streamingQuery = formData.streaming.join("|"); 
    let queryURL = urlShows + `?streaming_${streamingLocation}_like=(${streamingQuery})&mood_like=${formData.mood}&occasion_like=${formData.occasion}`;
    return queryURL;
}
// further filter selection of movies and return one result
async function filterMovies(movieData, formData) {
    console.log("movie Data before filterung:");
    console.log(movieData);
    if (movieData.length === 0) {
        return false;
    }
    let result = [...movieData];
    let shuffledData = movieData.sort((a, b) => 0.5 - Math.random());
    let oldResult = [];
    if (formData.genres.length > 0 && !formData.genres.includes("anyGenre")) {
        oldResult = [...result];
        // TBD: implement another filter logic that returns an array of movies that match the MOST genres from the form data
        let shuffledGenres = formData.genres.sort((a, b) => 0.5 - Math.random());
        result = shuffledData.filter( (movie) => {
            return movie.genreList.some( (item) => {
                return shuffledGenres.includes(item);
            });
        });
        if (result.length === 0) {
            result = [...oldResult];
        }    
    }
    if (result.length > 1) {
        oldResult = [...result];
        result = movieData.filter( (movie) => {
            return matchReleaseYear(formData.releaseYear, movie);
        });
        if (result.length === 0) {
            result = [...oldResult];
        }    
    }

    if (result.length > 1 && formData.additionalTags.length > 0) {
        let shuffledTags = formData.additionalTags.sort((a, b) => 0.5 - Math.random());
        oldResult = [...result];
        result = shuffledData.filter( (movie) => {
            return movie.additionalTags.some( (item) => {
                return shuffledTags.includes(item);
            });
        });
        if (result.length === 0) {
            result = [...oldResult];
        }    
    }  
    result.sort((a, b) => 0.5 - Math.random());
    console.log("final result(s): ");
    console.log(result);
    return result[0];
}
// check if the release year matches the users' input
function matchReleaseYear(releaseYear, movie) {
    if (releaseYear !== "noRestriction") {
        if (movie.releaseYear >= (currentYear - releaseYear)) {
            return true;
         } else {
            return false;
        }
    } else {
        return true;
    }
}
// show movie in modal and comapre with user input
function showMovie(movie, formData) {
    elMovieModal.classList.remove("hide");
    contentMoviePicker.classList.add("hide");
    let content = ``;
    if (!movie) {
        // alternativly: put the html inside the moviepicker.html and populate the fields via innerHTML/textContent
        content += `
        <section class="frame noResults">
            <section>
                <p>Sorry, we couldn't find any results!</p>
            </section>
            <section class="watchLink">
                <a href="/project1/moviepicker.html"><i class="fa-solid fa-arrows-rotate"></i> Restart the Movie Picker</a></section>
                <div id="closeBt"><i class="fa-solid fa-x"></i></div>
            </section>
        </section>
        `;
    } else {
        content += `
        <section class="frame">
            <h2>We found a movie for you!</h2>
            <section class="movieColumns">
                <div><img id="movieThumbnail" src="${movie.imageSet.verticalPoster.w240}"></div>
                <section class="movieColumn">
                <section>
                    <h3>${movie.title}</h3>
                    <p>${movie.overview}</p>
                    <p><strong>Released in ${movie.releaseYear}</strong></p>
                </section>
                <section class="tagLists">
                    <section class="tagList">
                    <h2>Genres</h2>
                    <ul class="tagList">
                    ${createResultTags(movie, formData, "genres")}
                    </ul>
                    </section>`;
        if (movie.additionalTags) {
            content += `
                <section class="tagList">
                <h2>Additional Tags</h2>
                <ul class="tagList">
                ${createResultTags(movie, formData, "additionalTags")}
                </ul>
                </section>
            `;
        }
        content += `
                </section>
                </section>        
            </section>
            <section class="tagLists">
                <section class="tagList">
                <h2>Suitable for watching...</h2>
                <ul class="tagList">
                ${createResultTags(movie, formData, "occasion")}
                 ${createResultTags(movie, formData, "mood")}
                </ul>
                </section>
            </section>
           `;
        
        let shuffledsteamingOption = movie.streamingOptions.de.sort((a, b) => 0.5 - Math.random());
        // tbd show all streaming options
        for (let steamingOption of shuffledsteamingOption) {
            if (formData.streaming.includes(steamingOption.service.id)) {
                content += ` <section class="watchLink"><a href="${steamingOption.link}" target="_blank">Watch now on ${steamingOption.service.name} <i class="fa-solid fa-film"></i></a></section>`;
                break;
            }
        }
        content += `
        <section class="watchLink">
            <a id="btMoviePicker" href="/project1/moviepicker.html"><i class="fa-solid fa-arrows-rotate"></i> Restart the Movie Picker</a>
        </section>
        <div id="closeBt"><i class="fa-solid fa-x"></i></div>
        </section>
        `;
        // TBD: Get another movie recommandation
        // <a id="btRestartMoviePicker" href="#"><i class="fa-solid fa-arrows-rotate"></i>Get Another Movie Recommandation</a>
        // document.querySelector("#btRestartMoviePicker").addEventListener("click", filterMovies(movieData, formData))
        
    }
    console.log(formData);
    console.log(movie);
    elMovieModal.innerHTML = content;
    contentMoviePicker.classList.add("hide");
    document.querySelector("header nav").classList.add("hide");
    document.querySelector("#closeBt").addEventListener("click", closeModal);
}
// create tags for movie and check against user input
function createResultTags(movie, formData, dataCategory) {
    let tagList = "";
    for (let item of movie[dataCategory]) {
        // check if users formData and data in movie object match
        let tagClass = "tag";
        if (dataCategory === "genres") {
            tagList += `<li class="${tagClass}">${item.name}`
            if (formData[dataCategory].includes(item.id)) {
                tagList += "<i class='fa-solid fa-check'></i>";
            }
            tagList += `</li>`;
        } else {
            tagList += `<li class="${tagClass}">${tagsToText[item]}`
            if (formData[dataCategory].includes(item)) {
                tagList += "<i class='fa-solid fa-check'></i>";
            }
            tagList += `</li>`;
        }
    }
    tagList += "";
    console.log(tagList);
    return tagList;
}

// CALL Initializing FUNCTIONS
async function callPopulateGenres() {
    await getData(urlShows, populateGenres);

    // for debugging
    // activate form and populate with diffrent values .value = ""
    // alternative: autofill (google extension)
    // formMoviePicker.querySelector('input[value="netflix"]').checked = true;
    // formMoviePicker.querySelector('input[value="prime"]').checked = true;
    // formMoviePicker.querySelector('input[value="happy"]').checked = true;
    // formMoviePicker.querySelector('input[value="friends"]').checked = true;
    // formMoviePicker.querySelector('input[value="drama"]').checked = true;
    // formMoviePicker.querySelector('input[value="20"]').checked = true;
    // formMoviePicker.querySelector('input[value="book"]').checked = true;
    // pickAMovie();
}
callPopulateGenres()


// EVENT LISTENERS
for (let inputfield of inputFieldsMoviePicker) {
    inputfield.addEventListener("click", showNextButton);
    inputfield.addEventListener("click", styleCheckedInputFields);
}
for (let bt of btNext) {
    bt.addEventListener("click", showSection);
}
for (let bt of btBack) {
    bt.addEventListener("click", showSection);
}

btSendMovieForm.addEventListener("click", pickAMovie);

// For Debugging:

// let formData =
// {
//     "streaming": [
//         "netflix",
//         "prime",
//         "hbo",
//         "disney"
//     ],
//     "mood": "neutral",
//     "occasion": "alone",
//     "genres": [
//         "action",
//         "adventure"
//     ],
//     "releaseYear": "noRestriction",
//     "additionalTags": []
// };

// let movie = {
//     "itemType": "show",
//     "showType": "movie",
//     "id": "297",
//     "imdbId": "tt0245429",
//     "tmdbId": "movie/129",
//     "title": "Spirited Away",
//     "overview": "Chihiro wanders into a magical world where a witch rules -- and those who disobey her are turned into animals.",
//     "releaseYear": 2001,
//     "originalTitle": "千と千尋の神隠し",
//     "mood": [
//         "sad",
//         "neutral",
//         "happy"
//     ],
//     "occasion": [
//         "alone",
//         "friends",
//         "withFamily",
//         "withChildren",
//         "date"
//     ],
//     "additionalTags": [
//         "fantasy"
//     ],
//     "genreList": [
//         "adventure",
//         "animation",
//         "family"
//     ],
//     "genres": [
//         {
//             "id": "adventure",
//             "name": "Adventure"
//         },
//         {
//             "id": "animation",
//             "name": "Animation"
//         },
//         {
//             "id": "family",
//             "name": "Family"
//         }
//     ],
//     "directors": [
//         "Hayao Miyazaki"
//     ],
//     "cast": [
//         "Rumi Hiiragi",
//         "Miyu Irino",
//         "Mari Natsuki",
//         "Takashi Naito",
//         "Yasuko Sawaguchi",
//         "Tsunehiko Kamijô",
//         "Takehiko Ono"
//     ],
//     "rating": 84,
//     "imageSet": {
//         "verticalPoster": {
//             "w240": "https://cdn.movieofthenight.com/show/297/poster/vertical/en/240.jpg?Expires=1749522848&Signature=THRUiqVcqUDHNaOph9EWhS47a5DMMkNsR5ONF990i7jEmbmVSVBKo~3arbKTqk5FaPnUe27twjDHCYqzZcXAYT9irf19ajQQIhAyMfWIU1xYjReqaNXfUsHFnw9rwT68c9p41eM68VTAV4vI~HQbzHgj1Rdfv3fFPp9CMtgXe5vkMIZ78tG8aMMe1TEg3Rr5MUCAOKLEJK6eMBZR-HFEPn8G5-4O7eoV5BK4Dd5Bn7icAcQy6k~1WmKYlP3q8v5ZOnBISpSyTRGlmJYoq0RIphJodk54Tqw7NnnCoig4TwTji9fQJFbiJ0A7Ipxoh3Wm2srb6ztRBL~12PEFVYBCOw__&Key-Pair-Id=KK4HN3OO4AT5R",
//             "w360": "https://cdn.movieofthenight.com/show/297/poster/vertical/en/360.jpg?Expires=1749522848&Signature=iEDvRzK3IZMJZFo9PwSHAyl8r11rvlDozGM-B1ZPRiEUTNLV8eLQ8IRJBp8IBB8gtZT7LIvwkflcBG-eIOj08br2OHNH~j9CPzLsZTY~gn6hns1e2kv6KbkW6VQpNltNmtj7hv8HeJfrFvx-ei2OAcqXX2hi4oWFglf-DOb9my6ovO245aZFztsrOHj8wS5fi9bJhbyhOvCAVZuxRgLPWCocsRjYIddNY5oIGfa9h5qzDuoOYtzx-Y0nVYsLv-N1YnAlyTGZ5ltKKidAayvNc4ZwAnSUN4ahm3nbJrwI6hx1js7R8PcyYQI4odDAB1BvEgtSaG8yONmRTNNZR2Xx2Q__&Key-Pair-Id=KK4HN3OO4AT5R",
//             "w480": "https://cdn.movieofthenight.com/show/297/poster/vertical/en/480.jpg?Expires=1749522848&Signature=BpnWqEilvy0WqN8tom-INzT-~YrDi3zWJYuVSlgqr5cm~xW1EWv0IGcyn6QCpboKmZaN5sbtmV7GLZOcqWoJ-hSaZR0q1GQKa9gClR1LUP4t6HA0VmEgyJ-K22e4iUB280sF1dnJQr1hw3lk2Iu6bWFmvSTXdt1yedev2ODoLULO2TheRmhSOiWBiKq4iQHTvaD86sls5patSnXgxn-2Rpvx0jveuvnOVWp9meGyWwHa2BqM8Tdvnl3I9s-BLRqdjbC7kFy6x36l9YKthyMs9WOiFNHuMPEuHmcON9MXEgLeaFRnp2IkT-A38ASmJKcLBNWP6EbljChVyhRMTwsF5w__&Key-Pair-Id=KK4HN3OO4AT5R",
//             "w600": "https://cdn.movieofthenight.com/show/297/poster/vertical/en/600.jpg?Expires=1749522848&Signature=Z1unJx4kc44psMK3iQsyVSB8epGsyRUFdxb0SHXJ6I5ZG-1wWcR04PvJPqHkrHdrZGJGs~lOYDL2zapIkiNzQ37bKC5dDOdASvz~EOS-Xcxfbk5SVhInqFvwMNOfgMAXL3GEjtnZdB3LjuYL805Y5qYhLs8PdQ~egUY-Vm-BLHjR~NsRTQ8JjC-OW3~JiG02u6DFDPeZQMtqIVgOuCfg11ohgdfyL8k2w2n576hdZ0D12NNJc6isZ4aPLuu8G8cb9cTt3D7GLWFZqEWqoHreYIzN4BfKj9UAFFADeGbNbYPr85Bgwc6XeZlyVCaEz3-hGT5LLwHFDxsmmEdvALAn5A__&Key-Pair-Id=KK4HN3OO4AT5R",
//             "w720": "https://cdn.movieofthenight.com/show/297/poster/vertical/en/720.jpg?Expires=1749522848&Signature=ZZ2BiwKMFwpaKZwU7XTGgVg9BpXRDtVWZPLF7eb4kPKMrnFfA3vmEcsxuoL0hDMd0AEP5EjDEPy8HMGW9AFVKx1Ip29jUUm5dammLzw2wjNNdUp8FZiSQIh3AM-pBopO~flIgrhDDXd9vjGcYsNJx4bJ53E1PS5d7el7T2UyWuNdFrEZOB5BBCUqa5gmc1~sSktgKCBS52dtBiT59ZAb53yb2AjdfkrWIUDFKI6W4Qb79DdaGRDZUf-YRQfckA9xM00WGYW4veTZxvrHNe5P1l3H~Cc6Oi2bT7RE7k-I9mcUNxbD9bBrhi3li3rf9m~YdRXQYCZqhmNvjPGHA4vr1Q__&Key-Pair-Id=KK4HN3OO4AT5R"
//         },
//         "horizontalPoster": {
//             "w360": "https://cdn.movieofthenight.com/show/297/poster/horizontal/en/360.jpg?Expires=1749522853&Signature=V~yuEFDexG1IauEMOo9YNtyy2C7WcS5vya75in9THTYE9mTJ1bCcVOjZ6P8r~B8ZxSusJTT4HoJbATiuxIv9FNvWTmKQ7tZQsySrZeZNFJaoWfQ3Pn6llotgEfNvDO8FJHUDmNkqDnWlTnvunA~tzDuK9yDxFxshj2JwxOZL6~h8oRiV~fKdvDlmUVidDEHrxif8PWt4paesv6PffsGBonD25ovKP8xQxhLMHN0Vk8qzxvYGPk267-ZuEX4Uu3jP1kncmBelDYx88LQ4uAYCw6r-VVUXm684C8FWC60m5q6HpqtqStmLB7fK2x8YYHSq0jeTacAuUnhgwZYjnmtzPw__&Key-Pair-Id=KK4HN3OO4AT5R",
//             "w480": "https://cdn.movieofthenight.com/show/297/poster/horizontal/en/480.jpg?Expires=1749522853&Signature=Zo6IULU5n7KyvUzrYlPIRkIKnMa19tGgtQUjhkpH9itrvztzttuJj5OwjfFG8VcgGYO34y2Lx~c9fW2nD3qG9rYmcnlTMDlM6B1mcup~C9gbUg3tPIumMhbsYyWKWINHCT2WrHPsSyZQUGmcQjELwwWcRgj0jsDd3iy72Txwdknj3aPjnQ3D6vA9GatnmvFaTANDkOaozUhyIkJrB6DTAw4fqu2aisxgliVPE1j2eEhJlfIl-HHrpdArpB2Wq3u7zX7aFW~R00MV4ubhLnmICUJr4XpN0wL7U739hpWsngKrHW5lFlE3~lP0Yd0zuZsWOjkYh0i2I~V5tvINGQ67Uw__&Key-Pair-Id=KK4HN3OO4AT5R",
//             "w720": "https://cdn.movieofthenight.com/show/297/poster/horizontal/en/720.jpg?Expires=1749522853&Signature=FCEwcYOH2lhyPLUTia5RbFd42nbV-XXsRIxppH4YZHZ9WAsu9dxP2DBoXd0GElDSeDMSmTUzxTCFAGu3rLpEFiSlnYF96qPgrhH7Tap3VwensPyc8HR6500j8vXVXaT5jWmvEzbA6PA3a87pi2NZ1vUTPdkgVYVyXlxZdd-Xdmb6kTOUaYbyYezpiczQDZmFCQBQ1xHAwy5LBXHvqndgLG5tc~h4Z7CHGNBdSyxQcjoH0ooCMBWpewsGHrmONAPklUUItVQzh3pUcBRalfAKUYhoy8MXtiNI~SGJgvOjGp067-PhbKtuTTAuVM8u0PACdjvXtFsEPa3YtMO5IIZmzw__&Key-Pair-Id=KK4HN3OO4AT5R",
//             "w1080": "https://cdn.movieofthenight.com/show/297/poster/horizontal/en/1080.jpg?Expires=1749522853&Signature=ecCxdz3NvE7N84Zgi8R-8wpunZ2pNcIVcLJEojr0PFAvAt4iDMoUh8dnesqCtNVDQFQr9~1MhIluAjKtuUUkBljieVgKscehDQRU4bH-7CByx0XCMUKBmI6KcH1IY0N8cvAtXnKukDLor675rxjVDaF2xdRMdAEdoHSh6neyT4EosPjz0q3DPzf8XbW8PXTN1lDA~8AQC06aWO4VBAFpy9dfF1DkYus34mRDUfIASDBgaA1PB7ZHeIgRmghJQmGy5tg08GNsWVjrRzieXXgu9V7dRskfZo1o5MrbZ2YQ2MTSGv3GsDopgejkXbpDlz60~GGbIBNwf~m9pnsz7ESySA__&Key-Pair-Id=KK4HN3OO4AT5R",
//             "w1440": "https://cdn.movieofthenight.com/show/297/poster/horizontal/en/1440.jpg?Expires=1749522853&Signature=J1LgKAcwA6KKO8h7aEtbIn8RInknDuoHt3Yz86J2SyqIff2ZIwqWLLgYt48mgPP~dwAuNeY7SKIgepOhb9~WywNaKSnfAeLVeLLyLMtMx1d0~YTYUJQ~mD6lCWK2PKAQNZlUR6N-wm9wPKmCVgyDhTKnS0xLYDTCJb4d6CJ-APDZtEFejrGWH5e2aZrKkmPDPK4hE6oAQ14K1O7mrDtnt9EoF4mr04maRI13GK3ISXLoS6TvTGzHALo8XSaVrGcDMRM9f5DoHfQUdVAEt6CFpUVvLMJDQ9QC8jMrjbyzHa5QBu-oUFaZ7jB6Z6J-4UeB0exxxDZueamDdRJqeUCO-g__&Key-Pair-Id=KK4HN3OO4AT5R"
//         },
//         "verticalBackdrop": {
//             "w240": "https://cdn.movieofthenight.com/show/297/backdrop/vertical/240.jpg?Expires=1749522834&Signature=ivPC1Ks4~ciHxXHUUEzVnqOUORT4qMFjObJu8u~ORAlvDrP3YI0XWFSI49s2Luw9RHFXtFV6e170KJUQE~~YyfbvO3I613FTUJmX6F30Lrfzjb3Xn7ZEufj5R9ugx8IDnm1FIMKtvQ9f4UblvR97x~UQLiXrPxf3Xxr44Esx79MZTQziBtYMDP6TCgPbjPnyjxBkGHbk9LVAnuc58RqFjof-JAm8nJPMg34f1ASOLR1PZvjSviIw8AwxcpFhYPR1Tix-yhXTqYmsiPi22ePDNVVGrrApFY~mkeDAmshIFBLXoRJkZBMnFcxWy98ET79cWrky~OoGScOoNNWzP7Y~nQ__&Key-Pair-Id=KK4HN3OO4AT5R",
//             "w360": "https://cdn.movieofthenight.com/show/297/backdrop/vertical/360.jpg?Expires=1749522834&Signature=jfXzJ-GKNLBoHvCNyp7bwNc5ykKDKvKZlzkBJlOoQqva3q7T5qkyu58ZChFCohqnsQ3zgc1~1lxmzFJOmFXwGpJ1oGcHvpMJd~roVN6ur0jew8vVQWsSti9E7hVvKhWlT36JRz52B5VH4vr4c691Wict5bWSe~Ku0C5MzOzR0ibRzpCFAH0AlARqiGnV2swujjb4C1pDMIP8-vCemq4cLzR5Vw8UubeCqxm7BysRWiE6WQMNjYWw8TMSYWsYLE-~MRoBg09v8Os35~Gc4-WFUkye7V1NgIQKzvOj16~~CF-mStx6Pnq9whGlZ8QSW~gqGWpSjbXkc25ziVj9sqgcUg__&Key-Pair-Id=KK4HN3OO4AT5R",
//             "w480": "https://cdn.movieofthenight.com/show/297/backdrop/vertical/480.jpg?Expires=1749522834&Signature=BEi2HUHQW~BpJA7XVUSDbWRErx7GoZYcNhhiGolDvzMh3SEIfqFw~PBE4aaJnORayr4bP9ReQRrgJcYYuuplnfkJH7Ndv13kmcGvgiJGrxtCAWoWHH1Hrx68z1J48cL70rHkr5tCcBuHXdqVk~JfKuX41WTV7j2RpV9C1xKIW2iI92sFClUF1P9rlrgUr2jEQVeabylauf6Sn1-rrjuFiCPQ7jf-fzxlyF04UURtE3PU3s0E8sV1p1zI-wpXXbWlfJWS9MMBbLFleUmmC4bsS7VX1ASpEDokLbhuTY5SZiCG~l9jR3p3-PRSqpiWomd4FHxKUuHHf5JAZ6~I23jn6w__&Key-Pair-Id=KK4HN3OO4AT5R",
//             "w600": "https://cdn.movieofthenight.com/show/297/backdrop/vertical/600.jpg?Expires=1749522834&Signature=TymNcVamazI9UeQoF~sKAYB5QfBAHt6TeDE2gadQR4-x5MuRBIztduie1klBIu9FMIh5Es5hbGWubt4Wq-dmP7mNzFKWRl7PCCOAv5RZkcgRKa8uRGKdskVFI7O0lZoNrVX1Xi0v0ZmxDln9IE6WO-xGNs8KImMsuo5fkWBZy9czKaQZiJHmAg~dhLKA2WlOyfRiYxjpm2ItEHfq~kXxscmQaTcY5F10NS9o7XzZhI9QziTcxVp7Z325ml7KOgb78R-m~LDheQIVgW2oRJKcvmcpiXxZE2gPDHQftbDo75JfhrP2VRnUoO4jBNH4PMVD01yMwDYlPmR8nGKlnZuImw__&Key-Pair-Id=KK4HN3OO4AT5R",
//             "w720": "https://cdn.movieofthenight.com/show/297/backdrop/vertical/720.jpg?Expires=1749522834&Signature=ash0aMieX1T7CfFdiQkO9KGe0s4FuodJYnLspPdDh9zSHa0xbRi8wqc~uWAPtU0FyXxIvbEckW4CZSoQbGtM6IwtJ7ofApJrNKfJGgs7D5wN118X3Z-s4JLKDbBlFsy1-fsfpwrWTPxUZ1g2hTL~MCd7VaSEFcnNZgz03ws3hcRb50sx~q0Pv5vPdcDwIQoTu3JOn041UlsffY7m0WqLQY6CRdSjwUQIk2rr0UFuz4eOpHm~WDKdi25zFuHE1pDyWqOwfVdDQLOVaO3Y3DB0Nj1XBRDYwrOnVuOEcUr1~AsrDyb~KwHkzDf3aWjM~~joR5nYREPwRLxiTocz5QaX5Q__&Key-Pair-Id=KK4HN3OO4AT5R"
//         },
//         "horizontalBackdrop": {
//             "w360": "https://cdn.movieofthenight.com/show/297/backdrop/horizontal/360.jpg?Expires=1749522840&Signature=OO3DPzebLJMt16PFHI3HevhqaerQYoGp8tMGPlUHRHIrVaZjnjQFs2C2VBRcy16ixoQL~S7PUaAGjaUQGaFiM4JKsaToOwdHHxu2~2Vi~xcL1alXh-eLmgEUtAYiSPfRH9eeLTEKaDtOffO6dfW170ja9DuTuGXSKZAzKZgENRRAyvLp0ea4oph~TBESKhWYPU4tZb4s7ZRDWiewXebzY31foOcp9cIuZ4nffelkfeV0W4jPPYq5WHb-uNRalSo2lIaS2mqdMaXkrK~D6AyaEXgSqCu0wnmDLVSqBrs1huv0r0ZDrKPMS~Smx4oSPyGyKvAmZHUsn8gLCE4kbLEmrw__&Key-Pair-Id=KK4HN3OO4AT5R",
//             "w480": "https://cdn.movieofthenight.com/show/297/backdrop/horizontal/480.jpg?Expires=1749522840&Signature=LCI1~v3dNpxFxfmw27pfPoIT4Mcya~idxT7M5EyrVhXw5CxPx9MRnwjQtiIN6Yh5DqbH7z6aTjWPpkhvOGIDKe3xVXOVniyr~Bu4~OfJOaK91cj1JWxI0sIZTFpJ1leXLGsHaPhZtI6EPtlaZPbAlWMstuu-2bDMAeuKpUwiIYMJJyQpO~DmsJXaWKu02pJqC7evfBMamaUjewKGsuvYXEG323T4I6OpfCjodHNIZvUaLf59R3ceLHjKAruP6Hu7kCUfbrlYZ-gtVMBQpAdx0aYJEhLniM896LTzChdtLvcCNcAl7gcm3uugCKW5LZT3EJoo237hJvJ6lWq5qwF6fw__&Key-Pair-Id=KK4HN3OO4AT5R",
//             "w720": "https://cdn.movieofthenight.com/show/297/backdrop/horizontal/720.jpg?Expires=1749522840&Signature=VAO~NH-AoiXvVj07j166r6yBfPDHoAGZ30TDVAHngvgBRb9WntHTAcCKvtD1sHeXwi18xOGSNIZLnnEd3mRxNDAb8ziHjtQVGX7LHrM0DHUMyQvRkyvClivRt2RfBdBHIDZgCBZJwmW4qS~TAc1ze4wXPkJZ4uIIsqXNG8irKBe0WZmSGZdjfpc9Jr3OU1cZSVsCB5kmUzids5170MJKuHd7EHFMLt14Y3Jzib9i0qf4J7Lqka3qgQjJjDSwiKhTTqjjkdBBJCYNzxLbtRjIVApyP~in6gWMM74BPJ7rVbpfTew~YcO29CHr19z1Z8fF6-Njp6riQjicXnJFOD0hXQ__&Key-Pair-Id=KK4HN3OO4AT5R",
//             "w1080": "https://cdn.movieofthenight.com/show/297/backdrop/horizontal/1080.jpg?Expires=1749522840&Signature=MZ3-vO8pX67CeAED5oEpvdxpIfJQoxinYGcDOVickwd81Hr07-tY249xGRkfeMVeWHAURtq66Z0JyreYbi4Qq0lqpD-uJ9sg7l3fKXiFCUwHKOf09j~Jrm-hOD9pack0lyPDOPIETQwJRIGltOKFMXBN1U9xQDZSnCbUzLiEKcwKte~zxak1TE4Oe7EP93jQjgwoKs81DrwuJUKP4iNtYFTK5MCNOEWF6YJdzX4WSFYVYa8TWWUNzH5-nzF0mBMoMdE0H-KXhliAeBGwep8JD-bWgp6M9h-7cNe2cGvMucFFkWDs43TeUAOusYVRERpugAG-dqvFWX~U1oI5sLUPSw__&Key-Pair-Id=KK4HN3OO4AT5R",
//             "w1440": "https://cdn.movieofthenight.com/show/297/backdrop/horizontal/1440.jpg?Expires=1749522840&Signature=Kx~kq8d-M4ZW3~GHdQY0guk3xxteGz3F-NSJFrc0uMjUshKiD~3Ls2~3-3kVLdnMZpWkWpr9vdF2Aimu0pz5jd915gWKUPO4mbmHC7SCLkRkARAsf7UbV4yu8aZfNzBP3sgpqXvqHN9JIKjGJ69JG1eFET62iRriUx4AoTYj~gp0BGVJPodWj~Hs21-WawvasDTLsb0j24ue6x5~RRKGhQ-KJAotMnpiWipPcxC2CeSp-vL2j4645u6jWNdkJBGJJ35FoAZEK6tA8BS20ML8Hzw1rF60tU-IjesR8xMQ2sKbkXoHk~QgV7jiwe3p0Ny5WtNZ6rv8~XqmRXEM1N3T~A__&Key-Pair-Id=KK4HN3OO4AT5R"
//         }
//     },
//     "streaming_de": [
//         "netflix",
//         "prime"
//     ],
//     "streaming_pt": [
//         "netflix"
//     ],
//     "streamingOptions": {
//         "de": [
//             {
//                 "service": {
//                     "id": "netflix",
//                     "name": "Netflix",
//                     "homePage": "https://www.netflix.com/",
//                     "themeColorCode": "#E50914",
//                     "imageSet": {
//                         "lightThemeImage": "https://media.movieofthenight.com/services/netflix/logo-light-theme.svg",
//                         "darkThemeImage": "https://media.movieofthenight.com/services/netflix/logo-dark-theme.svg",
//                         "whiteImage": "https://media.movieofthenight.com/services/netflix/logo-white.svg"
//                     }
//                 },
//                 "type": "subscription",
//                 "link": "https://www.netflix.com/title/60023642/",
//                 "videoLink": "https://www.netflix.com/watch/60023642",
//                 "quality": "hd",
//                 "audios": [
//                     {
//                         "language": "deu"
//                     },
//                     {
//                         "language": "eng"
//                     },
//                     {
//                         "language": "fra"
//                     },
//                     {
//                         "language": "jpn"
//                     },
//                     {
//                         "language": "rus"
//                     },
//                     {
//                         "language": "tur"
//                     }
//                 ],
//                 "subtitles": [
//                     {
//                         "closedCaptions": false,
//                         "locale": {
//                             "language": "deu"
//                         }
//                     },
//                     {
//                         "closedCaptions": false,
//                         "locale": {
//                             "language": "eng"
//                         }
//                     },
//                     {
//                         "closedCaptions": false,
//                         "locale": {
//                             "language": "fra"
//                         }
//                     },
//                     {
//                         "closedCaptions": false,
//                         "locale": {
//                             "language": "jpn"
//                         }
//                     },
//                     {
//                         "closedCaptions": false,
//                         "locale": {
//                             "language": "rus"
//                         }
//                     },
//                     {
//                         "closedCaptions": false,
//                         "locale": {
//                             "language": "ukr"
//                         }
//                     }
//                 ],
//                 "expiresSoon": false,
//                 "availableSince": 1650465636
//             },
//             {
//                 "service": {
//                     "id": "prime",
//                     "name": "Prime Video",
//                     "homePage": "https://www.amazon.de/gp/video/storefront/",
//                     "themeColorCode": "#00A8E1",
//                     "imageSet": {
//                         "lightThemeImage": "https://media.movieofthenight.com/services/prime/logo-light-theme.svg",
//                         "darkThemeImage": "https://media.movieofthenight.com/services/prime/logo-dark-theme.svg",
//                         "whiteImage": "https://media.movieofthenight.com/services/prime/logo-white.svg"
//                     }
//                 },
//                 "type": "rent",
//                 "link": "https://www.amazon.de/gp/video/detail/B0CWZFHDC4/ref=atv_dp",
//                 "quality": "hd",
//                 "audios": [
//                     {
//                         "language": "deu"
//                     }
//                 ],
//                 "subtitles": [
//                     {
//                         "closedCaptions": false,
//                         "locale": {
//                             "language": "deu"
//                         }
//                     }
//                 ],
//                 "price": {
//                     "amount": "3.99",
//                     "currency": "EUR",
//                     "formatted": "3.99 EUR"
//                 },
//                 "expiresSoon": false,
//                 "availableSince": 1714585871
//             },
//             {
//                 "service": {
//                     "id": "prime",
//                     "name": "Prime Video",
//                     "homePage": "https://www.amazon.de/gp/video/storefront/",
//                     "themeColorCode": "#00A8E1",
//                     "imageSet": {
//                         "lightThemeImage": "https://media.movieofthenight.com/services/prime/logo-light-theme.svg",
//                         "darkThemeImage": "https://media.movieofthenight.com/services/prime/logo-dark-theme.svg",
//                         "whiteImage": "https://media.movieofthenight.com/services/prime/logo-white.svg"
//                     }
//                 },
//                 "type": "rent",
//                 "link": "https://www.amazon.de/gp/video/detail/B0CWZFHDC4/ref=atv_dp",
//                 "quality": "sd",
//                 "audios": [
//                     {
//                         "language": "deu"
//                     }
//                 ],
//                 "subtitles": [
//                     {
//                         "closedCaptions": false,
//                         "locale": {
//                             "language": "deu"
//                         }
//                     }
//                 ],
//                 "price": {
//                     "amount": "2.99",
//                     "currency": "EUR",
//                     "formatted": "2.99 EUR"
//                 },
//                 "expiresSoon": false,
//                 "availableSince": 1714585871
//             },
//             {
//                 "service": {
//                     "id": "prime",
//                     "name": "Prime Video",
//                     "homePage": "https://www.amazon.de/gp/video/storefront/",
//                     "themeColorCode": "#00A8E1",
//                     "imageSet": {
//                         "lightThemeImage": "https://media.movieofthenight.com/services/prime/logo-light-theme.svg",
//                         "darkThemeImage": "https://media.movieofthenight.com/services/prime/logo-dark-theme.svg",
//                         "whiteImage": "https://media.movieofthenight.com/services/prime/logo-white.svg"
//                     }
//                 },
//                 "type": "buy",
//                 "link": "https://www.amazon.de/gp/video/detail/B0CWZFHDC4/ref=atv_dp",
//                 "quality": "hd",
//                 "audios": [
//                     {
//                         "language": "deu"
//                     }
//                 ],
//                 "subtitles": [
//                     {
//                         "closedCaptions": false,
//                         "locale": {
//                             "language": "deu"
//                         }
//                     }
//                 ],
//                 "price": {
//                     "amount": "9.99",
//                     "currency": "EUR",
//                     "formatted": "9.99 EUR"
//                 },
//                 "expiresSoon": false,
//                 "availableSince": 1714585871
//             },
//             {
//                 "service": {
//                     "id": "prime",
//                     "name": "Prime Video",
//                     "homePage": "https://www.amazon.de/gp/video/storefront/",
//                     "themeColorCode": "#00A8E1",
//                     "imageSet": {
//                         "lightThemeImage": "https://media.movieofthenight.com/services/prime/logo-light-theme.svg",
//                         "darkThemeImage": "https://media.movieofthenight.com/services/prime/logo-dark-theme.svg",
//                         "whiteImage": "https://media.movieofthenight.com/services/prime/logo-white.svg"
//                     }
//                 },
//                 "type": "buy",
//                 "link": "https://www.amazon.de/gp/video/detail/B0CWZFHDC4/ref=atv_dp",
//                 "quality": "sd",
//                 "audios": [
//                     {
//                         "language": "deu"
//                     }
//                 ],
//                 "subtitles": [
//                     {
//                         "closedCaptions": false,
//                         "locale": {
//                             "language": "deu"
//                         }
//                     }
//                 ],
//                 "price": {
//                     "amount": "7.99",
//                     "currency": "EUR",
//                     "formatted": "7.99 EUR"
//                 },
//                 "expiresSoon": false,
//                 "availableSince": 1714585871
//             }
//         ],
//         "pt": [
//             {
//                 "service": {
//                     "id": "netflix",
//                     "name": "Netflix",
//                     "homePage": "https://www.netflix.com/",
//                     "themeColorCode": "#E50914",
//                     "imageSet": {
//                         "lightThemeImage": "https://media.movieofthenight.com/services/netflix/logo-light-theme.svg",
//                         "darkThemeImage": "https://media.movieofthenight.com/services/netflix/logo-dark-theme.svg",
//                         "whiteImage": "https://media.movieofthenight.com/services/netflix/logo-white.svg"
//                     }
//                 },
//                 "type": "subscription",
//                 "link": "https://www.netflix.com/title/60023642/",
//                 "videoLink": "https://www.netflix.com/watch/60023642",
//                 "quality": "hd",
//                 "audios": [
//                     {
//                         "language": "eng"
//                     },
//                     {
//                         "language": "fra"
//                     },
//                     {
//                         "language": "jpn"
//                     },
//                     {
//                         "language": "por"
//                     },
//                     {
//                         "language": "spa",
//                         "region": "ESP"
//                     }
//                 ],
//                 "subtitles": [
//                     {
//                         "closedCaptions": false,
//                         "locale": {
//                             "language": "eng"
//                         }
//                     },
//                     {
//                         "closedCaptions": false,
//                         "locale": {
//                             "language": "fra"
//                         }
//                     },
//                     {
//                         "closedCaptions": false,
//                         "locale": {
//                             "language": "jpn"
//                         }
//                     },
//                     {
//                         "closedCaptions": false,
//                         "locale": {
//                             "language": "por"
//                         }
//                     },
//                     {
//                         "closedCaptions": false,
//                         "locale": {
//                             "language": "spa",
//                             "region": "ESP"
//                         }
//                     },
//                     {
//                         "closedCaptions": false,
//                         "locale": {
//                             "language": "ukr"
//                         }
//                     }
//                 ],
//                 "expiresSoon": false,
//                 "availableSince": 1650465636
//             }
//         ]
//     }
// }

// showMovie(movie, formData);