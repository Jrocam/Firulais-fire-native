import React, { Component } from 'react'

import { Platform,	View, StyleSheet, Image, TouchableOpacity, 
					Alert, ActivityIndicator, ScrollView, FlatList, ImageBackground} from 'react-native'
import {connect} from 'react-redux'
import Ripple from 'react-native-material-ripple'
//Accions
import foundationsActions from '../../../actions/foundationsActions'
import userActions from '../../../actions/usersActions'
//Style
import { Button, Icon, Thumbnail, Text, Item, Input, 
					Card, CardItem, Content, Left, ListItem, Body,
					Right,Toast} from 'native-base'
import firebase from '../../../firebase/firebaseSingleton'
import images from '../../../../assets/images'
import { Ionicons } from '@expo/vector-icons';

class FundationProfileView extends Component {
	constructor(props) {
		super(props);
		this.state={
			data: [],
			pets: [],
			news: [],
			imSubscribed: false,
			isFetchingData: true,
			isFetchingPets: true,
			isFetchingNews: true,
			isFetchingSubscription: true
		}
		this.renderPets = this.renderPets.bind(this)
		this.renderNews = this.renderNews.bind(this)
		this.petTouched = this.petTouched.bind(this)
		this.addVoluntario = this.addVoluntario.bind(this)
	}

	static navigationOptions = ({navigation}) => {
		const params = navigation.state.params || {};
		if(params.myperfil){
			return{
				title: 'Mi Fundación',
				headerRight: (Platform.OS==='ios'?
					<Button transparent onPress={()=>navigation.navigate('EditProfile')}>
						<Text primary>Editar</Text>
					</Button>
				:
				<Button transparent style={{marginTop: 8}} onPress={()=>navigation.navigate('EditProfile')}>
					<Text primary style={{fontSize:16}} >Editar</Text>
				</Button>)
			}
		}else{
			return{
				title:'Fundación'
			}
		}

	}
		
	componentDidMount() {
		let params = this.props.navigation.state.params
		this.fetchIsSubscribed(this.props.currentUser.uid,params)
		if(this.props.currentUser.uid===params.foundationID){this.props.navigation.setParams({ myperfil: true })}
		this.fetchEverything(params)

	}
	
	fetchEverything = async (params) =>{
		let promise = await foundationsActions.fetchByUID(params.foundationID).then((val)=>{ 
			// console.log('FUNDATIONVALUE',val)
			this.setState({data: val, isFetchingData: false})
		})
		let promise2 = await foundationsActions.fetchFoundationPets(params.foundationID).then((val)=>{
			// console.log('PETVALUES',val)
			this.setState({pets: val, isFetchingPets: false})
		})
		let promise3 = await foundationsActions.fetchFoundationNews(params.foundationID).then((val)=>{
			// console.log('NEWSVALUES',val)
			this.setState({news: val, isFetchingNews: false})
		})
	}
	
	fetchIsSubscribed = async (uid,params) =>{
		let promiseSubscribe = await userActions.fetchUserIsSubscribed(uid,params.foundationID).then((val)=>{
			// console.log('SUBSCRITO',val)
			if(val){
				this.setState({imSubscribed: true, isFetchingSubscription: false })
			}
			
		})
	}

	petTouched(mascotaId, fundacionId, userId,petObj) {
		let myPet = this.props.currentUser.uid === petObj.idFundacion
		if(this.state.data){
			this.props.navigation.navigate('PetProfile',{petId: mascotaId, myPet: myPet, fundObj: this.state.data })
		}
	}

	addVoluntario() {
		Alert.alert(
			`Confirmar subscripción`,
			`Estoy segur@ de que quiero recibir noticias de ${this.state.data.givenName} \u2665`,
			[
				{text: 'NO', onPress: () => null, style: 'cancel'},
				{text: 'SI', onPress: () => this._updateUserSubscription()},
			],
			{ cancelable: false }
		)
	}
	deleteVoluntario() {
		Alert.alert(
			'Anular subscripción',
			`No quiero recibir más noticias de ${this.state.data.givenName}.`,
			[
				{text: 'NO', onPress: () => null, style: 'cancel'},
				{text: 'SI', onPress: () => this._updateUserSubscription()},
			],
			{ cancelable: false }
		)
	}

