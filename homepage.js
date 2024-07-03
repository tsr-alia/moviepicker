let btMoviePickerStart = document.querySelector("#btMoviePicker");
let contentMoviePicker = document.querySelector("#contentMoviePicker");
let btSendMovieForm = document.querySelector("#btSendForm");
let formMoviePicker = document.querySelector("#moviePicker");
let inputFieldsMoviePicker = document.querySelectorAll("#moviePicker input");
let btNext = document.querySelectorAll("#moviePicker .btNext");


// display movie picker
function showMoviePicker() {
    formMoviePicker.style.display = "block";
    this.style.display = "none";
}

// tbd: make a function that hides the button as soon as nothing is selected anymore
function showNextButton() {
    let id = this.getAttribute("data-id");
    document.querySelector(`.btNext#${id}`).style.display = "block";
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
        let content = "";
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

// function populateAdditionalTags(data) {
//     let tags = [];
//     for (let item of data) {
//         for (let tag of item.additionalTags) {
//             if (!tags.includes(tag)) {
//                 tags.push(tag);
//             }
//         }        
//     }
//     tags.sort();
//     let elTagList = document.querySelector("#tagList");
//     let content = "";
//     for (let tag of tags) {
//         console.log("Test");
//         content += 
//         `<p><input type="checkbox" id="${tag}" name="genre" value="${tag}">
//         <label for="${tag}">...</label><br></p>
//         `;
//     }
//     console.log(content);
//     elTagList.innerHTML = content;
// }

getData(urlShows, populateGenres);
// getData(urlShows, populateAdditionalTags);
btMoviePickerStart.addEventListener("click", showMoviePicker);
for (let inputfield of inputFieldsMoviePicker) {
    inputfield.addEventListener("click", showNextButton);
}

for (let bt of btNext) {
    bt.addEventListener("click", showNextSection);
}





