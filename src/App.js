import React, { Component } from 'react';
import Clarifai from 'clarifai';
import Particles from 'react-particles-js';
import Navigation from './components/Navigation/Navigation';
import FaceRecognition from './components/FaceRecognition/FaceRecognition';
import SignIn from './components/SignIn/SignIn';
import Register from './components/Register/Register';
import Logo from './components/Logo/Logo';
import Rank from './components/Rank/Rank';
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm';
import './App.css';

const app = new Clarifai.App({
  apiKey: '9ac9e216202641e2b6913032751c76bb'
});

const parts = {
  particles: {
    number: {
      value:80,
      density: {
        enable: true,
        value_area: 1000
      } 
    }
  }
}

class App extends Component {
  constructor() {
    super();
    this.state = {
      input: '',
      imageURL: '',
      box: {},
      route: 'signIn',
      isSignedIn: false
    }
  }


  calculateFaceLocation = (data) => {
    const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box;
    const image = document.getElementById('inputImage');
    const width = Number(image.width);
    const height = Number(image.height);
    return {
      leftCol: clarifaiFace.left_col * width,
      topRow: clarifaiFace.top_row * height,
      rightCol: width - (clarifaiFace.right_col * width),
      bottomRow: height - (clarifaiFace.bottom_row * height)
    }
  }

  displayFaceBox = (box) => {
    console.log(box);
    this.setState({ box: box });
  }

  onInputChange = (event) => {
    this.setState({ input: event.target.value });
  }

  onButtonSubmit = () => {  
    this.setState({ imageURL: this.state.input });
    app.models
      .predict(
        Clarifai.FACE_DETECT_MODEL,
        this.state.input)
      .then(response => this.displayFaceBox(this.calculateFaceLocation(response)))
      .catch(err => console.log(err));
  }

  onRouteChange = (route) => {
    if (route === 'signout') {
      this.setState({ isSignedIn: false})
    } else if (route === 'home') {
      this.setState({ isSignedIn: true})
    }
    this.setState({ route: route });
  }

  render() {
    const { isSignedIn, imageURL, route, box} = this.state;
    return (
      <div className="App">
        <Particles className='particles' params= { parts } />
        <Navigation isSignedIn={ isSignedIn } onRouteChange={ this.onRouteChange }/>
        { this.state.route === 'home'
            ? <div>
                <Logo />
                <Rank />
                <ImageLinkForm 
                  onInputChange={ this.onInputChange } 
                  onButtonSubmit={ this.onButtonSubmit }
                />
                <FaceRecognition box={ box } imageURL={ imageURL }/>
              </div>
            : (
                route === 'signIn' 
                ? <SignIn onRouteChange={ this.onRouteChange }/>
                : <Register onRouteChange={ this.onRouteChange }/>
              )
          }
      </div>
    );
  }
}

export default App;
