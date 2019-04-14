import React, { Component } from 'react'

import '../css/App.css'
import logo from '../img/logo.svg'
import Button from './Button'


class App extends Component {
  constructor(props) {
    super(props)
    // state is initialized in JSON notation
    this.state = {
      name: "User",
      age: 21,
      status: ""
    }

    // you must add this line!
    this.handleChange = this.handleChange.bind(this)
    // global methods for a component are not bound to the current instance
    // automatically this is just how javascript works

  }

  // a pre-existing lifecycle method that we are overriding
  // this will run right after the component is created in the DOM
  // if you add and remove components, it will run every single time
  // the particular compnent was added
  componentDidMount() {
    // const user_name = prompt("What is your name?")
    // prompt() allows you to prompt a user for an input

    // this.state can only be accessed as a public member variable in the constructor
    // it becomes private with get & set methods in other functions
    // setState() takes in 1 argument, the object, representing the new state items
    this.setState({
      status: "Current status"
    })
  }

  // event handlers are passed in an event variable, we'll call ours "e"
  handleChange(e) {
    this.setState({
      // for target <tag> of this element's event "e", select its "value" attribute
      // assign the "status" state to this value
      status: e.target.value
    })
  }

  render() {
    const { name, age, status} = this.state // save all the state variables
    return (
      <div className="App">
      <Button/>

        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <p>
            Hi {name}, edit <code>src/App.js</code> and save to reload.
          </p>
          <input type="text" name="Status" placeholder=" good." value={status} onChange={this.handleChange}></input>
          {/* This is a JSX Style Comment */}
        </header>
      </div>
    )
  }
}

export default App
