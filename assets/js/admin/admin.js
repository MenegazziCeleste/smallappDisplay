import '../../css/global.css';
import '../../css/admin/admin_global.css';
import '../../../node_modules/materialize-css/dist/css/materialize.min.css';
import '../../../node_modules/materialize-css/dist/js/materialize.min.js';

// Need jQuery? Install it with "yarn add jquery", then uncomment to import it.
// import $ from 'jquery';
import React , { Suspense } from 'react';
import ReactDOM from 'react-dom';
import {withRouter} from 'react-router';
import {BrowserRouter, Link, NavLink, Route, Switch} from 'react-router-dom';
import axios from 'axios';

// Refresh function
import {setRefresh, LoadingContext, setLoading, setLoaded} from '../utils.js';

import AdminNavbar from './navbar/admin_navbar.js'

const Users = React.lazy(() => import('./mainpage/users/users.js'));
const Posts = React.lazy(() => import('./mainpage/posts/posts/posts.js'));
const CreateEditPost = React.lazy(() => import('./mainpage/posts/create_edit_post/create_edit_post.js'));
const Tags = React.lazy(() => import('./mainpage/tags/tags.js'));


class Admin extends React.Component {
	constructor(props) {
		super(props);

		this.setLoading = () => { setLoading(this);};
		this.setLoaded = () => { setLoaded(this);};		

		this.state = {
			'id': '',
			'username': '',


			loadingContext: {
				loading: false,
				setLoading: this.setLoading,
				setLoaded: this.setLoaded
			}
		};
		
		this.setLoggedIn 	= this.setLoggedIn.bind(this);
		this.setLogOut 	= this.setLogOut.bind(this);


		setRefresh(this);
	}
	componentDidMount(){
		this.setLoggedIn();
	}
	setLoggedIn(username = false){
		if(username){
			this.setState({username: username});
			return;
		}
		axios.get('/api/user')
			.then(data => {
				var username = data.username ? data.username : data.email;
				this.setState({username: username, id: data.id});	
			});
	}
	setLogOut(message){
		var route = (message == "Connexion expired") ? "/?connexion_expired=true" : "/";
		this.props.history.push(route);
	}
	logOut(){
		axios.get('/api/login/log_out')
			.then(data => {
				this.setLogOut();
			})
	}
	render() {
		return (
			<LoadingContext.Provider value={this.state.loadingContext}>
				<AdminNavbar logOut={() => this.logOut()} username={this.state.username} />
				
				<Suspense fallback={<div></div>}>
					<Switch>
						<Route key="users" path="/admin/users" render={(props) => <Users {...props} currentAdminId={this.state.id}/> }/>
						<Route key="posts" path="/admin/posts" component={Posts}/>
						<Route key="post_edit_create" path="/admin/post/edit/:id" component={CreateEditPost}/>
						<Route key="tags" path="/admin/tags" component={Tags}/>
						<Route key="admin" path="/admin">
							<div className="container center-align">
								<h5>This is the admin page !</h5>
							</div>
						</Route> 
						<Route key="app" path="/" render={() => window.location.reload()}/>,
					</Switch>
				</Suspense>
			</LoadingContext.Provider>
		)
	}
}

const WithRouterAdmin = withRouter(Admin);
					
ReactDOM.render(<BrowserRouter>
					<WithRouterAdmin />
				</BrowserRouter>, document.getElementById('root'));
