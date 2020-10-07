<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Routing\Annotation\Route;

// DB
use App\Entity\Post;
use App\Entity\PostImage;
use App\Repository\PostRepository;
use App\Repository\TagRepository;
use App\Repository\CommentRepository;
use Doctrine\ORM\EntityManagerInterface;

use Symfony\Component\HttpFoundation\Request;

// Custom services
use App\Service\PostService;
use App\Service\ResponseGenerator;
use App\Service\JsonDataExtrator;
use App\Service\Validator;
use App\Service\Uploader;

/**
 * @Route("/api/admin/post", name="admin_post_")
 */
class AdminPostController extends AbstractController
{
	private $postRepository;
	private $rg;
	private $jde;
	private $validator;

	public function __construct(
								PostRepository $postRepository, 
								ResponseGenerator $rg, 
								JsonDataExtrator $jde,
								PostService $postService,
								Validator $validator
								){
		$this->postRepository   = $postRepository;
		$this->rg 				= $rg;
		$this->jde 				= $jde;
		$this->postService 		= $postService;
		$this->validator 		= $validator;
	}

	/**
	* @Route("/list", name="list")
	*/
	public function getPosts(Request $request)
	{
		$data = $this->jde->getDataFromRequest($request, ['page', 'filters', 'sort']);
		
		$queryResult = $this->postRepository->findAllPosts($data['page'], $data['filters'], $data['sort'], true);

		$posts = $this->postService->updatePosts($queryResult["posts"]);

		return $this->rg->getSuccessResponse([	"posts" 	=> $posts, 
												"page" 		=> $queryResult["page"], 
												"nbPosts" 	=> $queryResult["nbPosts"]]);
	}

	/**
	* @Route("/{id}", name="find", requirements={"id"="\d+"})
	*/
	public function getPost($id)
	{
		$post = $this->postRepository->find($id);
		if(!$post){
			return $this->rg->getFailResponse('Invalid post id.');
		}
		$post = $this->postService->updatePost($post, true);

		return $this->rg->getSuccessResponse(["post" => $post]);
	}
	
	/**
	* @Route("/edit/{id}",name="create_edit", requirements={"id"="\d+|new"})
	*/
	public function createOrEdit($id, Request $request, TagRepository $tagRepository, Uploader $uploader)
	{
		$data = $this->jde->getDataFromForm($request, ['title', 'text', 'tags']);

		if(!$data){
			return $this->rg->getFailResponse('Invalid data.');
		}

		if($id == "new"){
			$post = new Post();			
		}else{
			$post = $this->postRepository->find($id);

			if(!$post){
				return $this->rg->getFailResponse('Invalid post id.');
			}
		}
		
		$post->setTitle(trim($data["title"]));
		$post->setText(trim($data["text"]));
		
		$currentTags = $post->getTags();
		foreach ($currentTags as $tag) {
			$post->removeTag($tag);
		}
		foreach ($data['tags'] as $tagOption) {
			$tag = $tagRepository->find($tagOption);
			
			if(!$tag) return $this->rg->getFailResponse('Invalid data.');
			$post->addTag($tag);
		}
		if(!count($post->getTags()) || count($post->getTags()) > 5){
			return $this->rg->getFailResponse('A post must have between 1 and 5 tags');	
		}

		if($invalidMessage = $this->validator->isInvalid($post)){
			return $this->rg->getFailResponse($invalidMessage);	
		}
		
		$this->postRepository->save($post);

		// handle images
		$images = $this->jde->getDataFromForm($request, ['images']);
		if(!$this->postService->handleExistingImages($post, $images['images'])){
			return $this->rg->getFailResponse("Post #" . $post->getId() . " was edited but the image removal failed");
		}
		
		$newImages = $this->jde->getFilesFromForm($request, ['newImages']);
		if($newImages){
			foreach ($newImages['newImages'] as $key => $newImage) {

				$newImage = new PostImage($newImage);
				if($invalidMessage = $this->validator->isInvalid($newImage)){
					return $this->rg->getFailResponse($invalidMessage);	
				}
				if ($newImage) {
					if($errorMessage = $uploader->uploadPostImage($newImage, $post->getId(), $key)){
						return $this->rg->getFailResponse($errorMessage);	
					}
				}
			}
		}
		

		return $this->rg->getSuccessResponse(["post" => $this->postService->updatePost($post, true)]);
	}

	/**
	* @Route("/delete/{id}", name="delete", requirements={"id"="\d+"})
	*/
	public function deletePost($id)
	{
		$post = $this->postRepository->find($id);
		if(!$post){
			return $this->rg->getFailResponse('Invalid post id.');
		}

		$this->postRepository->delete($post);

		return $this->rg->getSuccessResponse();
	}

	/**
	* @Route("/comment/delete/{id}", name="comment_delete", requirements={"id"="\d+"})
	*/
	public function deleteComment($id, CommentRepository $commentRepository)
	{
		$comment = $commentRepository->find($id);
		if(!$comment){
			return $this->rg->getFailResponse('Invalid comment id.');
		}

		$commentRepository->delete($comment);
		
		return $this->rg->getSuccessResponse();
	}

}
