import React, { Component } from 'react';
import { connect } from 'react-redux'
import { Alert } from 'react-native';
//Firebase
import firebase from '../firebase/firebaseSingleton'
import ApiKeys from '../firebase/ApiKeys'
//Routes
import { SignedOutRoutes, SignedInRoutes } from '../routes/routes'
//Session
import sessionActions from '../actions/sessionActions'
//Resources
import { Entypo, FontAwesome, MaterialIcons, Foundation, Ionicons } from '@expo/vector-icons';
import { AppLoading, Asset, Font} from 'expo';
import Images from '../../assets/images'

class SessionWrapper extends Component {
  constructor(props) {
    super(props)
    this.state={
      isLoadingComplete: false,
      isAuthenticationReady: false,
      isAuthenticated: false,
    }
    firebase.auth().useDeviceLanguage()
    firebase.auth().onAuthStateChanged(this.onAuthStateChanged)
  }
  componentWillMount(){
    //Here trigger Cache 
    this.props.rehydrateCurrentUser()
  }
  onAuthStateChanged = (user) => {
    this.setState({isAuthenticationReady: true})
    this.setState({isAuthenticated: !!user})
  }
                                                                                             
  
  render() {
    // Handle user auth_token 
    let welcomeContainer = null
    if (!this.state.isLoadingComplete||!this.state.isAuthenticationReady) {
      return (
        <AppLoading
          startAsync={this._loadResourcesAsync}
          onError={this._handleLoadingError}
          onFinish={this._handleFinishLoading}
        />
      )
    }else{
      // console.log('USER:',this.props.currentUser)
      if (this.props.currentUser.uid) {
        welcomeContainer = <SignedInRoutes/>
      } else {
        welcomeContainer = <SignedOutRoutes/>
      }
    }
    return (welcomeContainer)
  }
  
  _loadResourcesAsync = async () => {
    return Promise.all([
      ...Images,
      Font.loadAsync({
        ...Ionicons.font,
        ...Entypo.font, ...FontAwesome.font, ...MaterialIcons.font, ...Foundation.font,
        // This is the font that we are using for our tab bar
        // We include SpaceMono because we use it in HomeScreen.js. Feel free
        // to remove this if you are not using it in your app 
        'Roboto': require('../../assets/fonts/Roboto/Roboto-Regular.ttf'),
        'Roboto-Bold': require('../../assets/fonts/Roboto/Roboto-Bold.ttf'),
        'Roboto-Medium': require('../../assets/fonts/Roboto/Roboto-Medium.ttf'),
        'Roboto_medium': require('native-base/Fonts/Roboto_medium.ttf'),
      }),
    ]);
  };

  _handleLoadingError = error => {
    // In this case, you might want to report the error to your error
    // reporting service, for example Sentry
    console.warn(error);
  };

  _handleFinishLoading = () => {
    this.setState({ isLoadingComplete: true });
  };

}
const mapStateToProps = (state) => {
  return {
    currentUser: state.currentUser
  }
}
export default connect(mapStateToProps,{
  rehydrateCurrentUser: sessionActions.rehydrateCurrentUser,
})(SessionWrapper)
