import React from 'react';
import ReactDOM from 'react-dom';

import {ModalFavoritesButton, FavoriteButton} from '../../../global/favorite.js';

class CardPost extends React.Component {
	constructor(props) {
		super(props);        
	}
	render() {
		var image = <span>No image</span>;
		if(this.props.post.images.length > 0){
			image = <img src={this.props.post.images[0]}/>;
		}
		return (
			<div className="col s12 m6 l3">
				<div className="card grey darken-3 post-little">
					<div className="card-image overlay-container" onClick={() => this.props.openModalPost(this.props.post.id)}>
						{image}
						<div className="top favorite-button">
							<FavoriteButton updatePost={this.props.updatePost} post={this.props.post}/>
						</div>
						<div className="overlay-post">
							<div className="text-post">
								{this.props.post.text.length > 80 ? this.props.post.text.substr(0,80) + '...' : this.props.post.text}
							</div>
							<div className="tags-post">
								{this.props.post.tags.map((tag) => 
									<span key={tag.id} className="tag-display cyan darken-1">
										{tag.name}
									</span>
								)}
							</div>
							<div className="stat-post">
								<ModalFavoritesButton nbFavorites={this.props.post.nbFavorites} postId={this.props.post.id} openModalFavorites={this.props.openModalFavorites} />
								<i className="material-icons">favorite</i>
								<span> 
									{this.props.post.nbComments} <i className="material-icons">comment</i>
								</span>
							</div>
						</div>
					</div>
					<div className="card-content">
						<span className="card-title truncate">{this.props.post.title}</span>
					</div>
				</div>
			</div>
		)

	}
}
export default CardPost;