	_updateUserSubscription = ()=>{
		let uid = this.props.currentUser.uid
		let fundId = this.props.navigation.state.params.foundationID
		if(!this.state.imSubscribed){
			let info = this.state.data
			let params = this.props.navigation.state.params
			let name = info.name
			let thumb = info.photoUrl
			userActions.addFoundationToUser(uid, fundId, name, thumb)
			this.setState({imSubscribed: true})
		}else{
			userActions.unSubscribe(uid, fundId)
			this.setState({imSubscribed: false})
		}
	}

	renderPets({item, index}) {
		let pets = this.state.pets
		let images = pets[item].imageUrls
		let imgURL = images[Object.keys(images)[0]].url
		return(
			<TouchableOpacity onPress={()=>this.petTouched(item, pets[item].idFundacion, this.props.currentUser.uid, pets[item])}>
				<Card key={item} style={styles.petCard}>
					<CardItem>
							<View style={styles.petCardContent}>
							<Thumbnail circle large source={{ uri: imgURL}}/> 
								<Text numberOfLines={1} note style={{textAlign:'center', marginTop:5}}> {pets[item].tempName} </Text>
							</View>
					</CardItem>
				</Card>

			</TouchableOpacity>
		)
	}
	renderNews({item, index}) {
		let { navigate } = this.props.navigation
		let news = this.state.news
		let images = news[item].imageUrls
		let imgURL = images[Object.keys(images)[0]].url
		return(
			<TouchableOpacity onPress={()=> navigate('NewsView', { news: news[item] })}>
				<Card key={item} style={styles.petCard}>
					<CardItem>
							<View style={styles.petCardContent}>
							<Thumbnail circle large source={{ uri: imgURL}}/> 
								<Text numberOfLines={1} note style={{textAlign:'center', marginTop:5}}> {news[item].title}</Text>
							</View>
					</CardItem>
				</Card>

			</TouchableOpacity>
		)
	}
	render() {
		const { navigate } = this.props.navigation
		let info = this.state.data
		let pets = this.state.pets
		let news = this.state.news
		let profile = info.profile
		return (
			<ScrollView style={{flex:1}}>
				<View style={{flexDirection:'column'}}>
					{
						this.state.isFetchingData?(
							<View style={styles.infoContainer}>
								<ActivityIndicator size='large' />
							</View>
						):(

							<View style={{backgroundColor:'#ffffff'}}>
								<View style={{marginTop:20}}/>	
								<ListItem avatar noBorder>
									<Left>
										<Thumbnail 
										style={{borderColor: '#2a2a2a59', borderWidth:5, marginTop: 15}} 
										rounded large source={{ uri: info.photoUrl }}/>
									</Left>
									<Body>
										<Text style={{fontSize: 20, fontWeight:'bold', marginBottom:10}}>{info.name}</Text>

										{profile&&profile.description&&<Text note style={{marginBottom:10}}>{profile.description}</Text>}

										{profile&&profile.ciudad&&<Text note>
										<Ionicons name="md-globe" size={(15)} color="rgb(75, 75, 73)"/> {profile.ciudad}</Text>}
									</Body>
								</ListItem>
								<View style={{marginTop:30}}/>

								{this.props.currentUser.type === 'user' &&(
										<View style={{marginHorizontal: 10, marginBottom: 10}}> 		

											{!this.state.imSubscribed?<Card> 
												<CardItem
													button
													onPress={()=>this.addVoluntario()}
													style={{backgroundColor: '#FFFFFF'}}>
													<Left>
														<Thumbnail square small source={images.antenna_optional}/>
														<Body>
															<Text note>¿Quieres recibir noticias de esta fundación?</Text>
															<Text style={{fontWeight: 'bold'}}>¡Subscríbeme!</Text>
														</Body>
													</Left>
												</CardItem>
											</Card>
											:
											<Card>
												<Ripple onPress={()=>this.deleteVoluntario()}> 
													<CardItem
														style={{backgroundColor: '#FFFFFF'}}>
														<Left>
															<Thumbnail square small source={images.antenna_green}/>
															<Body>
																<Text style={{fontWeight: 'bold'}}>¡Estas subscrito a esta fundación!</Text>
																<Text note>Te avisaremos de la actividad de esta fundación.</Text>
															</Body>
														</Left>
														<Ionicons name='md-close' size={20}/>
													</CardItem>
												</Ripple>
											</Card>
											}
										</View>
									)	
								}
							</View>
						)
					}
					<View>

						<View style={styles.subtitle}>
							<ListItem itemDivider style={{backgroundColor:'#ffffff'}}>
								<Left><Text style={{textAlign:'center', fontWeight:'bold'}}>MASCOTAS</Text></Left>
								{/* <Right><Text style={styles.dividerText}>Ver más...</Text></Right> */}
							</ListItem>
						</View>
						{
							this.state.isFetchingPets ? (
								<View style={styles.infoContainer}>
									<ActivityIndicator size='large' />
								</View>
								
							):(
								<View>
									{pets?
									<View style={styles.cardsContainer}>
										<FlatList data={Object.keys(pets)}
											horizontal
											showsHorizontalScrollIndicator={false}
											bounces={true}
											renderItem={this.renderPets}
											keyExtractor={ (item, index) => {return `${index}` } }/>
									</View>
									:
									<View>
										<ListItem noBorder>
											<Body style={{borderBottomWidth: 0}}> 
												<Text style={{color: '#2a2a2a'}}>{info.givenName} no tiene mascotas todavía :(</Text>
											</Body>	
											<Right style={{borderBottomWidth: 0}}>
												<Thumbnail square size={80} 
													source={images.wonder_kitty}/>
											</Right>
										</ListItem>
									</View>
									}
								</View>
							)
						}
					</View>

					<View>
						<View style={styles.subtitle}>
							<ListItem itemDivider style={{justifyContent:'space-between',backgroundColor:'#ffffff'}}>
								<Text style={styles.dividerText}>NOTICIAS</Text>
								<TouchableOpacity onPress={ ()=> navigate('AllNewsView') }>
									<Text style={styles.dividerText}> Ver más...</Text>
								</TouchableOpacity>
							</ListItem> 
						</View>
						{
								this.state.isFetchingNews ? (
									<View style={styles.infoContainer}>
										<ActivityIndicator size='large' />
									</View>
								):(
									news ? (
										<View style={styles.cardsContainer}>
											<FlatList data={Object.keys(news)}
												horizontal
												showsHorizontalScrollIndicator={false}
												bounces={true}
												renderItem={this.renderNews}
												keyExtractor={ (item, index) => {return `${index}` } }
											/>
										</View>
									):(
										<View>
											<ListItem noBorder>
												<Body style={{borderBottomWidth: 0}}> 
													<Text style={{color: '#2a2a2a'}}>No hay noticias :(</Text>
												</Body>
												<Right style={{borderBottomWidth: 0}}>
													<Thumbnail square size={80} 
														source={images.wonder_kitty}/>
												</Right>
											</ListItem>
										</View>
									)
								)
						}					
					</View>



				</View>
			</ScrollView>
	)}
}

function mapStateToProps({currentUser}) {
  return {
    currentUser: currentUser,
  }
}
export default connect(mapStateToProps)(FundationProfileView)

const styles = StyleSheet.create({
	thumbContainer: {
		flexDirection: 'column',
		justifyContent: 'center',
		alignItems: 'center',
		marginTop: 10,
		marginBottom: 10
	},
	infoContainer: {
		flexDirection:'column',
		justifyContent:'center',
		alignItems: 'center',
	},
	nameField: {
		textAlign:'center',
		fontWeight: 'bold',
		color: '#ffffff',
		marginTop: 15,
		fontSize: 25
	},
	infoField: {
		textAlign:'center', 
		width:'80%',

		color: '#ffffff',
		marginBottom: 30,
	},
	cardsContainer: {
		alignItems:'center', 
		paddingVertical: 5,
		marginBottom: 5  
	},
	petCard: {
		flex: 0,
		margin: 2,
		width: 120
	},
	petCardContent: {
		flex: 1,
		width: '100%',
		flexDirection: 'column',
		justifyContent:'center',
		alignItems: 'center'
	},
	subtitle: {
		marginBottom: 5
	},
	verMas: {
		margin: 5,
		fontFamily: 'Roboto-Bold',
		fontSize: 14
	},
	dividerText: {
		fontWeight: 'bold',
		color: '#2a2a2a'
	} 
});