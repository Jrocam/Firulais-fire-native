import React, { Component } from 'react'

import { Platform,	View, StyleSheet, Image, TouchableOpacity, 
	Alert, ActivityIndicator, ScrollView, FlatList} from 'react-native'
import {connect} from 'react-redux'
import foundationsActions from '../../../actions/foundationsActions'
import userActions from '../../../actions/usersActions'

//Style
import { Button, Icon, Thumbnail, Text, Item, Input, 
				Card, CardItem, Content, Left, ListItem, Body,
				Right} from 'native-base'
import firebase from '../../../firebase/firebaseSingleton'

class UsersProfile extends Component {
	constructor(props) {
		super(props);
		this.state={
			data: [],
			foundations: [],
			services: [],
			isFetchingFoundations: true,
			isFetchingServices: true
		}
		this.renderFoundations = this.renderFoundations.bind(this)
		this.renderServices = this.renderServices.bind(this)
	}

	static navigationOptions = ({navigation}) => {
		const params = navigation.state.params || {};
		return{
			title: 'Perfil: Voluntario'
    }
	}

	componentWillMount() {
		let params = this.props.navigation.state.params
		let promise1 = foundationsActions.fetchByUID(params.userID).then((val)=>{
			this.setState({data: val})
		})
		let promise2 = userActions.fetchUserFoundations(params.userID).then((val)=>{
			this.setState({foundations: val, isFetchingFoundations: false})
		})
		let promise3 = userActions.fetchNUserServices(params.userID, 3).then((val)=>{
			this.setState({services: val, isFetchingServices: false})
		})
	}

	renderFoundations({item, index}) {
		let { navigate } = this.props.navigation
		let foundation = this.state.foundations
		let imgURL = foundation[item].thumbnail
		return(
			<TouchableOpacity onPress={()=> navigate('FoundationProfile', { foundationID: foundation[item].funId })}>
				<Card key={item} style={styles.petCard}>
					<CardItem>
							<View style={styles.petCardContent}>
							<Thumbnail circle large source={{ uri: imgURL}}/> 
								<Text style={{textAlign:'center'}} note> {foundation[item].givenName ? 
									foundation[item].givenName : foundation[item].name}</Text>
							</View>
					</CardItem>
				</Card>

			</TouchableOpacity>
		)
	}

	renderServices({item, index}) {
		// let { navigate } = this.props.navigation
		let service = this.state.services
		let imgURL = service[item].thumbnail
		if(service[item].status === 'finalizado'){
			return(
				<TouchableOpacity>
					<Card key={item} style={styles.serviceCard}>
						<CardItem>
							<View style={styles.petCardContent}>
								<Thumbnail circle large source={{ uri: imgURL}}/> 
								<Text style={{textAlign:'center'}} note>{service[item].dateFin? 'Finalizado en' + service[item].dateFin : ''} </Text>
							</View>
						</CardItem>
					</Card>
	
				</TouchableOpacity>
			)
		}else {
			return null
		}
		
	}

	render() {
		let info = this.state.data
		let foundations = this.state.foundations
		let services = this.state.services 
		let profile = info.profile
		return (
			<ScrollView style={{flex:1}}>
				<View style={{ flexDirection:'column'}}>
					{
						info ?(
							<View>
								<View style={styles.thumbContainer}>
									<Thumbnail circle large source={{ uri: info.photoUrl }}/>
									<Text style={styles.nameField}> 
										{info.name}
									</Text>
								</View>

								<View style={styles.infoContainer}>
									<Text style={styles.infoField}> {profile && profile.description  }  </Text>
								</View>
						<View style={styles.subtitle}>
							<ListItem itemDivider>
								<Left><Text style={styles.dividerText}>Fundaciones</Text></Left>
							</ListItem> 
						</View>
						{
							this.state.isFetchingFoundations ? (
								<View style={styles.infoContainer}>
									<ActivityIndicator size='large' />
								</View>
							):(
								<View style={styles.cardsContainer}>
									{
										foundations?
												<FlatList data={Object.keys(foundations)}
													horizontal
													showsHorizontalScrollIndicator={false}
													bounces={true}
													renderItem={this.renderFoundations}
													keyExtractor={ (item, index) => {return `${index}` } }
												/>
										:
											<View style={styles.infoContainer}>
												<Text style={styles.infoField}>
												No fundaciones suscritas :(
												</Text>
											</View>
									}
								</View>
							)
						}
						<View style={styles.subtitle}>
							<ListItem itemDivider>
								<Left><Text style={styles.dividerText}>Últimos Servicios</Text></Left>
							</ListItem> 
						</View>
						{
							this.state.isFetchingServices ? (
								<View style={styles.infoContainer}>
									<ActivityIndicator size='large' />
								</View>
							):(
								<View style={styles.cardsContainer}>
									{
										services?
												<FlatList data={Object.keys(services)}
													horizontal
													showsHorizontalScrollIndicator={false}
													bounces={true}
													renderItem={this.renderServices}
													keyExtractor={ (item, index) => {return `${index}` } }
												/>
										:
											<View style={styles.infoContainer}>
												<Text style={styles.infoField}>
												No servicios realizados :(
												</Text>
											</View>
									}
								</View>
							)
						}

							</View>
						):(
							<View style={styles.infoContainer}>
									<Text style={styles.infoField}>
										Nobody here :(
									</Text>
							</View>
						)
					}

				</View>
			</ScrollView>
		)
	}
}

function mapStateToProps({currentUser}) {
  return {
    currentUser: currentUser,
  }
}
export default connect(mapStateToProps)(UsersProfile)

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
		color: 'black',
		marginTop: 15,
	},
	infoField: {
		textAlign:'center', 
		width:'80%',
		color: 'black',
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
	serviceCard: {
		flex: 1,
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