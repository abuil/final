// React
var React = require('react')
var ReactDOM = require('react-dom')

// Google Maps
var ReactGMaps = require('react-gmaps')
var {Gmaps, Marker,InfoWindow} = ReactGMaps

// Movie data
var movieData = require('./data/movies.json')
var theatres = require('./data/theatres.json')

// Components
var Header = require('./components/Header')
var MovieDetails = require('./components/MovieDetails')
var MovieList = require('./components/MovieList')
var NoCurrentMovie = require('./components/NoCurrentMovie')
var SortBar = require('./components/SortBar')

// There should really be some JSON-formatted data in movies.json, instead of an empty array.
// I started writing this command to extract the data from the learn-sql workspace
// on C9, but it's not done yet :) You must have the csvtojson command installed on your
// C9 workspace for this to work.
// npm install -g csvtojson
// sqlite3 -csv -header movies.sqlite3 'select "imdbID" as id, "title" from movies' | csvtojson --maxRowLength=0 > movies.json

// Firebase configuration
var Rebase = require('re-base')
var base = Rebase.createClass({
  apiKey: "AIzaSyA_Kb7vGfcxj5k2qYW2vwlHtkQGJbjtULs",   // replace with your Firebase application's API key
  databaseURL: "https://final-6928c.firebaseio.com", // replace with your Firebase application's database URL

})


var App = React.createClass({
  movieClicked: function(movie) {
    this.setState({
      currentMovie: movie
    })
  },
  movieWatched: function(movie) {
    var existingMovies = this.state.movies
    var moviesWithWatchedMovieRemoved = existingMovies.filter(function(existingMovie) {
      return existingMovie.id !== movie.id
    })
    this.setState({
      movies: moviesWithWatchedMovieRemoved,
      currentMovie: null
    })
  },
  sortMovieList: function(view,moviesList) {
    var moviesSort
    if(view === 'latest')
    {
        moviesSort = moviesList.sort(this.movieCompareByReleased)
    }
    else //alpha
    {
        moviesSort = moviesList.sort(this.movieCompareByTitle)
    }
    this.setState({
      movies: moviesSort,
      currentView: view
    })
  },
  resetMovieListClicked: function() {
    this.sortMovieList(this.state.currentView,movieData)
  },
  viewChanged: function(view) {
    // View is either "latest" (movies sorted by release), "alpha" (movies
    // sorted A-Z), or "map" (the data visualized)
    // We should probably do the sorting and setting of movies in state here.
    // You should really look at https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort
    this.sortMovieList(view,this.state.movies)
    /*this.setState({
      currentView: view
    })
    */
  },
  renderMovieDetails: function() {
    if (this.state.currentMovie == null) {
      return <NoCurrentMovie resetMovieListClicked={this.resetMovieListClicked} />
    } else {
      return <MovieDetails movie={this.state.currentMovie}
                           movieWatched={this.movieWatched} />
    }
  },
  onMapCreated: function(map) {
    map.setOptions({
      disableDefaultUI: true
    });
  },
  toggleInfoWindow: function(data) {
    console.log('toggleInfoWindow: '+data)
    var infoWindows
    if(data == null)
    {
        infoWindows = null
    }
    else
    {
        infoWindows = {lat:data.lat ,long: data.long,content:data.content}
    }
    this.setState({
      currentInfoWindows: infoWindows
    })

  },
  renderInfoWindows: function() {
        console.log('renderInfoWindows')
        var currentInfo = this.state.currentInfoWindows
        if(currentInfo != null)
        {
                return (<InfoWindow
                        lat={currentInfo.lat}
                        lng={currentInfo.long}
                        content={currentInfo.content}
                        onCloseClick={() => this.toggleInfoWindow(null)}
                        />
                        )
        }
        else
        {
                return ""
        }

  },
  renderMarkers: function() {
    var this2 = this;
    return theatres.map( function(theatre, index) {
                        var data={lat: theatre.lat,
                                long: theatre.long,
                                content:theatre.name}

                        return (<Marker
                                key={index}
                                lat={theatre.lat}
                                lng={theatre.long}
                                onClick={() => this2.toggleInfoWindow(data)}
                                />
                                )
                })
  },
  renderMainSection: function() {
  // https://gist.github.com/MicheleBertoli/cdd3960f608574e49e24
    if (this.state.currentView === 'map') {
        var currentInfo = this.state.currentInfoWindows
        if(currentInfo == null)
        {
            currentInfo = theatres[0]
        }
      return (
        <div className="col-sm-12">
          <h3>Map of movie theaters where to watch good movies</h3>
          <Gmaps
                width={'700px'}
                height={'500px'}
                lat={currentInfo.lat}
                lng={currentInfo.long}
                zoom={12}
                loadingMessage={'movie theaters'}
                params={{v: '3.exp'}}
                onMapCreated={this.onMapCreated}
                ref="gmaps"
            >
                {this.renderMarkers()}
                {this.renderInfoWindows()}
          </Gmaps>
        </div>
      )
    } else {
      return (
        <div>
          <MovieList movies={this.state.movies} movieClicked={this.movieClicked} />
          {this.renderMovieDetails()}
        </div>
      )
    }
  },
  movieCompareByTitle: function(movieA, movieB) {
    if (movieA.title < movieB.title) {
      return -1
    } else if (movieA.title > movieB.title) {
      return 1
    } else {
      return 0
    }
  },
  movieCompareByReleased: function(movieA, movieB) {
    if (movieA.released > movieB.released) {
      return -1
    } else if (movieA.released < movieB.released) {
      return 1
    } else {
      return 0
    }
  },
  getInitialState: function() {
    return {
      movies: movieData.sort(this.movieCompareByReleased),
      currentMovie: null,
      currentView: 'latest',
      currentInfoWindows: null
    }
  },
  componentDidMount: function() {
    // We'll need to enter our Firebase configuration at the top of this file and
    // un-comment this to make the Firebase database work
    base.syncState('/movies', { context: this, state: 'movies', asArray: true })
  },
  render: function() {
    return (
      <div>
        <Header currentUser={this.state.currentUser} />
        <SortBar movieCount={this.state.movies.length}
                 viewChanged={this.viewChanged}
                 currentView={this.state.currentView} />
        <div className="main row">
          {this.renderMainSection()}
        </div>
      </div>
    )
  }
})

ReactDOM.render(<App />, document.getElementById("app"))
