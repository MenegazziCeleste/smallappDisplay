import '../../../../../css/admin/posts.css';

import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import {successToast, failToast} from '../../../../utils.js';
import CreatableSelect from 'react-select/creatable';

import NewImageModal from './new_image.js';


import {sortableContainer, sortableElement, sortableHandle} from 'react-sortable-hoc';
import arrayMove from 'array-move';

import {LoadingContext, LoadingAction} from '../../../../utils.js';
import {openModal} from '../../../../global/modal.js';

class CreateEditPost extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			'post': {
				id: '',
				title: '',
				text: '',
				tags: [],
				images: []
			},
			'sortedImages': [],

			'tags': [],


		};

		this.createTag 		= this.createTag.bind(this);
		this.setNewImage 	= this.setNewImage.bind(this);
		this.onSortEnd 		= this.onSortEnd.bind(this);
	}
	componentDidMount(){
		this.getTags(true);
	}

	/* TAG FUNCTIONS */
		getTags(first = false){
			axios.get('/api/post/tag/list')
				.then(data => {
					var tags = data.tags.map((tag) => {return {label: tag.name, value: tag.id}});
					this.setState({'tags' : tags}, () => { if(first) this.getPost();});
				});
		}
		createTag(tagName, setFieldValue, loadingContext){
			loadingContext.setLoading();
			//creates tag axios + selects the tag
			axios.post('/api/admin/tag/edit/new', {
					'name': tagName,
				})
				.then(data => {
					loadingContext.setLoaded();

					successToast('Tag created');	
					this.getTags();
					var post = this.state.post;

					var selectedTags = post.tags;
					selectedTags.push({
						label: data.tag.name,
						value: data.tag.id
					});
					post.tags = selectedTags;

					this.setState({'post': post});
					setFieldValue('tags',selectedTags);
				});	
		}

	/* POST FUNCTIONS */
		setPost(post){
			var selectedTags = this.state.tags.filter((tag) => {
							return post.tags.find((dataTag) => (dataTag.id == tag.value))
						});
			post.tags = selectedTags;
			this.setState({'post' : post});

			this.setState({'sortedImages' : post.images.map((imagePath) => ({imagePath: imagePath, file: false}))});
		}
		getPost(){
			if(Number.isInteger(parseInt(this.props.match.params.id))){
				axios.get('/api/admin/post/' + this.props.match.params.id)
					.then(data => {
						this.setPost(data.post)
					});
			}
		}
		createOrEditPost(values){
			var id = this.props.match.params.id;
			var formData = new FormData();
			formData.append('title', 	values.title);
			formData.append('text', 	values.text);
			values.tags.map((tag) => {formData.append('tags[]', tag.value);});
			this.state.sortedImages.map((image, index) => {
				if(image.file){
					formData.append('newImages[]', image.file, index);
				}else{
					formData.append('images[]', image.imagePath + "__" + index);
				}
			});

			axios.post('/api/admin/post/edit/' + id, formData, {headers: {'Content-Type': 'multipart/form-data' }})
				.then(data => {
					if(id == "new"){
						this.props.history.replace("/admin/post/edit/" + data.post.id);
					}
					var successText = id == "new" ? "Post #" + data.post.id + " created" : "Post #" + id + " edited";
					successToast(successText);	
					this.setPost(data.post);
				});	
		}

	/* IMAGE FUNCTIONS */
		openNewImageModal(){
			openModal("newImageModal")
		}
		setNewImage(newImage){
			var sortedImages = this.state.sortedImages;
			sortedImages.push(newImage);
			this.setState({'sortedImages': sortedImages});
		}
		deleteImage(e, imagePath){
			e.preventDefault();
			if(this.state.sortedImages.find((image) => {return image.imagePath == imagePath})){
				window.URL.revokeObjectURL(imagePath); 
				
				var sortedImages = this.state.sortedImages.filter((image) => {return image.imagePath != imagePath;});
				this.setState({sortedImages: sortedImages});
			}else{
				failToast("Could not find image");
			}
		}
		onSortEnd({oldIndex, newIndex}){
			var sortedImages = arrayMove(this.state.sortedImages, oldIndex, newIndex);
			this.setState({sortedImages: sortedImages});
		}


	render() {
		var component = this;

		// title & button text
		var titleText = this.props.match.params.id == "new" ? "Create new post" : "Edit post #" + this.props.match.params.id; 
		var buttonText = this.props.match.params.id == "new" ? "Create" : "Edit"; 

		// validation schema
		var postSchema = Yup.object().shape({
				title: Yup.string().max(25).required('Required'),
				text: Yup.string().max(2000, (text) =>  ("Text must be at most 2000 characters (" + text.value.length + "/2000)")).nullable(),
				tags: Yup.array().max(5).required('Required'),
				images: Yup.mixed().test('imageNotNull', "A post should have at least one image", 
										post => (this.state.sortedImages.length > 0))
									.test('imagesLimit', "A post can have 10 images at most", 
										post => (this.state.sortedImages.length < 11))
			});

		// handle images
		const DragHandle = sortableHandle(() => <i className="material-icons">open_with</i>);

		const SortableImage = sortableElement(({imagePath, indexToDisplay}) => 	<div className="wrap-image noselect">
																			<div className="card">
																				<div className="card-image">
																					<img src={imagePath} />
																					<span className="delete">
																						<button type="button" onClick={(e) => this.deleteImage(e, imagePath)}
																							className="pink waves-effect waves-light btn btn-floating">
																							<i className="material-icons">delete</i>
																						</button>
																					</span>
																					<span className="card-title bold">
																						<span>{indexToDisplay}</span>
																					</span>
																					<span className="handle bold">
																						<DragHandle />
																					</span>
																				</div>
																			</div>
																		</div>);

		const SortableContainer = sortableContainer(({children}) => {
		  return 	<div>
						{children}
						<div className="wrap-image">
							<button type="button" onClick={() => this.openNewImageModal()}
								className="add-image waves-effect waves-light btn btn-floating lime darken-1" >
								<i className="material-icons">add</i>
							</button>
						</div>
					</div>;
		});
		return (
			<div className="container admin admin-post">	
				<h4>{titleText}</h4>
				<div className="big-margin-top">
					<LoadingContext.Consumer>
						{(loading) => (
							<Formik
								initialValues={this.state.post}
								validationSchema={postSchema}
								enableReinitialize
								onSubmit={(values, { setSubmitting }) => {
									if(loading.loading) return;
									this.createOrEditPost(values);
									setSubmitting(false);
								}}>
								{({values, errors, touched, setFieldTouched, setFieldValue, handleSubmit}) => {
									useEffect(() => {
										// This will be called everytime values changes:
										M.updateTextFields();
										M.textareaAutoResize(document.getElementById('text'));
									}, [values]);
									return <Form>
												<div className="input-field">
													<Field id="title" type="text" name="title" 
														className={touched.title && errors.title ? "focus-white invalid" : "focus-white"}/>
													<label htmlFor="title">Title</label>
													<ErrorMessage className="pink-text" name="title" component="div" />
												</div>
												<div className="input-field">
													<Field id="text" as="textarea" name="text" 
														className={touched.text && errors.text ? "focus-white materialize-textarea invalid" : "focus-white materialize-textarea"}/>
													<label htmlFor="text">Text</label>
													<ErrorMessage className="pink-text" name="text" component="div" />
												</div>	
												<div className="input-field select">
													<span className="small-text">Tags</span>
													<CreatableSelect name="tags" id="tags"
														options={this.state.tags}
														onBlur={() => setFieldTouched("tags", true)}
														onChange={(tags) => {
															var post = component.state.post;
															post.tags = tags;
															component.setState({'post': post});
															setFieldValue("tags", tags ? tags : []);
														}}
														onCreateOption={(e) => {
															this.createTag(e, setFieldValue, loading);
														}}
														value={this.state.post.tags}
														isMulti
														placeholder=""
														classNamePrefix="select"
														className={touched.tags && errors.tags ? "focus-white invalid" : "focus-white"}/>
														<ErrorMessage className="pink-text" name="tags" component="div" />
												</div>
												<div className="input-field">
													<span className="small-text">Images</span>

													<p> A Post should have between 1 and 10 images.<br/>
														Please drag and drop the images to sort them. Only the first image will be visible on a non expended post.</p> 
													<p className="pink-text">{errors.images}</p> 
													<SortableContainer onSortEnd={this.onSortEnd} axis="xy" useDragHandle>
														{this.state.sortedImages ? this.state.sortedImages.map((image, index) => (
																						<SortableImage key={index} index={index} indexToDisplay={index + 1} imagePath={image.imagePath} />
																					)) : ""}
													</SortableContainer>
													<NewImageModal id="newImageModal" setNewImage={this.setNewImage}/>
												</div>

												<LoadingAction className="cyan darken-1 waves-effect waves-light btn" action={(e) => {handleSubmit(e);}}>
													{buttonText}
												</LoadingAction>
											</Form>}}
							</Formik>)}
					</LoadingContext.Consumer>
				</div>
			</div>
		)
	}
}
export default CreateEditPost;
