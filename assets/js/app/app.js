// any CSS you import will output into a single css file (app.css in this case)
import '../../css/global.css';
import '../../../node_modules/materialize-css/dist/css/materialize.min.css';
import '../../../node_modules/materialize-css/dist/js/materialize.min.js';

// Need jQuery? Install it with "yarn add jquery", then uncomment to import it.
// import $ from 'jquery';
import React , { Suspense } from 'react';
import ReactDOM from 'react-dom';
import {withRouter} from 'react-router';
import {BrowserRouter, Route, Switch} from 'react-router-dom';
import axios from 'axios';

// Refresh function
import {setRefresh, successToast, failToast, 
		LoadingContext, setLoading, setLoaded} from '../utils.js';

// COMPONENTS
import LoginNavbar from './navbar/login_navbar.js'
import ConnectedNavbar from './navbar/connected_navbar.js'

const User = React.lazy(() => import('./mainpage/user/user.js'));
const Password = React.lazy(() => import('./mainpage/user/password.js'));
const Post = React.lazy(() => import('./mainpage/post/post.js'));

class App extends React.Component {
	constructor(props) {
		super(props);

		this.setLoading = () => { setLoading(this);};
		this.setLoaded = () => { setLoaded(this);};
		
		this.state = {
			email: '',
			username: '',
			roles: '',
			isLoggedIn: false,


			loadingContext: {
				loading: false,
				setLoading: this.setLoading,
				setLoaded: this.setLoaded
			}
		};
		
		this.setLoggedIn 	= this.setLoggedIn.bind(this);
		this.setLogOut 		= this.setLogOut.bind(this);

		if(userValidated != undefined){
			props.history.replace("/");
			
			if(userValidated){
				successToast('User is validated, please log in !');
			}else{
				failToast('Validation failed, please log in to try again');
			}			
		}

		if(password_token != undefined && email != undefined){
			props.history.replace("/password");
		}

		setRefresh(this);


	}
	componentDidMount(){
		this.setLoggedIn();
	}
	setLoggedIn(){
		var component = this;
		axios.get('/api/user')
			.then(data => {
					var email = data.email;
					var username = data.username;
					var roles = data.roles;
					component.setState({isLoggedIn: true, email: email, username: username, roles: roles}, () => {M.updateTextFields();});
			})
	}
	setLogOut(message){
		if(message){
			failToast(message);
		}
		this.setState({isLoggedIn: false, email: '', username: '', roles: ''});
	}
	logOut(){
		var component = this;
		axios.get('/api/login/log_out')
			.then(res => {
				component.setLogOut();
			})
	}
	render() {
		// Anonymous Dom
		var navbar 			= 	<LoginNavbar setLoggedIn={this.setLoggedIn}/>;
		var anonymousRoute 	= 	<Route key="anonymous" path="/">
									<div className="container">
										<h3>Welcome !</h3>
										<h5>Please sign in or create an account !</h5>
									</div>
								</Route>;
		var authRoutes		= [];

		// Password Dom
		var passwordRoute 	= 	"";
		if(password_token != undefined && email != undefined){
			passwordRoute 	= 	<Route key="password" path="/password" render={(props) => 
									<Password  {...props} logOut={() => this.logOut()} isLoggedIn={this.state.isLoggedIn}/> }/>;
		}

		// Admin Dom
		if(this.state.roles.includes("ROLE_ADMIN")){
			authRoutes.push(<Route key="admin" path="/admin" render={() => window.location.reload()}/>);
		}
		// User Dom
		if (this.state.isLoggedIn) {      
			navbar =		<ConnectedNavbar logOut={() => this.logOut()} email={this.state.email} username={this.state.username} roles={this.state.roles} />; 
			authRoutes.push(<Route key="posts" path="/posts" component={Post}/>);
			authRoutes.push(<Route key="user_edit" path="/user" render={(props) => 
									<User {...props} setLoggedIn={() => this.setLoggedIn()} email={this.state.email} username={this.state.username}/> }/>);
			authRoutes.push(<Route key="default" path="/">
								<div className="container center-align">
									<h5>Congrats ! You can access the site !</h5>
								</div>
							</Route>);
		} 
		return (
			<LoadingContext.Provider value={this.state.loadingContext}>
				<div>
					{navbar}	
					<Suspense fallback={<div></div>}>
						<Switch>
							{passwordRoute}
							{authRoutes.map((route) => {
								return route;
							})}
							{anonymousRoute}
						</Switch>
					</Suspense>
				</div>
			</LoadingContext.Provider>
		)
	}
}

const WithRouterApp = withRouter(App);

ReactDOM.render(<BrowserRouter>
					<WithRouterApp />
				</BrowserRouter>, document.getElementById('root'));