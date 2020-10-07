// any CSS you import will output into a single css file (app.css in this case)
import '../../../../css/app/post.css';

import React from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';

import CardPost from './card_post.js'
import ModalPost from './modal_post.js'


import {LoadingButton, LoadingSelect} from '../../../utils.js';
import {openModal} from '../../../global/modal.js';
import {ModalFavorites, ModalFavoritesButton, FavoriteButton} from '../../../global/favorite.js';

class Post extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			posts: [],
			nbPosts: 0,
			loading: true,
			hasMore: false,
			page: 1,
			expandFilters: true,
			filters: {
				favorite: false,
				comment: false,
				tags: []},
			sort: "",
			tags: [],

			modalPostId: "",
			modalFavoritesPostId: "",
			marginPostContainer: {}
		};
		this.filterRef = React.createRef();

		this.onScroll 					= this.onScroll.bind(this);	
		this.updatePost 				= this.updatePost.bind(this);
		 
		this.openModalPost				= this.openModalPost.bind(this);	
		this.openModalFavorites			= this.openModalFavorites.bind(this);	
		this.updateMarginPostContainer	= this.updateMarginPostContainer.bind(this);	
		this.filter						= this.filter.bind(this);	

	}
	componentDidMount(){
		this.loadMore();
		this.getTags();
		window.addEventListener("resize", this.updateMarginPostContainer);
		window.addEventListener('scroll', this.onScroll, false);
	}
	componentWillUnmount() {
		window.removeEventListener("resize", this.updateMarginPostContainer);
		window.removeEventListener('scroll', this.onScroll, false);
	}
	//GET POSTS METHODS
		loadMore(){
			axios.post('/api/post/list',{
						page: 		this.state.page,
						filters: 	this.state.filters,
						sort: 		this.state.sort
				}).then(data => {
					var newPosts = data.posts;

					var posts = this.state.posts.concat(newPosts);
					this.setState({ 
						posts		: posts,
						nbPosts		: data.nbPosts, 
						hasMore		: data.hasMore ? true : false, 
						loading		: false,
						page		: ++this.state.page
					}, () => {
						// if the window can display more post, loads more posts
						if(window.innerHeight > document.body.offsetHeight && data.hasMore){
							this.loadMore();
						}
					});
				})
		}
		updatePost(updatedPost){
			var posts = this.state.posts.map((post) => {
			  if(post.id == updatedPost.id){
				post= updatedPost;
			  }
			  return post;
			});
			this.setState({posts: posts});
		}

	//SCROLL && RESIZE METHODS
		onScroll(){
			if ( (window.innerHeight + window.pageYOffset) >= (document.body.offsetHeight - 50) 
				&& this.state.hasMore && !this.state.loading) {
				this.setState({loading: true});
				this.loadMore();
			}
		}
		updateMarginPostContainer(){
			this.setState({marginPostContainer: window.innerWidth < 992 ? {marginTop: this.filterRef.current.offsetHeight + "px"} : {marginLeft: this.filterRef.current.offsetWidth + "px"} });
		}

	// POST MODAL METHOD
		openModalPost(postId){
			this.setState({modalPostId : postId}, () => {openModal("modalPost")});
		}

	//FILTER/SORT METHODS
		getTags(){
			axios.get('/api/post/tag/list')
				.then(data => {
					this.setState({tags: data.tags});

					this.updateMarginPostContainer();
				})
		}
		resetPosts(){
			this.setState({	posts: [],
							modalPostId: null,  
							hasMore: false,
							loading: true,
							page: 1});
		}
		sort(event){
			// get around a bug in materialize select
			M.FormSelect.init(event.target);
			var sort =  M.FormSelect.getInstance(event.target).getSelectedValues();
			this.resetPosts();
			this.setState({'sort': sort[0]}, () => this.loadMore());
		}
		filter(type, value){
			this.resetPosts();
			var filters = this.state.filters;
			filters[type] = value;
			this.setState({'filter': value}, () => this.loadMore());			
		}
		setFilterTag(event){
			var filterTags =  M.FormSelect.getInstance(event.target).getSelectedValues();
			this.filter('tags', filterTags);
		}
		toggleFilter(filterToToggle){
			this.filter(filterToToggle, !this.state.filters[filterToToggle]);
		}
		toggleDisplayFilters(){
			this.setState({expandFilters: !this.state.expandFilters}, () => this.updateMarginPostContainer());
		}

	//FAVORITE METHODS
		openModalFavorites(event, postId){
			event.stopPropagation();
			this.setState({modalFavoritesPostId : postId}, () => {openModal("modalFavorite")});
		}

	render() {
		var posts ='';
		if(this.state.posts && this.state.posts.length > 0){
			posts = this.state.posts.map((post) =>
							<CardPost key={post.id} post={post} openModalPost={this.openModalPost} updatePost={this.updatePost} openModalFavorites={this.openModalFavorites}/>
						);
		}else if (!this.state.loading){
			posts = <div className="center-align big-margin-top">No post found</div>; 
		}

		var modalPost = "";
		if(this.state.modalPostId){
			var modalPost = this.state.posts.find(obj => {
			  return obj.id === this.state.modalPostId;
			});
		}
		
		var filterOptions = "";
		if(this.state.tags && this.state.tags.length > 0){
			filterOptions = this.state.tags.map((tag) =>
							<option key={tag.id} value={tag.id}>{tag.name}</option>
						);
		}
		return (
			<div className="post">
				<div ref={this.filterRef} className="filter-container grey darken-4">
					<div style={{display: this.state.expandFilters ? "block" : "none"}}>
						<div className="fav-comment-filter">
							<LoadingButton action={() => this.toggleFilter('favorite')}
									className={this.state.filters.favorite ? "pink white-text waves-effect waves-light btn" : "grey darken-3 waves-effect waves-light btn"}>
								<i className={this.state.filters.favorite ? "material-icons" : "material-icons pink-text" }>favorite</i> 
								Favorites
							</LoadingButton>
							<LoadingButton action={() => this.toggleFilter('comment')}
									className={this.state.filters.comment ? "cyan darken-1 white-text waves-effect waves-light btn" : "grey darken-3 waves-effect waves-light btn"}>
								<i className={this.state.filters.comment ? "material-icons" : "material-icons cyan-text text-darken-1" }>comment</i> 
								Commented
							</LoadingButton>
						</div>
						<div className="col s6 l12">
							<div className="input-field">
								<h6>Sort By</h6>
								<LoadingSelect action={(event) => this.sort(event)}>
									<option value=""></option>
									<option value="favorite">Most Liked</option>
									<option value="comment">Most Commented</option>
								</LoadingSelect>
							</div>
						</div>
						<div className="col s6 l12">
							<div className="input-field">
								<h6>Filter By Tag</h6>
								<LoadingSelect multiple action={(event) => this.setFilterTag(event)}>
									{filterOptions}
								</LoadingSelect>
							</div>
						</div>
						<div className="col s6 l12">
							<h6>Total Posts : {this.state.nbPosts}</h6>
						</div>
					</div>
					<a className="expand-btn waves-effect waves-light btn btn-floating grey darken-1" onClick={() => this.toggleDisplayFilters()}>
						<i className="material-icons small text-darken-4 grey-text">
							{this.state.expandFilters ? "expand_less" : "expand_more"}
						</i>
					</a>
				</div>
				<div className="post-container" style={this.state.marginPostContainer} >
					<ModalPost id="modalPost" post={modalPost} updatePost={this.updatePost} openModalFavorites={this.openModalFavorites} />
					<div className="row">
						{posts}
					</div>
				</div>
				<ModalFavorites id="modalFavorite" postId={this.state.modalFavoritesPostId} />
			</div>
		)
	}
}
export default Post;
