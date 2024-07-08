Website that helps the user choose movies to watch by answering 6 questions (based on https://pickamovieforme.com/)
The database is loosly based on the Streaming Availability API (https://www.movieofthenight.com/about/api/)


Current Features:
- Movie Picker:
Form with 6 questions, user's answers are matched against a database of movies, one recommandation is shown
On the recommandation page, the user can see which of their answers match with the movie


Features to be implemented (excerpt):
- Movie Picker:
Implement a "Get Another Recommandation" Button that restarts the Movie Picker using the same user answers and gives a different recommandation
Get browser locale and automatically match streaming availability against local options, add option to manually set location and streaming options
Review and refine filter logic
Dynamically Populate all the questions in the form (see genres)
- Movie Overview: 
A site with an excerpt of the movies in the database, filters can be used to filter against the same categories as in the Movie Picker
- Automated database updates:
Update movies in the database by making calls to the external Streaming Availability API in order to keep up to date on the streaming availability
- Account
Let users register to save their locale and streaming options and prefil the form
- Watched Lists and Favourites
Let users save their favourite movies and watched movies to their account
Use users' watched and favourite lists to individualize filtering for them
- Fill the database with more movies


DEPENDENCIES

Local API: Use moviepicker.json at http://localhost:3000/ (put the file in a seperate folder and start a json server by typing: json-server --watch movies.json)
Font Awesome: Download fontawesome-free-6.5.2-web/css/all.min.css from https://fontawesome.com/ and use at ../assests/fontawesome/fontawesome-free-6.5.2-web/css/all.min.css
