import React from 'react';
//import axios from 'axios';
import Login from './Login';
import Chat from './Chat';
import './App.css';


class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      loggedIn: false,
      name: ' ',
    }

  }

  logIn = (user) => { //it takes username from Login.js
    this.setState({ loggedIn: true, name: user })
  }

  logOut = () => {
    this.setState({ loggedIn: false })
  }

  
  render() {
    return (
      <div className="App">
        {this.state.loggedIn ? <Chat name={this.state.name} logOut={this.logOut} /> : <Login logIn={this.logIn} />}
      </div>
    );
  };
}

export default App;
