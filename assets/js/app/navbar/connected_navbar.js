
// any CSS you import will output into a single css file (app.css in this case)
import '../../../css/navbar/navbar.css';


import React from 'react';
import ReactDOM from 'react-dom';
import {Link, NavLink} from 'react-router-dom';


import {LoadingButton, LoadingIndicator} from '../../utils.js';

class ConnectedNavbar extends React.Component {
	constructor(props) {
		super(props);
	}
	componentDidMount(){
		var elems = document.querySelectorAll('.sidenav');
		var instances = M.Sidenav.init(elems, []);	
	}
	render() {
		var username = "";
		if(this.props.username){
			username = "Hello " + this.props.username + " !";
		}else{
			username = 	<NavLink to="/user">
							Click here to choose your username !
						</NavLink>;
		}
		var adminlink = "";
		if(this.props.roles.includes("ROLE_ADMIN")){
			adminlink = <li>
							<Link className="pink-text bold" to="/admin">Admin</Link>
						</li>;
		}
		var content = 	<div>
							{adminlink}
							<li>
								<NavLink to="/user">Edit User</NavLink>
							</li>
							<li>
								<NavLink to="/posts">Posts</NavLink>
							</li>
							<li>
								<LoadingButton className="btn-navigation cyan darken-1 waves-effect waves-light btn" action={() => this.props.logOut()}>
									Log Out
								</LoadingButton>
							</li>
						</div>;
					
		return (
			<div className="navbar-fixed">
				<nav>
					<div className="nav-wrapper grey darken-3">
						<a href="#" data-target="nav-mobile" className="sidenav-trigger"><i className="material-icons">menu</i></a>
			
						<span className="username-navigation">
							{username} 
						</span>

						<ul className="right hide-on-med-and-down">
							{content}
						</ul>
						<ul id="nav-mobile" className="sidenav sidenav-close grey darken-3">
							{content}
						</ul>
						<LoadingIndicator />
					</div>
				</nav>
			</div>
		)
	}
}
export default ConnectedNavbar;