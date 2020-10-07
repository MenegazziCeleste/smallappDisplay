<?php


namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Routing\Annotation\Route;

use Doctrine\ORM\EntityManagerInterface;
use App\Repository\PostRepository;
use App\Repository\CommentRepository;
use App\Repository\FavoriteRepository;
use App\Repository\TagRepository;

use Symfony\Component\HttpFoundation\Request;

// Custom services
use App\Service\PostService;
use App\Service\ResponseGenerator;
use App\Service\JsonDataExtrator;
use App\Service\Mailer;
use App\Service\Validator;

/**
 * @Route("/api/post", name="post_")
 */
class PostController extends AbstractController
{
	private $postRepository;
	private $commentRepository;
	private $rg;
	private $jde;
	private $validator;

	public function __construct(PostRepository $postRepository, 
								CommentRepository $commentRepository, 
								PostService $postService,
								ResponseGenerator $rg, 
								JsonDataExtrator $jde,
								Validator $validator
	){
		$this->postRepository		= $postRepository;
		$this->commentRepository    = $commentRepository;
		$this->postService          = $postService;
		$this->rg                   = $rg;
		$this->jde                  = $jde;
		$this->validator            = $validator;
	}

	/**
	* @Route("/list", name="list")
	*/
	public function getPosts(Request $request)
	{
		$data = $this->jde->getDataFromRequest($request, ['page', 'filters', 'sort']);
		if(!$data){
			return $this->rg->getFailResponse();
		}

		$sort    = $data['sort'] ? [$data['sort'] => "DESC"] : ["id" => "DESC"];
		$filters = [
			'tags'      => $data['filters']['tags'] ? $data['filters']['tags'] : false,
			'favorite'  => $data['filters']['favorite'] ? [$this->getUser()] : false,
			'comment'   => $data['filters']['comment'] ? [$this->getUser()] : false
		];

		$queryResult = $this->postRepository->findAllPosts($data['page'], $filters, $sort);

		$posts = $this->postService->updatePosts($queryResult['posts'], true, $this->getUser()->getId());

		return $this->rg->getSuccessResponse([  "posts" => $posts, 
												"hasMore" => $queryResult["hasMore"], 
												"nbPosts" => $queryResult['nbPosts']]);
	}

	/**
	* @Route("/tag/list", name="tag_list")
	*/
	public function getTags(TagRepository $tagRepository)
	{
		$tags = $tagRepository->findAllTags();
		return $this->rg->getSuccessResponse(['tags' => $tags]);
	}


	/**
	* @Route("/fav/toggle", name="fav_toggle")
	*/
	public function toggleFavPost(Request $request, FavoriteRepository $favoriteRepository)
	{
		$data = $this->jde->getDataFromRequest($request, ['post_id']);
		if(!$data){
			return $this->rg->getFailResponse("Invalid data");
		}

		if(!$post = $this->postRepository->find($data['post_id'])){
			return $this->rg->getFailResponse("Invalid post");       
		}
		$user = $this->getUser();
		$favoriteRepository->toggleFav($post, $user);

		$post = $this->postService->updatePost($post, true, $this->getUser()->getId());

		return $this->rg->getSuccessResponse(['post' => $post]);

	}

	/**
	* @Route("/fav/list/{id}", name="fav_users", requirements={"id"="\d+"})
	*/
	public function getFavoritesUsersFromPost($id, FavoriteRepository $favoriteRepository){
		if(!$post = $this->postRepository->find($id)){
			return $this->rg->getFailResponse("Invalid post");       
		}
		$users = $favoriteRepository->getFavoritesUsersFromPost($post);

		return $this->rg->getSuccessResponse(['users' => $users]);
	}

	/**
	* @Route("/comment/list/{id}", name="comment_list", requirements={"id"="\d+"})
	*/
	public function getComments($id, Request $request)
	{
		if(!$post = $this->postRepository->find($id)){
			return $this->rg->getFailResponse("Invalid post");
		}

		$comments = $this->commentRepository->getPostComments($post);
		return $this->rg->getSuccessResponse(['comments' => $comments]);
	}


	/**
	* @Route("/comment/add", name="comment_add")
	*/
	public function addComment(Request $request)
	{
		$data = $this->jde->getDataFromRequest($request, ['post_id', 'comment']);
		if(!$data){
			return $this->rg->getFailResponse("Invalid data");
		}

		if(!$post = $this->postRepository->find($data['post_id'])){
			return $this->rg->getFailResponse("Invalid post");       
		}
		$user = $this->getUser();
		$comment = $this->commentRepository->createComment($user, $post, $data['comment']);

		if($invalidMessage = $this->validator->isInvalid($comment)){
			return $this->rg->getFailResponse($invalidMessage); 
		}

		$this->commentRepository->save($comment);

		$post = $this->postService->updatePost($post, true, $this->getUser()->getId());
		$comments = $this->commentRepository->getPostComments($data['post_id']);

		return $this->rg->getSuccessResponse(["comments" => $comments, "post" => $post]);            
	}
}
