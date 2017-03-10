var React = require('react');

var NoCurrentMovie = React.createClass({
  render: function() {
    return (
      <div>
        <h3>Please select a movie from the list!</h3>
        <p><a href="#" className="btn btn-success" onClick={this.props.resetMovieListClicked}>Reset movie list!</a></p>
      </div>
    )
  }
})

module.exports = NoCurrentMovie;