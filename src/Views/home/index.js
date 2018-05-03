import React, { Component } from 'react'

import { Platform,	Text,	View, StyleSheet, Image, TouchableOpacity } from 'react-native'
import {connect} from 'react-redux'
import {Button, Icon} from 'native-base'

import drawerActions from '../../actions/drawerActions'
import HomeFundation from './HomeFundation'
import HomeUser from './HomeUser'

class Home extends Component {
	constructor(props) {
		super(props);
  }

  static navigationOptions = ({navigation}) => {
		return{
			title: 'Inicio',
			headerLeft: (
				<Button transparent onPress={()=>navigation.navigate('DrawerOpen')}>
					<Icon name='menu' />
				</Button>
      )
    }
  }
	render() {
    let {user} = this.props.currentUser
    // console.log('user:',this.props.currentUser)
    if(this.props.currentUser.type=='fundation'){
      return <HomeFundation navigation={this.props.navigation}/>
    }else{
      return <HomeUser navigation={this.props.navigation} />
    }
		
	}
}

function mapStateToProps({currentUser}) {
  return {
    currentUser: currentUser,
  }
}
export default connect(mapStateToProps,{
  setDrawer: drawerActions.setDrawerState,
})(Home)
