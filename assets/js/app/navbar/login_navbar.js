// any CSS you import will output into a single css file (app.css in this case)
import '../../../css/navbar/navbar.css';


// Need jQuery? Install it with "yarn add jquery", then uncomment to import it.
// import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import {successToast, failToast, 
		LoadingButton, LoadingAction, LoadingIndicator} from '../../utils.js';


class LoginNavbar extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			email: ""
		}
		this.getToken = this.getToken.bind(this);
		this.createUser = this.createUser.bind(this);

	}
	componentDidMount(){
		var elems = document.querySelectorAll('.sidenav');
		var instances = M.Sidenav.init(elems, []);	
	}
	submitForm(values){
		var email = values.email.trim();
		var password = values.password.trim();
	
		if(values.signin){
			this.createUser(email, password);
		}else{
			this.getToken(email, password);
		}
	}
	getToken(email, password){
		var component = this;
		var props = this.props;
		axios.post('/api/login_check', {"username":email,"password": password})
				.then(res => {
					this.closeSideNav();
					props.setLoggedIn();
				})
	}
	createUser(email, password){
		var component = this;
		var props = this.props;

		axios.post('/api/login/create', {"email":email,"password": password})
				.then(data => {
					successToast('Please validate your email adress');
				})
		
	}
	sendEditPasswordLink(){
		if(this.state.email){
			axios.post('/api/login/password/send_edit_link',{
					email: this.state.email
				})
				.then(data => {
					successToast('Please use the link sent to you by email');	
				})
		}
		else{
			failToast('Please enter your email adress');
		}
		
	}
	closeSideNav() {  
		var sideNav =  M.Sidenav.getInstance(document.getElementById("nav-mobile"));
		sideNav.close(); 
	}
	render() {
		const fields = { 
			'email': '',
			'password': '' 
		};
		const loginSchema = Yup.object().shape({
				email: Yup.string()
								.email('Invalid email')
								.required('Email required'),
				// put conditions on password here
				password: Yup.string()
							.required('Password required')
			});
		

		var form = <Formik
						initialValues={fields}
						validationSchema={loginSchema}
						onSubmit={(values, { setSubmitting }) => {
							this.submitForm(values);
							setSubmitting(false);
						}}>
						{({setFieldValue, handleSubmit, errors, touched}) => (
							<Form>
								<li className="inputnav">
									<div className="input-field">
										<Field id="email" type="email" name="email" className={touched.email && errors.email ? "focus-white invalid" : "focus-white"}
											onChange={(e) => {this.setState({email: e.target.value}); setFieldValue('email', e.target.value);}}/>
										<label htmlFor="email">Email</label>
									</div>
								</li>
								<li className="inputnav">
									<div className="input-field">
										<Field id="password" type="password" name="password" className={touched.password && errors.password ? "focus-white invalid" : "focus-white"}/>
										<label htmlFor="password">Password</label>
									</div>
								</li>
								<li>
									<LoadingButton type="button" className="btn-navigation cyan darken-1 waves-effect waves-light btn" 
													action={(e)=>{ setFieldValue('signin',false); handleSubmit(e);}}>
										Log In
									</LoadingButton>
								</li>
								<li>
									<LoadingButton type="button" className="btn-navigation cyan darken-1 waves-effect waves-light btn" 
													action={(e)=>{ setFieldValue('signin',true); handleSubmit(e);}}>
										Sign In
									</LoadingButton>
								</li>
								<li>
									<LoadingAction action={()=> this.sendEditPasswordLink()}>
										Forgotten password ?
									</LoadingAction>
								</li>
								<li>
									<LoadingIndicator />
								</li>
								{touched.email && errors.email && <li className="pink-text login-error">{errors.email}</li>}
								{touched.password && errors.password && <li className="pink-text login-error">{errors.password}</li>}
							</Form>
						)}
					 </Formik>;
		return (
			<div className="navbar-fixed">
				<nav>
					<div className="nav-wrapper grey darken-3">
						<a href="#" data-target="nav-mobile" className="sidenav-trigger"><i className="material-icons">menu</i></a>
						
						<ul className="left hide-on-med-and-down">
							{form}
						</ul>
						<ul id="nav-mobile" className="sidenav grey darken-3">
							{form}
						</ul>
					</div>
				</nav>
			</div>
		)
	}
}
export default LoginNavbar;