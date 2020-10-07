import React from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import {successToast, LoadingButton} from '../../../utils.js';

import {closeModal} from '../../../global/modal.js';



class ModalNewUser extends React.Component {
	constructor(props) {
		super(props);
	}
	componentDidMount(){
		// inits modal
		var modal = document.getElementById('createUserModal');
		M.Modal.init(modal);
	}
	createUser(values){
		axios.post('/api/admin/user/edit/new', {
				'email': 		values.email,
				'password': 	values.password1,
				'username': 	values.username,
				'validated': 	values.validated,
				'admin': 		values.admin	
			})
			.then(data => {
				successToast("User created");	
				closeModal("createUserModal");
				this.props.getUsers();
			});	
	}
	render() {
		const fields = { 
			'email': '',
			'password1': '',
			'password2': '',
			'username': '',
			'validated': false,
			'admin': false	 
		};
		const userSchema = Yup.object().shape({
				email: Yup.string()
								.email('Invalid email')
								.required('Required'),
				// put conditions on password here
				password1: Yup.string()
							.required('Required'),
				password2: Yup.string().test('match', 'Passwords do not match', function (password2) {
				  return password2 === this.parent.password1;
				}),
				username: Yup.string().max(25),
				validated: Yup.boolean().required('Required'),
				admin: Yup.boolean().required('Required'),
			});
		return (
			<div className="add-user-div">
				<a className="waves-effect waves-light btn modal-trigger btn-floating lime darken-1 " href="#createUserModal"><i className="material-icons">add</i></a>
				
				<div id="createUserModal" className="modal">
					<a className="modal-close close-modal-icon right">
						<i className="material-icons grey-text">close</i>
					</a>
					<Formik
						initialValues={fields}
						validationSchema={userSchema}
						onSubmit={(values, { setSubmitting }) => {
							this.createUser(values);
							setSubmitting(false);
						}}>
						{({errors, touched}) => (
							<Form>
								<div className="modal-content">
									<h5 className="title-modal">Create new user</h5>
									<div className="input-field">
										<Field id="email" type="email" name="email" className={touched.email && errors.email ? "focus-white invalid" : "focus-white"}/>
										<label htmlFor="email">Email</label>
										<ErrorMessage className="pink-text" name="email" component="div" />
									</div>
									<div className="input-field">
										<Field id="password1" type="password" name="password1" className={touched.password1 && errors.password1 ? "focus-white invalid" : "focus-white"}/>
										<label htmlFor="password1">New password</label>
										<ErrorMessage className="pink-text" name="password1" component="div" />
									</div>
									<div className="input-field">
										<Field id="password2" type="password" name="password2" className={touched.password2 && errors.password2 ? "focus-white invalid" : "focus-white"}/>
										<label htmlFor="password2">Confirm new password</label>
										<ErrorMessage className="pink-text" name="password2" component="div" />
									</div>
									<div className="input-field">
										<Field id="username" type="text" name="username" className={touched.username && errors.username ? "focus-white invalid" : "focus-white"}/>
										<label htmlFor="username">Username</label>
										<ErrorMessage className="pink-text" name="username" component="div" />
									</div>
									<div className="input-checkbox">
										<label className="greencheck">
											<Field type="checkbox" name="validated"/>
											<span className="">Validated</span>
										</label>
									</div>
									<div className="input-checkbox">
										<label className="greencheck">
											<Field type="checkbox" name="admin"/>
											<span className="">Admin</span>
										</label>
									</div>
								</div>
								<div className="modal-footer">
									<LoadingButton type="submit" className="edit-user-btn cyan darken-1 waves-effect waves-light btn">
										Create User
									</LoadingButton>
								</div>
							</Form>)}
					 </Formik>			
				</div>
			</div>
		)
	}
}
export default ModalNewUser;
