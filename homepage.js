let btMoviePickerStart = document.querySelector("#btMoviePicker");
let contentMoviePicker = document.querySelector("#contentMoviePicker");
let btSendMovieForm = document.querySelector("#btSendMovieForm");
let formMoviePicker = document.querySelector("#moviePicker");
let inputFieldsMoviePicker = document.querySelectorAll("#moviePicker input");
let btNext = document.querySelectorAll("#moviePicker .btNext");
let currentYear = new Date().getFullYear();


// display movie picker
function showMoviePicker() {
    formMoviePicker.style.display = "block";
    this.style.display = "none";
}

// show form
// tbd: make a function that hides the button when nothing is selected anymore
function showNextButton() {
    let id = this.getAttribute("data-id");
    document.querySelector(`.btNext#${id}`).classList.remove("hide");
}

function showNextSection() {
    let id = this.getAttribute("data-id");
    console.log(id);    
    document.querySelector(`#${id}`).classList.remove("hide");
}

// fetch data for forms and filters from API
let urlShows = "http://localhost:3000/shows";
let urlTags = "http://localhost:3000/tags";

async function getData(url, action) {
    try {
        const response = await fetch(url);
        if (response.status!==200) {
            throw Error('There was a problem connecting to the API.');
        }
        const data = await response.json();
       
        action(data);
    } catch (error) {
        alert("The following error has occured: " + error)
    }
    
}

// tbd: pre-filter movies and possible values for each step in the form
function populateGenres(data) {
    let genres = [];
    
    // fetch(url)
    //     .then(response => {
    //         if (response.ok) {
    //             return response.json();
    //         } else {
    //             if (response.status === 404) {
    //                 return Promise.reject("URL does not exist");
    //             } else {
    //                 return Promise.reject("Unknown Error");
    //             }
    //         }
    //     })
    //     .then(data => {
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
        let content = `<p><input type="checkbox" id="anyGenre" name="genre" value="anyGenre" data-id="genres">
                <label for="anyGenre">Any Genre!</label><br></p>`;
        for (let genre of genres) {
            content += 
            `<p><input type="checkbox" id="${genre.id}" name="genre" value="${genre.id}" data-id="genres">
            <label for="${genre.id}">${genre.name}</label><br></p>`;
        }
        elGenreList.innerHTML = content;
        for (let inputfield of document.querySelectorAll("#genreList input")) {
            inputfield.addEventListener("click", showNextButton);
        }
        // .catch(error => {
        //     alert("The following error occured: " + error)
        // });
}

// MOVIE PICKER
function pickAMovie() {
    let formData = grabFormData();
    let queryURL = createQueryString(formData);
    let movie = getData(queryURL, (data) => filterMovies(data, formData));
    showMovie(movie);
    console.log(movie);
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

function createQueryString(formData) {
    // tbd dynamically set streaming location
    let streamingLocation = "de";
    let streamingQuery = formData.streaming.join("|"); 
    let queryURL = urlShows + `?streaming_${streamingLocation}_like=(${streamingQuery})&mood_like=${formData.mood}&occasion_like=${formData.occasion}`;
    
    return queryURL;
}

function filterMovies(movieData, formData) {
    console.log("next function:", movieData);
    let result = [...movieData];
    let shuffledData = movieData.sort((a, b) => 0.5 - Math.random());
    let oldResult = [];
    if (formData.genres.length > 0 && !formData.genres.includes("anyGenre")) {
        oldResult = [...result];
        let shuffledGenres = formData.genres.sort((a, b) => 0.5 - Math.random());
        result = shuffledData.filter( (movie) => {
            movie.genreList.some( (item) => {
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
            matchReleaseYear(formData.releaseYear, movie);
        });
        if (result.length === 0) {
            result = [...oldResult];
        }    
    }

    if (result.length > 1 && formData.additionalTags.length > 0) {
        let shuffledTags = formData.additionalTags.sort((a, b) => 0.5 - Math.random());
        oldResult = [...result];
        result = shuffledData.filter( (movie) => {
            movie.additionalTags.some( (item) => {
                return shuffledTags.includes(item);
            });
        });
        if (result.length === 0) {
            result = [...oldResult];
        }    
    }  
    result.sort((a, b) => 0.5 - Math.random());
    return result[0];
}

    // let result = data.filter((movie) => {
    //     // tbd "pt" is going to be dynamic when more streaming availability data available
        
    //     let matchStreaming = false;
    //     if (movie.streamingOptions.pt !== undefined) {
    //         matchStreaming = movie.streamingOptions.pt.some( (item) => {
    //             return streaming.includes(item.service.id);
    //             }
    //         );
    //     }
    //     let matchMood = movie.mood.includes(mood);
    //     let matchOccasion = movie.occasion.includes(occasion);
    //     let matchGenre = movie.genres.some( (item) => {
    //             return genres.includes(item.id);
    //             }
    //         );
    //     console.log(matchGenre);

    //     let matchYear = false;
    //     matchYear = matchReleaseYear(releaseYear, movie);

    //     let matchTags = false;
    //     if (additionalTags.length > 0 && movie.additionalTags.length > 0) {
    //         let matchTags = movie.additionalTags.some( (item) => {
    //             return additionalTags.includes(item);
    //             }
    //         );
    //     }
    //     console.log(movie.title);
    //     return (
    //         (matchStreaming && matchMood && matchOccasion && matchGenre && matchYear && matchTags) ||
    //         (matchStreaming && matchMood && matchOccasion && matchGenre && matchYear) ||
    //         (matchStreaming && matchMood && matchOccasion && matchGenre) ||
    //         (matchStreaming && matchMood && matchOccasion) ||
    //         (matchStreaming && matchMood)
    //     );
    // })
    // console.log(result);

function matchReleaseYear(releaseYear, movie) {
    console.log(releaseYear);
    if (releaseYear !== "noRestriction") {
        if (movie.releaseYear >= (currentYear - releaseYear)) {
            return true;
        
        // if (releaseYear === "lastTwenty" && movie.releaseYear >= (currentYear - 20)) {
        //     return true;
        // } else if (releaseYear === "lastTen" && movie.releaseYear >= (currentYear - 10)) {
        //     return true;
        // } else if (releaseYear === "lastFive" && movie.releaseYear >= (currentYear - 5)) {
        //     return true;
         } else {
            return false;
        }
    } else {
        return true;
    }
}

function showMovie(movie) {
    
}

getData(urlShows, populateGenres);

btMoviePickerStart.addEventListener("click", showMoviePicker);
for (let inputfield of inputFieldsMoviePicker) {
    inputfield.addEventListener("click", showNextButton);
}
for (let bt of btNext) {
    bt.addEventListener("click", showNextSection);
}

// btSendMovieForm.addEventListener("click", () => getData(urlShows, grabFormData));
btSendMovieForm.addEventListener("click", grabFormData);

// activate form and populate with diffrent values .value = ""
//  alternative: autofill (google extension)
formMoviePicker.querySelector('input[value="netflix"]').checked = true;
formMoviePicker.querySelector('input[value="prime"]').checked = true;
formMoviePicker.querySelector('input[value="happy"]').checked = true;
formMoviePicker.querySelector('input[value="friends"]').checked = true;
// formMoviePicker.querySelector('input[value="drama"]').checked = true;
formMoviePicker.querySelector('input[value="20"]').checked = true;

pickAMovie();
// getData(urlShows, grabFormData);


