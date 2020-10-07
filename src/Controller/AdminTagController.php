<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Routing\Annotation\Route;

// DB
use App\Entity\Tag;
use App\Repository\TagRepository;
use App\Repository\PostRepository;

use Symfony\Component\HttpFoundation\Request;

// Custom services
use App\Service\ResponseGenerator;
use App\Service\JsonDataExtrator;
use App\Service\Validator;

/**
 * @Route("/api/admin/tag", name="admin_tag_")
 */
class AdminTagController extends AbstractController
{
	private $tagRepository;
	private $postRepository;
	private $rg;
	private $jde;
	private $validator;

	public function __construct(
								TagRepository $tagRepository, 
								PostRepository $postRepository,
								ResponseGenerator $rg, 
								JsonDataExtrator $jde,
								Validator $validator
								){
		$this->tagRepository 	= $tagRepository;
		$this->postRepository 	= $postRepository;
		$this->rg 				= $rg;
		$this->jde 				= $jde;
		$this->validator 		= $validator;
	}

	/**
	* @Route("/list", name="list")
	*/
	public function getTags(Request $request)
	{
		$data = $this->jde->getDataFromRequest($request, ['search', 'sort']);
		if(!$data){
			return $this->rg->getFailResponse('Invalid search or sort.');
		}

		$results = $this->tagRepository->adminFindAllTags($data["search"], $data['sort']);

		$tags = [];
		foreach ($results['tags'] as $tag) {
			$tag['postsMakingTagNotDeletable'] = $this->postRepository->postsWithOnlyThisTag($tag['id']);
			$tags[] = $tag;
		}

		return $this->rg->getSuccessResponse([	'tags' 		=> $tags,
												'nbTags' 	=> $results['nbTags']]);
	}


	/**
	* @Route("/edit/{id}",name="create_edit", requirements={"id"="\d+|new"})
	*/
	public function createOrEdit($id, Request $request)
	{
		$data = $this->jde->getDataFromRequest($request, ['name']);
		if(!$data){
			return $this->rg->getFailResponse('Invalid data.');
		}

		if($id == "new"){
			$tag = new Tag();			
		}else{
			$tag = $this->tagRepository->find($id);

			if(!$tag){
				return $this->rg->getFailResponse('Invalid tag id.');
			}
		}
		
		$tag->setName(trim($data["name"]));
		
		if($invalidMessage = $this->validator->isInvalid($tag)){
			return $this->rg->getFailResponse($invalidMessage);	
		}
		
		$this->tagRepository->save($tag);

		return $this->rg->getSuccessResponse(["tag" => ['id' => $tag->getId(), 
														'name' => $tag->getName()]]);
	}

	/**
	* @Route("/delete/{id}",name="delete", requirements={"id"="\d+|new"})
	*/
	public function delete($id, Request $request)
	{
		$tag = $this->tagRepository->find($id);

		if(!$tag){
			return $this->rg->getFailResponse('Invalid tag id.');
		}

		if($postsMakingTagNotDeletable = $this->postRepository->postsWithOnlyThisTag($tag->getId())){
			$errorPosts = "";
			foreach ($postsMakingTagNotDeletable as $index => $postMakingTagNotDeletable) {
				if($index != 0) $errorPosts .= ", ";
				$errorPosts .= $postMakingTagNotDeletable;
			}
			return $this->rg->getFailResponse('The following posts are linked to this tag only and make this tag not deletable : ' . $errorPosts);
		}

		if(!$this->tagRepository->delete($tag)){
			return $this->rg->getFailResponse('Delete failed.');
		}

		return $this->rg->getSuccessResponse();
	}
}
