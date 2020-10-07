// any CSS you import will output into a single css file (app.css in this case)
import '../../../../css/app/user.css';

import React, {useContext} from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import {successToast, LoadingButton} from '../../../utils.js';

class User extends React.Component {
	constructor(props) {
		super(props);
	}
	componentDidMount(){
		M.updateTextFields();
	}
	editUser(username){
		var component = this;
		axios.post('/api/user/edit', {
				username: username
			})
			.then(data => {
				component.props.setLoggedIn(username);
				successToast("User edited");	
			})
	
	}
	sendEditPasswordLink(){
		axios.post('/api/login/password/send_edit_link',{
				email: this.props.email
			})
			.then(data => {
				successToast("Please use the link sent to you by email");
			})
	}
	render() {
		const field = {
			'username': this.props.username	 
		};
		const userSchema = Yup.object().shape({
				username: Yup.string().max(25),
			});             
		
		return (
			<div className="user container" >
				<h4> Edit your user </h4>
				<div className="big-margin-top">
					<Formik
						initialValues={field}
						validationSchema={userSchema}
						onSubmit={(values, { setSubmitting }) => {
							this.editUser(values.username);
							setSubmitting(false);
						}}>
						{({errors, touched, handleSubmit}) => (
							<Form>
								<div className="input-field">
									<input type="text" name="email" id="email" disabled className="focus-white" 
										value={this.props.email}/>
									<label htmlFor="email">Email</label>
								</div>
								<div className="input-field">
									<Field id="username" type="text" name="username" className={touched.username && errors.username ? "focus-white invalid" : "focus-white"}/>
									<label htmlFor="username">Username</label>
									<ErrorMessage className="pink-text" name="username" component="div" />
								</div>
								
								<LoadingButton type="submit" className="edit-user-btn cyan darken-1 waves-effect waves-light btn">
									Edit
								</LoadingButton>
								<LoadingButton type="button" action={() => this.sendEditPasswordLink()} className="cyan darken-1 waves-effect waves-light btn">
									Change Password
								</LoadingButton>
							</Form>)}
					</Formik>
				</div>	
			</div>
		)
	}
}
export default User;