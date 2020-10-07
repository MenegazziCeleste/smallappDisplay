import React from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import {successToast, LoadingButton} from '../../../utils.js';


import {hocModal} from '../../../global/modal.js';

class UnwrappedModalPassword extends React.Component {
	constructor(props) {
		super(props);
	}
	editPassword(password){
		axios.post('/api/admin/user/edit/password/' + this.props.userId, {
				new_password:		password
			})
			.then(data => {
				successToast("Password edited");
				var modal = M.Modal.getInstance(document.getElementById("editPasswordModal"));
				modal.close();
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
		return (	
			<div>		
				<a className="modal-close close-modal-icon right">
					<i className="material-icons grey-text">close</i>
				</a>
				<Formik
					initialValues={fields}
					validationSchema={passwordSchema}
					onSubmit={(values, { setSubmitting }) => {
						this.editPassword(values.password1);
						setSubmitting(false);
					}}>
					{({errors, touched}) => (
						<Form>
							<div className="modal-content">
								<h5 className="title-modal">Edit Password</h5>
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
							</div>
							<div className="modal-footer">
								<LoadingButton type="submit" className="edit-user-btn cyan darken-1 waves-effect waves-light btn">
									Edit Password
								</LoadingButton>
							</div>
						</Form>)}
				</Formik>
			</div>
		)
	}
}

const ModalPassword = hocModal(UnwrappedModalPassword)
export default ModalPassword;
