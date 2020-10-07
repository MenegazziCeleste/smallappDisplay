// any CSS you import will output into a single css file (app.css in this case)
import '../../../../../css/admin/posts.css';

import React from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';

import Table from 'rc-table';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import {NavLink} from 'react-router-dom';

import ModalComments from './modal_comments.js';

import {successToast, failToast, 
		LoadingAction, LoadingButton} from '../../../../utils.js';

import {SortHeader, changeSort, Pagination, changePage, setPageFromHash} from '../../../../global/table.js';
import {openModal} from '../../../../global/modal.js';
import {ModalFavorites, ModalFavoritesButton} from '../../../../global/favorite.js';

class Posts extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			'posts': [],
			'tags': [],
			'users': [],
			'filters': {
				'search': "",
				'tags': [],
				'favorite': [],
				'comment': []
			},
			'sort': {},
			'page': 1,
			'pagesCount': 0,

			'modalFavoritesPostId': '',
			'modalCommentsPostId': ''
		};
		this.getPosts 	= this.getPosts.bind(this);
		this.changeSort = this.changeSort.bind(this);
		this.changePage = this.changePage.bind(this);
	}
	componentDidMount(){
		// gets page from hash
			setPageFromHash(this, "getPosts");

			this.getTags();		
			this.getUsers();		
		
		// add materialize classes to the table
			var tables = document.getElementsByTagName('table');
			tables[0].classList.add("striped", "highlight", "responsive-table");
	}
	
	/* POST FUNCTIONS */
		changePage(page){
			changePage(this, "/admin/posts#", "getPosts", page);
		}	
		setFilter(values){
			this.setState({'filters': values}, () => {
				M.FormSelect.init(document.getElementById('select_tags'));
				M.FormSelect.init(document.getElementById('select_fav'));
				M.FormSelect.init(document.getElementById('select_comment'));
				this.getPosts();
			});
		}
		changeSort(type){
			changeSort(this, type, "getPosts");
		}
		getPosts(){
			var filters = {};
			for(let key in this.state.filters){
				if(this.state.filters[key] !== "" || this.state.filters[key] !== []) filters[key] = this.state.filters[key];
			}
			axios.post('/api/admin/post/list', {
				'page': this.state.page,
				'filters': filters,
				'sort': this.state.sort ? this.state.sort : false
			})
			.then(data => {
				var pagesCount = Math.ceil(data.nbPosts/5);
				this.setState({ 'posts': data.posts, 'page': data.page, 'nbPosts': data.nbPosts, 'pagesCount': pagesCount });	
			})
		}
		deletePost(id){
			axios.get('/api/admin/post/delete/' + id)
				.then(data => {
					this.getPosts();
					successToast('Post deleted');
				})
		}

	/* FILTER OPTIONS FUNCTIONS */
		getTags(){
			axios.get('/api/post/tag/list')
				.then(data => {
					this.setState({'tags' : data.tags}, () => {
						// inits the materialize selects
						var select = document.getElementById('select_tags');
						M.FormSelect.init(select);
					});
				})
		}
		getUsers(){
			axios.get('/api/admin/user/list/filter')
				.then(data => {
					this.setState({'users' : data.users}, () => {
						// inits the materialize selects
						var select = document.getElementById('select_fav');
						M.FormSelect.init(select);
						select = document.getElementById('select_comment');
						M.FormSelect.init(select);

					});
				})
		}

	/* MODAL FUNCTIONS */
		openModalFavorites(id){
			this.setState({modalFavoritesPostId : id}, () => {
				openModal("modalFavorite")
			});
		}
		openModalComments(id){
			this.setState({modalCommentsPostId : id}, () => {
				openModal("commentsModal")
			});
		}

	render() {
		// forms data
			const filterFields = {
				'search': "", 
				'tags': [],
				'favorite': [],
				'comment': []};
		// set filters options
			var tagOptions = "";
			if(this.state.tags && this.state.tags.length > 0){
				tagOptions = this.state.tags.map((tag) =>
								<option key={tag.id} value={tag.id}>{tag.name}</option>);
			}
			var userOptions = "";
			if(this.state.users && this.state.users.length > 0){
				userOptions = this.state.users.map((user) =>
								<option key={user.id} value={user.id}>{user.username}</option>);
			}
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
					title: <SortHeader column="title" sort={this.state.sort.title} changeSort={this.changeSort} />,
					dataIndex: 'title',
					key: 'title'
				},
				{
					title: <span>Tags</span>,
					dataIndex: 'tags',
					key: 'tags',
					align: 'center',
					render: (o, row) => {
						return <div>
									{o.map((tag) => 
										<span key={tag.id} className="tag-display cyan darken-1">
											{tag.name}
										</span>
									)}
								</div>;}
				},
				{
					title: 	<SortHeader column="favorite" sort={this.state.sort.favorite} changeSort={this.changeSort} />,
					dataIndex: 'nbFavorites',
					key: 'nbFavorites',
					align: 'center',
					render: (o, row) => {
						return <div className={o > 0 ? "action" : ""} onClick={() => o > 0 ? this.openModalFavorites(row.id) : falses}>
									<i className="material-icons pink-text">favorite</i>
									<div>{o}</div>
								</div>;}
				},
				{
					title: <span>
								<SortHeader column="comment" sort={this.state.sort.comment} changeSort={this.changeSort} />
								<LoadingAction className="waves-effect waves-light waves-circle" action={() => this.changeSort('commentTime')}>
									<i className="material-icons">access_time</i>
								</LoadingAction>
							</span>,
					dataIndex: 'nbComments',
					key: 'nbComments',
					align: 'center',
					render: (o, row) => {
						return <div className={o > 0 ? "action" : ""} onClick={() => o > 0 ? this.openModalComments(row.id) : false}>
									<i className="material-icons cyan-text text-darken-1">comment</i>
									<div>{o}</div>
								</div>;}
				},
				{
					title: '',
					dataIndex: '',
					key: 'action',
					align: 'center',
					render: (o, row) => {
						return <div>
									<NavLink className="table-btn cyan darken-1 waves-effect waves-light btn" 
										to={"/admin/post/edit/" + row.id}>Edit</NavLink>
									<LoadingButton type="button" className="table-btn pink waves-effect waves-light btn" 
											action={() => this.deletePost(row.id)}>
										<i className="material-icons">delete</i>
									</LoadingButton>
								</div>;}
				}];
		return (
			<div className="container admin admin-post" >
				<div className="row">
					<div className="add-post-div">
						<NavLink to="/admin/post/edit/new"
							className="waves-effect waves-light btn btn-floating lime darken-1" >
								<i className="material-icons">add</i>
						</NavLink>
					</div>
					<h4>
						Admin Posts
					</h4>
					<h6 className="left">
						Total posts : {this.state.nbPosts}
					</h6>
				</div>

				<div className="filters row">
					<Formik
						initialValues={filterFields}
						onSubmit={(values, { setSubmitting }) => {
							this.setFilter(values);
							setSubmitting(false);}
						}>
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
										<Field id="select_tags" as="select" name="tags" multiple>
											{tagOptions}
										</Field>
										<label>Tags</label>
									</div>
								</div>
								<div className="valign-wrapper col s12 m3">	
									<div className="input-field">
										<Field id="select_fav" as="select" name="favorite" multiple>
											{userOptions}
										</Field>
										<label>Favorited By</label>
									</div>
								</div>
								<div className="valign-wrapper col s12 m3">	
									<div className="input-field">
										<Field id="select_comment" as="select" name="comment" multiple>
											{userOptions}
										</Field>
										<label>Commented By</label>
									</div>
								</div>
								<div className="col s12">
									<div className="filter-btn right">	
										<LoadingButton type="submit" className="cyan darken-1 waves-effect waves-light btn">
											Filter
										</LoadingButton>
									</div>
									<div className="filter-btn right">	
										<LoadingButton type="button" className="cyan darken-1 waves-effect waves-light btn" 
												action={(e)=>{resetForm(); this.setState({'sort': {}}); handleSubmit(e);}}>
											Clear
										</LoadingButton>
									</div>
								</div>
							</Form>)}
					</Formik>
				</div>

				
				<Table columns={columns} data={this.state.posts} rowKey="id"/>
				
				<Pagination page={this.state.page} pagesCount={this.state.pagesCount} changePage={this.changePage} />
				
				<ModalFavorites id="modalFavorite"  postId={this.state.modalFavoritesPostId} admin={true}/>

				<ModalComments id="commentsModal" postId={this.state.modalCommentsPostId}  getPosts={this.getPosts}/>

			</div>
		)
	}	
}
export default Posts;
