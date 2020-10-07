// any CSS you import will output into a single css file (app.css in this case)
import '../../../../css/admin/users.css';


import React from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';

import Table from 'rc-table';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

import ModalPassword from './modal_password.js';
import ModalNewUser from './modal_new_user.js';

import {successToast, failToast, 
		LoadingAction, LoadingButton} from '../../../utils.js';

import {SortHeader, changeSort, Pagination, changePage, setPageFromHash} from '../../../global/table.js';

import {openModal} from '../../../global/modal.js';

class Users extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			'users': [],
			'filters': {
				'search': "",
				'validated': "",
				'disabled': "",
				'admin': ""
			},
			'sort': {},
			'page': 1,
			'pagesCount': 0,

			'modalPasswordUserId': ""
		};
		this.getUsers 	= this.getUsers.bind(this);
		this.changeSort = this.changeSort.bind(this);
		this.changePage = this.changePage.bind(this);
	}
	componentDidMount(){
		// gets page from hash
			setPageFromHash(this, "getUsers");		
		
		// inits the materialize selects
			var selects = document.querySelectorAll('select');
			var instances = M.FormSelect.init(selects);

		// add materialize classes to the table
			var tables = document.getElementsByTagName('table');
			tables[0].classList.add("striped", "highlight", "responsive-table");
	}
	//get user fucntions
		changePage(page){
			changePage(this, "/admin/users#", "getUsers", page);
		}	
		setFilter(values){
			this.setState({'filters': values}, () => {
				M.FormSelect.init(document.getElementById('select_validated'));
				M.FormSelect.init(document.getElementById('select_disabled'));
				M.FormSelect.init(document.getElementById('select_admin'));
				this.getUsers();
			});
		}
		changeSort(type){
			changeSort(this, type, "getUsers");
		}
		getUsers(){
			var filters = {};
			for(let key in this.state.filters){
				if(this.state.filters[key] !== "") filters[key] = this.state.filters[key];
			}
			axios.post('/api/admin/user/list', {
				'page': this.state.page,
				'filters': filters,
				'sort': this.state.sort
			})
			.then(data => {
				this.setEditToFalse(data.users);
				var pagesCount = Math.ceil(data.nbUsers/5);
				this.setState({'page': data.page, 'nbUsers': data.nbUsers, 'pagesCount': pagesCount });	
			})
		}
		setEditToFalse(users = false){
			users = users ? users : this.state.users;
			users = users.map((user) => {
					user.edit = false;
					return user;
				});
			this.setState({ 'users': users });
		}
	// edit functions
		toggleEdit(row) {
			var users = this.state.users.map((user) => {
				user.edit = (row.id == user.id) ? !user.edit : false;
				return user;
			});
			this.setState({'users' : users}); 
		}
		openModalPassword(id){
			this.setState({modalPasswordUserId : id}, () => {
				openModal("editPasswordModal");
			});
		}
		editUser(row){
			var user = {
				'username': row.username,
				'validated': row.validated,
				'disabled': row.disabled,
				'admin': row.admin
			}
			var component = this;
			axios.post('/api/admin/user/edit/' + row.id, user)
				.then(data => {
					this.setEditToFalse();	

					component.getUsers();
					successToast('User edited')
				});
		}

	render() {
		// forms data
			var user = this.state.users.find((user) => {return user.edit})
			var userFields = user ? user : {
				username: "",
				validated: false,
				disabled: false,
				admin: false
			};
			const userSchema = Yup.object().shape({
				username: Yup.string().max(25).nullable(),
				validated: Yup.boolean().required('Required'),
				disabled: Yup.boolean().required('Required'),
				admin: Yup.boolean().required('Required')
			});	

			const filterFields = {
				'search': "", 
				'validated': "", 
				'disabled': "", 
				'admin': ""};
		// set columns 
			var columns = [
				{
					title: <SortHeader column="id" sort={this.state.sort.id} changeSort={this.changeSort} />,
					dataIndex: 'id',
					key: 'id',
					align: 'center',
					width: "5%"
				},
				{
					title: <SortHeader column="email" sort={this.state.sort.email} changeSort={this.changeSort} />,
					dataIndex: 'email',
					key: 'email'
				},
				{
					title: <SortHeader column="username" sort={this.state.sort.username} changeSort={this.changeSort} />,
					dataIndex: 'username',
					key: 'username',
					render: (o, row, index) => { 
						var render = "";
						if(row.edit){
							render = <div className="input-field">
										<Field name="username">
											{({ field, form, meta }) => (
												<input {...field} type="text" 
													className={meta.touched &&meta.error ? "invalid focus-white" : "focus-white" } />)}
										</Field>
										<ErrorMessage className="pink-text small-text" name="username" component="div" />
									</div>;
						}else{
							render = o;
						}
						return render;}
				},
				{
					title: <span>Validated</span>,
					dataIndex: 'validated',
					key: 'validated',
					align: 'center',
					render: (o, row, index) => {
						var render = "";
						if(row.edit){
							// prevents the admin to log themselves out
							var disabled = this.props.currentAdminId == row.id ? true : false;

							render = <label className="greencheck">
										<Field type="checkbox" name="validated" disabled={disabled}/>
										<span></span>
									</label>;
						}else{
							render = o ? <i className="lime-text text-darken-1 material-icons">check</i> : <i className="pink-text material-icons">close</i>;
						}
						return render;}
				},
				{
					title: <span>Disabled</span>,
					dataIndex: 'disabled',
					key: 'disabled',
					align: 'center',
					render: (o, row, index) => {
						var render = "";
						if(row.edit){
							// prevents the admin to log themselves out
							var disabled = this.props.currentAdminId == row.id ? true : false;

							render = <label className="disabled">
										<Field type="checkbox" name="disabled" disabled={disabled}/>
										<span></span>
									</label>;
						}else{
							render = o ? <i className="pink-text material-icons">check</i> : "";
						}
						return render;}
				},
				{
					title:  <span>Admin</span>,
					dataIndex: 'admin',
					key: 'admin',
					align: 'center',
					render: (o, row, index) => {
						var render = "";
						if(row.edit){
							// prevents the admin to log themselves out
							var disabled = this.props.currentAdminId == row.id ? true : false;

							render = <label className="greencheck">
										<Field type="checkbox" name="admin" disabled={disabled}/>
										<span></span>
									</label>;
						}else{
							render = o ? <i className="lime-text text-darken-1 material-icons">check</i> : <i className="pink-text material-icons">close</i>;
						}
						return render;}
				},
				{
					title: '',
					dataIndex: '',
					key: 'action',
					render: (o, row) => {
						var render = "";
						if(row.edit){
							render = <div>
										<i className="cyan-text text-darken-1 waves-effect waves-light material-icons" onClick={() => this.toggleEdit(row)}>create</i>
										<LoadingButton type="submit" className="table-btn btn cyan darken-1 waves-effect waves-light btn">
											Edit
										</LoadingButton>
										<LoadingButton type="button" className="table-btn password cyan darken-1 waves-effect waves-light btn" action={() => this.openModalPassword(row.id)}>
											Edit <br /> password
										</LoadingButton>
									</div>;
						}else{
							render = <i className="cyan-text text-darken-1 waves-effect waves-light material-icons" onClick={() => this.toggleEdit(row)}>create</i>;
						}
						return render;}
				}];
		return (
			<div className="container admin admin-user" >
				<div className="title row">
					<ModalNewUser getUsers={this.getUsers} />
					<h4>
						Admin Users
					</h4>
					<h6 className="left">
						Total users : {this.state.nbUsers}
					</h6>
				</div>

				<div className="filters row">	
					<Formik
						initialValues={filterFields}
						onSubmit={(values, { setSubmitting }) => {
							setSubmitting(false);
							this.setFilter(values);
						}}>
						{({resetForm, handleSubmit}) => (
							<Form>
								<div className="valign-wrapper col s12 m3">	
									<div className="input-field">
										<Field id="search" type="text" name="search" className="focus-white"/>
										<label htmlFor="search">Search</label>
									</div>
								</div>
								<div className="valign-wrapper col s12 m3">	
									<div className="input-field">
										<Field id="select_validated" as="select" name="validated">
											<option value=""></option>
											<option value="1">Validated</option>
											<option value="0">Non Validated</option>
										</Field>
										<label>Validated</label>
									</div>
								</div>
								<div className="valign-wrapper col s12 m3">	
									<div className="input-field">
										<Field id="select_disabled" as="select" name="disabled">
											<option value=""></option>
											<option value="1">Disabled</option>
											<option value="0">Enabled</option>
										</Field>
										<label>Disabled</label>
									</div>
								</div>
								<div className="valign-wrapper col s12 m3">	
									<div className="input-field">
										<Field id="select_admin" as="select" name="admin">
											<option value=""></option>
											<option value="1">Admin</option>
											<option value="0">Non Admin</option>
										</Field>
										<label>Admin</label>
									</div>
								</div>
								<div className="col s12">
									<div className="filter-btn right">	
										<LoadingButton type="submit" className="cyan darken-1 waves-effect waves-light btn">
											Filter
										</LoadingButton>
									</div>
									<div className="filter-btn right">	
										<LoadingAction className="cyan darken-1 waves-effect waves-light btn" 
												action={(e)=>{ resetForm(); this.setState({'sort': {}}); handleSubmit(e);}}>
											Clear
										</LoadingAction>
									</div>
								</div>
							</Form>)}
					</Formik>
				</div>

				<Formik
					initialValues={userFields}
					enableReinitialize
					validationSchema={userSchema}
					onSubmit={(values, { setSubmitting }) => {
						this.editUser(values);
						setSubmitting(false);
					}}>
					{({errors, touched}) => {
						return (
						<Form>
							<Table columns={columns} data={this.state.users} rowKey="id"/>
						</Form>)}}
				 </Formik>	
				
				<Pagination page={this.state.page} pagesCount={this.state.pagesCount} changePage={this.changePage} />
				
				<ModalPassword id="editPasswordModal" userId={this.state.modalPasswordUserId} />
				
			</div>
		)
	}	
}
export default Users;
