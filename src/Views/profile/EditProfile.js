import React, { Component } from 'react'

import { Platform,	View, StyleSheet, Image, TouchableOpacity,Alert, ActivityIndicator, KeyboardAvoidingView } from 'react-native'
import {connect} from 'react-redux'
//Style
import { Button, Text ,Icon,Thumbnail ,Item, Input,Label, Toast, ListItem, Left, Body} from 'native-base'
import firebase from '../../firebase/firebaseSingleton'
import { ScrollView } from 'react-native-gesture-handler';
import sessionActions from '../../actions/sessionActions'
import NavigationService from '../../routes/NavigationService'

class EditProfileView extends Component {
	constructor(props) {
		super(props);
		this.state = {
			description:'',
			ciudad:'',
			phone:'',
			direction:'',
			fetching: true
		}
		this.profiles_fire_reference=firebase.database().ref('users/' + this.props.currentUser.uid + '/profile')
		this._fetch_profile=this._fetch_profile.bind(this)
	}
	static navigationOptions = ({navigation}) => {
		const params = navigation.state.params || {};
		return{
			title: 'Editar perfil',
      headerRight: (Platform.OS==='ios'?
        <Button transparent onPress={params.saveProfile}>
          <Text primary>Guardar</Text>
        </Button>
      :
			<Button transparent style={{marginTop: 8}} onPress={params.saveProfile}>
				<Text primary style={{fontSize:16}}>Guardar</Text>
			</Button>)
    }
	}

	componentDidMount() {
		this.props.navigation.setParams({ saveProfile: this._saveProfile })
		this._fetch_profile()
	}

	_fetch_profile(){
		this.setState({fetching:true})
		
		this.profiles_fire_reference.once('value')
		.then( (res)=>{
			this.setState({ ...res.val() ,fetching: false })
		})
	}

	_saveProfile = () => {
		this.profiles_fire_reference.update({...this.state})
		.then(() => {
			// console.log('state',this.state)
			this.props.setUserInfo({ ...this.state ,fetching: false })

			this.props.navigation.dispatch(NavigationService.navigateToRoot('Home'))
			Toast.show({
				text:'Perfil guardado con éxito  \u2b50 ',
				buttonText:'OK',
				duration: 4000,
				type:'success'
			})
		})
		.catch(() => {
			Alert.alert('Sorry, your profile could not be saved')
			this._fetch_profile()
		})	
	}
	
	render() {
		let {user} = this.props.currentUser
		// console.log('USER PROFILE',this.state)
		if(this.state.fetching){
			return (
				<View style={{flex:1,justifyContent:'center'}}> 
					<ActivityIndicator size="large" /> 
				</View>
			)
		}else{
		return (
			<ScrollView>
				<KeyboardAvoidingView behavior={Platform.OS==='ios'?'position':null}  style={{ flex:1, flexDirection:'column'}}>
					<View style={{backgroundColor:'#ffffff'}}>
						<View style={{marginTop:20}}/>
						<ListItem avatar noBorder>
							<Left>
								<Thumbnail 
								style={{borderColor: '#2A2A2A59', borderWidth:5, marginTop: 15}} 
								rounded large source={{uri:user.photoUrl}}/>
							</Left>

							<Body>
								<Text  style={{fontSize: 20, fontWeight:'bold'}}>{user.name}</Text>
								<Text note>Edita la información de tu perfil.</Text>
							</Body>
						</ListItem>	
						<View style={{marginTop:30}}/>					
					</View>

					<View style={{flexDirection:'column',justifyContent:'space-around'}}>
						
						<ListItem itemDivider style={{backgroundColor:'#ffffff'}}>
							<Text style={{textAlign:'center', fontWeight:'bold'}}> INFORMACIÓN </Text>
						</ListItem> 
						
						<Item stackedLabel>
							<Label> Descripción </Label>
							<Input placeholder='Aquí va mi descripción... '
							autoCorrect={true}
							value={this.state.description}
							onChangeText={(text)=> this.setState({description: text})}/>
						</Item>

						<Item stackedLabel>
							<Label> Ciudad </Label>
							<Input placeholder='Barranq...'
							value={this.state.ciudad}
							autoCorrect={true}
							onChangeText={(text)=> this.setState({ciudad: text})} 
							/>
						</Item>
						<View style={{marginTop: 25}}/>

						<ListItem itemDivider style={{backgroundColor:'#ffffff'}}>
							<Text style={{textAlign:'center', fontWeight:'bold'}}> CONTACTO </Text>
						</ListItem> 

						<Item stackedLabel>
							<Label> Móvil </Label>
							<Input placeholder='3004347...' keyboardType='phone-pad' 
							value={this.state.phone} onChangeText={(text)=> this.setState({phone: text})} />
						</Item>
						<Item stackedLabel>
							<Label> Dirección </Label>
							<Input placeholder='Cra 72 # 9...' autoCorrect 
							value={this.state.direction} onChangeText={(text)=> this.setState({direction: text})} />
						</Item>
						<View style={{marginBottom:(Platform.OS==='ios'?85:25)}}/>
					</View>
				</KeyboardAvoidingView>
			</ScrollView>
		)
	}
}
}

function mapStateToProps({currentUser}) {
  return {
    currentUser: currentUser,
  }
}
export default connect(mapStateToProps,{
	setUserInfo: sessionActions.setUserInfo
})(EditProfileView)

const styles = StyleSheet.create({

});