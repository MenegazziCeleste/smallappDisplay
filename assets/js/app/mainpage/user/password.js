// any CSS you import will output into a single css file (app.css in this case)
import '../../../../css/app/user.css';


import React, {useContext} from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import {successToast, neutralToast} from '../../../utils.js';

import {LoadingButton} from '../../../utils.js';

class Password extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			'email': email ? email : false,
			'passwordToken': password_token ? password_token : false
		};

	}
	editPassword(password){
		axios.post('/api/login/password/edit', {
				email: 				this.state.email,
				password_token: 	this.state.passwordToken,
				new_password:		password
			})
			.then(data => {
				successToast("Password edited");

				this.setState({'passwordToken' : false});  
				this.props.history.push("/");
				if(this.props.isLoggedIn){
					this.props.logOut();
					neutralToast("Please login with your new password");	
				}
			});	
	}
	render() {

		const fields = {
			'password1': '',
			'password2': '',	 
		};
		const passwordSchema = Yup.object().shape({
				// put conditions on password here
				password1: Yup.string()
							.required('Required'),
				password2: Yup.string().test('match', 'Passwords do not match', function (password2) {
				  return password2 === this.parent.password1;
				})
			});            

		var formEditPassword = "";
		
		if(this.state.passwordToken){
			formEditPassword =  <Formik
									initialValues={fields}
									validationSchema={passwordSchema}
									onSubmit={(values, { setSubmitting }) => {
										this.editPassword(values.password1);
										setSubmitting(false);
									}}>
									{({errors, touched}) => (
										<Form>
											<div className="input-field">
												<Field id="password1" type="password" name="password1" 
													className={touched.password1 && errors.password1 ? "focus-white invalid" : "focus-white"}/>
												<label htmlFor="password1">New password</label>
												<ErrorMessage className="pink-text" name="password1" component="div" />
											</div>
											<div className="input-field">
												<Field id="password2" type="password" name="password2" 
													className={touched.password2 && errors.password2 ? "focus-white invalid" : "focus-white"}/>
												<label htmlFor="password2">Confirm new password</label>
												<ErrorMessage className="pink-text" name="password2" component="div" />
											</div>
											<LoadingButton type="submit" className="edit-user-btn cyan darken-1 waves-effect waves-light btn">
												Edit Password
											</LoadingButton>
										</Form>)}
								</Formik>;
		}
		return (
			<div className="user container" >
				<h4> Change your password </h4>
				<div className="big-margin-top">
					{formEditPassword}
				</div>	
			</div>
		)
	}
}
export default Password;