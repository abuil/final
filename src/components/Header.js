var React = require('react');

var Header = React.createClass({
  render: function() {
    return (
      <div className="header row">
        <div className="col-sm-9">
          <h1>Buyflix</h1>
        </div>
        <div className="hello col-sm-3 text-center">
          <h2>Hi there!</h2>
        </div>
      </div>
    )
  }
})

module.exports = Header;