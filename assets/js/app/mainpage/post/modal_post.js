import React, {useState, useEffect} from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';

import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

import {LoadingAction, LoadingButton} from '../../../utils.js';

import {hocModal} from '../../../global/modal.js';
import {CommentContainer} from '../../../global/comment.js';
import {ModalFavoritesButton, FavoriteButton} from '../../../global/favorite.js';


const UnwrappedModalPost = function (props){ 
	const [comments, setComments] 		= useState([]);
	const [seeComments, setSeeComments] = useState(false);
	const [images, setImages] 			= useState([]);


	
	useEffect(() => {
		setComments([]);
		setSeeComments(false);

		// important to update images only when we change post, not when the post is updated
		if(JSON.stringify(images) != JSON.stringify(props.post.images)){
			setImages(props.post.images);
		}
	}, [props.post]);

	useEffect(() => {
		if(images && images.length > 0){
			var elems 		= document.querySelectorAll('.carousel');

			// Bug with indicators adding up
			var indicators 	= document.querySelectorAll('.indicators');
			if(indicators){
				for (var i = indicators.length - 1; i >= 0; i--) {
					indicators[i].remove(indicators);
				}
			}
			M.Carousel.init(elems, {fullWidth: true, indicators: true});

			elems = document.querySelectorAll('.materialboxed');
			if(elems) M.Materialbox.init(elems);
		}else{
			elems = document.querySelectorAll('.materialboxed');
			for (var i = elems.length - 1; i >= 0; i--) {
				var materialBox = M.Materialbox.getInstance(elems[i]);
				if(materialBox) materialBox.destroy();
			}
			
		}
	}, [images]);

	useEffect(() => {
		if(seeComments){
			getComments();
		}
	}, [seeComments]);

	const toggleComments = () => { 
		setSeeComments(!seeComments);
	}

	const getComments = () => { 
		axios.get('/api/post/comment/list/' + props.post.id)
				.then(data => {
					setComments(data.comments);
				})
	}
	const addComment = (comment) => {
		axios.post('/api/post/comment/add', {
					post_id: props.post.id,
					comment: comment
			}).then(data => {
				props.updatePost(data.post);
				setComments(data.comments);
			})
	}

	if(!props.post){
		return (<div></div>);
	}

	var commentsdiv = "";
	if(seeComments){
		const field = {
			'comment': ''  
		};
		const commentSchema = Yup.object().shape({
			comment: Yup.string().max(2000).required('Required')
		}); 

		commentsdiv = 	<div className="modal-comments grey darken-4">

							<CommentContainer comments={comments} />
		
							<div className="scroll new-comment-div">
								<Formik
									initialValues={field}
									validationSchema={commentSchema}
									onSubmit={(values, { setSubmitting, resetForm }) => {
										addComment(values.comment);
										resetForm();
										setSubmitting(false);
									}}>
									{({values, errors, touched}) => (
										<Form className="new-comment-form">
											<div className="input-field">
												<Field id="new-comment-textarea" as="textarea" name="comment"
													className={touched.comment && errors.comment ? "invalid focus-white materialize-textarea" : "focus-white materialize-textarea"} />
												<label id="new-comment-label" className="white-text" htmlFor="email">
													New Comment
												</label>
											</div>
											<div className="div-button">
												<LoadingButton type="submit" className="cyan darken-1 waves-effect waves-light btn">
													<i className="material-icons">send</i>
												</LoadingButton>
												<div className={touched.comment && errors.comment ? "pink-text small-text" : "small-text"}>{values.comment.length}/2000</div>
											</div>
										</Form>)}
								</Formik>
							</div>
						</div>;
	}
	
	var carousel = <span>No image</span>;
	if(images && images.length > 0){
		carousel =  <div className="carousel carousel-slider">
						{images.map((image, index) =>{
							return <a className="carousel-item" key={index}><img src={image}/></a>
						})}
					</div>;
	}
	return (
			<div className="modal-post">		
				<a className="modal-close close-modal-icon right">
					<i className="material-icons grey-text">close</i>
				</a>
				<div className="modal-title">
					{props.post.title}
				</div>
				<div className="modal-content">
					<div className={props.post.images.length > 0 ? "modal-image center-align with-image grey darken-4" : "modal-image grey darken-4"}>
						<div className="materialboxed">
							{carousel}
						</div>
					</div>
					<div className="modal-info-tags-stats">
						<div className="modal-tag-stats">
							<div className="tags-post">
								{props.post.tags.map((tag) => 
									<span key={tag.id} className="tag-display cyan darken-1">
										{tag.name}
									</span>
								)}
							</div>
							<div className='stat-post'>
								<ModalFavoritesButton nbFavorites={props.post.nbFavorites} postId={props.post.id} openModalFavorites={props.openModalFavorites} />
								<FavoriteButton updatePost={props.updatePost} post={props.post}/>
								<span>{props.post.nbComments}</span> 
								<LoadingAction className="waves-effect waves-light waves-circle" action={() => toggleComments()}>
									<i className="material-icons cyan-text text-darken-1">comment</i>
								</LoadingAction>
							</div>
						</div>
						<div className="modal-info grey darken-2">
							<p>{props.post.text}</p>
							{commentsdiv}		
						</div>
					</div>
				</div>
			</div>
	)
}

const ModalPost = hocModal(UnwrappedModalPost);

export default ModalPost;

