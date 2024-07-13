# Movie Picker

Website that picks out a movie for the user to watch based on their answers to 6 questions. The website is based on <https://pickamovieforme.com/> and built for educational purposes only. 
The data is generated from the [Streaming Availability API](https://www.movieofthenight.com/about/api/), stored in a local JSON file and tagged with additional information.


## Current Features

### Movie Picker:

- Form with 6 questions:
   - What's your **current mood**?
   - Who are you watching with? What's the **occasion**?
   - Do you have any **genre preferences**?
   - Which **streaming services** are available to you?
   - Preferences about **release year** of the movie?
   - Do you have any **addition preferences**?
- The users' answers are matched against a JSON file with movies, one recommandation is shown.
- On the result page, there is a streaming link to the movie, additional information and indicators which of the users' preferences match with the movie.


## Features to be implemented (excerpt)

### Movie Picker:

- [ ] Implement a "Get Another Recommandation" Button that restarts the Movie Picker using the same user answers and gives a different recommandation
- [ ] Get browser locale and automatically match streaming availability against local options, add option to manually set location and streaming options
- [ ] Review and refine filter logic (in combination wit implementing a database instead of a JSON file)
Dynamically Populate all the questions in the form (see genres)

### Movie Overview: 

- [ ] Build a page with an excerpt of the movies in the database/JSON file, filters can be used to filter for the same categories as in the Movie Picker

### Automated database updates:

- [ ] Implement a database with movies instead of a JSON file
- [ ] Update movie information by making calls to the external Streaming Availability API in order to keep up to date on the streaming availability

### Account

- [ ] Let users register to save their locale and streaming options and prefil the form

### Watched Lists and Favourites

- [ ] Let users save their favourite movies and watched movies to their account
- [ ] Use users' watched and favourite lists to individualize filtering for them

## DEPENDENCIES

### Local API:

- Use the file `moviepicker.json` at <http://localhost:3000/> put the file in a seperate folder and start a json server with node.js by typing:  
`json-server --watch movies.json`

### Font Awesome:

- Font Awesome: Download `fontawesome-free-6.5.2-web/css/all.min.css` from <https://fontawesome.com/> and use at ../assests/fontawesome/fontawesome-free-6.5.2-web/css/all.min.css
