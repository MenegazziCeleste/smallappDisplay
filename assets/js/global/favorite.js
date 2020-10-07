import React,  { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';

import {hocModal} from './modal.js';
import {LoadingAction} from '../utils.js';

// Favorite Modal component
	export function ModalFavoritesButton(props){
		return (<span className={props.nbFavorites > 0 ? "action" : ""} onClick={(e) => props.nbFavorites > 0 ? props.openModalFavorites(e, props.postId) : false}>
				  {props.nbFavorites} 
				</span>)
	}
	const UnwrappedModalFavorites = function (props){ 
		const [users, setUsers] = useState([]);

		useEffect(() => {
			setUsers([]);
			if(props.postId){
				getFavoritesUsers();
			}
		}, [props.postId]);

		const getFavoritesUsers = () => {
			axios.get('/api/post/fav/list/' + props.postId)
				.then(data => {
					setUsers(data.users);
				});	
		}
		var usersFavorites = "";
		if(users && users.length > 0){
			usersFavorites = users.map((user) =>
								<li className="center-align" key={user.id}>
									{props.admin ? "#" + user.id + " - " : ""} {user.username ? user.username + " - " : ""} {user.email}
								</li>);
		}
		return (	
			<div>		
				<a className="modal-close close-modal-icon right">
					<i className="material-icons grey-text">close</i>
				</a>
				<div className="modal-content">
					<h4 className="center-align">
						<i className="material-icons pink-text">favorite</i>
						{"	"} Favorited By {"	"}
						<i className="material-icons pink-text">favorite</i>
					</h4>
					<div className="container like-container grey darken-4">
						<ul>
							{usersFavorites}
						</ul>
					</div>
				</div>
			</div>)	
	}
	export const ModalFavorites = hocModal(UnwrappedModalFavorites);

// Button favorite component
	export function FavoriteButton(props){ 
		const toggleFavPost = (event) => {
			event.stopPropagation();
			axios.post('/api/post/fav/toggle', {post_id: props.post.id})
				.then(data => {
					props.updatePost(data.post);
				})	
		}
		return (<LoadingAction className="waves-effect waves-light waves-circle" action={(event) => toggleFavPost(event)}>
					<i  className={props.post.favByUser ? "material-icons favorite" : "material-icons favorite-border"}>
						{props.post.favByUser ? 'favorite' : 'favorite_border'}</i>
				</LoadingAction>)	
	}