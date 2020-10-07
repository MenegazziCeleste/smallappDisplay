// any CSS you import will output into a single css file (app.css in this case)
import '../../../../css/admin/tags.css';


import React from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';

import Table from 'rc-table';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import {NavLink} from 'react-router-dom';

import {successToast, failToast, LoadingButton, LoadingAction} from '../../../utils.js';

import {SortHeader, changeSort} from '../../../global/table.js';


class Tags extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			'tags': [],
			'sort': {},
			'nbTags': 0
		};
		this.getTags 	= this.getTags.bind(this);
		this.changeSort = this.changeSort.bind(this);
	}
	componentDidMount(){
		this.getTags();	
	}
	//get tags fucntions
		getTags(search =""){
			axios.post('/api/admin/tag/list', {
					search: search,
					sort: this.state.sort
				})
				.then(data => {
					var tags = data.tags.map((tag) => {
							tag.edit = false;
							return tag;
						});
					this.setState({ 'tags': tags, 'nbTags': data.nbTags }, () => {
						var elems = document.querySelectorAll('.tooltipped');
						M.Tooltip.init(elems);	
					});
				})
		}
		changeSort(type){
			changeSort(this, type, "getTags");
		}

		// edit functions
		toggleEdit(row) {
			var tags = this.state.tags.map((tag) => {
				tag.edit = (row.id == tag.id) ? !tag.edit : false;
				return tag;
			});
			this.setState({'tags' : tags}); 
		}
		editTag(row){
			axios.post('/api/admin/tag/edit/' + row.id, {'name': row.name})
				.then(data => {
					this.getTags();
					successToast(row.id == 'new' ? 'Tag created' : 'Tag edited')
				});
		}
		deleteTag(id){
			if(id == "new"){
				var tags = this.state.tags.filter((tag) => {
					return tag.id != "new";
				});
				this.setState({tags: tags});
			}else{
				axios.get('/api/admin/tag/delete/' + id)
					.then(data => {
						this.getTags();
						successToast('Tag deleted');
					});
			}
		}
		addNewTagRow(){
			var tags = this.state.tags;
			if(!tags.find((tag) => {return tag.id == "new";})){
				var newTag = {
					id: "new",
					name: "",
					postsMakingTagNotDeletable: []
				};
				tags.unshift(newTag);
				this.setState({tags: tags});
				this.toggleEdit(newTag);
			}
		}
	render() {

		// edit form data
			var component = this;
			var tag = this.state.tags.find((tag) => {return tag.edit})
			var tagFields = tag ? tag : {name: ""};
			const tagSchema = Yup.object().shape({
				name: Yup.string().max(20).test('unique', 'Name already used', function(name) {
													return !component.state.tags.find((tag) => {return tag.name == name && tag.id != this.parent.id});
												}).required('Required')
			});	

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
					title: <SortHeader column="name" sort={this.state.sort.name} changeSort={this.changeSort} />,
					dataIndex: 'name',
					key: 'name',
					align: 'center',
					render: (o, row) => {
						var content = "";
						var error = "";
						if(row.edit){
							content = <span className="tag-display cyan darken-1">
										<Field name="name">
											{({ field, meta }) => (
												<input {...field} type="text" 
													className={meta.touched &&meta.error ? "invalid focus-white input-tag" : "focus-white input-tag" } />)}
										</Field>
									</span>;
							error = <ErrorMessage className="pink-text small-text" name="name" component="div" />
						}else{
							content = <span className="tag-display cyan darken-1">{o}</span>;
						}
						return <div className="input-field">
									{content}
									{error}
								</div>;}
				},
				{
					title: '',
					dataIndex: '',
					key: 'action',
					align: 'center',
					render: (o, row) => {
						var render = "";
						var textBtn = (row.id == "new") ? "Create" : "Edit";	
						if(row.edit){
							render = <span>
										<i className="cyan-text text-darken-1 waves-effect waves-light material-icons" onClick={() => this.toggleEdit(row)}>create</i>
										
										<LoadingButton type="submit" className="table-btn btn cyan darken-1 wrapper-loading-btn">
											{textBtn}
										</LoadingButton>
									</span>;
						}else{
							render = <i className="cyan-text text-darken-1 waves-effect waves-light material-icons" onClick={() => this.toggleEdit(row)}>create</i>;
						}
						// BTN delete settings
						var disabledDelete = false;
						var tooltipClass = "";
						var textTooltip = 'The following posts are linked to this tag only and make this tag not deletable : ';
						if(row.postsMakingTagNotDeletable.length > 0){
							disabledDelete = true;
							tooltipClass = "tooltipped";

							for (let i = 0; i < row.postsMakingTagNotDeletable.length; ++i) {
								if(i != 0) textTooltip += ", ";
								textTooltip += row.postsMakingTagNotDeletable[i];
							}

						}
						return 	<div>
									{render}
									<span className={tooltipClass} data-position="top" data-tooltip={textTooltip}>
										<LoadingButton type="button" disabled={disabledDelete} className="table-btn pink waves-effect waves-light btn" 
												action={() => this.deleteTag(row.id)}>
											<i className="material-icons">delete</i>
										</LoadingButton>
									</span>
								</div>;}
				}];
		return (
			<div className="container admin admin-tag" >
				<div className="row">
					<div className="add-post-div">
						<LoadingAction className="waves-effect waves-light btn btn-floating lime darken-1" action={() => this.addNewTagRow()}>
							<i className="material-icons">add</i>
						</LoadingAction>
					</div>
					<h4>
						Admin Tags
					</h4>
					<h6 className="left">
						Total tags : {this.state.nbTags}
					</h6>
				</div>
				<div className="filters row">
					<Formik
						initialValues={{'search': ''}}
						onSubmit={(values, { setSubmitting }) => {
							this.getTags(values.search);
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
								<div className="col s12">
									<div className="filter-btn right">
										<LoadingButton type="submit" className="cyan darken-1 waves-effect waves-light btn">
											Filter
										</LoadingButton>	
									</div>
									<div className="filter-btn right">	
										<LoadingButton type="button" className="cyan darken-1 waves-effect waves-light btn" 
											action={(e)=>{resetForm(); this.setState({sort: {}}); handleSubmit(e);}}>
											Clear
										</LoadingButton>	
									</div>
								</div>
							</Form>)}
					</Formik>
				</div>

				<Formik
					initialValues={tagFields}
					enableReinitialize
					validationSchema={tagSchema}
					onSubmit={(values, { setSubmitting }) => {
						this.editTag(values);
						setSubmitting(false);
					}}>
					{({errors, touched}) => {
						return (
						<Form>
							<Table columns={columns} data={this.state.tags} rowKey="id"/>
						</Form>)}}
				 </Formik>
			</div>
		)
	}	
}
export default Tags;
