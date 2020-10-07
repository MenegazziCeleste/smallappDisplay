// any CSS you import will output into a single css file (app.css in this case)
import '../../../css/navbar/navbar.css';


import React from 'react';
import ReactDOM from 'react-dom';
import {Link, NavLink} from 'react-router-dom';

import {LoadingButton, LoadingIndicator} from '../../utils.js';


class AdminNavbar extends React.Component {
	constructor(props) {
		super(props);
	}
	componentDidMount(){
		var elems = document.querySelectorAll('.sidenav');
		var instances = M.Sidenav.init(elems, []);	
	}
	render() {
		var content = 	<div>
							<li>
								<Link className="pink-text bold" to="/">App</Link>
							</li>
							<li>
								<NavLink to="/admin/users">Users</NavLink>
							</li>			
							<li>
								<NavLink to="/admin/posts">Posts</NavLink>
							</li>
							<li>
								<NavLink to="/admin/tags">Tags</NavLink>
							</li>
							<li>
								<LoadingButton action={() => this.props.logOut()} className="btn-navigation cyan darken-1 waves-effect waves-light btn">
									Log Out
								</LoadingButton>
							</li>
						</div>;
					
		return (
			<div className="navbar-fixed admin-navbar">
				<nav>
					<div className="nav-wrapper grey darken-3 center-align">
						<a href="#" data-target="nav-mobile" className="sidenav-trigger"><i className="material-icons">menu</i></a>
			
						<span className="username-navigation">
							Hello {this.props.username} !
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
export default AdminNavbar;